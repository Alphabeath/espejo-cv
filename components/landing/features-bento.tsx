import Image from "next/image"
import { Brain, Mic, MessageSquareText, ArrowRight } from "lucide-react"

export function FeaturesBento() {
  return (
    <section className="bg-ec-surface-container-low py-24">
      <div className="mx-auto max-w-7xl px-8">
        {/* Section header */}
        <div className="mb-16">
          <h2
            className="mb-4 text-3xl font-bold text-ec-on-surface md:text-4xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Domina cada interacción
          </h2>
          <p className="max-w-2xl text-ec-on-surface-variant">
            Nuestra plataforma de simulación va más allá de preguntas genéricas,
            utilizando modelos avanzados para crear una experiencia
            conversacional profunda.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Feature 1 — Análisis con IA (wide) */}
          <div className="group flex flex-col justify-between rounded-xl bg-ec-surface-container-lowest p-10 transition-shadow hover:shadow-xl md:col-span-2">
            <div className="max-w-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-ec-primary-container">
                <Brain className="h-6 w-6 text-ec-primary" />
              </div>
              <h3
                className="mb-4 text-2xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Análisis con IA
              </h3>
              <p className="leading-relaxed text-ec-on-surface-variant">
                Nuestro motor analiza tu tono, contenido y estructura para
                proporcionar perspectivas psicológicas sobre cómo eres percibido
                por los entrevistadores.
              </p>
            </div>
            <div className="mt-12 flex cursor-pointer items-center gap-2 font-semibold text-ec-primary transition-transform group-hover:translate-x-2">
              <span>Explorar análisis</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Feature 2 — Escenarios realistas (accent card) */}
          <div className="flex flex-col justify-between rounded-xl bg-ec-primary p-10 text-ec-on-primary shadow-lg shadow-ec-primary/20">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h3
                className="mb-4 text-2xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Escenarios Realistas
              </h3>
              <p className="leading-relaxed opacity-80">
                Desde profundizaciones técnicas hasta preguntas de
                comportamiento inesperadas, simulamos los niveles exactos de
                estrés de una ronda final.
              </p>
            </div>
            <div className="mt-8 border-t border-white/10 pt-8">
              <Image
                src="/interview-ui.png"
                alt="Interfaz de entrevista por video"
                width={400}
                height={180}
                className="w-full rounded object-cover opacity-90 shadow-sm"
              />
            </div>
          </div>

          {/* Feature 3 — Feedback personalizado (tertiary card) */}
          <div className="group flex flex-col justify-between rounded-xl bg-ec-tertiary-container p-10 transition-shadow hover:shadow-xl">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/50">
                <MessageSquareText className="h-6 w-6 text-ec-tertiary" />
              </div>
              <h3
                className="mb-4 text-2xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Feedback Personalizado
              </h3>
              <p className="leading-relaxed text-ec-on-tertiary-container">
                Recibe un informe detallado después de cada sesión con consejos
                accionables sobre cómo perfeccionar tu historia única.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-ec-tertiary">
                Análisis de Tono
              </span>
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-ec-tertiary">
                Puntuación de Confianza
              </span>
            </div>
          </div>

          {/* CTA mini-section */}
          <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-ec-surface-container-highest p-10 sm:flex-row md:col-span-2">
            <div className="flex-1">
              <h3
                className="mb-2 text-xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                ¿Listo para encontrar tu claridad?
              </h3>
              <p className="text-sm text-ec-on-surface-variant">
                Únete a más de 10,000 candidatos que practicaron su camino hacia
                la cima.
              </p>
            </div>
            <button className="rounded-md bg-ec-on-surface px-6 py-3 font-medium text-ec-surface transition-opacity hover:opacity-90">
              Comenzar Ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
