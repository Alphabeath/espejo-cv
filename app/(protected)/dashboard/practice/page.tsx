"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import {
  PracticeUploadStep,
  PracticeInterviewStep,
  PracticeResultsStep,
} from "@/components/practice"
import type { PracticeResult } from "@/components/practice"

// ─── Step machine ────────────────────────────────────────────────────────────
type Step = "upload" | "interview" | "results"

const MOCK_QUESTIONS = [
  "Cuéntame sobre tu experiencia más relevante para este puesto y por qué te interesa.",
  "¿Cómo manejas situaciones de alta presión o plazos ajustados? Dame un ejemplo concreto.",
  "Describe un proyecto técnico del que estés orgulloso. ¿Cuáles fueron los desafíos clave?",
  "¿Qué metodologías de trabajo en equipo has aplicado y cuál prefieres?",
  "¿Cómo te mantienes actualizado en tu campo? ¿Qué aprendiste recientemente?",
]

const MOCK_RESULT: PracticeResult = {
  score: 74,
  jobPosition: "",
  totalQuestions: MOCK_QUESTIONS.length,
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

  const [step, setStep] = useState<Step>("upload")

  // Upload step state
  const [isStarting, setIsStarting] = useState(false)

  // Interview step state
  const [jobPosition, setJobPosition] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isInterviewComplete, setIsInterviewComplete] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  // Results state
  const [result, setResult] = useState<PracticeResult | null>(null)

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Step 1 → 2: user submits CV + job position */
  const handleStart = useCallback(async (_cvFile: File, position: string) => {
    setIsStarting(true)
    setJobPosition(position)

    // Simulate latency for uploading / preparing interview
    await new Promise((r) => setTimeout(r, 1200))

    setCurrentQuestionIndex(0)
    setIsInterviewComplete(false)
    setIsStarting(false)
    setStep("interview")
  }, [])

  /** Step 2: user sends an answer */
  const handleSendAnswer = useCallback(
    async () => {
      setIsAiTyping(true)

      // Simulate AI thinking
      await new Promise((r) => setTimeout(r, 1400 + Math.random() * 800))

      const isLastQuestion = currentQuestionIndex >= MOCK_QUESTIONS.length - 1

      if (isLastQuestion) {
        setIsInterviewComplete(true)
      } else {
        setCurrentQuestionIndex((index) => index + 1)
      }

      setIsAiTyping(false)
    },
    [currentQuestionIndex],
  )

  /** Step 2 → 3: user finishes interview */
  const handleFinish = useCallback(async () => {
    setIsFinishing(true)
    // Simulate scoring
    await new Promise((r) => setTimeout(r, 1800))
    setResult({ ...MOCK_RESULT, jobPosition })
    setIsFinishing(false)
    setStep("results")
  }, [jobPosition])

  /** Step 3 → 1: start over */
  const handleNewPractice = useCallback(() => {
    setStep("upload")
    setCurrentQuestionIndex(0)
    setIsInterviewComplete(false)
    setJobPosition("")
    setResult(null)
  }, [])

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
      {step === "upload" && (
        <PracticeUploadStep onStart={handleStart} isLoading={isStarting} />
      )}

      {step === "interview" && (
        <PracticeInterviewStep
          jobPosition={jobPosition}
          currentQuestion={MOCK_QUESTIONS[currentQuestionIndex] ?? ""}
          isAiTyping={isAiTyping}
          isInterviewComplete={isInterviewComplete}
          questionIndex={Math.min(currentQuestionIndex + 1, MOCK_QUESTIONS.length)}
          totalQuestions={MOCK_QUESTIONS.length}
          onSendAnswer={handleSendAnswer}
          onFinish={handleFinish}
          isFinishing={isFinishing}
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