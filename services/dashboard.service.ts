import type { Models } from "appwrite"
import { Query } from "appwrite"

import { createAppwriteServices } from "@/lib/appwrite"

/*
 * Este archivo vive en la capa de servicios.
 *
 * La idea de un service es encapsular el acceso a datos y devolverle a la UI
 * una estructura ya lista para usar. De esa forma, los componentes del dashboard
 * no necesitan saber:
 *
 * - cómo hablar con Appwrite,
 * - qué tablas se consultan,
 * - qué relationships hay que expandir,
 * - ni cómo combinar filas, archivos y métricas derivadas.
 *
 * En este caso, el servicio toma datos crudos de Appwrite y los transforma en:
 *
 * - `entries`: filas del historial que la tabla puede renderizar directo,
 * - `summary`: métricas agregadas para lógica de negocio,
 * - `metrics`: valores ya formateados para la cabecera del dashboard.
 */

const DATABASE_ID = "espejo_cv"
const CV_SESSIONS_COLLECTION_ID = "cv_sessions"
const CV_FILES_BUCKET_ID = "cv-files"

export type DashboardSessionStatus =
	| "draft"
	| "analyzing"
	| "interviewing"
	| "completed"
	| "failed"

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
	// cvText no se selecciona en la query del dashboard para evitar traer el longtext completo.
	jobOffer?: JobOfferRow | string | null
	report?: ReportRow | string | null
	status: DashboardSessionStatus
	startedAt: string
	completedAt?: string
	lastActivityAt: string
}

export type DashboardHistoryEntry = {
	sessionId: string
	role: string
	domain: string
	date: string
	file: string
	score: number
	status: DashboardSessionStatus
	startedAt: string
	completedAt?: string
}

export type DashboardMetric = {
	label: string
	value: string
	unit: string
}

export type DashboardSummary = {
	averageScore: number
	simulations: number
	activeSessions: number
	completedSessions: number
	latestScore: number | null
}

export type DashboardData = {
	metrics: DashboardMetric[]
	entries: DashboardHistoryEntry[]
	summary: DashboardSummary
}

// TablesDB es la API moderna de Appwrite para trabajar con filas y relationships.
// Aquí se consulta la tabla `cv_sessions`, que funciona como raíz del agregado.
function getTables() {
	return createAppwriteServices().tables
}

// Storage se usa aparte porque el nombre del archivo no está dentro de la fila,
// sino en el bucket `cv-files`.
function getStorage() {
	return createAppwriteServices().storage
}

// Account permite resolver el usuario actual cuando la UI no pasa explícitamente el userId.
function getAccount() {
	return createAppwriteServices().account
}

// Appwrite devuelve 401 cuando no existe sesión activa. Para el dashboard eso no es
// necesariamente un error técnico: puede significar simplemente "no hay usuario autenticado".
function isUnauthorizedError(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: number }).code === 401
	)
}

function emptyDashboardData(): DashboardData {
	// Mantiene una respuesta estable para la UI cuando no hay sesión activa.
	// Esto evita que la capa visual tenga que lidiar con `null`, `undefined`
	// o ramas especiales para ausencia de datos.
	return {
		metrics: buildMetrics({
			averageScore: 0,
			simulations: 0,
			activeSessions: 0,
			completedSessions: 0,
			latestScore: null,
		}),
		entries: [],
		summary: {
			averageScore: 0,
			simulations: 0,
			activeSessions: 0,
			completedSessions: 0,
			latestScore: null,
		},
	}
}

function formatDate(value: string) {
	// Convierte el ISO guardado por Appwrite a una fecha legible para la tabla.
	return new Intl.DateTimeFormat("es-ES", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value))
}

function formatFileName(fileId: string, fileName?: string) {
	// Si Storage responde con el nombre real del archivo, se usa ese valor.
	// Si no, se genera un fallback estable para no romper la tabla.
	if (fileName) {
		return fileName
	}

	return `CV_${fileId.slice(0, 8)}.pdf`
}

