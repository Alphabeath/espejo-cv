import "server-only"

import { experimental_transcribe as transcribe, generateObject } from "ai"
import { cerebras } from "@ai-sdk/cerebras"
import { deepgram } from "@ai-sdk/deepgram"
import { groq } from "@ai-sdk/groq"
import { PdfReader } from "pdfreader"
import { z } from "zod"

import type { AudioTranscription, InterviewPlan } from "@/lib/ai-types"

const MAX_CV_TEXT_LENGTH = 14_000
const INTERVIEW_QUESTION_COUNT = 5
const MAX_ROLE_SUMMARY_LENGTH = 80
const DEFAULT_INTERVIEW_PROVIDER = "groq"
const GROQ_INTERVIEW_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
const CEREBRAS_INTERVIEW_MODEL = "qwen-3-235b-a22b-instruct-2507"

type InterviewObjectProvider = "cerebras" | "groq"

const interviewPlanSchema = z.object({
	cvSummary: z.string().min(1).max(600),
	roleSummary: z.string().min(1).max(MAX_ROLE_SUMMARY_LENGTH),
	focusAreas: z.array(z.string().min(1).max(120)).min(3).max(6),
	questions: z
		.array(
			z.object({
				id: z.string().min(1).max(50),
				text: z.string().min(1).max(240),
			}),
		)
		.min(INTERVIEW_QUESTION_COUNT)
		.max(INTERVIEW_QUESTION_COUNT + 3),
})

const interviewPlanProviderSchema = z.object({
	cvSummary: z.string(),
	roleSummary: z.string(),
	focusAreas: z.array(z.string()).min(3).max(6),
	questions: z
		.array(
			z.object({
				id: z.string(),
				text: z.string(),
			}),
		)
		.min(INTERVIEW_QUESTION_COUNT)
		.max(INTERVIEW_QUESTION_COUNT + 3),
})

function ensureEnv(name: string) {
	const value = process.env[name]

	if (!value) {
		throw new Error(`Falta la variable de entorno ${name}.`)
	}

	return value
}

function normalizeWhitespace(value: string) {
	return value.replace(/\s+/g, " ").trim()
}

function truncateText(value: string, maxLength: number) {
	if (value.length <= maxLength) {
		return value
	}

	return `${value.slice(0, maxLength)}...`
}

function resolveInterviewProvider(): InterviewObjectProvider {
	const configuredProvider = process.env.AI_TEXT_PROVIDER?.trim().toLowerCase()

	if (!configuredProvider) {
		if (process.env.CEREBRAS_API_KEY) {
			return DEFAULT_INTERVIEW_PROVIDER
		}

		if (process.env.GROQ_API_KEY) {
			return "groq"
		}

		throw new Error(
			"Falta la variable de entorno CEREBRAS_API_KEY o GROQ_API_KEY para generar contenido de IA.",
		)
	}

	if (configuredProvider === "cerebras" || configuredProvider === "groq") {
		return configuredProvider
	}

	throw new Error(
		"AI_TEXT_PROVIDER debe ser 'cerebras' o 'groq'.",
	)
}

function getInterviewProviderOptions(provider: InterviewObjectProvider): Record<string, Record<string, boolean>> {
	if (provider === "groq") {
		return {
			groq: {
				structuredOutputs: true,
				strictJsonSchema: true,
			},
		}
	}

	return {
		cerebras: {
			strictJsonSchema: true,
		},
	}
}

function getInterviewGenerationConfig() {
	const provider = resolveInterviewProvider()

	if (provider === "groq") {
		ensureEnv("GROQ_API_KEY")

		return {
			provider,
			model: groq(GROQ_INTERVIEW_MODEL),
			providerOptions: getInterviewProviderOptions(provider),
		}
	}

	ensureEnv("CEREBRAS_API_KEY")

	return {
		provider,
		model: cerebras(CEREBRAS_INTERVIEW_MODEL),
		providerOptions: getInterviewProviderOptions(provider),
	}
}

function getInterviewPlanGenerationSchema(provider: InterviewObjectProvider) {
	return provider === "cerebras"
		? interviewPlanProviderSchema
		: interviewPlanSchema
}

function normalizeList(values: string[], maxItems: number, maxLength: number) {
	return values
		.map((value) => truncateText(normalizeWhitespace(value), maxLength))
		.filter(Boolean)
		.slice(0, maxItems)
}

