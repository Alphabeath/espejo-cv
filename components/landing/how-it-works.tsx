"use client"

import { Upload, Brain, BarChart3, ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Sube tu CV y el puesto",
    description:
      "Carga tu CV y pega la descripción del trabajo al que aplicas. La IA entiende tu perfil y el contexto del rol.",
    accentClass: "bg-blue-500/10 text-blue-500",
  },
  {
    number: "02",
    icon: Brain,
    title: "Simulación conversacional",
    description:
      "Un entrevistador con IA te hace preguntas adaptadas al puesto. Responde con tu voz, como en una entrevista real.",
    accentClass: "bg-purple-500/10 text-purple-500",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Feedback detallado",
    description:
      "Recibe un análisis profundo de tus respuestas: tono, fluidez, puntaje y áreas de mejora con consejos accionables.",
    accentClass: "bg-emerald-500/10 text-emerald-500",
  },
]

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative bg-ec-surface-container-low py-24 md:py-32 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ec-surface to-transparent" />
      <div className="mx-auto max-w-7xl px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 flex flex-col items-center text-center"
        >
          <Badge
            variant="outline"
            className="mb-5 border-ec-outline-variant/20 bg-ec-surface-container-lowest text-ec-on-surface-variant px-4 py-1.5"
          >
            Cómo funciona
          </Badge>
          <h2
            className="mb-6 text-3xl font-bold text-ec-on-surface md:text-5xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Tres pasos hacia la{" "}
            <span className="text-ec-primary">claridad profesional</span>
          </h2>
          <p className="max-w-2xl text-lg text-ec-on-surface-variant">
            Sin configuraciones complicadas ni demoras. Sube tu información, practica de inmediato y
            mejora tu perfil con datos y métricas concretas basadas en IA analítica.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-ec-outline-variant/30 to-transparent z-0" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10"
            >
              <Card className="group relative h-full overflow-hidden border border-ec-outline-variant/10 bg-ec-surface-container-lowest/80 backdrop-blur-sm shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_-24px_oklch(0.27_0.015_210/0.18)] hover:border-ec-primary/20">
                {/* Step number watermark */}
                <div
                  className="pointer-events-none absolute -right-4 -top-8 text-9xl font-black text-ec-outline-variant/5 transition-colors duration-500 group-hover:text-ec-primary/5"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {step.number}
                </div>

                <CardContent className="relative space-y-6 flex flex-col items-center text-center p-8 pt-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-inner ${step.accentClass}`}
                  >
                    <step.icon className="h-10 w-10" />
                  </motion.div>

                  <div>
                    <h3
                      className="text-xl font-bold text-ec-on-surface mb-3"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {step.title}
                    </h3>

                    <p className="leading-relaxed text-ec-on-surface-variant text-sm">
                      {step.description}
                    </p>
                  </div>
                </CardContent>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-ec-surface-container transition-all duration-500 group-hover:bg-ec-primary/80" />
              </Card>
              
              {/* Arrow right indicating flow */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-[44px] -right-5 z-20 items-center justify-center w-10 h-10 rounded-full bg-ec-surface shadow-sm border border-ec-outline-variant/20 text-ec-primary/40">
                  <ArrowRight className="size-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
