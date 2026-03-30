"use client"

import { CheckCircle2, Quote } from "lucide-react"
import * as motion from "motion/react-client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const testimonials = [
  {
    quote:
      "Se sintió como una conversación real, no una máquina. Fui a mi entrevista real sin nervios.",
    name: "Laura R.",
    role: "Product Designer",
    initials: "LR",
  },
  {
    quote:
      "Las preguntas de seguimiento fueron tan precisas que pensé que era un humano. Conseguí el trabajo.",
    name: "Carlos M.",
    role: "Frontend Developer",
    initials: "CM",
  },
  {
    quote:
      "El feedback sobre mi tono me hizo darme cuenta de mis puntos ciegos. Excelente herramienta.",
    name: "Sofía T.",
    role: "Data Analyst",
    initials: "ST",
  },
]

const stats = [
  {
    value: "94%",
    label: "Mejora del desempeño",
    description:
      "Los candidatos se sienten significativamente más preparados después de solo tres sesiones.",
  },
  {
    value: "3x",
    label: "Más probabilidades de avanzar",
    description:
      "Quienes practican con espejoCV avanzan tres veces más en procesos de selección.",
  },
  {
    value: "4 min",
    label: "Para empezar",
    description:
      "El tiempo desde subir tu CV hasta tu primera pregunta simulada.",
  },
]

export function Testimonial() {
  return (
    <section className="bg-ec-surface-container-low py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <Badge className="mb-5 h-auto bg-ec-primary-container px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ec-on-primary-container hover:bg-ec-primary-container">
            Historias de Éxito
          </Badge>
          <h2
            className="mb-4 text-3xl font-bold text-ec-on-surface md:text-5xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            De los nervios a la{" "}
            <span className="italic text-ec-primary">autoridad serena</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-ec-on-surface-variant">
            Candidatos reales, resultados reales. Así es como espejoCV ha
            transformado la preparación para entrevistas.
          </p>
        </motion.div>

        {/* Testimonials row */}
        <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Card className="group h-full transition-shadow duration-500 hover:shadow-[0_24px_60px_-24px_oklch(0.27_0.015_210/0.2)]">
                <CardContent className="space-y-5 p-8">
                  <Quote className="h-8 w-8 text-ec-primary/20" />
                  <p
                    className="text-lg leading-snug text-ec-on-surface"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar className="bg-ec-primary/10">
                      <AvatarFallback className="bg-transparent text-sm font-semibold text-ec-primary">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-ec-on-surface">{t.name}</p>
                      <p className="text-sm text-ec-on-surface-variant">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Card className="h-full bg-ec-surface-container-lowest shadow-none">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <div className="rounded-full bg-ec-primary/10 p-2 text-ec-primary-dim">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className="text-3xl font-black text-ec-primary"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {stat.value}
                    </p>
                    <CardTitle className="text-sm font-bold text-ec-on-surface">
                      {stat.label}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-ec-on-surface-variant">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
