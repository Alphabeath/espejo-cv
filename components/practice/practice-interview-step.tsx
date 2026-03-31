"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Send, SkipForward, Sparkles, Waves } from "lucide-react"

import { Persona } from "@/components/ai-elements/persona"
import { SpeechInput, type SpeechInputRef } from "@/components/ai-elements/speech-input"
import { Button } from "@/components/ui/button"
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
  onFinish: (duration: number) => void
  isFinishing?: boolean
  audioUrl?: string | null
  onQuestionAudioEnd?: () => void
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
  audioUrl,
  onQuestionAudioEnd,
}: PracticeInterviewStepProps) {
  const [answer, setAnswer] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isPersonaReady, setIsPersonaReady] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const speechInputRef = useRef<SpeechInputRef>(null)
  const autoFinishTriggered = useRef(false)

  // Auto-activate mic after audio finishes playing
  const handleAudioEnded = () => {
    setIsAudioPlaying(false)
    onQuestionAudioEnd?.()
    
    // Auto-start listening if not already complete/processing
    if (!isInterviewComplete && !isAiTyping && !isTranscribing) {
      speechInputRef.current?.start()
    }
  }

  // Auto-finish once the interview is complete
  useEffect(() => {
    if (isInterviewComplete && !isFinishing && !autoFinishTriggered.current) {
      autoFinishTriggered.current = true
      onFinish(elapsedSeconds)
    }
  }, [isInterviewComplete, isFinishing, elapsedSeconds, onFinish])

  useEffect(() => {
    if (isInterviewComplete || isPreparing || isFinishing) return

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isInterviewComplete, isPreparing, isFinishing])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    if (!audioUrl) {
      el.pause()
      el.removeAttribute("src")
      return
    }

    el.src = audioUrl
    el.play().catch(() => {
      // autoplay blocked — interview continues without audio, maybe auto-start mic immediately
      handleAudioEnded()
    })
  }, [audioUrl])

  const isQuestionReady = currentQuestion.trim().length > 0
  const effectivePreparing = isPreparing || (!isInterviewComplete && !isQuestionReady)
  const canSend =
    answer.trim().length > 0 &&
    !effectivePreparing &&
    !isAiTyping &&
    !isTranscribing &&
    !isFinishing &&
    !isInterviewComplete &&
    !isAudioPlaying

  function handleSend() {
    if (!canSend) return
    onSendAnswer(answer.trim())
    setAnswer("")
  }

  const progress = totalQuestions > 0 ? ((questionIndex) / totalQuestions) * 100 : 0
  const statusLabel = effectivePreparing
    ? "Preparando entrevista"
    : isInterviewComplete
    ? "Sesión completada"
    : isAudioPlaying
      ? "Hablando pregunta"
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
    ? "La práctica terminó. Estamos generando el feedback para esta simulación."
    : currentQuestion

  const isPersonaListening = isListening && !effectivePreparing && !isAiTyping && !isInterviewComplete

  const personaState = effectivePreparing
    ? "idle"
    : isInterviewComplete
    ? "idle"
    : isAudioPlaying
      ? "speaking"
    : isAiTyping
      ? "thinking"
      : isPersonaListening
        ? "listening"
        : "idle"

  const title = jobPosition.trim().length > 0 ? jobPosition : "Preparando entrevista"
  const isResponseAreaReady = isPersonaReady && !effectivePreparing

  return (
    <div className="animate-fade-in flex flex-1 flex-col gap-0 overflow-hidden">
      {/* Hidden audio element for TTS playback */}
      <audio
        ref={audioRef}
        hidden
        onPlay={() => setIsAudioPlaying(true)}
        onEnded={handleAudioEnded}
        onError={handleAudioEnded}
      />
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
              Tiempo
            </span>
            <span className="mt-0.5 text-xl font-bold text-ec-on-surface tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
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

      <div className="flex flex-1 flex-col overflow-y-auto pb-6 pt-6 md:flex-row md:items-center md:justify-center md:gap-12 lg:gap-16">
        {/* Columna Izquierda: Persona y Controles de Voz */}
        <section className="flex shrink-0 flex-col items-center justify-center gap-8 pb-8 md:w-[320px] md:pb-0">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-4 rounded-full bg-ec-primary/10 blur-2xl" aria-hidden="true" />
              <Persona
                state={personaState}
                variant="mana"
                className={cn(
                  "size-40 transition-opacity duration-500 md:size-56",
                  isPersonaReady ? "opacity-100" : "opacity-0",
                )}
                onReady={() => setIsPersonaReady(true)}
              />
              {!isPersonaReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-28 md:size-36 rounded-full border border-ec-outline-variant/20 bg-ec-surface-container-low animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
              <SpeechInput
                ref={speechInputRef}
                type="button"
                size="icon"
                disabled={effectivePreparing || isAiTyping || isTranscribing || isInterviewComplete || isFinishing || !isPersonaReady || isAudioPlaying}
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
                className="size-16 shadow-lg shadow-ec-primary/20 hover:scale-105"
                aria-label="Activar micrófono para responder"
              />
              <div className="flex items-center gap-2 text-xs font-medium text-ec-on-surface-variant">
                <Waves className={cn("size-3.5", isListening && "text-ec-primary animate-pulse")} />
                <span>{isPersonaReady ? statusLabel : "Preparando entrevista"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Columna Derecha: Pregunta y Transcripción */}
        <section className="flex w-full max-w-2xl flex-1 flex-col justify-center gap-6">
          <div className="flex flex-col items-start gap-4">
            <Badge className="rounded-full bg-ec-primary-container px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ec-on-primary-container">
              {effectivePreparing ? "Preparando" : isInterviewComplete ? "Resumen" : `Pregunta ${questionIndex} de ${totalQuestions}`}
            </Badge>

            <div className="quiet-surface w-full rounded-[2rem] px-6 py-8 md:px-8 shadow-sm">
              {!effectivePreparing && isPersonaReady ? (
                <p className="font-headline text-2xl font-bold leading-tight text-ec-on-surface text-glow md:text-[2rem] md:leading-[1.2]">
                  {promptText}
                </p>
              ) : (
                <div className="flex flex-col items-start gap-3 py-2 text-left">
                  <Loader2 className="size-5 animate-spin text-ec-primary" />
                  <p className="font-headline text-xl font-bold leading-tight text-ec-on-surface md:text-3xl">
                    Conectando con tu entrevistador...
                  </p>
                  <p className="max-w-xl text-sm leading-relaxed text-ec-on-surface-variant">
                    En unos segundos podrás conversar. Recuerda que esta simulación es puramente por voz.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col gap-4 transition-all duration-500",
              isResponseAreaReady ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
            )}
          >
            <div className="quiet-surface flex w-full flex-col gap-3 rounded-[2rem] p-5 shadow-sm">
              <div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
                <Sparkles className="size-3.5" />
                Tu respuesta (Transmisión de voz)
              </div>

              <div
                className={cn(
                  "min-h-[140px] w-full resize-none overflow-y-auto rounded-2xl bg-ec-surface-container-lowest px-5 py-4 text-sm leading-relaxed shadow-inner",
                  "border border-ec-outline-variant/5 transition-all text-ec-on-surface",
                )}
              >
                {effectivePreparing ? (
                  <span className="text-ec-on-surface-variant/50">Esperando inicio...</span>
                ) : isInterviewComplete ? (
                  <span className="text-ec-on-surface-variant/50">La entrevista ha finalizado. Generando el análisis detallado.</span>
                ) : answer ? (
                  <span className="whitespace-pre-wrap">{answer}</span>
                ) : (
                  <span className="text-ec-on-surface-variant/50 italic">
                    {isListening 
                      ? "Escuchando... tu voz será transcrita aquí automáticamente."
                      : "Presiona el micrófono y empieza a hablar para responder..."}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="px-2 text-xs text-ec-on-surface-variant/70">
                  {!isInterviewComplete && !isListening && answer.length > 0 && "Envía tu respuesta cuando termines de hablar."}
                </p>

                {isInterviewComplete ? (
                  <Button
                    size="lg"
                    onClick={() => onFinish(elapsedSeconds)}
                    disabled={isFinishing}
                    className="gap-2 rounded-xl px-6 text-sm font-semibold shadow-md"
                  >
                    {isFinishing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SkipForward className="size-4" />
                    )}
                    {isFinishing ? "Generando feedback…" : "Ver resultados"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled={!canSend}
                    onClick={handleSend}
                    className="gap-2 rounded-xl px-6 text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5"
                    aria-label="Enviar respuesta oral"
                  >
                    <Send className="size-4" />
                    Enviar y continuar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
