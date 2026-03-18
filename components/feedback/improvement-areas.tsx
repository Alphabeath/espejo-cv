import { Card, CardContent } from "@/components/ui/card"

const improvements = [
  {
    title: "Consistencia en el Contacto Visual",
    description:
      "Se detectaron desvíos ocasionales de la mirada al explicar conceptos técnicos complejos. Intenta mantener el foco en la cámara.",
  },
  {
    title: "Uso de Muletillas",
    description:
      'Hubo un incremento del 4% en el uso de "eh" y "como" durante el segmento de negociación salarial.',
  },
  {
    title: "Cambio de Postura",
    description:
      "Recostarse al final de la entrevista puede percibirse como una pérdida de compromiso. Mantener una postura erguida transmite mayor interés.",
  },
]

export function ImprovementAreas() {
  return (
    <Card className="border-transparent bg-ec-surface-container-high shadow-none ring-0">
      <CardContent className="pt-2">
        <h3
          className="mb-8 text-2xl font-bold"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Áreas de Mejora
        </h3>
        <ul className="space-y-6">
          {improvements.map((item) => (
            <li key={item.title} className="flex gap-4">
              <div className="mt-3 h-2 w-2 shrink-0 rounded-full bg-ec-error" />
              <div className="text-sm leading-relaxed text-ec-on-surface">
                <span
                  className="mb-1 block font-bold"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {item.title}
                </span>
                {item.description}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