function sanitizeInterviewPlanObject(
	object: z.infer<typeof interviewPlanProviderSchema>,
) {
	return interviewPlanSchema.parse({
		cvSummary: truncateText(normalizeWhitespace(object.cvSummary), 600),
		roleSummary: truncateText(
			normalizeWhitespace(object.roleSummary),
			MAX_ROLE_SUMMARY_LENGTH,
		),
		focusAreas: normalizeList(object.focusAreas, 6, 120),
		questions: object.questions
			.map((question, index) => ({
				id:
					truncateText(normalizeWhitespace(question.id), 50) ||
					`question-${index + 1}`,
				text: truncateText(normalizeWhitespace(question.text), 240),
			}))
			.filter((question) => question.text.length > 0)
			.slice(0, INTERVIEW_QUESTION_COUNT),
	})
}

function buildInterviewPlanPrompt(jobPosition: string, cvText: string) {
	return [
		"Actúa como reclutador con experiencia y de ser necesario técnico.",
		"Analiza el CV y el puesto. Genera un plan breve de entrevista en español.",
		`En roleSummary devuelve solo un título breve y limpio del puesto, apto para UI, de máximo ${MAX_ROLE_SUMMARY_LENGTH} caracteres.`,
		"roleSummary no debe incluir empresa, modalidad, ubicación, seniority redundante, stack excesivo ni detalles largos de la vacante salvo que sean esenciales para identificar el rol.",
		`Devuelve exactamente ${INTERVIEW_QUESTION_COUNT} preguntas personalizadas, claras y sin respuesta sugerida.`,
		`No devuelvas una sexta pregunta ni variantes extra. El máximo permitido es ${INTERVIEW_QUESTION_COUNT}.`,
		"Las preguntas deben mezclar experiencia, ajuste al rol, logros y capacidad de resolución.",
		"No generes evaluación final ni scoring.",
		`Puesto: ${jobPosition}`,
		`CV extraído: ${cvText}`,
	].join("\n\n")
}

function buildInterviewFeedbackPrompt({
	jobPosition,
	cvText,
	turnsBlock,
	turnCount,
}: {
	jobPosition: string
	cvText: string
	turnsBlock: string
	turnCount: number
}) {
	return [
		"Actúa como un evaluador de entrevistas de trabajo con experiencia en selección de personal y evaluación de competencias.",
		"Analiza las respuestas de esta entrevista de práctica comparándolas con el CV del candidato y los requisitos del puesto, recuerda que es una entrevista oral",
		"",
		"Criterios de evaluación:",
		"- Relevancia de la respuesta a la pregunta formulada",
		"- Estructura y claridad (método STAR u otra estructura coherente)",
		"- Profundidad técnica y ejemplos concretos",
		"- Ajuste cultural y comunicación profesional",
		"- Coherencia con la experiencia declarada en el CV",
		"",
		"Devuelve:",
		"- overallScore: puntaje global 0–100",
		"- summary: resumen general del desempeño en 2-3 oraciones",
		"- confidence: confianza de tu análisis 0–100",
		"- strengths: de 2 a 4 fortalezas detectadas, cada una con label corto y descripción",
		"- gaps: de 1 a 4 brechas o áreas de mejora, cada una con label y descripción",
		"- recommendations: de 2 a 4 recomendaciones accionables, cada una con label y descripción",
		"- turnScores: una evaluación por cada pregunta respondida con turnIndex (empezando en 0), score 0–100 y feedback breve",
		"",
		"Todo el output debe estar en español y usando un tono profesional y constructivo.",
		"",
		`Puesto: ${jobPosition}`,
		"",
		`CV del candidato: ${truncateText(cvText, MAX_CV_TEXT_LENGTH)}`,
		"",
		`Entrevista (${turnCount} preguntas):`,
		turnsBlock,
	].join("\n")
}

