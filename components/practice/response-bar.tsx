"use client"

import { Mic, Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ResponseBar() {
  return (
    <div className="fixed bottom-0 left-0 z-40 w-full pb-8 pt-4 backdrop-blur-xl" style={{ background: "oklch(0.975 0.003 230 / 0.8)" }}>
      <div className="mx-auto max-w-4xl px-6">
        {/* Input row */}
        <div className="relative flex items-center gap-4">
          {/* Textarea */}
          <div className="group relative flex-grow">
            <Textarea
              placeholder="Escribe tu respuesta aquí o usa la voz..."
              rows={1}
              className="w-full resize-none rounded-xl border-none bg-ec-surface-container-high px-6 py-4 pr-16 shadow-inner transition-all placeholder:text-ec-on-surface-variant focus:bg-ec-surface-container-highest focus:ring-0 focus-visible:border-transparent focus-visible:ring-0"
            />
            {/* Attach button inside textarea */}
            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-ec-on-surface-variant hover:text-ec-primary"
                  >
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Adjuntar archivo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Adjuntar archivo</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Mic button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="h-14 w-14 rounded-full bg-ec-surface-container-highest text-ec-primary shadow-sm transition-all hover:bg-ec-primary hover:text-white"
                >
                  <Mic className="h-5 w-5" />
                  <span className="sr-only">Usar micrófono</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Usar micrófono</TooltipContent>
            </Tooltip>

            {/* Send button */}
            <Button
              className="signature-gradient h-14 gap-3 rounded-xl px-8 text-white shadow-lg transition-transform active:scale-95"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Enviar Respuesta
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-ec-on-surface-variant/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Conexión Estable
          </div>
          <div className="flex items-center gap-4">
            <span>Enter para enviar</span>
            <span>•</span>
            <span>Cmd + L para silenciar</span>
          </div>
        </div>
      </div>
    </div>
  )
}
