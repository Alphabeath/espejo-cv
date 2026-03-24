"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAI } from "@/hooks/useAI"
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

// ─── Step machine ────────────────────────────────────────────────────────────
type Step = "upload" | "interview" | "results"

const MOCK_RESULT: PracticeResult = {
  score: 74,
  jobPosition: "",
  totalQuestions: 0,
  duration: 312,
  summary:
    "Demostraste sólidos conocimientos técnicos y buena comunicación. Tu mayor área de crecimiento es estructurar las respuestas con el método STAR para mayor claridad y persuasión ante el entrevistador.",
  feedback: [
    {
      label: "Claridad técnica",
      description: "Explicaste conceptos complejos de forma accesible y coherente.",
      type: "strength",
    },
    {
      label: "Escucha activa",
      description: "Respondiste con precisión a lo preguntado sin desviarte del tema.",
      type: "strength",
    },
    {
      label: "Estructura STAR",
      description:
        "Algunas respuestas carecían de contexto o resultado explícito. Prueba Situación → Tarea → Acción → Resultado.",
      type: "improvement",
    },
    {
      label: "Preguntas al entrevistador",
      description:
        "No formulaste preguntas de retorno. Esto puede percibirse como bajo interés en la empresa.",
      type: "improvement",
    },
  ],
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    questions,
    isAnalyzing,
    isTranscribing,
    error: aiError,
    createInterviewPlan,
    loadInterviewPlan,
    transcribeAudio,
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
        setStep("interview")
      } catch (restoreError) {
        if (cancelled) {
          return
        }

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
  }, [loadInterviewPlan, requestedSessionId, sessionId])

  const activeError = pageError ?? aiError

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Step 1 → 2: user submits CV + job position */
  const handleStart = useCallback(async (cvFile: File, position: string) => {
    setPageError(null)
    const plan = await createInterviewPlan(cvFile, position)

    // Persiste la sesión, la oferta y los turnos en Appwrite
    const { sessionId: newSessionId } = await startInterviewSession({
      cvFile,
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
    }
  }, [createInterviewPlan, router])

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
          setCurrentQuestionIndex((index) => index + 1)
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
    [currentQuestionIndex, questions.length, sessionId],
  )

  /** Step 2 → 3: user finishes interview */
  const handleFinish = useCallback(async () => {
    setIsFinishing(true)

    try {
      if (sessionId) {
        await completeInterviewSession(sessionId)
      }

      await new Promise((r) => setTimeout(r, 1800))
      setResult({ ...MOCK_RESULT, jobPosition: displayJobTitle, totalQuestions: questions.length })
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
          error={activeError}
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
          error={activeError}
        />
      )}

      {step === "results" && result && (
        <PracticeResultsStep
          result={result}
          onNewPractice={handleNewPractice}
          onGoToDashboard={() => router.push("/dashboard")}
        />
      )}
    </main>
  )
}