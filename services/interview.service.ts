import type { Models } from "appwrite"
import { ID, Permission, Query, Role } from "appwrite"

import { createAppwriteServices } from "@/lib/appwrite"
import type { InterviewPlan } from "@/lib/ai-types"

const DATABASE_ID = "espejo_cv"
const CV_SESSIONS_COLLECTION_ID = "cv_sessions"
const JOB_OFFERS_COLLECTION_ID = "job_offers"
const INTERVIEW_TURNS_COLLECTION_ID = "interview_turns"
const CV_FILES_BUCKET_ID = "cv-files"

function getServices() {
  return createAppwriteServices()
}

export type InterviewSessionStatus =
  | "draft"
  | "analyzing"
  | "interviewing"
  | "completed"
  | "failed"

export type InterviewTurnStatus = "pending" | "answered" | "reviewed"

type JobOfferRow = Models.Row & {
  title?: string
}

type CvSessionRow = Models.Row & {
  userId: string
  cvFileId: string
  cvText: string
  jobOffer?: JobOfferRow | string | null
  status: InterviewSessionStatus
  startedAt: string
  completedAt?: string
  lastActivityAt: string
}

type InterviewTurnRow = Models.Row & {
  cvSession?: CvSessionRow | string | null
  turnIndex: number
  question: string
  answer?: string
  status: InterviewTurnStatus
  askedAt: string
  answeredAt?: string
}

export type StartInterviewResult = {
  sessionId: string
  plan: InterviewPlan
}

export type ContinueInterviewResult = {
  sessionId: string
  status: InterviewSessionStatus
  currentQuestionIndex: number
  isInterviewComplete: boolean
  plan: InterviewPlan
}

export type UserCvFile = {
  id: string
  name: string
  uploadedAt: string
  isPrimary: boolean
  sizeInBytes: number
}

async function resolveCvFileIdForSession({
  cvFile,
  existingCvId,
  userId,
  userPermissions,
}: {
  cvFile: File
  existingCvId?: string
  userId: string
  userPermissions: string[]
}) {
  const { storage } = getServices()

  if (existingCvId) {
    let existingFile: Models.File

    try {
      existingFile = await storage.getFile({
        bucketId: CV_FILES_BUCKET_ID,
        fileId: existingCvId,
      })
    } catch {
      throw new Error("No se pudo reutilizar el CV seleccionado. Intenta elegirlo de nuevo o subir uno nuevo.")
    }

    const isOwnedByUser = existingFile.$permissions.some((permission) => permission.includes(`user:${userId}`))

    if (!isOwnedByUser || existingFile.mimeType !== "application/pdf") {
      throw new Error("No se pudo reutilizar el CV seleccionado. Intenta elegirlo de nuevo o subir uno nuevo.")
    }

    return existingFile.$id
  }

  const uploadedFile = await storage.createFile(
    CV_FILES_BUCKET_ID,
    ID.unique(),
    cvFile,
    userPermissions,
  )

  return uploadedFile.$id
}

function parsePreferredCvIds(rawValue: unknown) {
  if (!rawValue) {
    return [] as string[]
  }

  try {
    const parsed = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((cv): cv is { id: string; isPrimary?: boolean } => {
        if (!cv || typeof cv !== "object") {
          return false
        }

        const candidate = cv as { id?: unknown; isPrimary?: unknown }
        return typeof candidate.id === "string"
      })
      .sort((left, right) => Number(Boolean(right.isPrimary)) - Number(Boolean(left.isPrimary)))
      .map((cv) => cv.id)
  } catch {
    return []
  }
}

function formatCvUploadedAt(timestamp: string) {
  return `Subido el ${new Date(timestamp).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`
}

async function listOwnedSessionCvFileIds(userId: string) {
  const { tables } = getServices()
  const collectedIds = new Set<string>()
  let cursorAfter: string | null = null

  while (true) {
    const response: Models.RowList<CvSessionRow> = await tables.listRows<CvSessionRow>({
      databaseId: DATABASE_ID,
      tableId: CV_SESSIONS_COLLECTION_ID,
      queries: [
        Query.equal("userId", userId),
        Query.orderAsc("$id"),
        Query.limit(100),
        Query.select(["$id", "cvFileId"]),
        ...(cursorAfter ? [Query.cursorAfter(cursorAfter)] : []),
      ],
    })

    for (const row of response.rows) {
      if (typeof row.cvFileId === "string" && row.cvFileId.length > 0) {
        collectedIds.add(row.cvFileId)
      }
    }

    if (response.rows.length < 100) {
      break
    }

    cursorAfter = response.rows[response.rows.length - 1]?.$id ?? null

    if (!cursorAfter) {
      break
    }
  }

  return [...collectedIds]
}

