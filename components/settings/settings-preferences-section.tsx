"use client"

import { ChevronRight, KeyRound, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface SettingsPreferencesSectionProps {
  twoFactorEnabled: boolean
  onChangePassword: () => void
  onToggle2FA: () => void
}

export function SettingsPreferencesSection({
  twoFactorEnabled,
  onChangePassword,
  onToggle2FA,
}: SettingsPreferencesSectionProps) {
  return (
    <section
      id="preferencias"
      className="grid grid-cols-1 max-w-xl animate-fade-in-up delay-200 gap-16"
    >
      {/* Security */}
      <div>
        <h3 className="font-headline text-2xl font-bold text-ec-primary mb-8 tracking-tight">
          Seguridad
        </h3>
        <p className="text-sm text-ec-on-surface-variant mb-6">
          Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
        </p>
        <div className="space-y-4">
          <button
            type="button"
            onClick={onChangePassword}
            className="group flex w-full items-center justify-between rounded-xl bg-ec-surface-container-high p-4 transition-colors hover:bg-ec-surface-container-highest"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="size-5 text-ec-on-surface-variant" />
              <span className="text-sm font-semibold text-ec-on-surface">
                Cambiar contraseña
              </span>
            </div>
            <ChevronRight className="size-5 text-ec-on-surface-variant transition-transform group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={onToggle2FA}
            className="group flex w-full items-center justify-between rounded-xl bg-ec-surface-container-high p-4 transition-colors hover:bg-ec-surface-container-highest"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-ec-on-surface-variant" />
              <span className="text-sm font-semibold text-ec-on-surface">
                Autenticación de Dos Pasos
              </span>
            </div>
            {twoFactorEnabled ? (
              <Badge className="bg-ec-primary-container text-ec-on-primary-container text-[10px] rounded-md font-bold">
                ACTIVADO
              </Badge>
            ) : (
              <Badge className="bg-ec-error-container text-ec-on-surface text-[10px] rounded-md font-bold">
                DESACTIVADO
              </Badge>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
