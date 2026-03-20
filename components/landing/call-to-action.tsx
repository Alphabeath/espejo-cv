"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"

import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background ambient effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-ec-primary-fixed/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-ec-tertiary-fixed/15 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="signature-gradient relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-[0_36px_72px_-30px_oklch(0.27_0.015_210/0.45)] md:px-16 md:py-24"
        >
          {/* Internal decorative circles */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <Sparkles className="mx-auto mb-6 h-8 w-8 text-white/60" />
            <h2
              className="mb-6 text-3xl font-bold text-white md:text-5xl"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              ¿Listo para encontrar
              <br />
              tu claridad profesional?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-white/70">
              Únete a los candidatos que transformaron sus nervios en confianza.
              Tu próxima entrevista comienza aquí.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="group bg-white! px-8 text-base font-bold text-ec-primary! shadow-lg hover:bg-white/95!"
              >
                <Link href="/auth/login">
                  Comenzar Ahora — Es Gratis
                  <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#como-funciona">Saber Más</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
