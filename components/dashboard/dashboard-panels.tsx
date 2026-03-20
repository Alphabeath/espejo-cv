import { ArrowRight, CalendarDays, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

export function DashboardPanels({
  insightTitle = "¿Listo para mejorar tu score?",
  insightDescription =
    'Analiza tu sesión con peor desempeño para identificar áreas de mejora y optimizar tu preparación.',
  nextGoalTitle = "Próxima meta",
  nextGoalDescription = (
    <>
      Tu próxima simulación programada es para el rol de <strong>Product Lead</strong> mañana a las 10:00 AM.
    </>
  ),
}: {
  insightTitle?: string
  insightDescription?: string
  nextGoalTitle?: string
  nextGoalDescription?: ReactNode
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="relative overflow-hidden rounded-2xl signature-gradient p-6 text-ec-on-primary shadow-[0_28px_64px_-34px_oklch(0.27_0.015_210/0.45)]">
        <div className="pointer-events-none absolute right-4 top-4 text-white/15">
          <TrendingUp className="size-20" />
        </div>
        <h3 className="text-xl font-bold leading-snug text-white">
          {insightTitle}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          {insightDescription}
        </p>
        <Button
          variant="outline"
          className="mt-5 h-9 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white hover:bg-white/15"
        >
          Ver análisis de tu peor sesión reciente
          <ArrowRight className="size-4" />
        </Button>
      </section>

      <section className="flex flex-col items-center justify-center rounded-2xl bg-ec-surface-container p-6 text-center">
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-ec-primary-container">
          <CalendarDays className="size-5 text-ec-primary" />
        </div>
        <h3 className="text-base font-semibold text-ec-on-surface">
          {nextGoalTitle}
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ec-on-surface-variant">
          {nextGoalDescription}
        </p>
      </section>
    </div>
  )
}
