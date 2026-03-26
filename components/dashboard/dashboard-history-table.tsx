import Link from "next/link"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { DashboardHistoryEntry, DashboardSessionStatus } from "@/services/dashboard.service"

const STATUS_LABEL: Record<DashboardSessionStatus, string> = {
  draft: "Borrador",
  analyzing: "Analizando",
  interviewing: "En curso",
  completed: "Completada",
  failed: "Fallida",
}

const STATUS_CLASS: Record<DashboardSessionStatus, string> = {
  draft: "text-ec-on-surface-variant bg-ec-surface-container",
  analyzing: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
  interviewing: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  completed: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/40",
  failed: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
}

function StatusBadge({ status }: { status: DashboardSessionStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function ScoreDot({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "ml-1.5 inline-block size-2 shrink-0 rounded-full",
        score >= 85 ? "bg-green-500" : score >= 70 ? "bg-amber-400" : "bg-red-500",
      )}
    />
  )
}

function canResumeInterview(status: DashboardSessionStatus) {
  return status === "draft" || status === "analyzing" || status === "interviewing"
}

export function DashboardHistoryTable({
  entries = [],
}: {
  entries?: DashboardHistoryEntry[]
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl bg-ec-surface-container-lowest shadow-[0_24px_60px_-40px_oklch(0.27_0.015_210/0.28)]">
      <div className="grid grid-cols-[minmax(0,2fr)_110px_140px_minmax(0,1.5fr)_80px_120px] gap-4 bg-ec-surface-container-low/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
        <span>Puesto de Trabajo</span>
        <span>Estado</span>
        <span>Fecha</span>
        <span>CV Utilizado</span>
        <span>Score</span>
        <span>Acción</span>
      </div>

      <Separator className="bg-ec-outline-variant/15" />

      {entries.map((entry, index) => (
        <div key={entry.sessionId}>
          <div className="grid grid-cols-[minmax(0,2fr)_110px_140px_minmax(0,1.5fr)_80px_120px] items-center gap-4 px-6 py-5 transition-colors hover:bg-ec-surface-container-low/50">
            <div>
              <p className="text-sm font-semibold text-ec-on-surface">{entry.role}</p>
              <p className="mt-0.5 text-xs text-ec-on-surface-variant">{entry.domain}</p>
            </div>
            <StatusBadge status={entry.status} />
            <span className="text-sm text-ec-on-surface-variant">{entry.date}</span>
            
            <div className="flex items-center gap-1.5 text-sm text-ec-primary">
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">{entry.file}</span>
            </div>
            <div className="flex items-center text-sm font-semibold text-ec-on-surface">
              {entry.score}%
              <ScoreDot score={entry.score} />
            </div>
            <div className="flex justify-start">
              {canResumeInterview(entry.status) ? (
                <Button asChild size="sm" variant="outline" className="rounded-full px-4 text-xs font-semibold">
                  <Link href={`/dashboard/practice?sessionId=${entry.sessionId}`}>
                    Continuar
                  </Link>
                </Button>
              ) : (
                  <Button size="sm" variant="outline" className="rounded-full px-4 text-xs font-semibold" disabled>Continuar</Button>
              )}
            </div>
          </div>

          {index < entries.length - 1 && (
            <Separator className="mx-6 bg-ec-outline-variant/10" />
          )}
        </div>
      ))}
    </section>
  )
}
