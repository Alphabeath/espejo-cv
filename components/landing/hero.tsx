import Link from "next/link"
import { FileText, Settings, Sparkles, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const practiceSignals = [
  "Preguntas adaptadas al rol",
  "Retroalimentacion accionable",
  "Simulacion realista",
]

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-20 md:py-32">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <Badge className="animate-fade-in-up h-auto rounded-full bg-ec-secondary-container px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-ec-on-secondary-container hover:bg-ec-secondary-container">
            Presentamos espejoCV
          </Badge>

          <h1
            className="animate-fade-in-up delay-100 text-glow text-5xl font-extrabold leading-[1.1] tracking-tight text-ec-on-surface md:text-7xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Prepárate para tu <br />
            <span className="italic text-ec-primary">
              próximo paso profesional
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-200 max-w-xl text-lg leading-relaxed text-ec-on-surface-variant md:text-xl">
            Sube tu CV y la descripción del puesto para iniciar una simulación
            de entrevista realista impulsada por IA. Gana la confianza necesaria
            para conseguir el rol.
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-col gap-4 pt-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="signature-gradient px-6 text-base font-semibold text-ec-on-primary shadow-lg shadow-ec-primary/20 hover:scale-[1.02] hover:bg-transparent"
            >
              <Link href="#">Iniciar Sesión de Práctica</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-ec-outline-variant/50 bg-white/70 px-6 text-base text-ec-on-surface hover:bg-ec-surface-variant"
            >
              <Link href="#">Ver Reporte de Ejemplo</Link>
            </Button>
          </div>

          <div className="animate-fade-in-up delay-400 flex flex-wrap gap-3">
            {practiceSignals.map((signal) => (
              <Badge
                key={signal}
                variant="outline"
                className="h-auto rounded-full border-ec-outline-variant/50 bg-white/60 px-3 py-1.5 text-xs text-ec-on-surface-variant"
              >
                <Sparkles className="size-3 text-ec-primary" />
                {signal}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="absolute -top-10 -right-10 -z-10 h-64 w-64 rounded-full bg-ec-primary-fixed/30 blur-3xl" />

          <Card className="animate-slide-in-right delay-300 relative overflow-hidden border border-white/60 bg-ec-surface-container-lowest/95 shadow-2xl shadow-indigo-900/5">
            <CardHeader className="border-b border-ec-surface-container pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-3 border-ec-outline-variant/40 bg-white/80 text-ec-on-surface-variant">
                    Preparacion guiada
                  </Badge>
                  <CardTitle className="text-lg font-semibold text-ec-on-surface">
                    Configuración de la Entrevista
                  </CardTitle>
                  <CardDescription className="mt-1 text-ec-on-surface-variant">
                    Ajusta el contexto para recibir preguntas alineadas al puesto.
                  </CardDescription>
                </div>
                <div className="rounded-full bg-ec-primary/10 p-2 text-ec-primary">
                  <Settings className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              <div className="rounded-xl border border-dashed border-ec-outline-variant/40 bg-ec-surface-container-low p-6 transition-colors hover:border-ec-primary/30">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-ec-primary/10 p-3 text-ec-primary-dim">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-ec-on-surface">Subir CV Profesional</p>
                    <p className="text-sm text-ec-on-surface-variant">
                      PDF, Word o Markdown con tu experiencia real.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-ec-outline-variant/40 bg-ec-surface-container-low p-6 transition-colors hover:border-ec-primary/30">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-ec-tertiary/10 p-3 text-ec-tertiary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-ec-on-surface">Pegar Descripción del Puesto</p>
                    <p className="text-sm text-ec-on-surface-variant">
                      Adaptaremos las preguntas, profundidad y tono al rol.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col items-stretch gap-4 border-t border-ec-surface-container pt-5">
              <div className="flex items-center justify-between text-sm text-ec-on-surface-variant">
                <span>Tiempo de preparación</span>
                <span className="font-semibold text-ec-on-surface">4 min</span>
              </div>
              <Separator className="bg-ec-surface-container" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-ec-primary-container text-ec-on-primary-container">
                  CV parsing
                </Badge>
                <Badge variant="secondary" className="bg-ec-secondary-container text-ec-on-secondary-container">
                  Role fit
                </Badge>
                <Badge variant="secondary" className="bg-ec-tertiary-container text-ec-on-tertiary-container">
                  Scoring
                </Badge>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
