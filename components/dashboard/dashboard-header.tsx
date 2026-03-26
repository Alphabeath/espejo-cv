import type { DashboardMetric } from "@/services/dashboard.service"

export function DashboardHeader({
  title = "Panel de prácticas",
  description =
    "Revisa tu progreso y analiza tus resultados en simulaciones pasadas para perfeccionar tu narrativa profesional.",
  metrics = [
    { label: "SCORE PROMEDIO", value: "0", unit: "%" },
    { label: "SIMULACIONES", value: "0", unit: "" },
  ],
}: {
  title?: string
  description?: string
  metrics?: DashboardMetric[]
}) {
  return (
    <header className="mb-8 flex items-start justify-between gap-8">
      <div>
        <h1 className="text-4xl font-bold leading-tight text-ec-on-surface">
          {title}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ec-on-surface-variant">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex min-w-32 flex-col rounded-2xl bg-ec-surface-container-low px-5 py-4"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ec-on-surface-variant">
              {metric.label}
            </span>
            <span className="mt-2 text-4xl font-bold text-ec-on-surface">
              {metric.value}
              <span className="text-xl">{metric.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </header>
  )
}
