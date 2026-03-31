import type { Models } from "appwrite"
import { ID, Permission, Query, Role } from "appwrite"

import { createAppwriteServices } from "@/lib/appwrite"

const DATABASE_ID = "espejo_cv"
const CV_SESSIONS_COLLECTION_ID = "cv_sessions"
const JOB_OFFERS_COLLECTION_ID = "job_offers"
const INTERVIEW_TURNS_COLLECTION_ID = "interview_turns"
const REPORTS_COLLECTION_ID = "reports"

function getServices() {
  return createAppwriteServices()
}

// ─── Row types ──────────────────────────────────────────────────────────────

type JobOfferRow = Models.Row & {
  title?: string
  company?: string
  rawText: string
  normalizedText: string
}

type ReportRow = Models.Row & {
  cvSession?: string | Models.Row | null
  overallScore: number
  summary: string
  strengths?: string
  gaps?: string
  recommendations?: string
  confidence?: number
  durationInSeconds?: number
  generatedAt: string
  modelVersion?: string
}

type CvSessionRow = Models.Row & {
  userId: string
  cvFileId: string
  cvText: string
  jobOffer?: JobOfferRow | string | null
  report?: ReportRow | string | null
  status: string
  startedAt: string
  completedAt?: string
  lastActivityAt: string
}

type InterviewTurnRow = Models.Row & {
  cvSession?: CvSessionRow | string | null
  turnIndex: number
  question: string
  answer?: string
  score?: number
  feedback?: string
  status: string
  askedAt: string
  answeredAt?: string
}

// ─── Public types ───────────────────────────────────────────────────────────

export type SessionFeedbackData = {
  sessionId: string
  userId: string
  cvText: string
  jobPosition: string
  turns: {
    id: string
    turnIndex: number
    question: string
    answer: string
  }[]
}

export type SaveReportInput = {
  overallScore: number
  summary: string
  strengths: string
  gaps: string
  recommendations: string
  durationInSeconds?: number
}

export type FeedbackHistoryEntry = {
  sessionId: string
  role: string
  date: string
  durationInSeconds?: number
  score: number
  status: string
  startedAt: string
}

export type UserFeedbackSummary = {
  averageScore: number
  bestScore: number
  totalSessions: number
  completedSessions: number
  recentHistory: FeedbackHistoryEntry[]
}

export type SessionTurnDetail = {
  turnIndex: number
  question: string
  answer: string
  score: number
  feedback: string
}

export type FeedbackItemParsed = {
  label: string
  description: string
}

export type SessionDetail = {
  sessionId: string
  jobPosition: string
  date: string
  durationInSeconds?: number
  overallScore: number
  summary: string
  strengths: FeedbackItemParsed[]
  gaps: FeedbackItemParsed[]
  recommendations: FeedbackItemParsed[]
  turns: SessionTurnDetail[]
  totalQuestions: number
}

export class SessionRedirectError extends Error {
  destination: string

  constructor(message: string, destination: string) {
    super(message)
    this.name = "SessionRedirectError"
    this.destination = destination
  }
}

function canResumeInterview(status: string) {
  return status === "draft" || status === "analyzing" || status === "interviewing"
}

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Session data reader ────────────────────────────────────────────────────

export async function getSessionFeedbackData(
  sessionId: string,
): Promise<SessionFeedbackData> {
  const { account, tables } = getServices()
  const user = await account.get()
  const userId = user.$id

  const session = await tables.getRow<CvSessionRow>({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    rowId: sessionId,
  })

  if (session.userId !== userId) {
    throw new Error("No tienes acceso a esta sesión.")
  }

  // Resolve job offer
  const loadedJobOffer = getLoadedRelation(session.jobOffer)
  const jobOfferId =
    loadedJobOffer?.$id ??
    (typeof session.jobOffer === "string" ? session.jobOffer : null)

  let jobPosition = "Sesión de práctica"

  if (jobOfferId) {
    const jobOffer = await tables.getRow<JobOfferRow>({
      databaseId: DATABASE_ID,
      tableId: JOB_OFFERS_COLLECTION_ID,
      rowId: jobOfferId,
    })
    jobPosition = jobOffer.title ?? jobOffer.normalizedText ?? jobPosition
  }

  // Load turns
  const turnsResponse = await tables.listRows<InterviewTurnRow>({
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
      ]),
    ],
  })

  const answeredTurns = turnsResponse.rows
    .filter((turn) => turn.answer && turn.answer.trim().length > 0)
    .map((turn) => ({
      id: turn.$id,
      turnIndex: turn.turnIndex,
      question: turn.question,
      answer: turn.answer!,
    }))

  return {
    sessionId,
    userId,
    cvText: session.cvText,
    jobPosition,
    turns: answeredTurns,
  }
}

// ─── Report CRUD ────────────────────────────────────────────────────────────

export async function getExistingReport(
  sessionId: string,
): Promise<ReportRow | null> {
  const { tables } = getServices()

  try {
    const response = await tables.listRows<ReportRow>({
      databaseId: DATABASE_ID,
      tableId: REPORTS_COLLECTION_ID,
      queries: [
        Query.equal("cvSession", sessionId),
        Query.limit(1),
      ],
    })

    return response.rows.length > 0 ? response.rows[0] : null
  } catch {
    return null
  }
}

