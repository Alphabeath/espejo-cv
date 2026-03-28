"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RotateCcw, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeedbackOverview } from "./feedback-overview"
import { FeedbackHistory } from "./feedback-history"
import type { HistoryEntry } from "./feedback-history"
import { FeedbackInsights } from "./feedback-insights"
import type { InsightItem } from "./feedback-insights"
import { getUserFeedbackSummary } from "@/services/feedback.service"

type FeedbackState = "loading" | "ready" | "error"

type FeedbackData = {
  averageScore: number
  bestScore: number
  totalSessions: number
  completedSessions: number
  recentHistory: HistoryEntry[]
  strengths: InsightItem[]
  gaps: InsightItem[]
  recommendations: InsightItem[]
}

export function FeedbackPage() {
  const router = useRouter()
  const [state, setState] = useState<FeedbackState>("loading")
  const [data, setData] = useState<FeedbackData | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const loadData = useCallback(async () => {
    setState("loading")
    setErrorMessage("")

    try {
      const summary = await getUserFeedbackSummary()

      // For insights, we try to load the latest completed session's report
      let strengths: InsightItem[] = []
      let gaps: InsightItem[] = []
      let recommendations: InsightItem[] = []

      const latestCompleted = summary.recentHistory.find(
        (s) => s.status === "completed" && s.score > 0,
      )

      if (latestCompleted) {
        try {
          const feedbackResponse = await fetch("/api/ai/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: latestCompleted.sessionId }),
          })

          if (feedbackResponse.ok) {
            const feedback = await feedbackResponse.json()
            strengths = feedback.strengths ?? []
            gaps = feedback.gaps ?? []
            recommendations = feedback.recommendations ?? []
          }
        } catch {
          // Insights are optional, proceed without them
        }
      }

      setData({
        averageScore: summary.averageScore,
        bestScore: summary.bestScore,
        totalSessions: summary.totalSessions,
        completedSessions: summary.completedSessions,
        recentHistory: summary.recentHistory,
        strengths,
        gaps,
        recommendations,
      })
      setState("ready")
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos de feedback.",
      )
      setState("error")
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (state === "loading") {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="size-8 animate-spin text-ec-primary" />
        <div>
          <p className="font-headline text-xl font-bold text-ec-on-surface">
            Cargando tu feedback
          </p>
          <p className="mt-1 text-sm text-ec-on-surface-variant">
            Preparando el resumen de tu rendimiento...
          </p>
        </div>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
        <div>
          <p className="font-headline text-xl font-bold text-ec-on-surface">
            Algo salió mal
          </p>
          <p className="mt-1 max-w-sm text-sm text-ec-on-surface-variant">
            {errorMessage}
          </p>
        </div>
        <Button
          onClick={loadData}
          className="mt-2 gap-2 rounded-xl px-6 text-sm font-semibold"
        >
          <RotateCcw className="size-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="animate-fade-in flex flex-col gap-8">
      {/* Page header */}
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-ec-primary uppercase">
          Feedback
        </p>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-ec-on-surface text-glow">
          Tu rendimiento
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-ec-on-surface-variant">
          Resumen de tu progreso en simulaciones de entrevista, con insights y
          recomendaciones basadas en IA.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Left column: overview */}
        <FeedbackOverview
          averageScore={data.averageScore}
          bestScore={data.bestScore}
          totalSessions={data.totalSessions}
          completedSessions={data.completedSessions}
        />

        {/* Right column: history + insights */}
        <div className="flex flex-col gap-8">
          <FeedbackHistory entries={data.recentHistory} />

          <FeedbackInsights
            strengths={data.strengths}
            gaps={data.gaps}
            recommendations={data.recommendations}
          />
        </div>
      </div>

    </div>
  )
}
