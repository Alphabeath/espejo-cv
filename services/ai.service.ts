import "server-only"

import { experimental_transcribe as transcribe, generateObject } from "ai"
import { deepgram } from "@ai-sdk/deepgram"
import { groq } from "@ai-sdk/groq"
import { PdfReader } from "pdfreader"
import { z } from "zod"

import type { AudioTranscription, InterviewPlan, ChatReply, InterviewQuestion } from "@/lib/ai-types"

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

const chatReplySchema = z.object({
	reply: z.string(),
	isFinished: z.boolean(),
	progress: z.number(),
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
	interviewType,
}: {
	cvFile: File
	jobPosition: string
	interviewType: string
}): Promise<InterviewPlan> {
	ensureEnv("GROQ_API_KEY")

	const normalizedJobPosition = normalizeWhitespace(jobPosition)

	if (normalizedJobPosition.length < 10) {
		throw new Error("Describe mejor el puesto para generar preguntas relevantes.")
	}

	const cvText = await extractPdfText(cvFile)

	let typeInstructions = ""
	if (interviewType === "estructurada") {
		typeInstructions = [
			"Tipo de Entrevista: Estructurada.",
			"Debes ser un entrevistador metódico. Las preguntas deben basarse estrictamente en competencias, validación del CV y resolución de brechas.",
			"// [PLACEHOLDER PREGUNTAS ESTRUCTURADAS]",
			// "Aqui van las preguntas predeterminadas"
		].join("\n")
	} else if (interviewType === "no-estructurada") {
		typeInstructions = [
			"Tipo de Entrevista: No Estructurada.",
			"Debes tener una conversación abierta y exploratoria, con preguntas adaptables que indagan en la motivación y actitud.",
		].join("\n")
	} else if (interviewType === "informal") {
		typeInstructions = [
			"Tipo de Entrevista: Informal.",
			"Adopta un tono muy casual, relajado y amigable para descubrir el 'fit cultural' y personalidad sin enfocarte estrictamente en habilidades técnicas.",
		].join("\n")
	} else {
		typeInstructions = "Las preguntas deben mezclar experiencia, ajuste al rol, logros y capacidad de resolución."
	}

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
			typeInstructions,
			"Mantén una postura conversacional: estás abierto a resolver las dudas del usuario. Si el usuario te hace una pregunta, resuélvela amablemente antes de continuar.",
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

export async function generateChatReply({
	messages,
	cvSummary,
	jobPosition,
	interviewType,
	focusAreas,
    plannedQuestions,
}: {
	messages: { role: "user" | "assistant", content: string }[]
	cvSummary: string
	jobPosition: string
	interviewType: string
	focusAreas: string[]
    plannedQuestions: InterviewQuestion[]
}): Promise<ChatReply> {
	ensureEnv("GROQ_API_KEY")

	let typeInstructions = ""
	if (interviewType === "estructurada") {
		typeInstructions = "La entrevista es altamente estructurada y metódica. Limítate a hacer preguntas evaluando rígidamente o contestando sus dudas de forma técnica y rigurosa."
	} else if (interviewType === "no-estructurada") {
		typeInstructions = "Mantén una conversación abierta y profunda. Debes hilar las respuestas previas para explorar más del candidato, su experiencia y su actitud."
	} else if (interviewType === "informal") {
		typeInstructions = "Adopta un tono muy amigable, cálido y relajado. Conversa de manera fluida para conocer la actitud real del candidato (fit cultural)."
	} else {
        typeInstructions = "Mantén la evaluación conversacional y fluida."
    }

	const { object } = await generateObject({
		model: groq("moonshotai/kimi-k2-instruct-0905"),
		schema: chatReplySchema,
		schemaName: "chat_reply",
		system: [
			"Eres un entrevistador corporativo de I.A. simulando una sesión de práctica.",
			`Puesto al que postulan: ${jobPosition}`,
			`Resumen del candidato: ${cvSummary}`,
			`Áreas clave de enfoque: ${focusAreas.join(", ")}`,
			`Preguntas u objetivos sugeridos (trata de integrarlos orgánicamente): \n${plannedQuestions.map(q => `- ${q.text}`).join("\n")}`,
			typeInstructions,
			"Tu objetivo es evaluar al candidato mediante un chat directo uno a uno. Lee sus respuestas, haz validaciones y formula tu siguiente comentario o pregunta de seguimiento.",
			"Debes estar dispuesto a resolver sus dudas si te preguntan algo.",
			"Utiliza 'isFinished' dándole el valor true cuando consideres que has agotado los temas de la simulación o cuando el usuario se despida voluntariamente sin más dudas (luego de unas 4 o 5 interacciones tuyas en promedio).",
			"Actualiza el 'progress' a un número entero de 0 a 100 estimando el porcentaje de la entrevista completado (0 al inicio, 100 al finalizar).",
			"IMPORTANTE: Debes responder estricta y únicamente con un objeto JSON válido. No incluyas bloques de markdown (```json), ni saludos fuera del esquema. Tu respuesta debe tener exactamente esta estructura: {\"reply\": string, \"isFinished\": boolean, \"progress\": number}.",
		].join("\n\n"),
		messages: messages.map((m) => ({
			role: m.role,
			content: m.content,
		})),
		providerOptions: {
			groq: {
				structuredOutputs: true,
				strictJsonSchema: true,
			},
		},
	})

	return object
}