"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Upload, X, Briefcase, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useUserCvs } from "@/hooks/useUserCvs"
import { getCvDownloadUrl } from "@/services/settings.service"

interface PracticeUploadStepProps {
  onStart: (cvFile: File, jobPosition: string, options?: { existingCvId?: string }) => void
  isLoading?: boolean
}

interface StoredCvDocument {
  id: string
  name: string
  uploadedAt: string
  isPrimary: boolean
  sizeInBytes?: number
}

function getFallbackHeaders() {
  const fallback = typeof window !== "undefined" ? window.localStorage.getItem("cookieFallback") : null
  const headers: Record<string, string> = {}

  if (fallback) {
    headers["X-Fallback-Cookies"] = fallback
  }

  return headers
}

export function PracticeUploadStep({
  onStart,
  isLoading = false,
}: PracticeUploadStepProps) {
  const { toast } = useToast()
  const { cvList: storedCvList, isLoading: isLoadingStoredCvs, error: storedCvError } = useUserCvs()
  const hasStoredCvs = storedCvList.length > 0
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [jobPosition, setJobPosition] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [cvSource, setCvSource] = useState<"stored" | "upload">("stored")
  const [selectedStoredCvId, setSelectedStoredCvId] = useState<string | null>(null)
  const [isResolvingCv, setIsResolvingCv] = useState(false)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)
  const storedCvIdsKey = storedCvList.map((cv) => cv.id).join("|")

  const canStart = cvFile !== null && jobPosition.trim().length > 0 && !isResolvingCv

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (isLoadingStoredCvs) return

    setCvSource(hasStoredCvs ? "stored" : "upload")
    setSelectedStoredCvId(null)
    setCvFile(null)
    setSelectionError(null)
    setIsResolvingCv(false)
  }, [hasStoredCvs, storedCvIdsKey, isLoadingStoredCvs])

  async function resolveStoredCv(cv: StoredCvDocument) {
    setSelectionError(null)
    setSelectedStoredCvId(cv.id)
    setCvFile(null)
    setIsResolvingCv(true)

    try {
      const response = await fetch(getCvDownloadUrl(cv.id).toString(), {
        credentials: "include",
        headers: getFallbackHeaders(),
      })

      if (!response.ok) {
        throw new Error(`status ${response.status}`)
      }

      const blob = await response.blob()

      if (!isMountedRef.current) {
        return
      }

      setCvFile(new File([blob], cv.name, { type: blob.type || "application/pdf" }))
    } catch (resolveError) {
      console.error("Failed to load stored CV", resolveError)

      if (!isMountedRef.current) {
        return
      }

      setSelectedStoredCvId(null)
      setSelectionError("No se pudo cargar el CV seleccionado. Intenta de nuevo o sube uno nuevo.")
    } finally {
      if (isMountedRef.current) {
        setIsResolvingCv(false)
      }
    }
  }

  function handleSwitchToUpload() {
    setCvSource("upload")
    setSelectedStoredCvId(null)
    setCvFile(null)
    setSelectionError(null)
    setIsResolvingCv(false)
  }

  function handleSwitchToStored() {
    setCvSource("stored")
    setCvFile(null)
    setSelectionError(null)
    setIsResolvingCv(false)
  }

  function handleFileChange(file: File | null) {
    if (!file) return
    if (file.type !== "application/pdf") return
    setCvSource("upload")
    setSelectedStoredCvId(null)
    setSelectionError(null)
    setCvFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0] ?? null
    handleFileChange(file)
  }

  const shouldShowStoredCvList = cvSource === "stored" && (hasStoredCvs || isLoadingStoredCvs)
  const selectedStoredCv = storedCvList.find((cv) => cv.id === selectedStoredCvId) ?? null
  const helperMessage = !cvFile
    ? shouldShowStoredCvList
      ? "Selecciona uno de tus CVs o sube uno nuevo para continuar."
      : "Sube tu CV para continuar."
    : "Describe el puesto para continuar."

  useEffect(() => {
    const nextError = selectionError ?? storedCvError

    if (!nextError) {
      return
    }

    toast({
      title: "No pudimos cargar tu CV",
      description: nextError,
    })

    if (selectionError) {
      setSelectionError(null)
    }
  }, [selectionError, storedCvError, toast])

  return (
    <div className="animate-fade-in-up mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-ec-primary">
          Paso 1 de 3
        </p>
        <h1 className="text-glow font-headline text-3xl font-bold tracking-tight text-ec-on-surface md:text-4xl">
          Prepara tu sesión
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-ec-on-surface-variant md:text-base">
          Elige uno de tus CVs guardados o sube uno nuevo en PDF. La IA personalizará la entrevista base a tu perfil.
        </p>
      </div>

      <div className="quiet-surface flex flex-col rounded-3xl p-6 md:p-8 border border-ec-outline-variant/10 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Label className="text-base font-semibold text-ec-on-surface">
                Tu currículum <span className="font-normal text-ec-on-surface-variant">(PDF)</span>
              </Label>

              {isLoadingStoredCvs ? null : hasStoredCvs && (
                <div className="flex gap-1 rounded-xl bg-ec-surface-container-low p-1 border border-ec-outline-variant/10 shadow-inner">
                  <button
                    type="button"
                    onClick={handleSwitchToStored}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      shouldShowStoredCvList
                        ? "bg-ec-surface-container-lowest text-ec-on-surface shadow-sm"
                        : "text-ec-on-surface-variant hover:text-ec-on-surface",
                    )}
                  >
                    Guardados
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToUpload}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      !shouldShowStoredCvList
                        ? "bg-ec-surface-container-lowest text-ec-on-surface shadow-sm"
                        : "text-ec-on-surface-variant hover:text-ec-on-surface",
                    )}
                  >
                    Subir
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1">
              {isLoadingStoredCvs ? (
                <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-ec-outline-variant/10 bg-ec-surface-container-lowest px-4 text-center shadow-[0_0_0_1.5px_oklch(0.57_0.01_210/0.15)]">
                  <Loader2 className="size-5 animate-spin text-ec-primary" />
                  <p className="text-sm font-medium text-ec-on-surface">Cargando información...</p>
                </div>
              ) : shouldShowStoredCvList ? (
                <div className="flex h-full min-h-[280px] max-h-[360px] w-full flex-col gap-3 overflow-y-auto rounded-2xl bg-ec-surface-container-lowest p-4 shadow-[0_0_0_1.5px_oklch(0.57_0.01_210/0.15)]">
                  {storedCvList.length === 0 ? (
                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl bg-ec-surface-container-low px-4 text-center">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-ec-surface-container-high text-ec-on-surface-variant">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ec-on-surface">No encontramos CVs guardados</p>
                        <p className="mt-1 text-xs text-ec-on-surface-variant">Sube uno nuevo para comenzar.</p>
                      </div>
                    </div>
                  ) : (
                    storedCvList.map((cv) => {
                      const isSelected = cv.id === selectedStoredCvId

                      return (
                        <button
                          key={cv.id}
                          type="button"
                          onClick={() => void resolveStoredCv(cv)}
                          disabled={isResolvingCv}
                          className={cn(
                            "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                            isSelected
                              ? "border-ec-primary/50 bg-ec-primary-container/40"
                              : "border-ec-outline-variant/10 bg-ec-surface-container-low hover:border-ec-primary/30 hover:bg-ec-surface-container-high",
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                            isSelected
                              ? "bg-ec-primary-container text-ec-on-primary-container"
                              : "bg-ec-surface-container-high text-ec-on-surface-variant",
                          )}>
                            {isSelected ? <CheckCircle2 className="size-4" /> : <FileText className="size-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-ec-on-surface">{cv.name}</p>
                              {cv.isPrimary && (
                                <span className="rounded-full bg-ec-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ec-on-secondary-container">
                                  Principal
                                </span>
                              )}
                            </div>
                            {cv.uploadedAt && (
                              <p className="mt-1 text-xs text-ec-on-surface-variant">{cv.uploadedAt}</p>
                            )}
                            {typeof cv.sizeInBytes === "number" && (
                              <p className="mt-1 text-[11px] text-ec-on-surface-variant">
                                {(cv.sizeInBytes / 1024).toFixed(0)} KB · PDF
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}

                  {isResolvingCv && (
                    <div className="mt-2 flex items-center gap-2 rounded-xl bg-ec-surface-container-low px-3 py-2 text-xs text-ec-on-surface-variant">
                      <Loader2 className="size-3.5 animate-spin" />
                      Cargando el CV seleccionado…
                    </div>
                  )}

                  {selectedStoredCv && cvFile && !isResolvingCv && (
                    <div className="mt-auto rounded-xl border border-ec-primary/20 bg-ec-primary-container/25 px-3 py-2 text-xs text-ec-on-surface">
                      Usarás <span className="font-semibold">{selectedStoredCv.name}</span> para esta práctica.
                    </div>
                  )}
                </div>
              ) : cvFile ? (
                <div className="group relative flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-ec-outline-variant/10 bg-ec-surface-container-lowest px-5 py-8 shadow-[0_0_0_1.5px_oklch(0.57_0.01_210/0.15)] animate-fade-in">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-ec-primary-container">
                    <FileText className="size-7 text-ec-on-primary-container" />
                  </div>
                  <div className="min-w-0 text-center">
                    <p className="wrap-break-word text-sm font-semibold text-ec-on-surface">
                      {cvFile.name}
                    </p>
                    <p className="mt-1.5 text-xs text-ec-on-surface-variant">
                      {(cvFile.size / 1024).toFixed(0)} KB · PDF
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCvFile(null)}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-ec-outline-variant/20 bg-ec-surface-container-low px-5 text-xs font-semibold text-ec-on-surface hover:bg-ec-surface-container-high transition-colors"
                  >
                    <X className="size-3.5" />
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
                    "flex h-full min-h-[280px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl px-6 py-10 text-center transition-all",
                    "bg-ec-surface-container-lowest shadow-[0_0_0_1.5px_oklch(0.57_0.01_210/0.15)]",
                    isDragging
                      ? "bg-ec-primary-container/30 shadow-[0_0_0_2px_oklch(0.445_0.055_260/0.5)]"
                      : "hover:bg-ec-surface-container-low hover:shadow-[0_0_0_1.5px_oklch(0.445_0.055_260/0.3)]",
                  )}
                >
                  <div className={cn(
                    "flex size-14 items-center justify-center rounded-2xl transition-colors",
                    isDragging ? "bg-ec-primary-container text-ec-on-primary-container" : "bg-ec-surface-container-high text-ec-on-surface-variant",
                  )}>
                    <Upload className="size-6" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-ec-on-surface">
                      {isDragging ? "Suelta el archivo aquí" : "Selecciona o arrastra tu CV"}
                    </p>
                    <p className="mt-1.5 text-xs text-ec-on-surface-variant">Solo archivos PDF, máximo 5MB</p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      handleFileChange(e.target.files?.[0] ?? null)
                      e.target.value = ""
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Label htmlFor="job-position" className="text-base font-semibold text-ec-on-surface">
              Puesto al que postulas
            </Label>
            <div className="relative flex-1">
              <Briefcase className="pointer-events-none absolute left-4 top-4 size-5 text-ec-on-surface-variant/80" />
              <Textarea
                id="job-position"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="Ej: Desarrollador Frontend Senior en una empresa fintech con trabajo 100% remoto...&#10;&#10;Pega aquí la descripción o responsabilidades de la vacante. Cuanta más información proporciones, más precisa será la IA."
                className={cn(
                  "h-full min-h-[280px] w-full resize-none overflow-y-auto rounded-2xl pl-12 pt-4 text-sm leading-relaxed",
                  "bg-ec-surface-container-lowest focus:bg-ec-surface-container-lowest",
                  "border-transparent shadow-[0_0_0_1.5px_oklch(0.57_0.01_210/0.15)]",
                  "focus-visible:border-ec-primary/40 focus-visible:ring-0 focus-visible:shadow-[0_0_0_1.5px_oklch(0.445_0.055_260/0.4)]",
                  "placeholder:text-ec-on-surface-variant/50 transition-all",
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-ec-outline-variant/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            {!canStart && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="flex size-2 rounded-full bg-ec-primary/60 animate-pulse" />
                <p className="text-sm font-medium text-ec-on-surface-variant">
                  {helperMessage}
                </p>
              </div>
            )}
          </div>
          
          <Button
            size="lg"
            disabled={!canStart || isLoading}
            onClick={() =>
              canStart &&
              onStart(cvFile!, jobPosition.trim(), {
                existingCvId: cvSource === "stored" ? selectedStoredCvId ?? undefined : undefined,
              })
            }
            className="w-full gap-2 rounded-xl px-8 py-6 text-sm font-bold shadow-lg shadow-ec-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-ec-primary/30 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Preparando sesión...
              </>
            ) : (
              <>
                Iniciar entrevista
                <ArrowRight className="size-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
