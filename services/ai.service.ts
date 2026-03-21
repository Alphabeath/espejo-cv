import "server-only"

import { experimental_transcribe as transcribe, generateObject } from "ai"
import { deepgram } from "@ai-sdk/deepgram"
import { groq } from "@ai-sdk/groq"
import { PdfReader } from "pdfreader"
import { z } from "zod"

import type { AudioTranscription, InterviewPlan } from "@/lib/ai-types"

const MAX_CV_TEXT_LENGTH = 14_000
const INTERVIEW_QUESTION_COUNT = 5

const interviewPlanSchema = z.object({
	cvSummary: z.string().min(1).max(600),
	roleSummary: z.string().min(1).max(300),
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
			"Plan de entrevista basado en CV y descripción del puesto, con preguntas concretas en español.",
		prompt: [
			"Actúa como reclutador técnico senior.",
			"Analiza el CV y el puesto. Genera un plan breve de entrevista en español.",
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