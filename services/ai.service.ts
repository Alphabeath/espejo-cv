import "server-only"

import { experimental_transcribe as transcribe, generateObject } from "ai"
import { deepgram } from "@ai-sdk/deepgram"
import { groq } from "@ai-sdk/groq"
import { PdfReader } from "pdfreader"
import { z } from "zod"

import type { AudioTranscription, InterviewPlan } from "@/lib/ai-types"

const MAX_CV_TEXT_LENGTH = 14_000
const INTERVIEW_QUESTION_COUNT = 5
const MAX_ROLE_SUMMARY_LENGTH = 80

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
	ensureEnv("GROQ_API_KEY")

	const normalizedJobPosition = normalizeWhitespace(jobPosition)

	if (normalizedJobPosition.length < 10) {
		throw new Error("Describe mejor el puesto para generar preguntas relevantes.")
	}

	const cvText = await extractPdfText(cvFile)

	const { object } = await generateObject({
		model: groq("moonshotai/kimi-k2-instruct-0905"),
		schema: interviewPlanSchema,
		schemaName: "interview_plan",
		schemaDescription:
			"Plan de entrevista basado en CV y descripción del puesto, con un título corto del rol y preguntas concretas en español.",
		prompt: [
			"Actúa como reclutador con experiencia y de ser necesario técnico.",
			"Analiza el CV y el puesto. Genera un plan breve de entrevista en español.",
			`En roleSummary devuelve solo un título breve y limpio del puesto, apto para UI, de máximo ${MAX_ROLE_SUMMARY_LENGTH} caracteres.` ,
			"roleSummary no debe incluir empresa, modalidad, ubicación, seniority redundante, stack excesivo ni detalles largos de la vacante salvo que sean esenciales para identificar el rol.",
			`Devuelve exactamente ${INTERVIEW_QUESTION_COUNT} preguntas personalizadas, claras y sin respuesta sugerida.`,
			`No devuelvas una sexta pregunta ni variantes extra. El máximo permitido es ${INTERVIEW_QUESTION_COUNT}.`,
			"Las preguntas deben mezclar experiencia, ajuste al rol, logros y capacidad de resolución.",
			"No generes evaluación final ni scoring.",
			`Puesto: ${normalizedJobPosition}`,
			`CV extraído: ${cvText}`,
		].join("\n\n"),
		providerOptions: {
			groq: {
				structuredOutputs: true,
				strictJsonSchema: true,
			},
		},
	})

	return {
		cvText,
		cvSummary: normalizeWhitespace(object.cvSummary),
		roleSummary: normalizeWhitespace(object.roleSummary),
		focusAreas: object.focusAreas.map((item) => normalizeWhitespace(item)),
		questions: object.questions.slice(0, INTERVIEW_QUESTION_COUNT).map((question, index) => ({
			id: normalizeWhitespace(question.id) || `question-${index + 1}`,
			text: normalizeWhitespace(question.text),
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
	ensureEnv("GROQ_API_KEY")

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
		model: groq("moonshotai/kimi-k2-instruct-0905"),
		schema: interviewFeedbackSchema,
		schemaName: "interview_feedback",
		schemaDescription:
			"Evaluación completa de una entrevista de práctica, con puntaje global, fortalezas, brechas, recomendaciones y evaluación por pregunta, todo en español.",
		prompt: [
			"Actúa como un evaluador de entrevistas de trabajo con experiencia en selección de personal y evaluación de competencias.",
			"Analiza las respuestas de esta entrevista de práctica comparándolas con el CV del candidato y los requisitos del puesto.",
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
			"Todo el output debe estar en español.",
			"",
			`Puesto: ${jobPosition}`,
			"",
			`CV del candidato: ${truncateText(cvText, MAX_CV_TEXT_LENGTH)}`,
			"",
			`Entrevista (${turns.length} preguntas):`,
			turnsBlock,
		].join("\n"),
		providerOptions: {
			groq: {
				structuredOutputs: true,
				strictJsonSchema: true,
			},
		},
	})

	return {
		overallScore: object.overallScore,
		summary: normalizeWhitespace(object.summary),
		confidence: object.confidence,
		strengths: object.strengths.map((s) => ({
			label: normalizeWhitespace(s.label),
			description: normalizeWhitespace(s.description),
		})),
		gaps: object.gaps.map((g) => ({
			label: normalizeWhitespace(g.label),
			description: normalizeWhitespace(g.description),
		})),
		recommendations: object.recommendations.map((r) => ({
			label: normalizeWhitespace(r.label),
			description: normalizeWhitespace(r.description),
		})),
		turnScores: object.turnScores.map((t) => ({
			turnIndex: t.turnIndex,
			score: t.score,
			feedback: normalizeWhitespace(t.feedback),
		})),
	}
}