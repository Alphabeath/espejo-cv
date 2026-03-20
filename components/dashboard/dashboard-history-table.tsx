import { FileText } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { DashboardHistoryEntry } from "@/services/dashboard.service"

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

export function DashboardHistoryTable({
  entries = [],
}: {
  entries?: DashboardHistoryEntry[]
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl bg-ec-surface-container-lowest shadow-[0_24px_60px_-40px_oklch(0.27_0.015_210/0.28)]">
      <div className="grid grid-cols-[minmax(0,2fr)_140px_minmax(0,1.5fr)_80px] gap-4 bg-ec-surface-container-low/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
        <span>Puesto de Trabajo</span>
        <span>Fecha</span>
        <span>CV Utilizado</span>
        <span className="text-right">Score</span>
      </div>

      <Separator className="bg-ec-outline-variant/15" />

      {entries.map((entry, index) => (
        <div key={entry.role}>
          <div className="grid grid-cols-[minmax(0,2fr)_140px_minmax(0,1.5fr)_80px] items-center gap-4 px-6 py-5 transition-colors hover:bg-ec-surface-container-low/50">
            <div>
              <p className="text-sm font-semibold text-ec-on-surface">{entry.role}</p>
              <p className="mt-0.5 text-xs text-ec-on-surface-variant">{entry.domain}</p>
            </div>
            <span className="text-sm text-ec-on-surface-variant">{entry.date}</span>
            <div className="flex items-center gap-1.5 text-sm text-ec-primary">
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">{entry.file}</span>
            </div>
            <div className="flex items-center justify-end text-sm font-semibold text-ec-on-surface">
              {entry.score}%
              <ScoreDot score={entry.score} />
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
