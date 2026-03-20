"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Send, Bot, User, Loader2, Volume2, SkipForward } from "lucide-react"

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
  messages: InterviewMessage[]
  isAiTyping: boolean
  questionIndex: number
  totalQuestions: number
  onSendAnswer: (answer: string) => void
  onFinish: () => void
  isFinishing?: boolean
}

export function PracticeInterviewStep({
  jobPosition,
  messages,
  isAiTyping,
  questionIndex,
  totalQuestions,
  onSendAnswer,
  onFinish,
  isFinishing = false,
}: PracticeInterviewStepProps) {
  const [answer, setAnswer] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const canSend = answer.trim().length > 0 && !isAiTyping && !isFinishing

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isAiTyping])

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
  const isLastQuestion = questionIndex >= totalQuestions

  return (
    <div className="animate-fade-in flex flex-1 flex-col gap-0 overflow-hidden">
      {/* Header — dashboard-style */}

      <header className="flex shrink-0 items-center justify-between gap-6 border-b border-ec-outline-variant/10 pb-4 mb-2">
        <div className="flex min-w-0 items-center gap-3">
          {/* Waveform / speaking indicator */}
          <div aria-hidden="true" className="flex shrink-0 items-center gap-0.5">
            {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.45].map((h, i) => (
              <span
                key={i}
                className={cn(
                  "w-0.5 rounded-full transition-all",
                  isAiTyping ? "bg-ec-primary animate-bounce" : "bg-ec-outline-variant",
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
              {jobPosition}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* Preguntas metric card */}
          <div className="flex min-w-22 flex-col rounded-2xl bg-ec-surface-container-low px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
              Preguntas
            </span>
            <span className="mt-0.5 text-xl font-bold text-ec-on-surface">
              {questionIndex}
              <span className="ml-0.5 text-xs font-medium text-ec-on-surface-variant"> /{totalQuestions}</span>
            </span>
          </div>
          {/* Avance metric card */}
          <div className="flex min-w-18 flex-col rounded-2xl bg-ec-surface-container-low px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
              Avance
            </span>
            <span className="mt-0.5 text-xl font-bold text-ec-on-surface">
              {Math.round(progress)}
              <span className="text-sm">%</span>
            </span>
          </div>
          <Badge
            variant="secondary"
            className="hidden rounded-full bg-ec-secondary-container px-3 text-xs font-medium text-ec-on-secondary-container md:flex"
          >
            En curso
          </Badge>
        </div>
      </header>

      {/* Messages area */}
      <div className="relative flex-1 overflow-y-auto">
        {/* Subtle gradient mask top */}
        <div className="pointer-events-none sticky top-0 z-10 h-6 bg-gradient-to-b from-[var(--color-ec-surface)] to-transparent" />

        <div className="flex flex-col gap-6 px-0 pb-4 pt-1">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 animate-fade-in-up",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "ai"
                    ? "bg-ec-primary-container"
                    : "bg-ec-surface-container-highest",
                )}
              >
                {msg.role === "ai" ? (
                  <Bot className="size-4 text-ec-on-primary-container" />
                ) : (
                  <User className="size-4 text-ec-on-surface-variant" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-5 py-3.5",
                  msg.role === "ai"
                    ? "quiet-surface rounded-tl-sm text-sm text-ec-on-surface"
                    : "bg-ec-primary-container rounded-tr-sm text-sm text-ec-on-primary-container",
                )}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "ai" && (
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="mt-2 flex items-center gap-1 text-xs text-ec-on-surface-variant transition-colors hover:text-ec-on-surface"
                    title="Leer en voz alta"
                    aria-label="Leer respuesta en voz alta"
                  >
                    <Volume2 className="size-3" />
                    Escuchar
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* AI typing indicator */}
          {isAiTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-ec-primary-container">
                <Bot className="size-4 text-ec-on-primary-container" />
              </div>
              <div className="quiet-surface rounded-2xl rounded-tl-sm px-5 py-4">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-ec-on-surface-variant animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input zone */}
      <div className="shrink-0 pt-4">
        {/* Composure hint when it's the user's turn */}
        {!isAiTyping && !isLastQuestion && (
          <p className="mb-2 text-xs text-ec-on-surface-variant animate-fade-in">
            Tómate tu tiempo. Puedes presionar <kbd className="rounded bg-ec-surface-container-high px-1 py-0.5 font-mono text-[10px]">Ctrl+Enter</kbd> para enviar.
          </p>
        )}

        <div className="quiet-surface flex items-end gap-3 rounded-2xl p-3">
          {/* Mic toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="mb-0.5 shrink-0 rounded-xl text-ec-on-surface-variant"
            title={isMuted ? "Activar micrófono" : "Silenciar"}
            aria-label={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
          >
            {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </Button>

          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLastQuestion ? "Entrevista completada…" : "Escribe tu respuesta…"}
            disabled={isAiTyping || isLastQuestion || isFinishing}
            rows={2}
            className={cn(
              "flex-1 resize-none border-transparent bg-transparent text-sm shadow-none",
              "focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-none",
              "placeholder:text-ec-on-surface-variant/45 transition-all",
            )}
          />

          <div className="mb-0.5 flex shrink-0 items-center gap-2">
            {isLastQuestion ? (
              <Button
                size="sm"
                onClick={onFinish}
                disabled={isFinishing}
                className="gap-1.5 rounded-xl text-xs font-semibold"
              >
                {isFinishing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <SkipForward className="size-3.5" />
                )}
                {isFinishing ? "Calculando…" : "Ver resultados"}
              </Button>
            ) : (
              <Button
                size="icon"
                disabled={!canSend}
                onClick={handleSend}
                className="size-8 rounded-xl shadow-none"
                aria-label="Enviar respuesta"
              >
                <Send className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
