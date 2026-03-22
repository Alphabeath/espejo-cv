"use client"

import { useRef, useState } from "react"
import { FileText, Upload, X, Briefcase, ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PracticeUploadStepProps {
  onStart: (cvFile: File, jobPosition: string) => void
  isLoading?: boolean
  error?: string | null
}

export function PracticeUploadStep({
  onStart,
  isLoading = false,
  error = null,
}: PracticeUploadStepProps) {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [jobPosition, setJobPosition] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canStart = cvFile !== null && jobPosition.trim().length > 0

  function handleFileChange(file: File | null) {
    if (!file) return
    if (file.type !== "application/pdf") return
    setCvFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0] ?? null
    handleFileChange(file)
  }

  return (
    <div className="animate-fade-in-up flex flex-col gap-10">
      {/* Page headline */}
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-ec-primary uppercase">
          Paso 1 de 3
        </p>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-ec-on-surface text-glow">
          Prepara tu sesión
        </h1>
        <p className="text-sm text-ec-on-surface-variant leading-relaxed max-w-sm">
          Sube tu CV en PDF e indica el puesto al que postulas. La IA personalizará la entrevista en base a tu perfil.
        </p>
      </div>

      <div className="quiet-surface rounded-3xl p-6 md:p-8">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] items-start">
          {/* CV Upload zone */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-8">
            <Label className="text-sm font-semibold text-ec-on-surface">
              Tu currículum <span className="text-ec-on-surface-variant font-normal">(PDF)</span>
            </Label>

            {cvFile ? (
              <div className="group relative flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-ec-outline-variant/10 bg-ec-surface-container-lowest px-5 py-8 animate-fade-in shadow-sm">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-ec-primary-container">
                  <FileText className="size-6 text-ec-on-primary-container" />
                </div>
                <div className="min-w-0 text-center">
                  <p className="wrap-break-word text-sm font-medium text-ec-on-surface">
                    {cvFile.name}
                  </p>
                  <p className="mt-1 text-xs text-ec-on-surface-variant">
                    {(cvFile.size / 1024).toFixed(0)} KB · PDF
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg border border-ec-outline-variant/15 px-4 text-xs font-semibold text-ec-on-surface-variant transition-colors hover:bg-ec-surface-container-high hover:text-ec-on-surface"
                >
                  <X className="size-3" />
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="Zona de carga de CV"
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                className={cn(
                  "flex min-h-80 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl px-6 py-10 text-center transition-all",
                  "bg-ec-surface-container-lowest",
                  "shadow-[0_0_0_1.5px_oklch(0.57_0.01_210/0.15)]",
                  isDragging
                    ? "shadow-[0_0_0_2px_oklch(0.445_0.055_260/0.5)] bg-ec-primary-container/30"
                    : "hover:shadow-[0_0_0_1.5px_oklch(0.445_0.055_260/0.3)] hover:bg-ec-surface-container-low",
                )}
              >
                <div className={cn(
                  "flex size-12 items-center justify-center rounded-full transition-colors",
                  isDragging ? "bg-ec-primary-container" : "bg-ec-surface-container-high",
                )}>
                  <Upload className={cn("size-5 transition-colors", isDragging ? "text-ec-on-primary-container" : "text-ec-on-surface-variant")} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ec-on-surface leading-tight">
                    {isDragging ? "Suelta aquí" : "Arrastra tu CV o haz clic"}
                  </p>
                  <p className="mt-1 text-[11px] text-ec-on-surface-variant">Solo archivos PDF</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  aria-label="Seleccionar archivo PDF"
                />
              </div>
            )}
          </div>

          {/* Job position field */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="job-position" className="text-sm font-semibold text-ec-on-surface">
                Puesto al que postulas
              </Label>
            </div>
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-4 top-4 size-4 text-ec-on-surface-variant" />
              <Textarea
                id="job-position"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="Ej: Desarrollador Frontend Senior en empresa fintech, trabajo remoto. Pega aquí la descripción del puesto si la tienes."
                className={cn(
                  "h-80 resize-none overflow-y-auto rounded-2xl pl-11 pt-3.5 text-sm leading-relaxed",
                  "bg-ec-surface-container-lowest focus:bg-ec-surface-container-lowest",
                  "shadow-[0_0_0_1.5px_oklch(0.57_0.01_210/0.15)]",
                  "border-transparent focus-visible:border-ec-primary/40 focus-visible:ring-0",
                  "focus-visible:shadow-[0_0_0_1.5px_oklch(0.445_0.055_260/0.4)]",
                  "placeholder:text-ec-on-surface-variant/40 transition-all",
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {!canStart && (
          <p className="text-[11px] text-ec-on-surface-variant">
            {!cvFile ? "Sube tu CV para continuar." : "Describe el puesto para continuar."}
          </p>
        )}
        <Button
          size="lg"
          disabled={!canStart || isLoading}
          onClick={() => canStart && onStart(cvFile!, jobPosition.trim())}
          className="h-10 w-full max-w-xs gap-2 rounded-lg px-6 text-sm font-semibold shadow-md shadow-ec-primary/20 transition-all hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Preparando sesión…
            </>
          ) : (
            <>
              Iniciar entrevista
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>


      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
