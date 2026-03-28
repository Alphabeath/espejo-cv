"use client"

import { useRouter } from "next/navigation"
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PracticeHistoryEntry } from "@/services/settings.service"

interface SettingsPracticeHistoryProps {
  entries: PracticeHistoryEntry[]
  isLoading: boolean
}

function getNavigationTarget(entry: PracticeHistoryEntry) {
  if (
    entry.status === "draft" ||
    entry.status === "analyzing" ||
    entry.status === "interviewing"
  ) {
    return `/dashboard/practice?sessionId=${entry.sessionId}`
  }

  return `/dashboard/feedback/${entry.sessionId}`
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
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
        "gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
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
      <div className="h-1.5 w-16 rounded-full bg-ec-surface-container-high">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-ec-on-surface">{score}%</span>
    </div>
  )
}

function HistoryCard({ entry }: { entry: PracticeHistoryEntry }) {
  const router = useRouter()
  const target = getNavigationTarget(entry)

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-2xl bg-ec-surface-container-low px-5 py-4 transition-all",
        "hover:bg-ec-surface-container cursor-pointer",
      )}
      onClick={() => router.push(target)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(target)
        }
      }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ec-surface-container-lowest">
        <Briefcase className="size-4 text-ec-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ec-on-surface">
          {entry.role}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ec-on-surface-variant">
          <span>{entry.company}</span>
          <span>·</span>
          <span>{entry.date}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {entry.score > 0 && <MiniScoreBar score={entry.score} />}
        <StatusBadge status={entry.status} />
        <ArrowRight className="size-4 text-ec-outline-variant opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  )
}

export function SettingsPracticeHistory({
  entries,
  isLoading,
}: SettingsPracticeHistoryProps) {
  const router = useRouter()

  return (
    <div className="animate-fade-in delay-400 quiet-surface rounded-3xl p-6 md:p-8">
      <div className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
          Ofertas de trabajo practicadas
        </p>
        <p className="text-sm text-ec-on-surface-variant">
          Historial de sesiones y puestos con los que has practicado
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 rounded-2xl bg-ec-surface-container-low px-4 text-sm text-ec-on-surface-variant">
          <Loader2 className="size-4 animate-spin" />
          Cargando historial…
        </div>
      ) : entries.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl bg-ec-surface-container-low px-4 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-ec-surface-container-high text-ec-on-surface-variant">
            <Briefcase className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ec-on-surface">
              Sin prácticas aún
            </p>
            <p className="mt-1 text-xs text-ec-on-surface-variant">
              Cuando completes tu primera sesión de entrevista, aparecerá aquí.
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/practice")}
            className="mt-2 gap-2 rounded-xl px-6 text-sm font-semibold"
          >
            Iniciar práctica
            <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <HistoryCard key={entry.sessionId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
