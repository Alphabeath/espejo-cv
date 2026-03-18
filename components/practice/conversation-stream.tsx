import { Bot, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ConversationStream() {
  return (
    <div className="flex flex-col gap-6 lg:col-span-7">
      <div className="flex-grow space-y-8">
        {/* Previous question (faded) */}
        <div className="opacity-40 transition-opacity hover:opacity-100">
          <div className="flex items-start gap-4">
            <Bot className="mt-1 h-5 w-5 shrink-0 text-ec-primary-dim" />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-tight text-ec-on-surface-variant">
                Entrevistador IA • hace 5m
              </p>
              <p className="italic leading-relaxed text-ec-on-surface">
                &ldquo;Cuéntame sobre alguna ocasión en la que tuviste que
                pivotar la estrategia de un producto basándote en comentarios
                contradictorios de los stakeholders.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Current active question — uses Card component */}
        <Card className="border-l-4 border-l-ec-primary border-transparent bg-ec-surface-container-lowest shadow-sm ring-0">
          <CardContent className="pt-2">
            <div className="flex items-start gap-4">
              <MessageSquare
                className="mt-1 h-5 w-5 shrink-0 text-ec-primary"
                fill="currentColor"
              />
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-ec-primary">
                  Pregunta Activa
                </p>
                <h2
                  className="text-2xl font-semibold leading-tight text-ec-on-surface"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  &ldquo;Basándote en tu respuesta anterior, ¿cómo medirías el
                  éxito de ese cambio de estrategia? Explícame los KPIs
                  específicos que priorizaste y por qué.&rdquo;
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live transcription bubble (user) */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-xl rounded-tr-none bg-ec-surface-container-high/50 p-6">
            <p className="leading-relaxed text-ec-on-surface">
              Empezaría por identificar los objetivos centrales del pivot...
              <span className="ml-1 inline-block h-5 w-1.5 animate-pulse rounded-sm bg-ec-primary align-middle" />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
