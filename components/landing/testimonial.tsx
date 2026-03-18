import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

const stats = [
  {
    title: "94% de aumento en confianza",
    description:
      "Los candidatos informan sentirse significativamente más preparados después de solo tres sesiones.",
  },
  {
    title: "Contenido Personalizado",
    description:
      "Cada pregunta se genera dinámicamente según el trabajo específico que buscas.",
  },
]

export function Testimonial() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-32">
      <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
        {/* Left — image + quote overlay */}
        <div className="relative">
          <Image
            src="/testimonial.png"
            alt="Candidata profesional"
            width={600}
            height={700}
            className="rounded-2xl object-cover shadow-2xl grayscale transition-all duration-700 hover:grayscale-0"
          />

          {/* Floating quote card */}
          <div className="absolute -right-10 -bottom-10 hidden rounded-xl bg-ec-primary p-12 text-ec-on-primary md:block">
            <span
              className="mb-4 block text-6xl font-black opacity-20"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              &ldquo;
            </span>
            <p
              className="text-xl leading-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Se sintió como una conversación real, no una máquina. Fui a mi
              entrevista real sin nervios.
            </p>
          </div>
        </div>

        {/* Right — stats */}
        <div className="lg:pl-12">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-ec-primary">
            Historias de Éxito
          </p>
          <h2
            className="mb-8 text-4xl font-bold leading-tight text-ec-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            De los nervios a la <br />
            autoridad serena.
          </h2>

          <div className="space-y-10">
            {stats.map((stat) => (
              <div key={stat.title} className="flex gap-6">
                <div className="shrink-0 text-ec-primary-dim">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold">{stat.title}</h4>
                  <p className="text-sm text-ec-on-surface-variant">
                    {stat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
