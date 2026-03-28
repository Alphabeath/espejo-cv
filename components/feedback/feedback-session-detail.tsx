"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Star,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getSessionDetail, SessionRedirectError } from "@/services/feedback.service"
import type { SessionDetail, SessionTurnDetail, FeedbackItemParsed } from "@/services/feedback.service"

// ─── Score Arc ──────────────────────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const radius = 68
  const stroke = 7
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const color =
    score >= 80
      ? "oklch(0.445 0.055 260)"
      : score >= 60
        ? "oklch(0.46 0.04 290)"
        : "oklch(0.50 0.15 25)"

  const label = score >= 80 ? "Excelente" : score >= 60 ? "Bueno" : "A mejorar"

  return (
    <div className="relative mx-auto flex size-40 items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160" aria-label={`Puntaje: ${score}`} role="img">
        <circle cx="80" cy="80" r={normalizedRadius} stroke="oklch(0.92 0.005 220)" strokeWidth={stroke} fill="none" />
        <circle
          cx="80" cy="80" r={normalizedRadius} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-headline text-4xl font-bold tracking-tight text-ec-on-surface">{score}</span>
        <span className="text-xs font-medium text-ec-on-surface-variant">{label}</span>
      </div>
    </div>
  )
}

// ─── Feedback Card ──────────────────────────────────────────────────────────

function FeedbackCard({
  item,
  variant,
}: {
  item: FeedbackItemParsed
  variant: "strength" | "gap" | "recommendation"
}) {
  const config = {
    strength: { icon: CheckCircle2, bg: "bg-ec-primary-container", fg: "text-ec-on-primary-container" },
    gap: { icon: AlertCircle, bg: "bg-ec-tertiary-container", fg: "text-ec-on-tertiary-container" },
    recommendation: { icon: Lightbulb, bg: "bg-ec-secondary-container", fg: "text-ec-on-secondary-container" },
  }
  const { icon: Icon, bg, fg } = config[variant]

  return (
    <div className="group flex items-start gap-4 rounded-2xl bg-ec-surface-container-low px-5 py-4 transition-all hover:bg-ec-surface-container">
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", bg)}>
        <Icon className={cn("size-4", fg)} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ec-on-surface">{item.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ec-on-surface-variant">{item.description}</p>
      </div>
    </div>
  )
}

// ─── Turn Review Card ───────────────────────────────────────────────────────