async function listAssociatedCvFileIdsForUser(user: Models.User<Models.Preferences>) {
  const preferredCvIds = parsePreferredCvIds((user.prefs as Record<string, unknown> | undefined)?.cvList)
  const sessionCvIds = await listOwnedSessionCvFileIds(user.$id)

  return {
    preferredCvIds,
    associatedCvIds: [...new Set([...preferredCvIds, ...sessionCvIds])],
  }
}

function getLoadedRelation<T>(value?: T | string | null) {
  if (!value || typeof value === "string") {
    return null
  }

  return value
}

export async function listCurrentUserCvFiles(): Promise<UserCvFile[]> {
  const { account, storage } = getServices()
  const user = await account.get()
  const { preferredCvIds, associatedCvIds } = await listAssociatedCvFileIdsForUser(user)

  if (associatedCvIds.length === 0) {
    return []
  }

  const preferredIdsSet = new Set(preferredCvIds)
  const ownedFiles = await Promise.all(
    associatedCvIds.map(async (fileId) => {
      try {
        const file = await storage.getFile({
          bucketId: CV_FILES_BUCKET_ID,
          fileId,
        })

        const isOwnedByUser = file.$permissions.some((permission) => permission.includes(`user:${user.$id}`))

        if (!isOwnedByUser || file.mimeType !== "application/pdf") {
          return null
        }

        return file
      } catch {
        return null
      }
    }),
  )

  const sortedFiles = ownedFiles
    .filter((file): file is Models.File => file !== null)
    .sort((left, right) => {
      const leftPreferredIndex = preferredCvIds.indexOf(left.$id)
      const rightPreferredIndex = preferredCvIds.indexOf(right.$id)

      if (leftPreferredIndex !== -1 || rightPreferredIndex !== -1) {
        if (leftPreferredIndex === -1) {
          return 1
        }

        if (rightPreferredIndex === -1) {
          return -1
        }

        return leftPreferredIndex - rightPreferredIndex
      }

      return new Date(right.$createdAt).getTime() - new Date(left.$createdAt).getTime()
    })

  return sortedFiles.map((file, index) => ({
    id: file.$id,
    name: file.name,
    uploadedAt: formatCvUploadedAt(file.$createdAt),
    isPrimary: preferredIdsSet.size > 0 ? preferredIdsSet.has(file.$id) && preferredCvIds[0] === file.$id : index === 0,
    sizeInBytes: file.sizeOriginal,
  }))
}

async function getOwnedSession(sessionId: string, userId: string) {
  const { tables } = getServices()

  const session = await tables.getRow<CvSessionRow>({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    rowId: sessionId,
  })

  if (session.userId !== userId) {
    throw new Error("No tienes acceso a esta sesión de entrevista.")
  }

  return session
}

async function getJobOfferRow(jobOfferId: string) {
  const { tables } = getServices()

  return tables.getRow<JobOfferRow>({
    databaseId: DATABASE_ID,
    tableId: JOB_OFFERS_COLLECTION_ID,
    rowId: jobOfferId,
  })
}

async function listInterviewTurns(sessionId: string) {
  const { tables } = getServices()

  const response = await tables.listRows<InterviewTurnRow>({
    databaseId: DATABASE_ID,
    tableId: INTERVIEW_TURNS_COLLECTION_ID,
    queries: [
      Query.equal("cvSession", sessionId),
      Query.orderAsc("turnIndex"),
      Query.select([
        "$id",
        "turnIndex",
        "question",
        "answer",
        "status",
        "askedAt",
        "answeredAt",
      ]),
    ],
  })

  return response.rows
}

/**
 * Persiste la primera fase de una sesión de entrevista:
 * 1. Sube el CV al bucket de Storage.
 * 2. Crea el documento `job_offer` con los datos de la oferta y el plan generado por la IA.
 * 3. Crea el documento `cv_session` vinculando la oferta.
 * 4. Crea los documentos `interview_turns` (uno por pregunta, en estado `pending`).
 *
 * Devuelve el `sessionId` para que el flujo de práctica pueda usarlo en los pasos siguientes.
 */
