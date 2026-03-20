import Image from "next/image"
import { Brain, Mic, MessageSquareText, ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const feedbackTags = ["Analisis de tono", "Puntuacion de confianza"]

export function FeaturesBento() {
  return (
    <section className="quiet-shell bg-ec-surface-container-low py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16">
          <Badge variant="outline" className="mb-5 border-ec-outline-variant/20 bg-ec-surface-container-lowest text-ec-on-surface-variant">
            Plataforma de simulación
          </Badge>
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="group md:col-span-2">
            <CardHeader className="pb-0">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-ec-primary-container">
                <Brain className="h-6 w-6 text-ec-primary" />
              </div>
              <CardTitle
                className="mb-4 text-2xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Análisis con IA
              </CardTitle>
            </CardHeader>
            <CardContent className="max-w-md">
              <p className="leading-relaxed text-ec-on-surface-variant">
                Nuestro motor analiza tu tono, contenido y estructura para
                proporcionar perspectivas psicológicas sobre cómo eres percibido
                por los entrevistadores.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="px-0 font-semibold text-ec-primary group-hover:translate-x-1">
                Explorar análisis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="signature-gradient text-ec-on-primary shadow-[0_28px_64px_-36px_oklch(0.27_0.015_210/0.45)]">
            <CardHeader>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <CardTitle
                className="mb-4 text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Escenarios Realistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed opacity-80">
                Desde profundizaciones técnicas hasta preguntas de
                comportamiento inesperadas, simulamos los niveles exactos de
                estrés de una ronda final.
              </p>
            </CardContent>
            <CardFooter className="block pt-8">
              <Image
                src="/interview-ui.png"
                alt="Interfaz de entrevista por video"
                width={400}
                height={180}
                className="w-full rounded object-cover opacity-90 shadow-sm"
              />
            </CardFooter>
          </Card>

          <Card className="group bg-ec-tertiary-container">
            <CardHeader>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/50">
                <MessageSquareText className="h-6 w-6 text-ec-tertiary" />
              </div>
              <CardTitle
                className="mb-4 text-2xl font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Feedback Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-ec-on-tertiary-container">
                Recibe un informe detallado después de cada sesión con consejos
                accionables sobre cómo perfeccionar tu historia única.
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

          <Card className="md:col-span-2 bg-ec-surface-container-highest">
            <CardContent className="flex flex-col items-start justify-between gap-6 pt-6 sm:flex-row sm:items-center">
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
              <Separator orientation="vertical" className="hidden h-12 bg-ec-outline-variant/25 sm:block" />
              <Button className="bg-ec-on-surface px-6 text-ec-surface hover:bg-ec-on-surface/90">
                Comenzar Ahora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
