"use client"

import { UserRoundCheck, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function KeyMetrics() {
  return (
    <div className="space-y-8">
      {/* Main Metric Card: Confidence */}
      <Card className="group relative overflow-hidden border-transparent bg-ec-surface-container-lowest shadow-[0_32px_64px_-15px_rgba(43,52,55,0.04)] ring-0">
        {/* Decorative blur */}
        <div className="absolute -mr-20 -mt-20 right-0 top-0 h-64 w-64 rounded-full bg-ec-primary-fixed/30 blur-3xl transition-all group-hover:bg-ec-primary-fixed/40" />

        <CardContent className="relative z-10 pt-2">
          {/* Title + Score */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-ec-primary">
                Indicador Principal
              </span>
              <h3
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Confianza
              </h3>
            </div>
            <div className="text-right">
              <span
                className="text-5xl font-extrabold text-ec-primary"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                88
                <span className="text-2xl font-normal opacity-50">%</span>
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <Progress
            value={88}
            className="mb-4 h-1.5 bg-ec-surface-container"
          />

          {/* Axis labels */}
          <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-ec-on-surface-variant">
            <span>Serenidad</span>
            <span>Asertividad</span>
          </div>
        </CardContent>
      </Card>

      {/* Split Metrics */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* Clarity */}
        <Card className="group border-transparent bg-ec-surface-container-low shadow-none ring-0 transition-all hover:bg-ec-surface-container-lowest">
          <CardContent className="pt-2">
            <div className="mb-4 flex items-center justify-between">
              <UserRoundCheck className="h-7 w-7 text-ec-primary" />
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                92%
              </span>
            </div>
            <h4
              className="mb-2 font-bold"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Claridad
            </h4>
            <p className="text-sm leading-relaxed text-ec-on-surface-variant">
              La estructura de tu mensaje siguió el método STAR de manera
              impecable.
            </p>
          </CardContent>
        </Card>

        {/* Job Match */}
        <Card className="group border-transparent bg-ec-surface-container-low shadow-none ring-0 transition-all hover:bg-ec-surface-container-lowest">
          <CardContent className="pt-2">
            <div className="mb-4 flex items-center justify-between">
              <Briefcase className="h-7 w-7 text-ec-primary" />
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                74%
              </span>
            </div>
            <h4
              className="mb-2 font-bold"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Ajuste al Puesto
            </h4>
            <p className="text-sm leading-relaxed text-ec-on-surface-variant">
              Tus palabras clave se alinearon bien con el perfil de Arquitecto
              Senior.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
