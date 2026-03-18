import { Upload, FileText, Settings } from "lucide-react"

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-20 md:py-32">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left column — copy */}
        <div className="space-y-8 lg:col-span-7">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center rounded-full bg-ec-secondary-container px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ec-on-secondary-container">
            Presentamos espejoCV
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up delay-100 text-glow text-5xl font-extrabold leading-[1.1] tracking-tight text-ec-on-surface md:text-7xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Prepárate para tu <br />
            <span className="italic text-ec-primary">
              próximo paso profesional
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-200 max-w-xl text-lg leading-relaxed text-ec-on-surface-variant md:text-xl">
            Sube tu CV y la descripción del puesto para iniciar una simulación
            de entrevista realista impulsada por IA. Gana la confianza necesaria
            para conseguir el rol.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in-up delay-300 flex flex-col gap-4 pt-4 sm:flex-row">
            <button className="signature-gradient rounded-md px-8 py-4 text-lg font-semibold text-ec-on-primary shadow-lg transition-all hover:scale-[1.02] hover:shadow-ec-primary/20 active:scale-95">
              Iniciar Sesión de Práctica
            </button>
            <button className="rounded-md bg-ec-surface-container-highest px-8 py-4 text-lg font-semibold text-ec-on-surface transition-all hover:bg-ec-surface-variant">
              Ver Reporte de Ejemplo
            </button>
          </div>
        </div>

        {/* Right column — mockup card */}
        <div className="relative lg:col-span-5">
          {/* Ambient glow */}
          <div className="absolute -top-10 -right-10 -z-10 h-64 w-64 rounded-full bg-ec-primary-fixed/30 blur-3xl" />

          <div className="animate-slide-in-right delay-300 relative overflow-hidden rounded-xl bg-ec-surface-container-lowest p-8 shadow-2xl shadow-indigo-900/5">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-ec-surface-container pb-4">
              <span className="text-sm font-semibold text-ec-on-surface-variant">
                Configuración de la Entrevista
              </span>
              <Settings className="h-5 w-5 text-ec-primary" />
            </div>

            {/* Upload zones */}
            <div className="mt-6 space-y-4">
              {/* Upload CV */}
              <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed border-ec-outline-variant/30 bg-ec-surface-container-low p-6 transition-colors hover:border-ec-primary/30">
                <Upload className="h-8 w-8 text-ec-primary-dim" />
                <span className="text-sm font-medium">
                  Subir CV Profesional
                </span>
                <span className="text-xs text-ec-on-surface-variant">
                  PDF, Word o Markdown
                </span>
              </div>

              {/* Paste JD */}
              <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed border-ec-outline-variant/30 bg-ec-surface-container-low p-6 transition-colors hover:border-ec-primary/30">
                <FileText className="h-8 w-8 text-ec-primary-dim" />
                <span className="text-sm font-medium">
                  Pegar Descripción del Puesto
                </span>
                <span className="text-xs text-ec-on-surface-variant">
                  Adaptaremos las preguntas a este rol
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
