import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
        <div className="relative">
          <Image
            src="/testimonial.png"
            alt="Candidata profesional"
            width={600}
            height={700}
            className="rounded-2xl object-cover shadow-2xl grayscale transition-all duration-700 hover:grayscale-0"
          />

          <Card className="absolute -right-10 -bottom-10 hidden max-w-sm border-none bg-ec-primary text-ec-on-primary shadow-2xl md:flex">
            <CardHeader className="pb-3">
              <span
                className="block text-6xl font-black opacity-20"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                &ldquo;
              </span>
            </CardHeader>
            <CardContent className="space-y-5">
              <p
                className="text-xl leading-tight"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Se sintió como una conversación real, no una máquina. Fui a mi
                entrevista real sin nervios.
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="bg-white/10 after:border-white/15">
                  <AvatarFallback className="bg-transparent text-white">
                    LR
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">Laura R.</p>
                  <p className="text-sm text-white/70">Product Designer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:pl-12">
          <Badge className="mb-6 h-auto bg-ec-primary-container px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ec-on-primary-container hover:bg-ec-primary-container">
            Historias de Éxito
          </Badge>
          <h2
            className="mb-8 text-4xl font-bold leading-tight text-ec-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            De los nervios a la <br />
            autoridad serena.
          </h2>

          <div className="space-y-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="border border-white/60 bg-white/80 shadow-sm">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <div className="rounded-full bg-ec-primary/10 p-2 text-ec-primary-dim">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="mb-1 text-lg font-bold text-ec-on-surface">
                      {stat.title}
                    </CardTitle>
                    <p className="text-sm text-ec-on-surface-variant">
                      {stat.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
