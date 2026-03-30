"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Play } from "lucide-react"

import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  DashboardHeader,
  DashboardHistoryTable,
  DashboardPanels,
} from "@/components/dashboard"
import { useDashboard } from "@/hooks/useDashboard"

export default function Dashboard() {
  const { toast } = useToast()
  const { entries, metrics, summary, isLoading, error, hasEntries } = useDashboard()

  useEffect(() => {
    if (!error) {
      return
    }

    toast({
      title: "No pudimos cargar el dashboard",
      description: "Intenta nuevamente en unos instantes.",
    })
  }, [error, toast])

  const lowestScoreEntry = entries.reduce<typeof entries[number] | null>((lowest, entry) => {
    if (!lowest || entry.score < lowest.score) {
      return entry
    }

    return lowest
  }, null)

  const insightTitle = lowestScoreEntry
    ? `Tu foco inmediato: ${lowestScoreEntry.role}`
    : "¿Listo para mejorar tu score?"

  const insightDescription = lowestScoreEntry
    ? `Tu sesión con menor score reciente fue ${lowestScoreEntry.score}%. Revisar esa práctica primero te dará la mejora más rápida.`
    : "Completa tu primera simulación para detectar automáticamente qué sesión conviene revisar primero."

    const insightLink = lowestScoreEntry 
      ? `/dashboard/feedback/${lowestScoreEntry.sessionId}`
      : "/dashboard/practice"

    const insightButtonText = lowestScoreEntry
      ? "Ver análisis de tu peor sesión reciente"
      : "Iniciar nueva simulación"

    const nextGoalTitle = summary.activeSessions > 0 ? "Sesiones en progreso" : "Próxima meta"

    const nextGoalDescription = summary.activeSessions > 0
      ? `Tienes ${summary.activeSessions} sesión${summary.activeSessions === 1 ? "" : "es"} activa${summary.activeSessions === 1 ? "" : "s"}. Retómalas para convertir práctica iniciada en feedback útil.`
      : hasEntries
        ? `Tu siguiente objetivo razonable es superar tu score promedio actual de ${summary.averageScore}%.`
        : "Sube tu CV y completa una simulación para empezar a construir historial y métricas reales."

    return (
      <main className="min-h-svh overflow-y-auto px-6 py-8 md:px-10 ">
        <DashboardHeader metrics={metrics} />
        <DashboardPanels
          insightTitle={insightTitle}
          insightDescription={insightDescription}
          insightLink={insightLink}
          insightButtonText={insightButtonText}
          nextGoalTitle={nextGoalTitle}
          nextGoalDescription={nextGoalDescription}
        />
      {isLoading ? (
        <section className="mb-8 rounded-2xl bg-ec-surface-container-low px-6 py-10 text-sm text-ec-on-surface-variant">
          Cargando historial y métricas del dashboard...
        </section>
      ) : error ? (
        <section className="mb-8 rounded-2xl bg-ec-surface-container-low px-6 py-10 text-sm text-ec-on-surface-variant">
          No pudimos cargar el dashboard en este momento. Intenta nuevamente en unos instantes.
        </section>
      ) : hasEntries ? (
        <DashboardHistoryTable entries={entries} />
      ) : (
        <section className="mb-8 flex flex-col items-center justify-center gap-6 rounded-3xl bg-ec-surface-container-low px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ec-primary-container text-ec-on-primary-container">
            <Play className="h-8 w-8" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-medium text-ec-on-surface">No hay entrevistas aún</h3>
            <p className="text-sm text-ec-on-surface-variant">
              Inicia tu primera simulación para ponerte a prueba, analizar tu desempeño y recibir feedback detallado al instante.
            </p>
          </div>
          <Button asChild size="lg" className="mt-2 text-ec-on-primary">
            <Link href="/dashboard/practice">
              Iniciar entrevista
            </Link>
          </Button>
        </section>
      )}

      
    </main>
  )
}