function toScore(value?: number) {
	// Normaliza números opcionales a un entero seguro para la UI.
	return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function getLoadedRelation<T>(value?: T | string | null) {
	// Si la relationship no fue expandida, Appwrite devuelve solo el ID relacionado.
	// Este helper nos deja trabajar siempre con `row expandida` o `null`,
	// que es mucho más cómodo que propagar la unión `row | string | null`.
	if (!value || typeof value === "string") {
		return null
	}

	return value
}

async function listSessions(userId: string, limit = 10) {
	// El dashboard lista desde la sesión y expande solo los campos mínimos que necesita.
	//
	// `Query.select([...])` es importante en Appwrite:
	// por defecto una relationship no trae la fila relacionada completa,
	// sino solo su ID. Para obtener datos como `jobOffer.title` o
	// `report.overallScore`, hay que pedirlos explícitamente.
	//
	// La consulta queda así:
	// 1. filtra sesiones del usuario,
	// 2. ordena por fecha descendente,
	// 3. limita el volumen,
	// 4. expande solo los campos relacionados que la UI realmente usa.
	const response = await getTables().listRows<CvSessionRow>({
		databaseId: DATABASE_ID,
		tableId: CV_SESSIONS_COLLECTION_ID,
		queries: [
			Query.equal("userId", userId),
			Query.orderDesc("startedAt"),
			Query.limit(limit),
			Query.select([
				"$id",
				"userId",
				"cvFileId",
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

	// TablesDB devuelve `rows`; la API legacy de Databases devolvía `documents`.
	return response.rows
}

async function getSessionFileName(fileId: string) {
	// El nombre visible del archivo vive en Storage, no en la fila de la sesión.
	// Si esta lectura falla, el dashboard sigue funcionando con un nombre fallback.
	try {
		const file = await getStorage().getFile(CV_FILES_BUCKET_ID, fileId)
		return file.name
	} catch {
		return null
	}
}

async function buildHistoryEntry(session: CvSessionRow): Promise<DashboardHistoryEntry> {
	// Los datos vienen de las relationships expandidas.
	const jobOffer = getLoadedRelation(session.jobOffer)
	const report = getLoadedRelation(session.report)
	const fileName = await getSessionFileName(session.cvFileId)

	const score = toScore(report?.overallScore)

	return {
		sessionId: session.$id,
		role: jobOffer?.title ?? "Sesión de práctica",
		domain:
			jobOffer?.company ??
			jobOffer?.seniority ??
			"—",
		date: formatDate(session.startedAt),
		file: formatFileName(session.cvFileId, fileName ?? undefined),
		score,
		status: session.status,
		startedAt: session.startedAt,
		completedAt: session.completedAt,
	}
}

function buildSummary(sessions: CvSessionRow[]): DashboardSummary {
	// El resumen se deriva de TODAS las sesiones de Appwrite (sin límite visual).
	// Extraemos directamente de las rows para evitar llamadas a Storage en métricas globales.
	const simulations = sessions.length
	
	const scores = sessions
		.map((session) => {
			const report = getLoadedRelation(session.report)
			return toScore(report?.overallScore)
		})
		.filter((score) => score > 0)

	const completedSessions = sessions.filter((entry) => entry.status === "completed").length
	const activeSessions = sessions.filter(
		(entry) =>
			entry.status === "draft" ||
			entry.status === "analyzing" ||
			entry.status === "interviewing",
	).length

	return {
		averageScore:
			scores.length > 0
				? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
				: 0,
		simulations,
		activeSessions,
		completedSessions,
		latestScore: scores.length > 0 ? scores[0] : null,
	}
}

function buildMetrics(summary: DashboardSummary): DashboardMetric[] {
	// La cabecera del dashboard solo necesita dos métricas resumidas por ahora.
	// Este paso separa la métrica de negocio (`summary`) del formato visual (`metrics`).
	return [
		{
			label: "SCORE PROMEDIO",
			value: String(summary.averageScore),
			unit: "%",
		},
		{
			label: "SIMULACIONES",
			value: String(summary.simulations),
			unit: "",
		},
	]
}

export async function getDashboardDataForUser(
	userId: string,
	limit = 4,
): Promise<DashboardData> {
	// Este es el punto de entrada principal para componer los datos de la vista.
	// 1. Traemos un histórico grande (hasta 5000) para poder calcular las métricas correctas:
	const allSessions = await listSessions(userId, 5000)
	
	// 2. Calculamos las métricas globales con TODAS las sesiones:
	const summary = buildSummary(allSessions)

	// 3. Limitamos solo los historiales que se van a mostrar visualmente (entries)
	const displaySessions = allSessions.slice(0, limit)
	const entries = await Promise.all(displaySessions.map((session) => buildHistoryEntry(session)))

	return {
		metrics: buildMetrics(summary),
		entries,
		summary,
	}
}

export async function getCurrentDashboardData(limit = 4): Promise<DashboardData> {
	// Permite usar el servicio sin pasar userId cuando ya existe una sesión Appwrite activa.
	// Es útil para páginas protegidas donde el usuario ya inició sesión y solo se
	// necesita resolver "quién soy" antes de consultar los datos.
	try {
		const user = await getAccount().get()
		return getDashboardDataForUser(user.$id, limit)
	} catch (error) {
		if (isUnauthorizedError(error)) {
			return emptyDashboardData()
		}

		throw error
	}
}

export async function getDashboardSessions(userId: string, limit = 10) {
	// Devuelve filas crudas de sesión para casos donde todavía no hace falta
	// construir todo el view model del dashboard.
	return listSessions(userId, limit)
}

export async function getDashboardMetrics(userId: string) {
	// Atajo para consumidores que solo quieren el resumen agregado.
	const { summary } = await getDashboardDataForUser(userId)
	return summary
}

export async function getDashboardHistoryEntries(userId: string, limit = 4) {
	// Atajo para consumidores que solo quieren la tabla de historial.
	const { entries } = await getDashboardDataForUser(userId, limit)
	return entries
}
