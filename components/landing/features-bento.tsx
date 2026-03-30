"use client"

import { Brain, Mic, MessageSquareText, Target, Shield, Zap, Activity, Award } from "lucide-react"
import * as motion from "motion/react-client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const feedbackTags = ["Análisis de tono", "Puntaje general", "Áreas de mejora"]

export function FeaturesBento() {
  return (
    <section id="caracteristicas" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <Badge
            variant="outline"
            className="mb-5 border-ec-outline-variant/20 bg-ec-surface-container-lowest text-ec-on-surface-variant"
          >
            Capacidades de la plataforma
          </Badge>
          <h2
            className="mb-4 text-3xl font-bold text-ec-on-surface md:text-5xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Todo lo que necesitas para{" "}
            <span className="text-ec-primary">dominar</span> la entrevista
          </h2>
          <p className="max-w-2xl text-lg text-ec-on-surface-variant">
            Desde la preparación hasta el análisis posterior, nuestra plataforma
            cubre cada etapa de tu proceso de entrevista.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1 — AI Analysis — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-2"
          >
            <Card className="group h-full overflow-hidden transition-shadow duration-500 hover:shadow-[0_28px_64px_-36px_oklch(0.27_0.015_210/0.22)]">
              <CardHeader className="pb-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-ec-primary-container"
                >
                  <Brain className="h-6 w-6 text-ec-primary" />
                </motion.div>
                <CardTitle
                  className="mb-4 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Análisis profundo con IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="max-w-md leading-relaxed text-ec-on-surface-variant mb-6">
                  Nuestro motor analiza tu tono, contenido y estructura para
                  proporcionar perspectivas sobre cómo eres
                  percibido. Identifica patrones y oportunidades de mejora.
                </p>
                {/* Visual mockup replacement for /feedback-visual.png */}
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-ec-surface-container-high/30 border border-ec-outline-variant/10 p-4 flex gap-4">
                  {/* Mock Charts */}
                  <div className="flex-1 flex flex-col justify-end gap-2 h-full">
                    <div className="w-full flex items-end gap-2 h-full opacity-60">
                       <motion.div initial={{ height: 0 }} whileInView={{ height: '40%' }} className="flex-1 bg-ec-primary rounded-t-sm" />
                       <motion.div initial={{ height: 0 }} whileInView={{ height: '70%' }} className="flex-1 bg-ec-secondary rounded-t-sm" />
                       <motion.div initial={{ height: 0 }} whileInView={{ height: '50%' }} className="flex-1 bg-ec-tertiary rounded-t-sm" />
                       <motion.div initial={{ height: 0 }} whileInView={{ height: '90%' }} className="flex-1 bg-ec-primary rounded-t-sm" />
                       <motion.div initial={{ height: 0 }} whileInView={{ height: '60%' }} className="flex-1 bg-ec-secondary rounded-t-sm" />
                    </div>
                  </div>
                  {/* Mock Score Card */}
                  <div className="w-40 rounded-lg bg-ec-surface-container shadow-sm p-4 flex flex-col justify-center items-center gap-2">
                    <Activity className="size-6 text-ec-primary" />
                    <div className="text-xl font-bold">92/100</div>
                    <div className="text-xs text-ec-on-surface-variant">Puntaje Global</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 — Realistic scenarios */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Card className="signature-gradient group h-full text-ec-on-primary shadow-[0_28px_64px_-36px_oklch(0.27_0.015_210/0.45)]">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10"
                >
                  <Mic className="h-6 w-6 text-white" />
                </motion.div>
                <CardTitle
                  className="mb-4 text-2xl font-bold text-white"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Escenarios por voz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed opacity-80 pb-4">
                  Desde preguntas técnicas hasta situaciones de
                  comportamiento, simulamos la presión real de una
                  entrevista usando reconocimiento de voz.
                </p>
              </CardContent>
              <CardFooter className="block pb-6">
                {/* Visual mockup replacement for /interview-ui.png */}
                <div className="w-full h-24 rounded-lg bg-black/20 overflow-hidden flex flex-col justify-center items-center gap-3 border border-white/10 shadow-inner">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <Mic className="size-5 text-white" />
                  </motion.div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div 
                        key={i} 
                        animate={{ height: ["4px", "12px", "4px"] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                        className="w-1 bg-white/60 rounded-full" 
                      />
                    ))}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Card 3 — Personalized feedback */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Card className="group h-full bg-ec-tertiary-container transition-shadow duration-500 hover:shadow-[0_28px_64px_-36px_oklch(0.27_0.015_210/0.22)]">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/50"
                >
                  <Award className="h-6 w-6 text-ec-tertiary" />
                </motion.div>
                <CardTitle
                  className="mb-4 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Feedback accionable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-ec-on-tertiary-container">
                  Recibe un informe detallado después de cada sesión con consejos
                  específicos sobre cómo mejorar tu comunicación profesional.
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                {feedbackTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="h-auto bg-white/60 px-3 py-1 text-xs font-medium text-ec-tertiary"
                  >
                    {tag}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          </motion.div>

          {/* Card 4 — Extra features row — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="md:col-span-2"
          >
            <Card className="h-full bg-ec-surface-container-low shadow-none">
              <CardContent className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-3">
                {[
                  {
                    icon: Target,
                    title: "Adaptado al rol",
                    desc: "Las preguntas se generan según el puesto y tu experiencia.",
                  },
                  {
                    icon: Shield,
                    title: "Datos en tu control",
                    desc: "Tu CV y respuestas son analizados de forma segura.",
                  },
                  {
                    icon: Zap,
                    title: "Rápido e intuitivo",
                    desc: "Empieza a practicar sin pasos ni configuraciones pesadas.",
                  },
                ].map((item) => (
                  <div key={item.title} className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ec-primary/8 text-ec-primary-dim">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h4
                      className="font-bold text-ec-on-surface"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {item.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-ec-on-surface-variant">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
