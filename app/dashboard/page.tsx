import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CirclePlus,
  FileText,
  LayoutDashboard,
  ReceiptText,
  Settings,
  TrendingUp,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Resumen", href: "/dashboard", icon: LayoutDashboard, current: true },
  { label: "Simulaciones", href: "/practica", icon: ReceiptText },
  { label: "Documentos", href: "/dashboard#documentos", icon: FileText },
  { label: "Configuración", href: "/dashboard#configuracion", icon: Settings },
]

const practiceHistory = [
  {
    role: "Senior Product Manager",
    domain: "Tecnología & Producto",
    date: "12 Oct, 2023",
    file: "CV_PM_Senior_v2.pdf",
    score: 92,
  },
  {
    role: "Diseñador UX/UI",
    domain: "Diseño & Creatividad",
    date: "05 Oct, 2023",
    file: "Portfolio_Creative.pdf",
    score: 78,
  },
  {
    role: "Analista de Datos Jr.",
    domain: "Data Science",
    date: "28 Sep, 2023",
    file: "CV_Data_Final.pdf",
    score: 65,
  },
  {
    role: "Engineering Manager",
    domain: "Ingeniería & IT",
    date: "15 Sep, 2023",
    file: "CV_Tech_Lead.pdf",
    score: 88,
  },
]

function ScoreDot({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "ml-1.5 inline-block size-2 shrink-0 rounded-full",
        score >= 85
          ? "bg-green-500"
          : score >= 70
            ? "bg-amber-400"
            : "bg-red-500",
      )}
    />
  )
}

export default function Dashboard() {
  return (
    <div className="flex h-[calc(100svh-3.5rem)]">
      {/* ── Sidebar ── */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-ec-outline-variant/20 bg-ec-surface-container-low px-3 py-6">
        {/* User */}
        <div className="mb-5 flex items-center gap-3 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ec-primary-container">
            <UserRound className="size-4 text-ec-on-primary-container" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Alexander Doe</p>
            <p className="truncate text-xs text-ec-on-surface-variant">
              Candidato Senior
            </p>
          </div>
        </div>

        <Separator className="mb-4 bg-ec-outline-variant/30" />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-r-xl py-2.5 pl-4 pr-3 text-sm transition-colors",
                  item.current
                    ? "font-medium text-ec-primary before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-ec-primary"
                    : "text-ec-on-surface-variant hover:bg-black/[0.04] hover:text-ec-on-surface",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        {/* CTA */}
        <Button
          asChild
          className="signature-gradient w-full justify-center rounded-xl text-sm text-ec-on-primary shadow-md shadow-ec-primary/15"
        >
          <Link href="/practica">
            <CirclePlus className="size-4" />
            Nueva Práctica
          </Link>
        </Button>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto bg-white px-10 py-8">
        {/* Header: title left, metrics right */}
        <div className="mb-8 flex items-start justify-between gap-8">
          <div>
            <h1
              className="text-4xl font-bold leading-tight text-ec-on-surface"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Historial de Práctica
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ec-on-surface-variant">
              Revisa tu progreso y analiza tus resultados en simulaciones pasadas
              para perfeccionar tu narrativa profesional.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            {[
              { label: "SCORE PROMEDIO", value: "84", unit: "%" },
              { label: "SIMULACIONES", value: "12", unit: "" },
            ].map((m) => (
              <div
                key={m.label}
                className="flex min-w-[128px] flex-col rounded-2xl bg-ec-surface-container-low px-5 py-4"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ec-on-surface-variant">
                  {m.label}
                </span>
                <span
                  className="mt-2 text-4xl font-bold text-ec-on-surface"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {m.value}
                  <span className="text-xl">{m.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-ec-outline-variant/20 bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,2fr)_140px_minmax(0,1.5fr)_80px] gap-4 bg-ec-surface-container-low/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
            <span>Puesto de Trabajo</span>
            <span>Fecha</span>
            <span>CV Utilizado</span>
            <span className="text-right">Score</span>
          </div>
          <Separator className="bg-ec-outline-variant/20" />
          {practiceHistory.map((entry, idx) => (
            <div key={entry.role}>
              <div className="grid grid-cols-[minmax(0,2fr)_140px_minmax(0,1.5fr)_80px] items-center gap-4 px-6 py-5 transition-colors hover:bg-ec-surface-container-low/40">
                <div>
                  <p className="text-sm font-semibold text-ec-on-surface">
                    {entry.role}
                  </p>
                  <p className="mt-0.5 text-xs text-ec-on-surface-variant">
                    {entry.domain}
                  </p>
                </div>
                <span className="text-sm text-ec-on-surface-variant">
                  {entry.date}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-ec-primary">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="truncate">{entry.file}</span>
                </div>
                <div className="flex items-center justify-end text-sm font-semibold text-ec-on-surface">
                  {entry.score}%
                  <ScoreDot score={entry.score} />
                </div>
              </div>
              {idx < practiceHistory.length - 1 && (
                <Separator className="mx-6 bg-ec-outline-variant/15" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom panels */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Insights (dark) */}
          <div className="relative overflow-hidden rounded-2xl bg-ec-primary p-6">
            <div className="pointer-events-none absolute right-4 top-4 text-white/15">
              <TrendingUp className="size-20" />
            </div>
            <h3
              className="text-xl font-bold leading-snug text-white"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              ¿Listo para mejorar tu score?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Hemos detectado que tu lenguaje corporal ha mejorado un 15% en las
              últimas sesiones. Sigue practicando para alcanzar el nivel
              &ldquo;Experto&rdquo;.
            </p>
            <Button
              variant="outline"
              className="mt-5 h-9 rounded-full border-white/30 bg-transparent px-5 text-sm text-white hover:bg-white/10"
            >
              Ver Análisis Detallado
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Próxima meta (light) */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-ec-surface-container-low p-6 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-ec-primary-container">
              <CalendarDays className="size-5 text-ec-primary" />
            </div>
            <h3 className="text-base font-semibold text-ec-on-surface">
              Próxima Meta
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ec-on-surface-variant">
              Tu próxima simulación programada es para el rol de{" "}
              <strong>Product Lead</strong> mañana a las 10:00 AM.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

