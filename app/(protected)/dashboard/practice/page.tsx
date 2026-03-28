"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAI } from "@/hooks/useAI"
import { useToast } from "@/components/ui/toast"
import {
  PracticeUploadStep,
  PracticeInterviewStep,
  PracticeResultsStep,
} from "@/components/practice"
import type { PracticeResult } from "@/components/practice"
import {
  answerInterviewTurn,
  completeInterviewSession,
  continueInterviewSession,
  startInterviewSession,
} from "@/services/interview.service"
import {
  getSessionFeedbackData,
  saveReport,
  updateTurnFeedback,
} from "@/services/feedback.service"

// ─── Step machine ────────────────────────────────────────────────────────────
type Step = "upload" | "interview" | "results"

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const {
    questions,
    isAnalyzing,
    isTranscribing,
    isSpeaking,
    error: aiError,
    createInterviewPlan,
    clearError: clearAiError,
    loadInterviewPlan,
    transcribeAudio,
    speakQuestion,
    reset: resetAI,
  } = useAI()
  const requestedSessionId = searchParams.get("sessionId")

  const [step, setStep] = useState<Step>("upload")

  // Interview step state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [displayJobTitle, setDisplayJobTitle] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isInterviewComplete, setIsInterviewComplete] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  // Results state
  const [result, setResult] = useState<PracticeResult | null>(null)

  // TTS state
  const [questionAudioUrl, setQuestionAudioUrl] = useState<string | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!aiError) {
      return
    }

    toast({
      title: "Ocurrió un problema al procesar la solicitud",
      description: aiError,
    })

    clearAiError()
  }, [aiError, clearAiError, toast])

  useEffect(() => {
    if (!pageError) {
      return
    }

    toast({
      title: "No pudimos continuar la práctica",
      description: pageError,
    })

    setPageError(null)
  }, [pageError, toast])

  /** Pre-fetch TTS audio for a given question, updating the shared ref/state */
  const prefetchAudio = useCallback(async (
    sid: string,
    turnIdx: number,
    text: string,
  ) => {
    const url = await speakQuestion(sid, turnIdx, text)

    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    audioUrlRef.current = url
    setQuestionAudioUrl(url)
  }, [speakQuestion])

  useEffect(() => {
    if (!requestedSessionId || requestedSessionId === sessionId) {
      return
    }

    const sessionIdToRestore = requestedSessionId

    let cancelled = false

    async function restoreSession() {
      setPageError(null)
      setIsRestoring(true)
      setStep("interview")

      try {
        const restoredSession = await continueInterviewSession(sessionIdToRestore)

        if (cancelled) {
          return
        }

        loadInterviewPlan(restoredSession.plan)
        setSessionId(restoredSession.sessionId)
        setDisplayJobTitle(restoredSession.plan.roleSummary)
        setCurrentQuestionIndex(restoredSession.currentQuestionIndex)
        setIsInterviewComplete(restoredSession.isInterviewComplete)

        // Pre-fetch audio for the current question on restore (non-blocking)
        if (!restoredSession.isInterviewComplete) {
          const currentQ = restoredSession.plan.questions[restoredSession.currentQuestionIndex]
          if (currentQ?.text) {
            void prefetchAudio(restoredSession.sessionId, restoredSession.currentQuestionIndex, currentQ.text)
          }
        }

        setStep("interview")
      } catch (restoreError) {
        if (cancelled) {
          return
        }

        setStep("upload")
        router.replace("/dashboard/practice")
        setPageError(
          restoreError instanceof Error
            ? restoreError.message
            : "No se pudo reanudar la sesión seleccionada.",
        )
      } finally {
        if (!cancelled) {
          setIsRestoring(false)
        }
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [loadInterviewPlan, prefetchAudio, requestedSessionId, sessionId])

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Step 1 → 2: user submits CV + job position */
  const handleStart = useCallback(async (
    cvFile: File,
    position: string,
    options?: { existingCvId?: string },
  ) => {
    setPageError(null)
    const plan = await createInterviewPlan(cvFile, position)

    // Persiste la sesión, la oferta y los turnos en Appwrite
    const { sessionId: newSessionId } = await startInterviewSession({
      cvFile,
      existingCvId: options?.existingCvId,
      jobPosition: position,
      plan,
    })

    setSessionId(newSessionId)
    setDisplayJobTitle(plan.roleSummary)
    setCurrentQuestionIndex(0)
    setIsInterviewComplete(false)
    router.replace(`/dashboard/practice?sessionId=${newSessionId}`)

    if (plan.questions.length > 0) {
      setStep("interview")

      // Pre-fetch audio for the first question (non-blocking — interview shows while loading)
      if (plan.questions[0]?.text) {
        void prefetchAudio(newSessionId, 0, plan.questions[0].text)
      }
    }
  }, [createInterviewPlan, prefetchAudio, router])

  /** Step 2: user sends an answer */
  const handleSendAnswer = useCallback(
    async (answer: string) => {
      if (!sessionId) {
        setPageError("No se encontró una sesión activa para continuar la entrevista.")
        return
      }

      setPageError(null)
      setIsAiTyping(true)

      try {
        await answerInterviewTurn({
          sessionId,
          turnIndex: currentQuestionIndex,
          answer,
        })

        await new Promise((r) => setTimeout(r, 700))

        const isLastQuestion = currentQuestionIndex >= questions.length - 1

        if (isLastQuestion) {
          setIsInterviewComplete(true)
        } else {
          const nextIndex = currentQuestionIndex + 1
          const nextQuestion = questions[nextIndex]

          // Pre-fetch audio for the next question while still in "Analizando respuesta"
          if (nextQuestion?.text) {
            await prefetchAudio(sessionId, nextIndex, nextQuestion.text)
          }

          setCurrentQuestionIndex(nextIndex)
        }
      } catch (submitError) {
        setPageError(
          submitError instanceof Error
            ? submitError.message
            : "No se pudo guardar la respuesta de la entrevista.",
        )
      } finally {
        setIsAiTyping(false)
      }
    },
    [currentQuestionIndex, prefetchAudio, questions, sessionId],
  )

  /** Step 2 → 3: user finishes interview */
  const handleFinish = useCallback(async () => {
    setIsFinishing(true)

    try {
      if (sessionId) {
        await completeInterviewSession(sessionId)
      }

      if (!sessionId) {
        throw new Error("No se encontró una sesión activa.")
      }

      // 1. Read session data client-side (browser Appwrite session)
      const sessionData = await getSessionFeedbackData(sessionId)

      if (sessionData.turns.length === 0) {
        throw new Error("La sesión no tiene respuestas para evaluar.")
      }

      // 2. Send raw data to API for AI generation (server-side only)
      const feedbackResponse = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: sessionData.cvText,
          jobPosition: sessionData.jobPosition,
          turns: sessionData.turns.map((t) => ({
            turnIndex: t.turnIndex,
            question: t.question,
            answer: t.answer,
          })),
        }),
      })

      const feedbackData = await feedbackResponse.json()

      if (!feedbackResponse.ok) {
        throw new Error(feedbackData.error || "No se pudo generar la evaluación.")
      }

      // 3. Persist report and per-turn feedback client-side
      await saveReport(sessionId, sessionData.userId, {
        overallScore: feedbackData.overallScore,
        summary: feedbackData.summary,
        strengths: JSON.stringify(feedbackData.strengths),
        gaps: JSON.stringify(feedbackData.gaps),
        recommendations: JSON.stringify(feedbackData.recommendations),
        confidence: feedbackData.confidence,
      })

      await Promise.all(
        (feedbackData.turnScores ?? []).map(
          (ts: { turnIndex: number; score: number; feedback: string }) => {
            const matchingTurn = sessionData.turns.find(
              (t) => t.turnIndex === ts.turnIndex,
            )
            if (!matchingTurn) return Promise.resolve()
            return updateTurnFeedback(matchingTurn.id, ts.score, ts.feedback)
          },
        ),
      )

      // Map AI feedback to PracticeResult shape
      const strengths = (feedbackData.strengths ?? []).map(
        (s: { label: string; description: string }) => ({
          label: s.label,
          description: s.description,
          type: "strength" as const,
        }),
      )

      const improvements = (feedbackData.gaps ?? []).map(
        (g: { label: string; description: string }) => ({
          label: g.label,
          description: g.description,
          type: "improvement" as const,
        }),
      )

      setResult({
        score: feedbackData.overallScore ?? 0,
        jobPosition: displayJobTitle,
        totalQuestions: questions.length,
        duration: 0,
        summary: feedbackData.summary ?? "",
        feedback: [...strengths, ...improvements],
      })
      setStep("results")
    } catch (finishError) {
      setPageError(
        finishError instanceof Error
          ? finishError.message
          : "No se pudo completar la sesión de entrevista.",
      )
    } finally {
      setIsFinishing(false)
    }
  }, [displayJobTitle, questions.length, sessionId])

  /** Step 3 → 1: start over */
  const handleNewPractice = useCallback(() => {
    setStep("upload")
    setSessionId(null)
    setCurrentQuestionIndex(0)
    setIsInterviewComplete(false)
    setDisplayJobTitle("")
    setResult(null)
    setPageError(null)
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    audioUrlRef.current = null
    setQuestionAudioUrl(null)
    resetAI()
    router.replace("/dashboard/practice")
  }, [resetAI, router])

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <main
      className={`px-6 md:px-10 ${
        step === "interview"
          ? "flex h-svh flex-col overflow-hidden"
          : "min-h-svh overflow-y-auto py-8"
      }`}
      aria-label="Página de práctica de entrevista"
    >
      {/* Step indicator strip (top) — hidden during interview to minimize distractions */}
      {step !== "interview" && (
        <div className="mb-8 flex items-center gap-2">
          {(["upload", "interview", "results"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-1 rounded-full transition-all ${
                  s === step
                    ? "w-8 bg-ec-primary"
                    : i < ["upload", "interview", "results"].indexOf(step)
                      ? "w-4 bg-ec-primary/40"
                      : "w-4 bg-ec-surface-container-high"
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      {step === "upload" && !isRestoring && (
        <PracticeUploadStep
          onStart={handleStart}
          isLoading={isAnalyzing}
        />
      )}

      {step === "interview" && (
        <PracticeInterviewStep
          jobPosition={displayJobTitle}
          currentQuestion={questions[currentQuestionIndex]?.text ?? ""}
          isAiTyping={isAiTyping}
          isPreparing={isRestoring}
          isTranscribing={isTranscribing}
          isInterviewComplete={isInterviewComplete}
          questionIndex={Math.min(currentQuestionIndex + 1, Math.max(questions.length, 1))}
          totalQuestions={questions.length}
          onSendAnswer={handleSendAnswer}
          onTranscribeAudio={transcribeAudio}
          onFinish={handleFinish}
          isFinishing={isFinishing}
          audioUrl={questionAudioUrl}
          onQuestionAudioEnd={() => setQuestionAudioUrl(null)}
        />
      )}

      {step === "results" && result && (
        <PracticeResultsStep
          result={result}
          onNewPractice={handleNewPractice}
          onGoToDashboard={() => router.push("/dashboard")}
          onGoToFeedback={() => router.push("/dashboard/feedback")}
        />
      )}
    </main>
  )
}