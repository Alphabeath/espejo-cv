import Image from "next/image"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PlaybackAndActions() {
  return (
    <div className="space-y-8">
      {/* Video Playback Thumbnail */}
      <div className="group relative aspect-square overflow-hidden rounded-xl bg-ec-surface-dim">
        <Image
          src="/interview-playback.png"
          alt="Miniatura de revisión de entrevista"
          fill
          className="object-cover opacity-80 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ec-primary/60 to-transparent p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md">
              <Play className="h-5 w-5" fill="white" />
            </div>
            <span
              className="font-bold text-white"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Ver Reproducción
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA Stack */}
      <div className="flex flex-col gap-4">
        <Button
          asChild
          className="signature-gradient h-auto w-full rounded-xl py-5 text-base font-bold tracking-wide text-white shadow-lg shadow-ec-primary/10 transition-all active:scale-95"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          <Link href="/practica">Iniciar Nueva Simulación</Link>
        </Button>

        <Button
          variant="secondary"
          className="h-auto w-full rounded-xl bg-ec-surface-container-highest py-5 text-base font-bold tracking-wide text-ec-on-surface transition-all hover:bg-ec-surface-variant active:scale-95"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Revisar Transcripción Completa
        </Button>
      </div>
    </div>
  )
}