function TurnCard({ turn }: { turn: SessionTurnDetail }) {
  const [expanded, setExpanded] = useState(false)

  const scoreColor =
    turn.score >= 80
      ? "text-ec-primary"
      : turn.score >= 60
        ? "text-ec-secondary"
        : "text-ec-tertiary"

  return (
    <div
      className="rounded-2xl bg-ec-surface-container-low transition-all hover:bg-ec-surface-container cursor-pointer"
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(!expanded) }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ec-surface-container-lowest">
          <span className="text-xs font-bold text-ec-on-surface">{turn.turnIndex + 1}</span>
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ec-on-surface">
          {turn.question}
        </p>
        <span className={cn("text-sm font-bold", scoreColor)}>{turn.score}%</span>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-ec-outline-variant" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-ec-outline-variant" />
        )}
      </div>

      {expanded && (
        <div className="animate-fade-in space-y-4 px-5 pb-5">
          <div className="rounded-xl bg-ec-surface-container-lowest px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant mb-1">
              Tu respuesta
            </p>
            <p className="text-sm leading-relaxed text-ec-on-surface">{turn.answer}</p>
          </div>
          {turn.feedback && (
            <div className="rounded-xl bg-ec-surface-container px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant mb-1">
                Feedback de la IA
              </p>
              <p className="text-sm leading-relaxed text-ec-on-surface-variant">{turn.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface FeedbackSessionDetailProps {
  sessionId: string
}

export function FeedbackSessionDetail({ sessionId }: FeedbackSessionDetailProps) {
  const router = useRouter()
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const loadDetail = useCallback(async () => {
    setState("loading")
    try {
      const data = await getSessionDetail(sessionId)
      setDetail(data)
      setState("ready")
    } catch (error) {
      if (error instanceof SessionRedirectError) {
        router.replace(error.destination)
        return
      }

      setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar la sesión.")
      setState("error")
    }
  }, [router, sessionId])

  useEffect(() => { void loadDetail() }, [loadDetail])

  if (state === "loading") {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="size-8 animate-spin text-ec-primary" />
        <p className="font-headline text-xl font-bold text-ec-on-surface">Cargando resultados</p>
      </div>
    )
  }

  if (state === "error" || !detail) {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-headline text-xl font-bold text-ec-on-surface">Algo salió mal</p>
        <p className="max-w-sm text-sm text-ec-on-surface-variant">{errorMessage}</p>
        <div className="flex gap-3">
          <Button onClick={loadDetail} className="gap-2 rounded-xl px-6 text-sm font-semibold">
            <RotateCcw className="size-4" /> Reintentar
          </Button>
          <Button variant="secondary" onClick={() => router.push("/dashboard/feedback")} className="gap-2 rounded-xl px-6 text-sm">
            <ArrowLeft className="size-4" /> Volver
          </Button>
        </div>
      </div>
    )
  }

  const stars = Math.round(detail.overallScore / 20)

  return (
    <div className="animate-fade-in flex flex-col gap-10">
      {/* Header */}
      <div className="space-y-2">
        <button
          onClick={() => router.push("/dashboard/feedback")}
          className="flex items-center gap-1.5 text-xs font-medium text-ec-primary hover:underline transition-colors mb-3"
        >
          <ArrowLeft className="size-3.5" />
          Volver al feedback
        </button>
        <p className="text-xs font-medium tracking-widest text-ec-primary uppercase">
          Resultados · {detail.date}
        </p>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-ec-on-surface text-glow">
          {detail.jobPosition}
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-[auto_1fr]">
        {/* Score panel */}
        <div className="quiet-surface flex flex-col items-center gap-6 rounded-3xl p-8 md:min-w-60">
          <ScoreArc score={detail.overallScore} />

          <div className="w-full space-y-3 text-center">
            <div className="flex items-center justify-center gap-3 text-xs text-ec-on-surface-variant">
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3.5" />
                {detail.totalQuestions} preguntas
              </span>
              <span className="text-ec-outline-variant">·</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="size-3.5" />
                {detail.confidence}% confianza
              </span>
            </div>

            <div className="flex items-center justify-center gap-0.5" aria-label={`${stars} estrellas de 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "size-4 transition-colors",
                    star <= stars ? "fill-ec-primary text-ec-primary" : "text-ec-outline-variant",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {detail.strengths.length > 0 && (
              <Badge className="rounded-full bg-ec-secondary-container px-3 py-0.5 text-xs font-medium text-ec-on-secondary-container">
                {detail.strengths.length} fortaleza{detail.strengths.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {detail.gaps.length > 0 && (
              <Badge className="rounded-full bg-ec-tertiary-container px-3 py-0.5 text-xs font-medium text-ec-on-tertiary-container">
                {detail.gaps.length} área{detail.gaps.length !== 1 ? "s" : ""} a mejorar
              </Badge>
            )}
          </div>
        </div>

        {/* Detail panels */}
        <div className="quiet-surface flex flex-col gap-6 rounded-3xl p-6">
          {/* Summary */}
          <div className="rounded-2xl bg-ec-surface-container px-6 py-5">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="size-4 text-ec-primary" />
              <p className="text-sm font-semibold text-ec-on-surface">Resumen general</p>
            </div>
            <p className="text-sm leading-relaxed text-ec-on-surface-variant">{detail.summary}</p>
          </div>

          {/* Strengths */}
          {detail.strengths.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ec-on-surface-variant">
                Fortalezas detectadas
              </p>
              <div className="flex flex-col gap-3">
                {detail.strengths.map((item) => (
                  <FeedbackCard key={item.label} item={item} variant="strength" />
                ))}
              </div>
            </div>
          )}

          {/* Gaps */}
          {detail.gaps.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ec-on-surface-variant">
                Áreas de mejora
              </p>
              <div className="flex flex-col gap-3">
                {detail.gaps.map((item) => (
                  <FeedbackCard key={item.label} item={item} variant="gap" />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {detail.recommendations.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ec-on-surface-variant">
                Recomendaciones
              </p>
              <div className="flex flex-col gap-3">
                {detail.recommendations.map((item) => (
                  <FeedbackCard key={item.label} item={item} variant="recommendation" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Per-turn review */}
      {detail.turns.length > 0 && (
        <div className="animate-fade-in delay-200 quiet-surface flex flex-col gap-5 rounded-3xl p-6 md:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
              Revisión por pregunta
            </p>
            <p className="text-sm text-ec-on-surface-variant">
              Toca cada pregunta para ver tu respuesta y el feedback de la IA
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {detail.turns.map((turn) => (
              <TurnCard key={turn.turnIndex} turn={turn} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
