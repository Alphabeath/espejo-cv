"use client"

import { Upload, Brain, BarChart3 } from "lucide-react"
import * as motion from "motion/react-client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Sube tu CV y el puesto",
    description:
      "Carga tu CV en PDF o Markdown y pega la descripción del trabajo al que aplicas. La IA entiende tu perfil y el contexto del rol.",
    accentClass: "bg-ec-primary/10 text-ec-primary",
  },
  {
    number: "02",
    icon: Brain,
    title: "Simulación conversacional",
    description:
      "Un entrevistador con IA te hace preguntas técnicas y de comportamiento adaptadas al puesto. Responde como lo harías en una entrevista real.",
    accentClass: "bg-ec-secondary/10 text-ec-secondary",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Feedback detallado",
    description:
      "Recibe un análisis profundo de tus respuestas: tono, contenido, confianza y áreas de mejora con consejos accionables.",
    accentClass: "bg-ec-tertiary/10 text-ec-tertiary",
  },
]

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="bg-ec-surface-container-low py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-2xl"
        >
          <Badge
            variant="outline"
            className="mb-5 border-ec-outline-variant/20 bg-ec-surface-container-lowest text-ec-on-surface-variant"
          >
            Cómo funciona
          </Badge>
          <h2
            className="mb-4 text-3xl font-bold text-ec-on-surface md:text-5xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Tres pasos hacia la{" "}
            <span className="text-ec-primary">claridad</span>
          </h2>
          <p className="text-lg text-ec-on-surface-variant">
            Sin configuraciones complicadas. Sube tu información, practica y
            mejora con datos concretos.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
            >
              <Card className="group relative h-full overflow-hidden border-none bg-ec-surface-container-lowest shadow-none transition-all duration-500 hover:shadow-[0_24px_60px_-24px_oklch(0.27_0.015_210/0.18)]">
                {/* Step number watermark */}
                <div
                  className="pointer-events-none absolute top-4 right-6 text-7xl font-black text-ec-outline-variant/10 transition-colors duration-500 group-hover:text-ec-primary/10"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {step.number}
                </div>

                <CardContent className="relative space-y-5 p-8 pt-10">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    transition={{ duration: 0.3 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${step.accentClass}`}
                  >
                    <step.icon className="h-7 w-7" />
                  </motion.div>

                  <h3
                    className="text-xl font-bold text-ec-on-surface"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {step.title}
                  </h3>

                  <p className="leading-relaxed text-ec-on-surface-variant">
                    {step.description}
                  </p>
                </CardContent>

                {/* Bottom accent bar — appears on hover */}
                <div className="h-1 w-full bg-ec-surface-container transition-all duration-500 group-hover:bg-ec-primary/60" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
