"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const floatingBadges = [
  { label: "IA Conversacional", delay: 0.8 },
  { label: "Feedback en Tiempo Real", delay: 1.0 },
  { label: "Preguntas por Rol", delay: 1.2 },
]

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-8 pb-20 pt-4 md:pb-32 md:pt-4 lg:pb-40 lg:pt-8">
      {/* Ambient glow behind hero */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-ec-primary-fixed/20 blur-[120px]" />

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
              Simulador de Entrevistas con IA
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-glow text-5xl font-extrabold leading-[1.05] tracking-tight text-ec-on-surface md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Practica tu
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
            de entrevista. La IA analiza tus respuestas y te da feedback
            accionable para mejorar antes del día real.
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
                Comenzar Práctica Gratis
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 text-base"
            >
              <Link href="#como-funciona">Ver Cómo Funciona</Link>
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

        {/* Right — Visual mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-6"
        >
          {/* Gradient backdrop */}
          <div className="absolute -top-16 -right-16 -z-10 h-72 w-72 rounded-full bg-ec-primary-fixed/25 blur-[80px]" />
          <div className="absolute -bottom-12 -left-12 -z-10 h-48 w-48 rounded-full bg-ec-tertiary-fixed/20 blur-[60px]" />

          <div className="quiet-surface overflow-hidden rounded-2xl">
            <Image
              src="/hero-mockup.png"
              alt="Interfaz de simulación de entrevista con IA de espejoCV"
              width={720}
              height={480}
              className="w-full object-cover"
              priority
            />
          </div>

          {/* Floating stat card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-6 -left-6 rounded-xl bg-ec-surface-container-lowest p-4 shadow-[0_24px_60px_-24px_oklch(0.27_0.015_210/0.28)] backdrop-blur-sm"
          >
            <p className="text-sm font-medium text-ec-on-surface-variant">
              Confianza promedio
            </p>
            <p
              className="text-3xl font-bold text-ec-primary"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              +94%
            </p>
            <p className="text-xs text-ec-on-surface-variant">
              después de 3 sesiones
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
