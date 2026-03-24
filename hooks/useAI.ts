"use client"

import { useCallback, useState } from "react"

import type { AudioTranscription, InterviewPlan } from "@/lib/ai-types"

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
				const message =
					requestError instanceof Error
						? requestError.message
						: "No se pudo generar la entrevista.";

				setError(message)
				throw requestError
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
			const message =
				requestError instanceof Error
					? requestError.message
					: "No se pudo transcribir el audio.";

			setError(message)
			throw requestError
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