export async function startInterviewSession({
  cvFile,
  existingCvId,
  jobPosition,
  plan,
}: {
  cvFile: File
  existingCvId?: string
  jobPosition: string
  plan: InterviewPlan
}): Promise<StartInterviewResult> {
  const { account, tables } = getServices()
  const user = await account.get()
  const userId = user.$id
  const now = new Date().toISOString()

  const userPermissions = [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]

  // 1. Reutilizar el CV ya guardado cuando exista; si no, subir uno nuevo.
  const cvFileId = await resolveCvFileIdForSession({
    cvFile,
    existingCvId,
    userId,
    userPermissions,
  })

  // 2. Crear la fila job_offer con datos de la oferta y el plan normalizado
  const jobOffer = await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: JOB_OFFERS_COLLECTION_ID,
    rowId: ID.unique(),
    data: {
      title: plan.roleSummary,
      rawText: jobPosition,
      normalizedText: plan.roleSummary,
      createdAt: now,
    },
    permissions: userPermissions,
  })

  // 3. Crear cv_session vinculando la oferta (Appwrite resuelve el lado inverso de la relación)
  const session = await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    rowId: ID.unique(),
    data: {
      userId,
      cvFileId,
      cvText: plan.cvText,
      jobOffer: jobOffer.$id,
      status: "interviewing" satisfies InterviewSessionStatus,
      startedAt: now,
      lastActivityAt: now,
    },
    permissions: userPermissions,
  })

  const sessionId = session.$id

  // 4. Crear un interview_turn por cada pregunta del plan
  await Promise.all(
    plan.questions.map((question, index) =>
      tables.createRow({
        databaseId: DATABASE_ID,
        tableId: INTERVIEW_TURNS_COLLECTION_ID,
        rowId: ID.unique(),
        data: {
          cvSession: sessionId,
          turnIndex: index,
          question: question.text,
          status: "pending",
          askedAt: now,
        },
        permissions: userPermissions,
      }),
    ),
  )

  return { sessionId, plan }
}

export async function continueInterviewSession(
  sessionId: string,
): Promise<ContinueInterviewResult> {
  const { account } = getServices()
  const user = await account.get()
  const session = await getOwnedSession(sessionId, user.$id)
  const turns = await listInterviewTurns(sessionId)

  const loadedJobOffer = getLoadedRelation(session.jobOffer)
  const jobOfferId = loadedJobOffer?.$id ?? (typeof session.jobOffer === "string" ? session.jobOffer : null)
  const jobOffer = jobOfferId ? await getJobOfferRow(jobOfferId) : null

  const firstPendingTurn = turns.find((turn) => turn.status === "pending")
  const isInterviewComplete =
    session.status === "completed" || turns.every((turn) => turn.status !== "pending")

  return {
    sessionId,
    status: session.status,
    currentQuestionIndex: firstPendingTurn
      ? firstPendingTurn.turnIndex
      : Math.max(turns.length - 1, 0),
    isInterviewComplete,
    plan: {
      cvText: session.cvText,
      cvSummary: "",
      roleSummary: jobOffer?.title ?? "Sesión de práctica",
      focusAreas: [],
      questions: turns.map((turn) => ({
        id: turn.$id,
        text: turn.question,
      })),
    },
  }
}

export async function answerInterviewTurn({
  sessionId,
  turnIndex,
  answer,
}: {
  sessionId: string
  turnIndex: number
  answer: string
}) {
  const normalizedAnswer = answer.trim()

  if (!normalizedAnswer) {
    throw new Error("La respuesta no puede estar vacía.")
  }

  const { account, tables } = getServices()
  const user = await account.get()
  const session = await getOwnedSession(sessionId, user.$id)
  const turns = await listInterviewTurns(sessionId)
  const turn = turns.find((item) => item.turnIndex === turnIndex)

  if (!turn) {
    throw new Error("No se encontró la pregunta que intentas responder.")
  }

  if (session.status === "completed") {
    throw new Error("La sesión ya fue completada.")
  }

  const now = new Date().toISOString()

  await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: INTERVIEW_TURNS_COLLECTION_ID,
    rowId: turn.$id,
    data: {
      answer: normalizedAnswer,
      status: "answered" satisfies InterviewTurnStatus,
      answeredAt: now,
    },
  })

  await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    rowId: sessionId,
    data: {
      status: "interviewing" satisfies InterviewSessionStatus,
      lastActivityAt: now,
    },
  })
}

export async function completeInterviewSession(sessionId: string) {
  const { account, tables } = getServices()
  const user = await account.get()

  await getOwnedSession(sessionId, user.$id)

  const now = new Date().toISOString()

  await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    rowId: sessionId,
    data: {
      status: "completed" satisfies InterviewSessionStatus,
      completedAt: now,
      lastActivityAt: now,
    },
  })
}
