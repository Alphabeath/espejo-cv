"use client"

import { useRef } from "react"
import { FileText, Upload, Download, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface CvDocument {
  id: string
  name: string
  uploadedAt: string
  isPrimary: boolean
}

interface SettingsCvSectionProps {
  cvList: CvDocument[]
  onUpload: (file: File) => void
  onDelete: (id: string) => void
  onSetPrimary: (id: string) => void
  onDownload: (id: string) => void
}

export function SettingsCvSection({
  cvList,
  onUpload,
  onDelete,
  onSetPrimary,
  onDownload,
}: SettingsCvSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") return
    onUpload(file)
    e.target.value = ""
  }

  return (
    <section id="cvs" className="animate-fade-in-up delay-100">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-10">
        <div>
          <h3 className="font-headline text-2xl font-bold text-ec-primary tracking-tight">
            Gestión de CVs
          </h3>
          <p className="text-sm text-ec-on-surface-variant mt-1">
            Selecciona el CV que usará la IA para tus entrevistas.
          </p>
        </div>
        <Button
          onClick={() => inputRef.current?.click()}
          className="gap-2 rounded-xl px-6 text-sm font-semibold"
        >
          <Upload className="size-4" />
          Subir Nuevo CV
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Seleccionar CV en PDF"
        />
      </div>

      {cvList.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-ec-surface-container-low px-8 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-ec-surface-container-high">
            <FileText className="size-6 text-ec-on-surface-variant" />
          </div>
          <div>
            <p className="text-sm font-medium text-ec-on-surface">
              No tienes CVs subidos
            </p>
            <p className="mt-1 text-xs text-ec-on-surface-variant">
              Sube tu primer CV para personalizar tus entrevistas
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cvList.map((cv) => (
            <div
              key={cv.id}
              className={cn(
                "group flex items-start gap-4 rounded-xl p-6 transition-shadow hover:shadow-md",
                cv.isPrimary
                  ? "bg-ec-surface-container-lowest border-l-4 border-ec-primary shadow-sm"
                  : "bg-ec-surface-container-low"
              )}
            >
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  cv.isPrimary
                    ? "bg-ec-primary-container text-ec-on-primary-container"
                    : "bg-ec-surface-container-high text-ec-on-surface-variant"
                )}
              >
                <FileText className="size-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <h4 className="truncate text-sm font-bold text-ec-on-surface">
                    {cv.name}
                  </h4>
                  {cv.isPrimary && (
                    <Badge className="shrink-0 bg-ec-secondary-container text-ec-on-secondary-container text-[10px] px-2 rounded-full font-bold uppercase tracking-tighter">
                      Principal
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-ec-on-surface-variant">
                  {cv.uploadedAt}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {!cv.isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(cv.id)}
                      className="text-xs font-bold text-ec-primary hover:underline"
                    >
                      Marcar como principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDownload(cv.id)}
                    className="flex items-center gap-1 text-xs font-bold text-ec-primary hover:underline"
                  >
                    <Download className="size-3" />
                    Descargar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(cv.id)}
                    className="flex items-center gap-1 text-xs font-bold text-ec-error hover:underline"
                  >
                    <Trash2 className="size-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
