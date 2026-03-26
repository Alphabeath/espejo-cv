"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { AlertCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastVariant = "error" | "info"

type ToastInput = {
  title: string
  description?: string
  duration?: number
  variant?: ToastVariant
}

type ToastItem = ToastInput & {
  id: string
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutMapRef = useRef<Map<string, ReturnType<typeof window.setTimeout>>>(new Map())

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutMapRef.current.get(id)

    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutMapRef.current.delete(id)
    }

    setToasts((currentToasts) => currentToasts.filter((toastItem) => toastItem.id !== id))
  }, [])

  const toast = useCallback(({ duration = 5000, variant = "error", ...input }: ToastInput) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

    setToasts((currentToasts) => [...currentToasts, { id, duration, variant, ...input }])

    const timeoutId = window.setTimeout(() => {
      dismissToast(id)
    }, duration)

    timeoutMapRef.current.set(id, timeoutId)
  }, [dismissToast])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur",
              toastItem.variant === "error"
                ? "border-ec-error/15 bg-ec-surface-container-lowest text-ec-on-surface"
                : "border-ec-outline-variant/20 bg-ec-surface-container-lowest text-ec-on-surface",
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-ec-error-container/25 text-ec-error">
                <AlertCircle className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toastItem.title}</p>
                {toastItem.description && (
                  <p className="mt-1 text-xs leading-relaxed text-ec-on-surface-variant">
                    {toastItem.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toastItem.id)}
                className="rounded-lg p-1 text-ec-on-surface-variant transition-colors hover:bg-ec-surface-container-high hover:text-ec-on-surface"
                aria-label="Cerrar notificación"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider.")
  }

  return context
}