"use client"

import { useRef, useState } from "react"
import { FileText, Upload, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UserCvFile } from "@/services/interview.service"

interface SettingsCvManagerProps {
  cvList: UserCvFile[]
  isLoading: boolean
  isHidingCv: boolean
  isUploadingCv: boolean
  onHideCv: (fileId: string) => Promise<void>
  onUploadCv: (file: File) => Promise<unknown>
  onToast: (msg: { title: string; description?: string }) => void
}

export function SettingsCvManager({
  cvList,
  isLoading,
  isHidingCv,
  isUploadingCv,
  onHideCv,
  onUploadCv,
  onToast,
}: SettingsCvManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [hidingId, setHidingId] = useState<string | null>(null)

  async function handleHide(fileId: string) {
    setHidingId(fileId)

    try {
      await onHideCv(fileId)

      onToast({
        title: "CV ocultado",
        description: "El CV ya no aparecerá en tus opciones de práctica.",
      })
    } catch {
      onToast({
        title: "No se pudo ocultar el CV",
        description: "Intenta de nuevo en unos instantes.",
      })
    } finally {
      setHidingId(null)
      setConfirmingId(null)
    }
  }

  async function handleUpload(file: File | null) {
    if (!file) return

    if (file.type !== "application/pdf") {
      onToast({
        title: "Formato no válido",
        description: "Solo se permiten archivos PDF.",
      })
      return
    }

    try {
      await onUploadCv(file)

      onToast({
        title: "CV subido correctamente",
        description: `${file.name} ya está disponible para tus prácticas.`,
      })
    } catch {
      onToast({
        title: "No se pudo subir el CV",
        description: "Intenta de nuevo en unos instantes.",
      })
    }
  }

  return (
    <div className="animate-fade-in delay-200 quiet-surface rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-on-surface-variant">
            Mis CVs
          </p>
          <p className="text-sm text-ec-on-surface-variant">
            Currículums disponibles para tus sesiones de práctica
          </p>
        </div>

        <Button
          size="sm"
          disabled={isUploadingCv}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 gap-2 rounded-xl px-4 text-xs font-semibold"
        >
          {isUploadingCv ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {isUploadingCv ? "Subiendo…" : "Subir CV"}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            void handleUpload(e.target.files?.[0] ?? null)
            e.target.value = ""
          }}
          aria-label="Subir archivo PDF"
        />
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 rounded-2xl bg-ec-surface-container-low px-4 text-sm text-ec-on-surface-variant">
          <Loader2 className="size-4 animate-spin" />
          Cargando tus CVs…
        </div>
      ) : cvList.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl bg-ec-surface-container-low px-4 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-ec-surface-container-high text-ec-on-surface-variant">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ec-on-surface">
              No tienes CVs disponibles
            </p>
            <p className="mt-1 text-xs text-ec-on-surface-variant">
              Sube un PDF para empezar a practicar entrevistas.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cvList.map((cv) => {
            const isConfirming = confirmingId === cv.id
            const isHiding = hidingId === cv.id

            return (
              <div
                key={cv.id}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-5 py-4 transition-all",
                  "bg-ec-surface-container-low",
                  isConfirming && "ring-1 ring-ec-error/30 bg-ec-surface-container",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    cv.isPrimary
                      ? "bg-ec-primary-container text-ec-on-primary-container"
                      : "bg-ec-surface-container-lowest text-ec-on-surface-variant",
                  )}
                >
                  {cv.isPrimary ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ec-on-surface">
                      {cv.name}
                    </p>
                    {cv.isPrimary && (
                      <span className="rounded-full bg-ec-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ec-on-secondary-container">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ec-on-surface-variant">
                    <span>{cv.uploadedAt}</span>
                    {typeof cv.sizeInBytes === "number" && (
                      <>
                        <span>·</span>
                        <span>{(cv.sizeInBytes / 1024).toFixed(0)} KB</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0">
                  {isConfirming ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <span className="text-xs text-ec-on-surface-variant">
                        ¿Ocultar?
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isHiding}
                        onClick={() => void handleHide(cv.id)}
                        className="h-8 rounded-lg px-3 text-xs font-semibold"
                      >
                        {isHiding ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "Sí, ocultar"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmingId(null)}
                        className="h-8 rounded-lg px-3 text-xs text-ec-on-surface-variant"
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(cv.id)}
                      disabled={isHidingCv}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-ec-on-surface-variant transition-colors hover:bg-ec-surface-container-high hover:text-ec-on-surface"
                    >
                      <EyeOff className="size-3.5" />
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
