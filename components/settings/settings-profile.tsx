"use client"

import { useState } from "react"
import { Mail, Calendar, Check, Pencil, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/hooks/useAuth"

interface SettingsProfileProps {
  user: AuthUser | null
  isUpdatingName: boolean
  onUpdateName: (name: string) => Promise<void>
}

function getUserInitials(name?: string | null) {
  const value = name?.trim()

  if (!value) {
    return "EC"
  }

  const [first = "", second = ""] = value.split(/\s+/)
  return `${first.charAt(0)}${second.charAt(0) || first.charAt(1) || ""}`.toUpperCase()
}

function formatAccountDate(dateString?: string) {
  if (!dateString) {
    return "—"
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString))
}

export function SettingsProfile({
  user,
  isUpdatingName,
  onUpdateName,
}: SettingsProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [nameValue, setNameValue] = useState(user?.name ?? "")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const hasChanged = nameValue.trim() !== (user?.name ?? "").trim()

  async function handleSave() {
    if (!hasChanged || !nameValue.trim()) {
      return
    }

    try {
      await onUpdateName(nameValue.trim())
      setIsEditing(false)
      setSaveSuccess(true)

      setTimeout(() => setSaveSuccess(false), 2400)
    } catch {
      // Error handled by parent
    }
  }

  function handleCancel() {
    setNameValue(user?.name ?? "")
    setIsEditing(false)
  }

  return (
    <div className="animate-fade-in quiet-surface rounded-3xl p-6 md:p-8">
      <div className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
          Información personal
        </p>
        <p className="text-sm text-ec-on-surface-variant">
          Tu perfil y datos de cuenta
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Name / Avatar Row */}
        <div className="flex items-center gap-4 rounded-2xl bg-ec-surface-container-low px-5 py-4 transition-all">
          <div className="signature-gradient flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
            <span className="font-headline text-sm font-black tracking-widest text-ec-on-primary">
              {getUserInitials(user?.name)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="flex flex-wrap items-center gap-2 animate-fade-in">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={cn(
                    "h-8 w-full max-w-[200px] rounded-lg px-3 text-sm",
                    "bg-ec-surface-container-lowest shadow-[0_0_0_1px_oklch(0.57_0.01_210/0.15)]",
                    "border-transparent focus-visible:border-ec-primary/40 focus-visible:ring-0"
                  )}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSave()
                    if (e.key === "Escape") handleCancel()
                  }}
                />
                <Button
                  size="sm"
                  disabled={!hasChanged || isUpdatingName}
                  onClick={() => void handleSave()}
                  className="h-8 rounded-lg px-3 text-xs font-semibold"
                >
                  {isUpdatingName ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-8 rounded-lg px-2 text-xs text-ec-on-surface-variant"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-ec-on-surface">
                    {user?.name || "Sin nombre"}
                  </p>
                  {saveSuccess ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 animate-fade-in">
                      <Check className="size-3" />
                      Guardado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setNameValue(user?.name ?? "")
                        setIsEditing(true)
                      }}
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-ec-on-surface-variant transition-colors hover:bg-ec-surface-container-high hover:text-ec-primary"
                    >
                      <Pencil className="size-3" />
                      Editar
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ec-on-surface-variant">
                  Nombre principal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Email Row */}
        <div className="flex items-center gap-4 rounded-2xl bg-ec-surface-container-low px-5 py-4 transition-all">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ec-surface-container-lowest">
            <Mail className="size-4 text-ec-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ec-on-surface">
              {user?.email ?? "—"}
            </p>
            <p className="mt-0.5 text-xs text-ec-on-surface-variant">
              Correo electrónico de la cuenta
            </p>
          </div>
        </div>

        {/* Member Since Row */}
        <div className="flex items-center gap-4 rounded-2xl bg-ec-surface-container-low px-5 py-4 transition-all">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ec-surface-container-lowest">
            <Calendar className="size-4 text-ec-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ec-on-surface">
              {formatAccountDate(user?.$createdAt)}
            </p>
            <p className="mt-0.5 text-xs text-ec-on-surface-variant">
              Miembro de espejoCV
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