async function extractPdfText(cvFile: File) {
	if (cvFile.type !== "application/pdf") {
		throw new Error("El CV debe estar en formato PDF.")
	}

	const buffer = Buffer.from(await cvFile.arrayBuffer())

	const text = await new Promise<string>((resolve, reject) => {
		const fragments: Array<{
			page: number
			y: number
			x: number
			text: string
		}> = []
		let currentPage = 1

		new PdfReader().parseBuffer(buffer, (error, item) => {
			if (error) {
				reject(error)
				return
			}

			if (!item) {
				const orderedText = fragments
					.sort((left, right) => {
						if (left.page !== right.page) {
							return left.page - right.page
						}

						const sameLine = Math.abs(left.y - right.y) < 0.3

						if (!sameLine) {
							return left.y - right.y
						}

						return left.x - right.x
					})
					.map((fragment) => fragment.text)
					.join(" ")

				resolve(normalizeWhitespace(orderedText))
				return
			}

			if ("page" in item && typeof item.page === "number") {
				currentPage = item.page
				return
			}

			if (
				"text" in item &&
				typeof item.text === "string" &&
				typeof item.x === "number" &&
				typeof item.y === "number"
			) {
				fragments.push({
					page: currentPage,
					x: item.x,
					y: item.y,
					text: item.text,
				})
			}
		})
	})

	if (text.length < 80) {
		throw new Error(
			"No se pudo extraer suficiente texto del CV. Verifica que el PDF tenga texto seleccionable.",
		)
	}

	return truncateText(text, MAX_CV_TEXT_LENGTH)
}

export async function generateInterviewPlan({
	cvFile,
	jobPosition,
}: {
	cvFile: File
	jobPosition: string
}): Promise<InterviewPlan> {
	const generationConfig = getInterviewGenerationConfig()

	const normalizedJobPosition = normalizeWhitespace(jobPosition)

	if (normalizedJobPosition.length < 10) {
		throw new Error("Describe mejor el puesto para generar preguntas relevantes.")
	}

	const cvText = await extractPdfText(cvFile)

	const { object } = await generateObject({
		model: generationConfig.model,
		schema: getInterviewPlanGenerationSchema(generationConfig.provider),
		schemaName: "interview_plan",
		schemaDescription:
			"Plan de entrevista basado en CV y descripción del puesto, con un título corto del rol y preguntas concretas en español.",
		prompt: buildInterviewPlanPrompt(normalizedJobPosition, cvText),
		providerOptions: generationConfig.providerOptions,
	})

	const parsedObject = sanitizeInterviewPlanObject(object)

	return {
		cvText,
		cvSummary: parsedObject.cvSummary,
		roleSummary: parsedObject.roleSummary,
		focusAreas: parsedObject.focusAreas,
		questions: parsedObject.questions.slice(0, INTERVIEW_QUESTION_COUNT).map((question, index) => ({
			id: question.id || `question-${index + 1}`,
			text: question.text,
		})),
	}
}

export async function transcribeInterviewAudio({
	audioFile,
	language = "es",
}: {
	audioFile: File
	language?: string
}): Promise<AudioTranscription> {
	ensureEnv("DEEPGRAM_API_KEY")

	if (audioFile.size === 0) {
		throw new Error("El archivo de audio está vacío.")
	}

	const result = await transcribe({
		model: deepgram.transcription("nova-3"),
		audio: Buffer.from(await audioFile.arrayBuffer()),
		providerOptions: {
			deepgram: {
				language,
				detectLanguage: !language,
				punctuate: true,
				smartFormat: true,
				diarize: false,
				utterances: true,
				fillerWords: false,
			},
		},
	})

	return {
		text: normalizeWhitespace(result.text),
		durationInSeconds: result.durationInSeconds ?? null,
		language: result.language ?? null,
		segments: result.segments.map((segment) => ({
			text: normalizeWhitespace(segment.text),
			startSecond: segment.startSecond,
			endSecond: segment.endSecond,
		})),
	}
}

// ─── Interview Feedback Generation ──────────────────────────────────────────

export type InterviewTurnFeedback = {
	turnIndex: number
	score: number
	feedback: string
}

export type FeedbackItem = {
	label: string
	description: string
}

export type InterviewFeedback = {
	overallScore: number
	summary: string
	confidence: number
	strengths: FeedbackItem[]
	gaps: FeedbackItem[]
	recommendations: FeedbackItem[]
	turnScores: InterviewTurnFeedback[]
}

const feedbackItemSchema = z.object({
	label: z.string().min(1).max(80),
	description: z.string().min(1).max(300),
})

const feedbackItemProviderSchema = z.object({
	label: z.string(),
	description: z.string(),
})

