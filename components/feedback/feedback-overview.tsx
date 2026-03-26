"use client"

import { Star, Target, TrendingUp, Award } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FeedbackOverviewProps {
  averageScore: number
  bestScore: number
  totalSessions: number
  completedSessions: number
}

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const stroke = 7
  const radius = size / 2 - stroke / 2
  const circumference = 2 * Math.PI * radius
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
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Score promedio: ${score} de 100`}
        role="img"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="oklch(0.92 0.005 220)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition:
              "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-headline text-5xl font-bold tracking-tight text-ec-on-surface">
          {score}
        </span>
        <span className="text-xs font-medium text-ec-on-surface-variant">
          {label}
        </span>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  unit?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-ec-surface-container-low px-6 py-5 transition-colors hover:bg-ec-surface-container">
      <Icon className="size-5 text-ec-primary" />
      <div className="text-center">
        <p className="font-headline text-2xl font-bold text-ec-on-surface">
          {value}
          {unit && <span className="text-sm font-normal">{unit}</span>}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
          {label}
        </p>
      </div>
    </div>
  )
}

export function FeedbackOverview({
  averageScore,
  bestScore,
  totalSessions,
  completedSessions,
}: FeedbackOverviewProps) {
  const stars = Math.round(averageScore / 20)

  return (
    <div className="animate-fade-in-up quiet-surface flex flex-col items-center gap-8 rounded-3xl p-8 md:p-10">
      <div className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-widest text-ec-primary uppercase">
          Rendimiento general
        </p>
        <h2 className="font-headline text-3xl font-bold tracking-tight text-ec-on-surface text-glow">
          Tu progreso
        </h2>
      </div>

      <ScoreRing score={averageScore} size={180} />

      <div
        className="flex items-center justify-center gap-0.5"
        aria-label={`${stars} estrellas de 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "size-5 transition-colors",
              star <= stars
                ? "fill-ec-primary text-ec-primary"
                : "text-ec-outline-variant",
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge className="rounded-full bg-ec-secondary-container px-3 py-0.5 text-xs font-medium text-ec-on-secondary-container">
          {completedSessions} completada{completedSessions !== 1 ? "s" : ""}
        </Badge>
        {totalSessions > completedSessions && (
          <Badge className="rounded-full bg-ec-tertiary-container px-3 py-0.5 text-xs font-medium text-ec-on-tertiary-container">
            {totalSessions - completedSessions} en curso
          </Badge>
        )}
      </div>

      <div className="grid w-full grid-cols-3 gap-4">
        <MetricCard
          icon={TrendingUp}
          label="Promedio"
          value={averageScore}
          unit="%"
        />
        <MetricCard
          icon={Award}
          label="Mejor score"
          value={bestScore}
          unit="%"
        />
        <MetricCard
          icon={Target}
          label="Sesiones"
          value={totalSessions}
        />
      </div>
    </div>
  )
}
