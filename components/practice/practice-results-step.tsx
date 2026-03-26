"use client"

import { useMemo } from "react"
import {
  Trophy,
  Star,
  ArrowRight,
  RotateCcw,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface InterviewFeedbackItem {
  label: string
  description: string
  type: "strength" | "improvement"
}

export interface PracticeResult {
  score: number // 0–100
  jobPosition: string
  totalQuestions: number
  duration: number // seconds
  feedback: InterviewFeedbackItem[]
  summary: string
}

interface PracticeResultsStepProps {
  result: PracticeResult
  onNewPractice: () => void
  onGoToDashboard: () => void
  onGoToFeedback?: () => void
}

function ScoreArc({ score }: { score: number }) {
  // SVG arc for the score ring
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

  const label =
    score >= 80 ? "Excelente" : score >= 60 ? "Bueno" : "A mejorar"

  return (
    <div className="relative mx-auto flex size-40 items-center justify-center">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        aria-label={`Puntaje: ${score} de 100`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx="80"
          cy="80"
          r={normalizedRadius}
          stroke="oklch(0.92 0.005 220)"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Score arc */}
        <circle
          cx="80"
          cy="80"
          r={normalizedRadius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-headline text-4xl font-bold tracking-tight text-ec-on-surface">
          {score}
        </span>
        <span className="text-xs font-medium text-ec-on-surface-variant">{label}</span>
      </div>
    </div>
  )
}

function FeedbackCard({ item }: { item: InterviewFeedbackItem }) {
  const isStrength = item.type === "strength"
  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-2xl bg-ec-surface-container-low px-5 py-4 transition-all",
        "hover:bg-ec-surface-container",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          isStrength ? "bg-ec-primary-container" : "bg-ec-tertiary-container",
        )}
      >
        {isStrength ? (
          <CheckCircle2 className="size-4 text-ec-on-primary-container" />
        ) : (
          <AlertCircle className="size-4 text-ec-on-tertiary-container" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ec-on-surface">{item.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ec-on-surface-variant">{item.description}</p>
      </div>
    </div>
  )
}

export function PracticeResultsStep({
  result,
  onNewPractice,
  onGoToDashboard,
  onGoToFeedback,
}: PracticeResultsStepProps) {
  const { strengths, improvements } = useMemo(() => {
    return {
      strengths: result.feedback.filter((f) => f.type === "strength"),
      improvements: result.feedback.filter((f) => f.type === "improvement"),
    }
  }, [result.feedback])

  const minutes = Math.floor(result.duration / 60)
  const seconds = result.duration % 60

  return (
    <div className="animate-fade-in-up flex flex-col gap-10">
      {/* Headline */}
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-ec-primary uppercase">
          Resultados · Paso 3 de 3
        </p>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-ec-on-surface text-glow">
          Tu evaluación
        </h1>
        <p className="text-sm text-ec-on-surface-variant max-w-sm leading-relaxed">
          Aquí tienes el análisis detallado de tu desempeño en la simulación.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[auto_1fr]">
        {/* Score panel */}
        <div className="quiet-surface flex flex-col items-center gap-6 rounded-3xl p-8 md:min-w-[240px]">
          <ScoreArc score={result.score} />

          <div className="w-full space-y-3 text-center">
            <p className="text-sm font-semibold text-ec-on-surface">{result.jobPosition}</p>

            <div className="flex items-center justify-center gap-3 text-xs text-ec-on-surface-variant">
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3.5" />
                {result.totalQuestions} preguntas
              </span>
              <span className="text-ec-outline-variant">·</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="size-3.5" />
                {minutes}m {seconds}s
              </span>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-0.5" aria-label={`${Math.round(result.score / 20)} estrellas de 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "size-4 transition-colors",
                    star <= Math.round(result.score / 20)
                      ? "fill-ec-primary text-ec-primary"
                      : "text-ec-outline-variant",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Feedback chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {strengths.length > 0 && (
              <Badge className="rounded-full bg-ec-secondary-container px-3 py-0.5 text-xs font-medium text-ec-on-secondary-container">
                {strengths.length} fortaleza{strengths.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {improvements.length > 0 && (
              <Badge className="rounded-full bg-ec-tertiary-container px-3 py-0.5 text-xs font-medium text-ec-on-tertiary-container">
                {improvements.length} área{improvements.length !== 1 ? "s" : ""} a mejorar
              </Badge>
            )}
          </div>
        </div>

        {/* Feedback details */}
        <div className="quiet-surface flex flex-col gap-6 rounded-3xl p-6">
          {/* Summary */}
          <div className="rounded-2xl bg-ec-surface-container px-6 py-5">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="size-4 text-ec-primary" />
              <p className="text-sm font-semibold text-ec-on-surface">Resumen general</p>
            </div>
            <p className="text-sm leading-relaxed text-ec-on-surface-variant">{result.summary}</p>
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ec-on-surface-variant">
                Fortalezas detectadas
              </p>
              <div className="flex flex-col gap-3">
                {strengths.map((item) => (
                  <FeedbackCard key={item.label} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {improvements.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ec-on-surface-variant">
                Áreas de mejora
              </p>
              <div className="flex flex-col gap-3">
                {improvements.map((item) => (
                  <FeedbackCard key={item.label} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          onClick={onNewPractice}
          className="gap-2 rounded-xl px-7 text-sm font-semibold shadow-lg shadow-ec-primary/20 hover:-translate-y-0.5 transition-all"
        >
          <RotateCcw className="size-4" />
          Nueva práctica
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onGoToDashboard}
          className="gap-2 rounded-xl px-7 text-sm"
        >
          Ver historial
          <ArrowRight className="size-4" />
        </Button>
        {onGoToFeedback && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onGoToFeedback}
            className="gap-2 rounded-xl px-7 text-sm"
          >
            Ver feedback completo
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