const interviewFeedbackSchema = z.object({
	overallScore: z.number().int().min(0).max(100),
	summary: z.string().min(10).max(800),
	confidence: z.number().int().min(0).max(100),
	strengths: z.array(feedbackItemSchema).min(1).max(5),
	gaps: z.array(feedbackItemSchema).min(1).max(5),
	recommendations: z.array(feedbackItemSchema).min(1).max(5),
	turnScores: z
		.array(
			z.object({
				turnIndex: z.number().int().min(0),
				score: z.number().int().min(0).max(100),
				feedback: z.string().min(1).max(400),
			}),
		)
		.min(1),
})

const interviewFeedbackProviderSchema = z.object({
	overallScore: z.number().int().min(0).max(100),
	summary: z.string(),
	confidence: z.number().int().min(0).max(100),
	strengths: z.array(feedbackItemProviderSchema).min(1).max(5),
	gaps: z.array(feedbackItemProviderSchema).min(1).max(5),
	recommendations: z.array(feedbackItemProviderSchema).min(1).max(5),
	turnScores: z
		.array(
			z.object({
				turnIndex: z.number().int().min(0),
				score: z.number().int().min(0).max(100),
				feedback: z.string(),
			}),
		)
		.min(1),
})

function getInterviewFeedbackGenerationSchema(provider: InterviewObjectProvider) {
	return provider === "cerebras"
		? interviewFeedbackProviderSchema
		: interviewFeedbackSchema
}

function sanitizeInterviewFeedbackObject(
	object: z.infer<typeof interviewFeedbackProviderSchema>,
) {
	return interviewFeedbackSchema.parse({
		overallScore: object.overallScore,
		summary: truncateText(normalizeWhitespace(object.summary), 800),
		confidence: object.confidence,
		strengths: object.strengths.map((item) => ({
			label: truncateText(normalizeWhitespace(item.label), 80),
			description: truncateText(normalizeWhitespace(item.description), 300),
		})),
		gaps: object.gaps.map((item) => ({
			label: truncateText(normalizeWhitespace(item.label), 80),
			description: truncateText(normalizeWhitespace(item.description), 300),
		})),
		recommendations: object.recommendations.map((item) => ({
			label: truncateText(normalizeWhitespace(item.label), 80),
			description: truncateText(normalizeWhitespace(item.description), 300),
		})),
		turnScores: object.turnScores.map((turn) => ({
			turnIndex: turn.turnIndex,
			score: turn.score,
			feedback: truncateText(normalizeWhitespace(turn.feedback), 400),
		})),
	})
}

export type InterviewTurnInput = {
	turnIndex: number
	question: string
	answer: string
}

export async function generateInterviewFeedback({
	cvText,
	jobPosition,
	turns,
}: {
	cvText: string
	jobPosition: string
	turns: InterviewTurnInput[]
}): Promise<InterviewFeedback> {
	const generationConfig = getInterviewGenerationConfig()

	if (turns.length === 0) {
		throw new Error("No hay respuestas para evaluar.")
	}

	const turnsBlock = turns
		.map(
			(t, i) =>
				`Pregunta ${i + 1}: ${t.question}\nRespuesta: ${t.answer || "(sin respuesta)"}`,
		)
		.join("\n\n")

	const { object } = await generateObject({
		model: generationConfig.model,
		schema: getInterviewFeedbackGenerationSchema(generationConfig.provider),
		schemaName: "interview_feedback",
		schemaDescription:
			"Evaluación completa de una entrevista de práctica, con puntaje global, fortalezas, brechas, recomendaciones y evaluación por pregunta, todo en español.",
		prompt: buildInterviewFeedbackPrompt({
			jobPosition,
			cvText,
			turnsBlock,
			turnCount: turns.length,
		}),
		providerOptions: generationConfig.providerOptions,
	})

	const parsedObject = sanitizeInterviewFeedbackObject(object)

	return {
		overallScore: parsedObject.overallScore,
		summary: parsedObject.summary,
		confidence: parsedObject.confidence,
		strengths: parsedObject.strengths.map((s) => ({
			label: s.label,
			description: s.description,
		})),
		gaps: parsedObject.gaps.map((g) => ({
			label: g.label,
			description: g.description,
		})),
		recommendations: parsedObject.recommendations.map((r) => ({
			label: r.label,
			description: r.description,
		})),
		turnScores: parsedObject.turnScores.map((t) => ({
			turnIndex: t.turnIndex,
			score: t.score,
			feedback: t.feedback,
		})),
	}
}