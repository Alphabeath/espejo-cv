"use client"

import { ChevronRight, KeyRound, ShieldCheck } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface NotificationPrefs {
  emailAlerts: boolean
  pushNotifications: boolean
}

interface SettingsPreferencesSectionProps {
  notifications: NotificationPrefs
  onNotificationsChange: (prefs: NotificationPrefs) => void
  twoFactorEnabled: boolean
  onChangePassword: () => void
  onToggle2FA: () => void
}

export function SettingsPreferencesSection({
  notifications,
  onNotificationsChange,
  twoFactorEnabled,
  onChangePassword,
  onToggle2FA,
}: SettingsPreferencesSectionProps) {
  return (
    <section
      id="preferencias"
      className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-fade-in-up delay-200"
    >
      {/* Notifications */}
      <div>
        <h3 className="font-headline text-2xl font-bold text-ec-primary mb-8 tracking-tight">
          Notificaciones
        </h3>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-ec-surface-container-low p-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-ec-on-surface">
                Alertas por Email
              </p>
              <p className="text-xs text-ec-on-surface-variant">
                Feedback de entrevistas y tips semanales
              </p>
            </div>
            <Switch
              checked={notifications.emailAlerts}
              onCheckedChange={(checked) =>
                onNotificationsChange({
                  ...notifications,
                  emailAlerts: checked,
                })
              }
              aria-label="Alertas por email"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-ec-surface-container-low p-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-ec-on-surface">
                Notificaciones Push
              </p>
              <p className="text-xs text-ec-on-surface-variant">
                Recordatorios de simulaciones agendadas
              </p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) =>
                onNotificationsChange({
                  ...notifications,
                  pushNotifications: checked,
                })
              }
              aria-label="Notificaciones push"
            />
          </div>
        </div>
      </div>

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
                Cambiar Contraseña
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
