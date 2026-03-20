"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, MicOff, Send, Bot, SkipForward, Loader2, Volume2, Square } from "lucide-react"

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
  isRecording?: boolean
  isTranscribing?: boolean
  volume?: number
  silenceTick?: number
  onToggleMic?: () => Promise<string>
}

/**
 * Animated Waveform using SVG line elements
 */
function WaveformVisualizer({ volume = 0, isActive = false }: { volume: number; isActive: boolean }) {
  // Generar 40 barras
  return (
    <div className="flex h-24 w-full items-center justify-center gap-[2px] overflow-hidden px-4">
      {Array.from({ length: 40 }).map((_, i) => {
        // Altura base (con un poco de ruido si está activo)
        const baseHeight = isActive ? Math.max(10, (volume / 255) * 100 * (0.5 + Math.random() * 0.5)) : 2
        return (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-full transition-all duration-75",
              isActive ? "bg-ec-primary" : "bg-ec-surface-container-highest",
            )}
            style={{
              height: `${baseHeight}%`,
            }}
          />
        )
      })}
    </div>
  )
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
  isRecording = false,
  isTranscribing = false,
  volume = 0,
  silenceTick = 0,
  onToggleMic,
}: PracticeInterviewStepProps) {
  const [answer, setAnswer] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const canSend = answer.trim().length > 0 && !isAiTyping && !isFinishing
  const isLastQuestion = questionIndex >= totalQuestions

  const lastAiMessage = [...messages].reverse().find((m) => m.role === "ai")

  const isRecordingRef = useRef(isRecording)
  isRecordingRef.current = isRecording
  
  const onToggleMicRef = useRef(onToggleMic)
  onToggleMicRef.current = onToggleMic

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastSpokenTextRef = useRef<string>("")

  const speakText = useCallback(async (text: string, autoStartMic: boolean = false) => {
    if (!text || (autoStartMic && text === lastSpokenTextRef.current)) return
    
    // 1. Limpiar rastro de cualquier voz nativa vieja
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    // 2. Abortar cualquier petición de audio anterior que aún no haya terminado de descargar
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // 3. Detener audio que esté sonando actualmente
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (autoStartMic) {
      lastSpokenTextRef.current = text
    }

    try {
      const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`)
      audioRef.current = audio

      audio.onended = () => {
        if (autoStartMic && !isRecordingRef.current && onToggleMicRef.current) {
          onToggleMicRef.current().then((transcribedText) => {
            if (transcribedText) {
              setAnswer((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText))
            }
          }).catch(console.error)
        }
      }

      await audio.play()
    } catch (error: any) {
      console.error("Deepgram TTS error:", error)
    }
  }, [])

  // Leer en voz alta la última pregunta al terminar de generarse
  useEffect(() => {
    if (lastAiMessage && lastAiMessage.content && !isAiTyping) {
      speakText(lastAiMessage.content, true)
    }
  }, [lastAiMessage?.id, isAiTyping, speakText])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isAiTyping])

  /**
   * Efecto que escucha los "ticks" de silencio del hook useSpeechToText.
   * Si estamos grabando y recibimos un tick (el silencio superó los 3.5s), detenemos el mic y enviamos.
   */
  useEffect(() => {
    if (silenceTick > 0 && isRecording && onToggleMic) {
      const triggerAutoSend = async () => {
        const transcribedText = await onToggleMic()
        const finalAnswer = (answer + " " + transcribedText).trim()
        if (finalAnswer) {
          onSendAnswer(finalAnswer)
          setAnswer("")
        }
      }
      triggerAutoSend()
    }
  }, [silenceTick]) // solo depende de silenceTick para evitar loops

  function handleSend() {
    if (!canSend) return
    if (audioRef.current) {
      audioRef.current.pause()
    }
    onSendAnswer(answer.trim())
    setAnswer("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleMicToggle() {
    if (!onToggleMic) return
    if (!isRecording && audioRef.current) {
      audioRef.current.pause()
    }
    const transcribedText = await onToggleMic()
    if (transcribedText) {
      setAnswer((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText))
    }
  }

  const progress = totalQuestions > 0 ? (questionIndex / totalQuestions) * 100 : 0

  return (
    <div className="flex h-full flex-col overflow-hidden bg-ec-surface">
      {/* HEADER TIPO BOSQUEJO */}
      <header className="flex shrink-0 items-center justify-between border-b-2 border-ec-outline-variant/30 bg-ec-surface-container-lowest px-6 py-4">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-wide text-ec-on-surface">
            PUESTO: {jobPosition}
          </h1>
          <p className="text-sm font-medium text-ec-on-surface-variant">
            DIFICULTAD: ALTA
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Badge variant="outline" className="text-xs uppercase shadow-sm">
            Pregunta {questionIndex} de {totalQuestions}
          </Badge>
          <div className="w-32 h-2 rounded-full border border-ec-outline-variant/30 bg-ec-surface-container-high overflow-hidden">
            <div
              className="h-full bg-ec-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* PANEL SUPERIOR: IA (Mitad de pantalla) */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-ec-surface-container-lowest p-6">
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          {isAiTyping ? (
            <div className="flex items-start gap-4 animate-fade-in justify-end">
              <div className="flex flex-col max-w-[80%] gap-1 items-end">
                <span className="text-xs font-bold uppercase text-ec-on-surface-variant tracking-widest">Celeste</span>
                <div className="relative rounded-2xl rounded-tr-sm bg-ec-surface-container-high px-6 py-5 shadow-sm border border-ec-outline-variant/20">
                  <div className="flex items-center gap-2 h-6">
                    <span className="size-2 rounded-full bg-ec-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-2 rounded-full bg-ec-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-2 rounded-full bg-ec-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-full bg-ec-primary-container border-2 border-ec-primary/20 shadow-md">
                <Bot className="size-8 text-ec-on-primary-container" />
              </div>
            </div>
          ) : lastAiMessage ? (
             <div className="flex items-start gap-4 animate-fade-in-up justify-end relative">
               <div className="flex flex-col max-w-[80%] gap-1 items-end">
                 <span className="text-xs font-bold uppercase text-ec-on-surface-variant mr-2 tracking-widest">Celeste</span>
                 <div className="relative rounded-2xl rounded-tr-sm bg-ec-surface-container-low px-6 py-5 shadow-md border border-ec-outline-variant/30">
                   {/* Burbuja estilo cómic tail */}
                   <div className="absolute right-0 top-4 translate-x-1/2 rotate-45 size-4 bg-ec-surface-container-low border-r border-t border-ec-outline-variant/30 hidden md:block" />
                   
                   <p className="text-lg leading-relaxed text-ec-on-surface font-medium whitespace-pre-wrap">
                     "{lastAiMessage.content}"
                   </p>
                   
                   <button
                     type="button"
                     onClick={() => speakText(lastAiMessage.content)}
                     className="mt-4 flex items-center gap-2 text-sm font-semibold text-ec-primary hover:text-ec-primary/80 transition-colors"
                   >
                     <Volume2 className="size-4" />
                     ESCUCHAR NUEVAMENTE
                   </button>
                 </div>
               </div>
               
               {/* Avatar IA gigante a la derecha */}
               <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full bg-ec-primary-container border-2 border-ec-primary shadow-lg z-10 mt-6 hidden md:flex">
                 <Bot className="size-9 text-ec-on-primary-container" />
               </div>
             </div>
          ) : (
            <div className="flex h-full items-center justify-center text-ec-on-surface-variant/50 flex-col gap-2">
              <Bot className="size-8 animate-pulse" />
              <p>Esperando a que la entrevista comience...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* PANEL INFERIOR: USUARIO (Mitad de pantalla) */}
      <div className="flex flex-1 flex-col border-t-2 border-ec-outline-variant/30 bg-ec-surface-container-low">
        
        <div className="flex h-full w-full max-w-5xl mx-auto flex-col p-6">
          <span className="text-xs font-bold uppercase text-ec-on-surface-variant mb-3">
            RESPUESTA DEL USUARIO {isRecording && "(EN TIEMPO REAL)"}
          </span>
          
          <div className="flex flex-col md:flex-row flex-1 gap-4 overflow-hidden rounded-2xl border-2 border-ec-outline-variant/50 bg-ec-surface-container-lowest shadow-inner">
            
            {/* Columna Izquierda: Waveform */}
            <div className={cn(
              "flex flex-col flex-1 border-b md:border-b-0 md:border-r-2 border-ec-outline-variant/30 p-4 relative overflow-hidden transition-colors",
              isRecording ? "bg-orange-500/5 border-orange-500/30" : "bg-ec-surface-container-lowest"
            )}>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isRecording ? "text-orange-600 animate-pulse" : "text-ec-on-surface-variant"
              )}>
                {isRecording ? "MICRÓFONO ACTIVO - ESCUCHANDO..." : "MICRÓFONO INACTIVO"}
              </span>
              
              <div className="flex-1 flex items-center justify-center">
                <WaveformVisualizer volume={volume} isActive={isRecording} />
              </div>
              
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest text-right",
                isRecording ? "text-orange-600 animate-pulse" : "text-ec-on-surface-variant"
              )}>
                {isRecording && "MICRÓFONO ACTIVO - ESCUCHANDO..."}
              </span>
            </div>

            {/* Columna Derecha: Texto */}
            <div className="flex flex-col flex-1 p-4 bg-ec-surface-container-lowest">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ec-on-surface-variant mb-2 shrink-0">
                TRANSCRIPCIÓN EN VIVO (LO QUE DICES):
              </span>
              
              <div className="relative flex flex-1">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isTranscribing
                      ? "Procesando audio..."
                      : isRecording
                        ? "Habla ahora... la transcripción aparecerá aquí al detener."
                        : isLastQuestion
                          ? "Entrevista completada."
                          : "Escribe o dicta tu respuesta..."
                  }
                  disabled={isAiTyping || isLastQuestion || isFinishing}
                  className="w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-ec-on-surface focus-visible:ring-0 shadow-none scrollbar-thin scrollbar-thumb-ec-outline-variant"
                />
                
                {isTranscribing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ec-surface-container-lowest/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="size-6 animate-spin text-ec-primary" />
                       <span className="text-xs font-semibold uppercase text-ec-primary animate-pulse">Procesando...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Controles inferiores */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={handleMicToggle}
              disabled={isAiTyping || isLastQuestion || isFinishing || isTranscribing}
              className={cn(
                "gap-2 px-6 rounded-xl font-bold uppercase tracking-wide border-2",
                isRecording && "animate-pulse border-red-500 hover:bg-red-600"
              )}
            >
              {isRecording ? <Square className="size-5" fill="currentColor" /> : <Mic className="size-5" />}
              {isRecording ? "Detener Grabación" : "Activar Micrófono"}
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={isLastQuestion ? onFinish : handleSend}
              disabled={(!canSend && !isRecording) || isTranscribing}
              className="gap-2 px-8 rounded-xl font-bold uppercase tracking-wide group"
            >
              {isLastQuestion ? (
                 <>
                   {isFinishing ? <Loader2 className="size-5 animate-spin" /> : "Finalizar Entrevista"}
                 </>
              ) : (
                <>
                  {isRecording ? "Parar / Enviar Respueta" : "Enviar / Siguiente Pregunta"}
                  <SkipForward className="size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  )
}
