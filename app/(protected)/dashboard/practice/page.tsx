"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import { useAI } from "@/hooks/useAI"
import {
  PracticeUploadStep,
  PracticeInterviewStep,
  PracticeResultsStep,
} from "@/components/practice"
import type { PracticeResult } from "@/components/practice"
import type { InterviewType } from "@/lib/ai-types"

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
  const {
    interviewPlan,
    questions,
    isAnalyzing,
    isTranscribing,
    error: aiError,
    createInterviewPlan,
    transcribeAudio,
    sendChatMessage,
    reset: resetAI,
  } = useAI()

  const [step, setStep] = useState<Step>("upload")

  // Interview step state
  const [displayJobTitle, setDisplayJobTitle] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  
  // Conversational state
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([])
  const [progress, setProgress] = useState(0)

  const [isInterviewComplete, setIsInterviewComplete] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  // Results state
  const [result, setResult] = useState<PracticeResult | null>(null)

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Step 1 → 2: user submits CV + job position + interview type */
  const handleStart = useCallback(async (cvFile: File, position: string, type: InterviewType) => {
    const plan = await createInterviewPlan(cvFile, position, type)

    setDisplayJobTitle(plan.roleSummary)
    setProgress(0)
    setIsInterviewComplete(false)

    if (plan.questions.length > 0) {
      setMessages([{ role: "assistant", content: plan.questions[0].text }])
      setStep("interview")
    }
  }, [createInterviewPlan])

  /** Step 2: user sends an answer */
  const handleSendAnswer = useCallback(
    async (answer: string) => {
      setIsAiTyping(true)

      const newHistory = [...messages, { role: "user" as const, content: answer }]
      setMessages(newHistory)

      try {
        if (!interviewPlan) return;

        const aiResponse = await sendChatMessage({
          messages: newHistory,
          cvSummary: interviewPlan.cvSummary,
          jobPosition: displayJobTitle,
          interviewType: interviewPlan.interviewType || "estructurada",
          focusAreas: interviewPlan.focusAreas,
          plannedQuestions: interviewPlan.questions
        });

        setMessages([...newHistory, { role: "assistant" as const, content: aiResponse.reply }]);
        setProgress(aiResponse.progress);

        if (aiResponse.isFinished) {
          setIsInterviewComplete(true);
        }
      } catch(e) {
      } finally {
        setIsAiTyping(false);
      }
    },
    [messages, interviewPlan, displayJobTitle, sendChatMessage],
  )

  /** Step 2 → 3: user finishes interview */
  const handleFinish = useCallback(async () => {
    setIsFinishing(true)
    await new Promise((r) => setTimeout(r, 1800))
    setResult({ ...MOCK_RESULT, jobPosition: displayJobTitle, totalQuestions: questions.length })
    setIsFinishing(false)
    setStep("results")
  }, [displayJobTitle, questions.length])

  /** Step 3 → 1: start over */
  const handleNewPractice = useCallback(() => {
    setStep("upload")
    setMessages([])
    setProgress(0)
    setIsInterviewComplete(false)
    setDisplayJobTitle("")
    setResult(null)
    resetAI()
  }, [resetAI])

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
        <PracticeUploadStep
          onStart={handleStart}
          isLoading={isAnalyzing}
          error={aiError}
        />
      )}

      {step === "interview" && (
        <PracticeInterviewStep
          jobPosition={displayJobTitle}
          currentQuestion={messages.filter((m) => m.role === "assistant").pop()?.content ?? ""}
          isAiTyping={isAiTyping}
          isTranscribing={isTranscribing}
          isInterviewComplete={isInterviewComplete}
          progress={progress}
          onSendAnswer={handleSendAnswer}
          onTranscribeAudio={transcribeAudio}
          onFinish={handleFinish}
          isFinishing={isFinishing}
          error={aiError}
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