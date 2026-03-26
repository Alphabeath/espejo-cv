"use client"

import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type InsightItem = {
  label: string
  description: string
}

interface FeedbackInsightsProps {
  strengths: InsightItem[]
  gaps: InsightItem[]
  recommendations: InsightItem[]
}

function InsightCard({
  item,
  variant,
}: {
  item: InsightItem
  variant: "strength" | "gap" | "recommendation"
}) {
  const config = {
    strength: {
      icon: CheckCircle2,
      containerClass: "bg-ec-primary-container",
      iconClass: "text-ec-on-primary-container",
    },
    gap: {
      icon: AlertCircle,
      containerClass: "bg-ec-tertiary-container",
      iconClass: "text-ec-on-tertiary-container",
    },
    recommendation: {
      icon: Lightbulb,
      containerClass: "bg-ec-secondary-container",
      iconClass: "text-ec-on-secondary-container",
    },
  }

  const { icon: Icon, containerClass, iconClass } = config[variant]

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
          containerClass,
        )}
      >
        <Icon className={cn("size-4", iconClass)} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ec-on-surface">
          {item.label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-ec-on-surface-variant">
          {item.description}
        </p>
      </div>
    </div>
  )
}

function InsightSection({
  title,
  items,
  variant,
}: {
  title: string
  items: InsightItem[]
  variant: "strength" | "gap" | "recommendation"
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ec-on-surface-variant">
        {title}
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <InsightCard key={item.label} item={item} variant={variant} />
        ))}
      </div>
    </div>
  )
}

export function FeedbackInsights({
  strengths,
  gaps,
  recommendations,
}: FeedbackInsightsProps) {
  const hasContent =
    strengths.length > 0 || gaps.length > 0 || recommendations.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <div className="animate-fade-in delay-300 quiet-surface flex flex-col gap-6 rounded-3xl p-6 md:p-8">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
          Insights del análisis
        </p>
        <p className="text-sm text-ec-on-surface-variant">
          Basado en tus sesiones más recientes
        </p>
      </div>

      <InsightSection
        title="Fortalezas recurrentes"
        items={strengths}
        variant="strength"
      />

      <InsightSection
        title="Áreas de mejora"
        items={gaps}
        variant="gap"
      />

      <InsightSection
        title="Recomendaciones"
        items={recommendations}
        variant="recommendation"
      />
    </div>
  )
}
