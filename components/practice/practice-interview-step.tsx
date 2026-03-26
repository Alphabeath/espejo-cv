"use client"

import { useState } from "react"
import { Loader2, Send, SkipForward, Sparkles, Waves } from "lucide-react"

import { Persona } from "@/components/ai-elements/persona"
import { SpeechInput } from "@/components/ai-elements/speech-input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface InterviewMessage {
  id: string
  role: "ai" | "user"
  content: string
  timestamp: Date
}

interface PracticeInterviewStepProps {
  jobPosition: string
  currentQuestion: string
  isAiTyping: boolean
  isPreparing?: boolean
  isTranscribing?: boolean
  isInterviewComplete?: boolean
  questionIndex: number
  totalQuestions: number
  onSendAnswer: (answer: string) => void
  onTranscribeAudio: (audioBlob: Blob) => Promise<string>
  onFinish: () => void
  isFinishing?: boolean
}

export function PracticeInterviewStep({
  jobPosition,
  currentQuestion,
  isAiTyping,
  isPreparing = false,
  isTranscribing = false,
  isInterviewComplete = false,
  questionIndex,
  totalQuestions,
  onSendAnswer,
  onTranscribeAudio,
  onFinish,
  isFinishing = false,
}: PracticeInterviewStepProps) {
  const [answer, setAnswer] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isPersonaReady, setIsPersonaReady] = useState(false)
  const isQuestionReady = currentQuestion.trim().length > 0
  const effectivePreparing = isPreparing || (!isInterviewComplete && !isQuestionReady)
  const canSend =
    answer.trim().length > 0 &&
    !effectivePreparing &&
    !isAiTyping &&
    !isTranscribing &&
    !isFinishing &&
    !isInterviewComplete

  function handleSend() {
    if (!canSend) return
    onSendAnswer(answer.trim())
    setAnswer("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const progress = totalQuestions > 0 ? ((questionIndex) / totalQuestions) * 100 : 0
  const statusLabel = effectivePreparing
    ? "Preparando entrevista"
    : isInterviewComplete
    ? "Sesión completada"
    : isAiTyping
      ? "Analizando respuesta"
      : isTranscribing
        ? "Transcribiendo audio"
      : isListening
        ? "Escuchando respuesta"
        : "Tu turno"

  const promptText = effectivePreparing
    ? ""
    : isInterviewComplete
    ? "La práctica terminó. Revisa la evaluación generada para esta simulación."
    : currentQuestion

  const isPersonaListening = isListening && !effectivePreparing && !isAiTyping && !isInterviewComplete

  const personaState = effectivePreparing
    ? "idle"
    : isInterviewComplete
    ? "idle"
    : isAiTyping
      ? "thinking"
      : isPersonaListening
        ? "listening"
        : "idle"

  const title = jobPosition.trim().length > 0 ? jobPosition : "Preparando entrevista"
  const isResponseAreaReady = isPersonaReady && !effectivePreparing

  return (
    <div className="animate-fade-in flex flex-1 flex-col gap-0 overflow-hidden">
      <header className="mb-2 flex shrink-0 items-center justify-between gap-6 border-b border-ec-outline-variant/10 pb-4 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <div aria-hidden="true" className="flex shrink-0 items-center gap-0.5">
            {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.45].map((h, i) => (
              <span
                key={i}
                className={cn(
                  "w-0.5 rounded-full transition-all",
                  isAiTyping || isPersonaListening
                    ? "bg-ec-primary animate-bounce"
                    : "bg-ec-outline-variant",
                )}
                style={{
                  height: `${h * 20}px`,
                  animationDelay: `${i * 80}ms`,
                  animationDuration: "0.9s",
                }}
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
              Entrevistador IA
            </p>
            <h1 className="font-headline truncate text-xl font-bold leading-snug text-ec-on-surface text-glow">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex min-w-18 flex-col rounded-2xl bg-ec-surface-container-low px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
              Avance
            </span>
            <span className="mt-0.5 text-xl font-bold text-ec-on-surface">
              {Math.round(progress)}
              <span className="text-sm">%</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-between gap-6 overflow-y-auto pb-4 pt-6">
        <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Badge className="rounded-full bg-ec-primary-container px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ec-on-primary-container">
              {effectivePreparing ? "Preparando" : isInterviewComplete ? "Resumen" : `Pregunta ${questionIndex}`}
            </Badge>

            <div className="quiet-surface w-full max-w-6xl rounded-[2rem] px-6 py-8 md:px-10 md:py-10 xl:max-w-7xl xl:px-12">
              {!effectivePreparing && isPersonaReady ? (
                <p className="font-headline text-xl font-bold leading-tight text-ec-on-surface text-glow md:text-[2rem] md:leading-[1.15] xl:text-[2rem]">
                  {promptText}
                </p>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Loader2 className="size-5 animate-spin text-ec-primary" />
                  <p className="font-headline text-xl font-bold leading-tight text-ec-on-surface md:text-3xl">
                    Preparando entrevista
                  </p>
                  <p className="max-w-xl text-sm leading-relaxed text-ec-on-surface-variant">
                    En unos segundos verás al entrevistador y podrás responder con voz o texto.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-4 rounded-full bg-ec-primary/10 blur-2xl" aria-hidden="true" />
              <Persona
                state={personaState}
                variant="mana"
                className={cn(
                    "size-36 transition-opacity duration-500 md:size-44",
                  isPersonaReady ? "opacity-100" : "opacity-0",
                )}
                onReady={() => setIsPersonaReady(true)}
              />
              {!isPersonaReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-24 rounded-full border border-ec-outline-variant/20 bg-ec-surface-container-low animate-pulse md:size-28" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
              <SpeechInput
                type="button"
                size="icon"
                disabled={effectivePreparing || isAiTyping || isTranscribing || isInterviewComplete || isFinishing || !isPersonaReady}
                onListeningChange={setIsListening}
                onAudioRecorded={onTranscribeAudio}
                preferredMode="server-transcription"
                onTranscriptionChange={(text) => {
                  setAnswer((prev) => {
                    const normalized = text.trim()
                    if (!normalized) return prev
                    return prev.trim().length > 0 ? `${prev.trim()} ${normalized}` : normalized
                  })
                }}
                className="size-16 shadow-lg shadow-ec-primary/20"
                aria-label="Activar dictado de respuesta"
              />
              <div className="flex items-center gap-2 text-xs text-ec-on-surface-variant">
                <Waves className="size-3.5" />
                <span>{isPersonaReady ? statusLabel : "Preparando entrevista"}</span>
              </div>
            </div>
          </div>
        </section>

        <div
          className={cn(
            "shrink-0 space-y-3 transition-all duration-500",
            isResponseAreaReady
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0",
          )}
        >
          {isResponseAreaReady && !isAiTyping && !isInterviewComplete && (
            <p className="text-center text-xs text-ec-on-surface-variant animate-fade-in">
              Puedes responder con voz o ajustar el texto manualmente. Usa Ctrl+Enter para continuar.
            </p>
          )}

          <div className="quiet-surface mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-[2rem] p-4 md:p-5 xl:max-w-7xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
              <Sparkles className="size-3.5" />
              Tu respuesta
            </div>

            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                effectivePreparing
                  ? "Estamos preparando la entrevista..."
                  : isInterviewComplete
                  ? "La entrevista terminó. Ya puedes revisar los resultados."
                  : "Tu respuesta aparecerá aquí mientras hablas o escribes."
              }
              disabled={effectivePreparing || isAiTyping || isTranscribing || isInterviewComplete || isFinishing}
              rows={3}
              className={cn(
                "min-h-22 resize-none rounded-2xl border-transparent bg-ec-surface-container-lowest px-4 py-3 text-sm shadow-none md:min-h-12",
                "focus-visible:border-ec-primary/35 focus-visible:ring-0",
                "placeholder:text-ec-on-surface-variant/45 transition-all",
              )}
            />

            <div className="flex flex-wrap items-center justify-end gap-3">
              {isInterviewComplete ? (
                <Button
                  size="lg"
                  onClick={onFinish}
                  disabled={isFinishing}
                  className="gap-2 rounded-xl px-6 text-sm font-semibold"
                >
                  {isFinishing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <SkipForward className="size-4" />
                  )}
                  {isFinishing ? "Calculando…" : "Ver resultados"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled={!canSend}
                  onClick={handleSend}
                  className="gap-2 rounded-xl px-6 text-sm font-semibold shadow-none"
                  aria-label="Enviar respuesta"
                >
                  <Send className="size-4" />
                  Continuar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
