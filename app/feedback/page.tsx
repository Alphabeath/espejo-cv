import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import {
  FeedbackHeader,
  KeyMetrics,
  StrengthsList,
  ImprovementAreas,
  PlaybackAndActions,
} from "@/components/feedback"

export const metadata = {
  title: "Resultados — espejoCV",
  description:
    "Resumen de desempeño de tu simulación de entrevista. Análisis detallado de confianza, claridad, fortalezas y áreas de mejora.",
}

export default function FeedbackPage() {
  return (
    <>
      <Navbar />
      <main className="px-6 pb-24 pt-32 md:px-12">
        <div className="mx-auto max-w-7xl">
          <FeedbackHeader />

          {/* Bento Grid — asymmetric layout */}
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            {/* Left column: Metrics + Strengths */}
            <div className="space-y-8 md:col-span-7">
              <KeyMetrics />
              <StrengthsList />
            </div>

            {/* Right column: Improvements + Video + CTAs */}
            <div className="space-y-8 md:col-span-5">
              <ImprovementAreas />
              <PlaybackAndActions />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
