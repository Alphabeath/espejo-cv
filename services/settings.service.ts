import { ID, Permission, Query, Role } from "appwrite"
import type { Models } from "appwrite"
import { createAppwriteServices } from "@/lib/appwrite"

const CV_FILES_BUCKET_ID = "cv-files"
const DATABASE_ID = "espejo_cv"
const CV_SESSIONS_COLLECTION_ID = "cv_sessions"

type JobOfferRow = Models.Row & {
  title?: string
  company?: string
  seniority?: string
}

type ReportRow = Models.Row & {
  overallScore: number
}

type CvSessionRow = Models.Row & {
  userId: string
  cvFileId: string
  jobOffer?: JobOfferRow | string | null
  report?: ReportRow | string | null
  status: string
  startedAt: string
  completedAt?: string
  lastActivityAt: string
}

export type PracticeHistoryEntry = {
  sessionId: string
  role: string
  company: string
  date: string
  score: number
  status: string
  startedAt: string
}

function getAccount() {
  return createAppwriteServices().account
}

function getStorage() {
  return createAppwriteServices().storage
}

function getTables() {
  return createAppwriteServices().tables
}

function getLoadedRelation<T>(value?: T | string | null) {
  if (!value || typeof value === "string") {
    return null
  }

  return value
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

// ─── User profile ───────────────────────────────────────────────────────────

export async function updateUserName(name: string) {
  return await getAccount().updateName(name)
}

export async function updateUserEmail(email: string, password: string) {
  return await getAccount().updateEmail(email, password)
}

export async function updatePreferences(prefs: Record<string, any>) {
  return await getAccount().updatePrefs(prefs)
}

// ─── CV file management ─────────────────────────────────────────────────────

export async function uploadCvFile(file: File) {
  const account = getAccount()
  const user = await account.get()

  const permissions = [
    Permission.read(Role.user(user.$id)),
    Permission.write(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id)),
  ]

  const uploadedFile = await getStorage().createFile(
    CV_FILES_BUCKET_ID,
    ID.unique(),
    file,
    permissions,
  )

  const prefs = user.prefs as Record<string, unknown>
  let cvList: { id: string; isPrimary?: boolean }[] = []

  if (prefs.cvList) {
    try {
      const parsed = typeof prefs.cvList === "string" ? JSON.parse(prefs.cvList) : prefs.cvList
      if (Array.isArray(parsed)) {
        cvList = parsed
      }
    } catch {
      // ignore
    }
  }

  const hasPrimary = cvList.some((cv) => cv.isPrimary)

  cvList.push({
    id: uploadedFile.$id,
    isPrimary: !hasPrimary,
  })

  await account.updatePrefs({
    ...prefs,
    cvList: JSON.stringify(cvList),
  })

  return uploadedFile
}

export async function deleteCvFile(fileId: string) {
  return await getStorage().deleteFile(CV_FILES_BUCKET_ID, fileId)
}

export function getCvDownloadUrl(fileId: string) {
  const { storage } = createAppwriteServices()
  return storage.getFileDownload(CV_FILES_BUCKET_ID, fileId).toString()
}

// ─── Hidden CVs (soft delete) ───────────────────────────────────────────────

function parseHiddenCvIds(prefs: Record<string, unknown>): string[] {
  const raw = prefs.hiddenCvIds

  if (!raw) {
    return []
  }

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((id): id is string => typeof id === "string")
  } catch {
    return []
  }
}

export async function getHiddenCvIds(): Promise<string[]> {
  const user = await getAccount().get()
  return parseHiddenCvIds(user.prefs as Record<string, unknown>)
}

export async function hideCvFile(fileId: string): Promise<void> {
  const account = getAccount()
  const user = await account.get()
  const prefs = user.prefs as Record<string, unknown>
  const currentHidden = parseHiddenCvIds(prefs)

  if (currentHidden.includes(fileId)) {
    return
  }

  await account.updatePrefs({
    ...prefs,
    hiddenCvIds: JSON.stringify([...currentHidden, fileId]),
  })
}

export async function restoreCvFile(fileId: string): Promise<void> {
  const account = getAccount()
  const user = await account.get()
  const prefs = user.prefs as Record<string, unknown>
  const currentHidden = parseHiddenCvIds(prefs)
  const updated = currentHidden.filter((id) => id !== fileId)

  await account.updatePrefs({
    ...prefs,
    hiddenCvIds: JSON.stringify(updated),
  })
}

// ─── Practice history (sessions with job offers) ────────────────────────────

export async function getUserPracticeHistory(
  limit = 20,
): Promise<PracticeHistoryEntry[]> {
  const account = getAccount()
  const user = await account.get()

  const response = await getTables().listRows<CvSessionRow>({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    queries: [
      Query.equal("userId", user.$id),
      Query.orderDesc("startedAt"),
      Query.limit(limit),
      Query.select([
        "$id",
        "status",
        "startedAt",
        "completedAt",
        "lastActivityAt",
        "jobOffer.title",
        "jobOffer.company",
        "jobOffer.seniority",
        "report.overallScore",
      ]),
    ],
  })

  return response.rows.map((session) => {
    const jobOffer = getLoadedRelation(session.jobOffer)
    const report = getLoadedRelation(session.report)

    return {
      sessionId: session.$id,
      role: jobOffer?.title ?? "Sesión de práctica",
      company:
        jobOffer?.company ??
        jobOffer?.seniority ??
        "—",
      date: formatDate(session.startedAt),
      score:
        typeof report?.overallScore === "number" && Number.isFinite(report.overallScore)
          ? report.overallScore
          : 0,
      status: session.status,
      startedAt: session.startedAt,
    }
  })
}
