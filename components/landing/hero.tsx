"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Mic, FileText, CheckCircle2, BarChart3, Activity } from "lucide-react"
import * as motion from "motion/react-client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const floatingBadges = [
  { label: "IA conversacional", delay: 0.8 },
  { label: "Feedback en tiempo real", delay: 1.0 },
  { label: "Preguntas por rol", delay: 1.2 },
]

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-8 pb-20 pt-15 md:pb-32 md:pt-32 lg:pb-40 lg:pt-15">
      {/* Ambient glow behind hero */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-ec-primary-fixed/20 blur-[120px]" />

      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
        {/* Left — Copy */}
        <div className="space-y-8 lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge className="h-auto rounded-full bg-ec-secondary-container px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-ec-on-secondary-container hover:bg-ec-secondary-container">
              <Sparkles className="mr-1.5 size-3" />
              Simulador de entrevistas
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-glow text-5xl font-extrabold leading-[1.05] tracking-tight text-ec-on-surface md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Domina tu
            <br />
            entrevista con
            <br />
            <span className="italic text-ec-primary">
              inteligencia artificial
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg text-lg leading-relaxed text-ec-on-surface-variant md:text-xl"
          >
            Sube tu CV, pega la descripción del puesto y obtén una{" "}
            <strong className="text-ec-on-surface">simulación realista</strong>{" "}
            por voz. Nuestra IA analiza cada respuesta para darte feedback preciso y accionable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 pt-2 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="group px-8 text-base font-semibold"
            >
              <Link href="/auth/login">
                Comenzar práctica
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 text-base"
            >
              <Link href="#como-funciona">Ver cómo funciona</Link>
            </Button>
          </motion.div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap gap-3 pt-2"
          >
            {floatingBadges.map((badge) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: badge.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Badge
                  variant="outline"
                  className="h-auto rounded-full border-ec-outline-variant/30 bg-ec-surface-container-lowest/80 px-3.5 py-1.5 text-xs text-ec-on-surface-variant backdrop-blur-sm"
                >
                  {badge.label}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right — Animated abstract mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-6 flex items-center justify-center h-full min-h-[400px]"
        >
          {/* Gradients */}
          <div className="absolute -right-8 -top-8 -z-10 h-64 w-64 rounded-full bg-ec-primary/20 blur-[80px]" />
          <div className="absolute -bottom-8 -left-8 -z-10 h-48 w-48 rounded-full bg-ec-secondary/20 blur-[60px]" />
          
          <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl border border-ec-outline-variant/30 bg-ec-surface-container-lowest/50 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-4 overflow-hidden">
            {/* Header Mockup */}
            <div className="flex items-center justify-between border-b border-ec-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-ec-primary/20 flex items-center justify-center">
                  <Activity className="size-5 text-ec-primary" />
                </div>
                <div>
                  <div className="h-4 w-24 rounded-full bg-ec-on-surface/10 mb-1" />
                  <div className="h-3 w-16 rounded-full bg-ec-on-surface/5" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-ec-outline-variant/10" />
                <div className="h-8 w-8 rounded-full bg-ec-outline-variant/10" />
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 flex flex-col justify-end gap-3 pb-4">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1.5, duration: 0.5 }}
                 className="self-start max-w-[80%] rounded-2xl rounded-tl-sm bg-ec-surface-container-high p-3"
               >
                 <div className="h-3 w-32 bg-ec-on-surface/10 rounded-full mb-2" />
                 <div className="h-3 w-48 bg-ec-on-surface/10 rounded-full" />
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 2.2, duration: 0.5 }}
                 className="self-end max-w-[80%] rounded-2xl rounded-tr-sm bg-ec-primary/10 p-3"
               >
                 <div className="h-3 w-40 bg-ec-primary/20 rounded-full mb-2" />
                 <div className="h-3 w-28 bg-ec-primary/20 rounded-full" />
               </motion.div>
            </div>

            {/* Bottom Input Mockup */}
            <div className="h-12 w-full rounded-xl bg-ec-surface-container-high/50 flex items-center px-4 justify-between border border-ec-outline-variant/10">
               <div className="h-3 w-32 bg-ec-on-surface/10 rounded-full" />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }} 
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="h-8 w-8 rounded-full bg-ec-primary/20 flex items-center justify-center"
               >
                 <Mic className="size-4 text-ec-primary" />
               </motion.div>
            </div>
            
            {/* Overlay Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Floating stat card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-6 -left-6 rounded-xl border border-ec-outline-variant/20 bg-ec-surface-container-lowest p-5 shadow-[0_24px_60px_-24px_oklch(0.27_0.015_210/0.28)] backdrop-blur-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-green-500/20 p-1.5 text-green-600">
                <BarChart3 className="size-4" />
              </div>
              <p className="text-sm font-medium text-ec-on-surface-variant">
                Puntaje promedio
              </p>
            </div>
            <p
              className="text-3xl font-bold text-ec-primary"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              aumenta
            </p>
            <p className="text-xs text-ec-on-surface-variant mt-1">
              después de 3 sesiones
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

