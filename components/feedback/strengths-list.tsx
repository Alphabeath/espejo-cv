import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const strengths = [
  {
    title: "Ritmo y Pausas",
    description:
      "Utilizaste eficazmente silencios de 2 segundos para enfatizar tus logros clave.",
  },
  {
    title: "Tono Auténtico",
    description:
      "Tu variedad vocal fue alta, mostrando una pasión genuina por resolver problemas.",
  },
  {
    title: "Lenguaje de Autoridad",
    description:
      'Empleaste verbos de acción potentes: "Dirigí", "Orquesté" y "Resolví".',
  },
]

export function StrengthsList() {
  return (
    <Card className="border-transparent bg-ec-surface-container-lowest shadow-sm ring-0">
      <CardContent className="pt-2">
        <h3
          className="mb-8 text-2xl font-bold"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Fortalezas
        </h3>
        <div className="space-y-6">
          {strengths.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ec-secondary-container">
                <Check className="h-3 w-3 text-ec-on-secondary-container" />
              </div>
              <div>
                <h5
                  className="font-bold text-ec-on-surface"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {item.title}
                </h5>
                <p className="text-sm text-ec-on-surface-variant">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
