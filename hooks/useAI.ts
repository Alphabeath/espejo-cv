"use client"

import { useCallback, useState } from "react"

import type { AudioTranscription, InterviewPlan } from "@/lib/ai-types"

const ANALYZE_ERROR_MESSAGE = "No pudimos preparar la entrevista en este momento. Intenta nuevamente."
const TRANSCRIBE_ERROR_MESSAGE = "No pudimos procesar el audio en este momento. Intenta nuevamente."

async function parseJsonResponse<T>(response: Response): Promise<T> {
	const payload = (await response.json().catch(() => null)) as
		| (T & { error?: string })
		| null

	if (!response.ok) {
		throw new Error(
			payload?.error ?? "La solicitud de IA no se pudo completar.",
		)
	}

	if (!payload) {
		throw new Error("La respuesta del servicio de IA llegó vacía.")
	}

	return payload
}

export function useAI() {
	const [interviewPlan, setInterviewPlan] = useState<InterviewPlan | null>(null)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [isTranscribing, setIsTranscribing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const createInterviewPlan = useCallback(
		async (cvFile: File, jobPosition: string) => {
			setError(null)
			setIsAnalyzing(true)

			try {
				const formData = new FormData()
				formData.append("cvFile", cvFile)
				formData.append("jobPosition", jobPosition)

				const response = await fetch("/api/ai/analyze", {
					method: "POST",
					body: formData,
				})

				const plan = await parseJsonResponse<InterviewPlan>(response)
				setInterviewPlan(plan)
				return plan
			} catch (requestError) {
				console.error("Failed to analyze CV", requestError)
				setError(ANALYZE_ERROR_MESSAGE)
				throw new Error(ANALYZE_ERROR_MESSAGE)
			} finally {
				setIsAnalyzing(false)
			}
		},
		[],
	)

	const transcribeAudio = useCallback(async (audioBlob: Blob) => {
		setError(null)
		setIsTranscribing(true)

		try {
			const formData = new FormData()
			const audioFile = new File([audioBlob], "interview-answer.webm", {
				type: audioBlob.type || "audio/webm",
			})

			formData.append("audio", audioFile)
			formData.append("language", "es")

			const response = await fetch("/api/ai/transcribe", {
				method: "POST",
				body: formData,
			})

			const transcription = await parseJsonResponse<AudioTranscription>(response)
        
			return transcription.text
		} catch (requestError) {
			console.error("Failed to transcribe audio", requestError)
			setError(TRANSCRIBE_ERROR_MESSAGE)
			throw new Error(TRANSCRIBE_ERROR_MESSAGE)
		} finally {
			setIsTranscribing(false)
		}
	}, [])

	const loadInterviewPlan = useCallback((plan: InterviewPlan) => {
		setInterviewPlan(plan)
	}, [])

	const reset = useCallback(() => {
		setInterviewPlan(null)
		setIsAnalyzing(false)
		setIsTranscribing(false)
		setError(null)
	}, [])

	const clearError = useCallback(() => {
		setError(null)
	}, [])

	return {
		interviewPlan,
		questions: interviewPlan?.questions ?? [],
		isAnalyzing,
		isTranscribing,
		error,
		createInterviewPlan,
		transcribeAudio,
		loadInterviewPlan,
		reset,
		clearError,
	}
}
