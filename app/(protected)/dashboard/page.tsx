"use client"

import { useEffect } from "react"

import { useToast } from "@/components/ui/toast"
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
        <section className="mb-8 rounded-2xl bg-ec-surface-container-low px-6 py-10 text-sm text-ec-on-surface-variant">
          Aún no tienes simulaciones registradas. Cuando completes una práctica, aparecerá aquí.
        </section>
      )}

      
    </main>
  )
}

