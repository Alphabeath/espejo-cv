import { Inter, Manrope, Geist_Mono } from "next/font/google"

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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
