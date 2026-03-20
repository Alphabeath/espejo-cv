"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { TextStreamChatTransport, type UIMessage } from "ai"

import type { PracticeResult, InterviewFeedbackItem } from "@/components/practice"

const TOTAL_QUESTIONS = 5

/**
 * Extrae el texto plano de un UIMessage (v6 usa .parts en lugar de .content)
 */
export function getMessageText(message: UIMessage): string {
  if (message.parts && message.parts.length > 0) {
    return message.parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("")
  }
  // Fallback silencioso por si el transport usa internalmente .content
  return (message as any).content || ""
}

/**
 * Hook que orquesta el flujo completo de entrevista con el AI SDK v6.
 *
 * - Usa `useChat` con `DefaultChatTransport` (apunta a `/api/chat`).
 * - `sendMessage` en lugar del antiguo `append`.
 * - `status` en lugar del antiguo `isLoading`.
 */
export function useInterview() {
  const [cvText, setCvText] = useState("")
  const [jobPosition, setJobPosition] = useState("")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isInterviewDone, setIsInterviewDone] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const startTimeRef = useRef<number>(0)

  // Refs para tener acceso al valor más reciente dentro de callbacks
  const cvTextRef = useRef(cvText)
  cvTextRef.current = cvText
  const jobPositionRef = useRef(jobPosition)
  jobPositionRef.current = jobPosition

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: () => ({
          cvText: cvTextRef.current,
          jobPosition: jobPositionRef.current,
        }),
      }),
    [],
  )

  const {
    messages,
    status,
    sendMessage,
    setMessages,
    error,
  } = useChat({
    transport,
    onFinish: ({ message }) => {
      console.log("[useChat] onFinish message:", message)
      if (message.role === "assistant") {
        setQuestionIndex((i) => i + 1)

        const text = getMessageText(message)
        if (text.includes("[ENTREVISTA_FINALIZADA]")) {
          setIsInterviewDone(true)
        }
      }
    },
    onError: (err) => {
      console.error("[useChat] Error:", err)
    }
  })

  // Debug local
  if (typeof window !== "undefined") {
    (window as any)._debugChat = { messages, status, error }
  }

  const isAiTyping = status === "streaming" || status === "submitted"

  /** Inicia la entrevista */
  const startInterview = useCallback(
    async (extractedCvText: string, position: string) => {
      setCvText(extractedCvText)
      setJobPosition(position)
      cvTextRef.current = extractedCvText
      jobPositionRef.current = position
      setQuestionIndex(0)
      setIsInterviewDone(false)
      startTimeRef.current = Date.now()

      await sendMessage({
        parts: [
          {
            type: "text",
            text: `Hola, estoy listo para la entrevista para el puesto de ${position}. Por favor comienza.`,
          },
        ],
      })
    },
    [sendMessage],
  )

  /** Envía una respuesta del usuario */
  const sendAnswer = useCallback(
    async (answer: string) => {
      await sendMessage({ parts: [{ type: "text", text: answer }] })
    },
    [sendMessage],
  )

  /** Genera la evaluación final llamando a /api/evaluate */
  const finishInterview = useCallback(async (): Promise<PracticeResult> => {
    setIsEvaluating(true)
    try {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

      const plainMessages = messages.map((m) => ({
        role: m.role,
        content: getMessageText(m),
      }))

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: plainMessages,
          jobPosition: jobPositionRef.current,
        }),
      })

      if (!response.ok) {
        throw new Error("Evaluation request failed")
      }

      const evaluation = await response.json()

      return {
        score: evaluation.score as number,
        jobPosition: jobPositionRef.current,
        totalQuestions: TOTAL_QUESTIONS,
        duration,
        summary: evaluation.summary as string,
        feedback: evaluation.feedback as InterviewFeedbackItem[],
      }
    } finally {
      setIsEvaluating(false)
    }
  }, [messages])

  /** Resetea todo */
  const resetInterview = useCallback(() => {
    setMessages([])
    setCvText("")
    setJobPosition("")
    setQuestionIndex(0)
    setIsInterviewDone(false)
    setIsEvaluating(false)
  }, [setMessages])

  return {
    messages,
    isAiTyping,
    questionIndex,
    totalQuestions: TOTAL_QUESTIONS,
    isInterviewDone,
    isEvaluating,
    startInterview,
    sendAnswer,
    finishInterview,
    resetInterview,
    jobPosition,
    getMessageText,
  }
}
