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

function getLoadedRelation<T>(value?: T | string | null) {
  if (!value || typeof value === "string") {
    return null
  }

  return value
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
  jobPosition,
  plan,
}: {
  cvFile: File
  jobPosition: string
  plan: InterviewPlan
}): Promise<StartInterviewResult> {
  const { account, tables, storage } = getServices()
  const user = await account.get()
  const userId = user.$id
  const now = new Date().toISOString()

  const userPermissions = [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]

  // 1. Subir CV al bucket de Storage
  const uploadedFile = await storage.createFile(
    CV_FILES_BUCKET_ID,
    ID.unique(),
    cvFile,
    userPermissions,
  )

  const cvFileId = uploadedFile.$id

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
