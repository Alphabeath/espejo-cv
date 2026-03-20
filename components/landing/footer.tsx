import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const footerLinks = [
  { label: "Política de Privacidad", href: "#" },
  { label: "Términos de Servicio", href: "#" },
  { label: "Soporte", href: "#" },
]

export function Footer() {
  return (
    <footer className="w-full bg-ec-surface-container-low py-12">
      <div className="mx-auto max-w-7xl px-8">
        <Separator className="mb-8 bg-gradient-to-r from-transparent via-ec-outline-variant/25 to-transparent" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
          <div className="text-xs tracking-wide text-ec-on-surface-variant">
          © {new Date().getFullYear()} espejoCV Interview Systems
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {footerLinks.map((link) => (
              <Button
                key={link.label}
                asChild
                variant="link"
                size="sm"
                className="h-auto px-3 text-xs tracking-wide text-ec-on-surface-variant hover:text-ec-primary"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
