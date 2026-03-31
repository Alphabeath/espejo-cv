import Link from "next/link"
import { FileText, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { DashboardHistoryEntry, DashboardSessionStatus } from "@/services/dashboard.service"

function StatusBadge({ status }: { status: DashboardSessionStatus }) {
  const config: Record<
    DashboardSessionStatus,
    { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
  > = {
    completed: {
      label: "Completada",
      icon: CheckCircle2,
      className: "bg-ec-primary-container text-ec-on-primary-container",
    },
    interviewing: {
      label: "En curso",
      icon: Clock,
      className: "bg-ec-secondary-container text-ec-on-secondary-container",
    },
    analyzing: {
      label: "Analizando",
      icon: Clock,
      className: "bg-ec-secondary-container text-ec-on-secondary-container",
    },
    draft: {
      label: "Borrador",
      icon: AlertCircle,
      className: "bg-ec-tertiary-container text-ec-on-tertiary-container",
    },
    failed: {
      label: "Fallida",
      icon: AlertCircle,
      className: "bg-ec-error-container text-ec-on-error",
    },
  }

  const { label, icon: Icon, className } = config[status] ?? config.draft!

  return (
    <Badge
      className={cn(
        "gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border-none",
        className,
      )}
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}

function MiniScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-ec-primary"
      : score >= 60
        ? "bg-ec-secondary"
        : "bg-ec-tertiary"

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-ec-surface-container-high shrink-0">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-ec-on-surface w-8">{score}%</span>
    </div>
  )
}

function getSessionNavigationTarget(status: DashboardSessionStatus, sessionId: string) {
  if (status === "draft" || status === "analyzing" || status === "interviewing") {
    return `/dashboard/practice?sessionId=${sessionId}`
  }

  return `/dashboard/feedback/${sessionId}`
}

export function DashboardHistoryTable({
  entries = [],
}: {
  entries?: DashboardHistoryEntry[]
}) {
  return (
    <section className="mt-8 flex flex-col overflow-hidden rounded-3xl bg-ec-surface-container-lowest shadow-[0_24px_60px_-40px_oklch(0.27_0.015_210/0.28)]">
      <div className="px-6 py-6 md:px-8 space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
          Sesiones Recientes
        </h2>
        <p className="text-sm text-ec-on-surface-variant">
          Tus últimas prácticas de entrevista
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1.5fr)_130px_110px_minmax(0,1fr)_110px_50px] gap-3 bg-ec-surface-container-low/60 px-5 sm:px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
        <span>Práctica</span>
        <span>Estado</span>
        <span>Fecha</span>
        <span className="hidden sm:block">CV Utilizado</span>
        <span className="block sm:hidden">CV</span>
        <span>Score</span>
        <span className="text-right">Ir</span>
      </div>

      <Separator className="bg-ec-outline-variant/15" />

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 bg-ec-surface-container-low/20 p-12 text-center">
          <FileText className="size-10 text-ec-outline-variant" />
          <p className="text-sm font-semibold text-ec-on-surface">
            Sin sesiones recientes
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {entries.map((entry, index) => {
            const href = getSessionNavigationTarget(entry.status, entry.sessionId)

            return (
              <div key={entry.sessionId}>
                <Link
                  href={href}
                  className="group grid grid-cols-[minmax(0,1.5fr)_130px_110px_minmax(0,1fr)_110px_50px] items-center gap-3 px-5 sm:px-6 py-4 transition-colors hover:bg-ec-surface-container-low/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-ec-surface-container-low transition-colors group-hover:bg-ec-surface-container md:flex">
                      <FileText className="size-4 text-ec-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ec-on-surface">
                        {entry.role}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-ec-on-surface-variant">
                        {entry.domain}
                      </p>
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={entry.status} />
                  </div>

                  <span className="truncate text-xs font-medium text-ec-on-surface-variant">
                    {entry.date}
                  </span>

                  <div className="flex items-center gap-2 min-w-0 text-xs text-ec-on-surface-variant">
                    <FileText className="size-3.5 shrink-0 opacity-70" />
                    <span className="truncate" title={entry.file}>{entry.file}</span>
                  </div>

                  <div>
                    {entry.status === "completed" ? (
                      <MiniScoreBar score={entry.score} />
                    ) : (
                      <span className="text-sm font-medium text-ec-outline-variant ml-2">-</span>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <div className="flex size-8 items-center justify-center rounded-full bg-ec-surface-container border border-ec-outline-variant/10 text-ec-on-surface-variant transition-all duration-300 group-hover:bg-ec-primary group-hover:text-ec-on-primary group-hover:border-transparent group-hover:shadow-[0_4px_12px_-2px_var(--ec-primary)]">
                      <ArrowRight className="size-4" />
                    </div>
                  </div>
                </Link>

                {index < entries.length - 1 && (
                  <Separator className="mx-5 sm:mx-6 bg-ec-outline-variant/10" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