export async function saveReport(
  sessionId: string,
  userId: string,
  report: SaveReportInput,
): Promise<ReportRow> {
  const { tables } = getServices()

  const userPermissions = [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]

  const row = await tables.createRow<ReportRow>({
    databaseId: DATABASE_ID,
    tableId: REPORTS_COLLECTION_ID,
    rowId: ID.unique(),
    data: {
      cvSession: sessionId,
      overallScore: report.overallScore,
      summary: report.summary,
      strengths: report.strengths,
      gaps: report.gaps,
      recommendations: report.recommendations,
        durationInSeconds: report.durationInSeconds,
      generatedAt: new Date().toISOString(),
    },
    permissions: userPermissions,
  })

  return row
}

// ─── Turn feedback writer ───────────────────────────────────────────────────

export async function updateTurnFeedback(
  turnId: string,
  score: number,
  feedback: string,
) {
  const { tables } = getServices()

  await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: INTERVIEW_TURNS_COLLECTION_ID,
    rowId: turnId,
    data: {
      score,
      feedback,
      status: "reviewed",
    },
  })
}

// ─── User feedback summary (for the feedback page) ─────────────────────────

export async function getUserFeedbackSummary(): Promise<UserFeedbackSummary> {
  const { account, tables } = getServices()
  const user = await account.get()
  const userId = user.$id

  const response = await tables.listRows<CvSessionRow>({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    queries: [
      Query.equal("userId", userId),
      Query.orderDesc("startedAt"),
      Query.limit(20),
      Query.select([
        "$id",
        "status",
        "startedAt",
        "completedAt",
        "lastActivityAt",
        "jobOffer.title",
        "report.overallScore",
      ]),
    ],
  })

  const sessions = response.rows
  const completedSessions = sessions.filter((s) => s.status === "completed")

  const scores = completedSessions
    .map((s) => {
      const report = getLoadedRelation(s.report)
      return report?.overallScore ?? 0
    })
    .filter((score) => score > 0)

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0

  const bestScore = scores.length > 0 ? Math.max(...scores) : 0

  const recentHistory: FeedbackHistoryEntry[] = sessions.map((s) => {
    const jobOffer = getLoadedRelation(s.jobOffer)
    const report = getLoadedRelation(s.report)

    return {
      sessionId: s.$id,
      role: jobOffer?.title ?? "Sesión de práctica",
      date: formatDate(s.startedAt),
      score: report?.overallScore ?? 0,
        durationInSeconds: report?.durationInSeconds ?? 0,
      status: s.status,
      startedAt: s.startedAt,
    }
  })

  return {
    averageScore,
    bestScore,
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    recentHistory,
  }
}

// ─── Session detail (read-only, for detail page) ────────────────────────────

function safeParse(value?: string | null): FeedbackItemParsed[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function getSessionDetail(
  sessionId: string,
): Promise<SessionDetail> {
  const { account, tables } = getServices()
  const user = await account.get()

  const session = await tables.getRow<CvSessionRow>({
    databaseId: DATABASE_ID,
    tableId: CV_SESSIONS_COLLECTION_ID,
    rowId: sessionId,
  })

  if (session.userId !== user.$id) {
    throw new Error("No tienes acceso a esta sesión.")
  }

  // Resolve job offer
  const loadedJobOffer = getLoadedRelation(session.jobOffer)
  const jobOfferId =
    loadedJobOffer?.$id ??
    (typeof session.jobOffer === "string" ? session.jobOffer : null)

  let jobPosition = "Sesión de práctica"

  if (jobOfferId) {
    const jobOffer = await tables.getRow<JobOfferRow>({
      databaseId: DATABASE_ID,
      tableId: JOB_OFFERS_COLLECTION_ID,
      rowId: jobOfferId,
    })
    jobPosition = jobOffer.title ?? jobOffer.normalizedText ?? jobPosition
  }

  // Load report
  const report = await getExistingReport(sessionId)

  if (!report) {
    if (canResumeInterview(session.status)) {
      throw new SessionRedirectError(
        "Esta sesión aún no está completada. Te llevamos a la entrevista para continuarla.",
        `/dashboard/practice?sessionId=${sessionId}`,
      )
    }

    throw new Error("Esta sesión aún no tiene un reporte generado.")
  }

  // Load turns with feedback
  const turnsResponse = await tables.listRows<InterviewTurnRow>({
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
        "score",
        "feedback",
        "status",
      ]),
    ],
  })

  const turns: SessionTurnDetail[] = turnsResponse.rows
    .filter((t) => t.answer && t.answer.trim().length > 0)
    .map((t) => ({
      turnIndex: t.turnIndex,
      question: t.question,
      answer: t.answer!,
      score: t.score ?? 0,
      feedback: t.feedback ?? "",
    }))

  return {
    sessionId,
    jobPosition,
    date: formatDate(session.startedAt),
    durationInSeconds: report.durationInSeconds ?? 0,
    overallScore: report.overallScore ?? 0,
    summary: report.summary,
    strengths: safeParse(report.strengths),
    gaps: safeParse(report.gaps),
    recommendations: safeParse(report.recommendations),
    turns,
    totalQuestions: turnsResponse.rows.length,
  }
}

