"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import {
  PracticeUploadStep,
  PracticeInterviewStep,
  PracticeResultsStep,
} from "@/components/practice"
import type { InterviewMessage, PracticeResult } from "@/components/practice"

// ─── Step machine ────────────────────────────────────────────────────────────
type Step = "upload" | "interview" | "results"

// ─── Mock helpers (replace with real API calls) ──────────────────────────────
let msgCounter = 0
function uid() {
  return `msg-${++msgCounter}-${Date.now()}`
}

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
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
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

    const firstQuestion = MOCK_QUESTIONS[0] ?? "Cuéntame sobre ti."
    setMessages([
      {
        id: uid(),
        role: "ai",
        content: `Hola 👋 Seré tu entrevistador hoy para el puesto: **${position}**.\n\n${firstQuestion}`,
        timestamp: new Date(),
      },
    ])
    setQuestionIndex(1)
    setIsStarting(false)
    setStep("interview")
  }, [])

  /** Step 2: user sends an answer */
  const handleSendAnswer = useCallback(
    async (answer: string) => {
      const userMsg: InterviewMessage = {
        id: uid(),
        role: "user",
        content: answer,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsAiTyping(true)

      // Simulate AI thinking
      await new Promise((r) => setTimeout(r, 1400 + Math.random() * 800))

      const nextQuestion = MOCK_QUESTIONS[questionIndex]
      const isLast = !nextQuestion

      const aiContent = isLast
        ? "Gracias por todas tus respuestas. Fue un placer entrevistarte. Presiona **«Ver resultados»** para conocer tu evaluación."
        : nextQuestion

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "ai",
          content: aiContent,
          timestamp: new Date(),
        },
      ])
      setIsAiTyping(false)
      setQuestionIndex((i) => i + 1)
    },
    [questionIndex],
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
    setMessages([])
    setQuestionIndex(0)
    setJobPosition("")
    setResult(null)
    msgCounter = 0
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
          messages={messages}
          isAiTyping={isAiTyping}
          questionIndex={questionIndex}
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