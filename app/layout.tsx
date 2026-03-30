import { Inter, Manrope, Geist_Mono } from "next/font/google"
import { MonitorSmartphone } from "lucide-react"

import "./globals.css"
import { AppProviders } from "@/components/app-providers"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-headline" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  title: "espejoCV — Claridad en tu Entrevista",
  description:
    "Sube tu CV y la descripción del puesto para iniciar una simulación de entrevista realista impulsada por IA. Gana la seguridad necesaria para conseguir el rol.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        inter.variable,
        manrope.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-svh text-ec-on-surface" suppressHydrationWarning>
        <AppProviders>
          {/* Contenido principal oculto en móvil */}
          <div className="contents max-md:hidden">
            {children}
          </div>

          {/* Bloqueo para móviles */}
          <div className="md:hidden flex flex-col items-center justify-center min-h-svh w-full px-8 py-10 text-center bg-ec-surface quiet-shell">
            <MonitorSmartphone className="size-16 mb-6 text-ec-primary opacity-80" />
            <h1 
              className="text-2xl font-bold tracking-widest text-ec-primary uppercase mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              espejoCV
            </h1>
            <h2 className="text-xl font-bold leading-snug text-ec-on-surface mb-3 font-headline">
              Experiencia de escritorio requerida
            </h2>
            <p className="text-sm text-ec-on-surface-variant max-w-[280px] leading-relaxed mx-auto">
              Esta experiencia no está optimizada para dispositivos móviles o pantallas pequeñas. 
              Por favor, accede desde un ordenador o PC para aprovechar al máximo las simulaciones de entrevista.
            </p>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
