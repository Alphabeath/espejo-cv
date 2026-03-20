"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import {
  PracticeUploadStep,
  PracticeInterviewStep,
  PracticeResultsStep,
} from "@/components/practice"
import type { PracticeResult, InterviewMessage } from "@/components/practice"
import { useInterview } from "@/hooks/useInterview"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { extractTextFromPDF } from "@/lib/pdf-utils"

// ─── Step machine ────────────────────────────────────────────────────────────
type Step = "upload" | "interview" | "results"

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("upload")
  const [isStarting, setIsStarting] = useState(false)
  const [result, setResult] = useState<PracticeResult | null>(null)

  // Contador para disparar el auto-envío desde el hook
  const [silenceTick, setSilenceTick] = useState(0)

  // Hooks reales de IA
  const interview = useInterview()
  const stt = useSpeechToText(() => {
    // Si se detecta silencio, incrementamos el tick para avisarle al componente hijo
    setSilenceTick((prev) => prev + 1)
  })

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Step 1 → 2: user submits CV + job position */
  const handleStart = useCallback(
    async (cvFile: File, position: string) => {
      setIsStarting(true)
      try {
        const cvText = await extractTextFromPDF(cvFile)
        await interview.startInterview(cvText, position)
        setStep("interview")
      } catch (error) {
        console.error("Error starting interview:", error)
      } finally {
        setIsStarting(false)
      }
    },
    [interview],
  )

  /** Step 2: user sends an answer */
  const handleSendAnswer = useCallback(
    async (answer: string) => {
      await interview.sendAnswer(answer)
    },
    [interview],
  )

  /** Step 2 → 3: user finishes interview */
  const handleFinish = useCallback(async () => {
    try {
      const practiceResult = await interview.finishInterview()
      setResult(practiceResult)
      setStep("results")
    } catch (error) {
      console.error("Error finishing interview:", error)
    }
  }, [interview])

  /** Step 3 → 1: start over */
  const handleNewPractice = useCallback(() => {
    setStep("upload")
    setResult(null)
    interview.resetInterview()
    stt.cancelRecording()
  }, [interview, stt])

  /** Toggle micrófono */
  const handleToggleMic = useCallback(async (): Promise<string> => {
    if (stt.isRecording) {
      const text = await stt.stopRecording()
      return text
    } else {
      await stt.startRecording()
      return ""
    }
  }, [stt])

  // Convertir UIMessages (v6 parts) a nuestro formato InterviewMessage
  const interviewMessages: InterviewMessage[] = interview.messages
    .filter((m) => m.role === "assistant" || m.role === "user")
    .map((m) => {
      const text = interview.getMessageText(m)
      return {
        id: m.id,
        role: m.role === "assistant" ? ("ai" as const) : ("user" as const),
        content: text.replace("[ENTREVISTA_FINALIZADA]", "").trim(),
        timestamp: new Date(),
      }
    })

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

      {step === "upload" && (
        <PracticeUploadStep onStart={handleStart} isLoading={isStarting} />
      )}

      {step === "interview" && (
        <PracticeInterviewStep
          jobPosition={interview.jobPosition}
          messages={interviewMessages}
          isAiTyping={interview.isAiTyping}
          questionIndex={interview.questionIndex}
          totalQuestions={interview.totalQuestions}
          onSendAnswer={handleSendAnswer}
          onFinish={handleFinish}
          isFinishing={interview.isEvaluating}
          isRecording={stt.isRecording}
          isTranscribing={stt.isTranscribing}
          volume={stt.volume}
          silenceTick={silenceTick}
          onToggleMic={handleToggleMic}
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