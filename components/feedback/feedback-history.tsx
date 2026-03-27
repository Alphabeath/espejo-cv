"use client"

import { useRouter } from "next/navigation"
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type HistoryEntry = {
  sessionId: string
  role: string
  date: string
  score: number
  status: string
  startedAt: string
}

interface FeedbackHistoryProps {
  entries: HistoryEntry[]
}

function getSessionNavigationTarget(entry: HistoryEntry) {
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
      className:
        "bg-ec-primary-container text-ec-on-primary-container",
    },
    interviewing: {
      label: "En curso",
      icon: Clock,
      className:
        "bg-ec-secondary-container text-ec-on-secondary-container",
    },
    analyzing: {
      label: "Analizando",
      icon: Clock,
      className:
        "bg-ec-secondary-container text-ec-on-secondary-container",
    },
    draft: {
      label: "Borrador",
      icon: AlertCircle,
      className:
        "bg-ec-tertiary-container text-ec-on-tertiary-container",
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

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const router = useRouter()
  const navigationTarget = getSessionNavigationTarget(entry)

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-2xl bg-ec-surface-container-low px-5 py-4 transition-all",
        "hover:bg-ec-surface-container cursor-pointer",
      )}
      onClick={() => router.push(navigationTarget)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(navigationTarget)
        }
      }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ec-surface-container-lowest">
        <MessageSquare className="size-4 text-ec-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ec-on-surface">
          {entry.role}
        </p>
        <p className="text-xs text-ec-on-surface-variant">{entry.date}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {entry.score > 0 && <MiniScoreBar score={entry.score} />}
        <StatusBadge status={entry.status} />
        <ArrowRight className="size-4 text-ec-outline-variant opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  )
}

export function FeedbackHistory({ entries }: FeedbackHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="animate-fade-in quiet-surface flex flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <MessageSquare className="size-10 text-ec-outline-variant" />
        <div>
          <p className="text-sm font-semibold text-ec-on-surface">
            Sin sesiones aún
          </p>
          <p className="mt-1 text-xs text-ec-on-surface-variant">
            Completa tu primera práctica para ver tu historial aquí.
          </p>
        </div>
        <Button
          onClick={() => {
            window.location.href = "/dashboard/practice"
          }}
          className="mt-2 gap-2 rounded-xl px-6 text-sm font-semibold"
        >
          Iniciar práctica
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in delay-200 quiet-surface flex flex-col gap-5 rounded-3xl p-6 md:p-8">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
          Historial de sesiones
        </p>
        <p className="text-sm text-ec-on-surface-variant">
          Tus últimas {entries.length} prácticas de entrevista
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <HistoryCard key={entry.sessionId} entry={entry} />
        ))}
      </div>
    </div>
  )
}
