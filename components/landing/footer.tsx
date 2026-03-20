"use client"

import Link from "next/link"
import * as motion from "motion/react-client"

import { Button } from "@/components/ui/button"

const footerLinks = [
  { label: "Política de Privacidad", href: "#" },
  { label: "Términos de Servicio", href: "#" },
  { label: "Soporte", href: "#" },
]

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full bg-ec-surface-container-low py-12"
    >
      <div className="mx-auto max-w-7xl px-8">
        {/* Top separator */}
        <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-ec-outline-variant/25 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-0">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span
              className="text-lg font-bold uppercase tracking-widest text-ec-primary"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              espejoCV
            </span>
            <span className="text-xs tracking-wide text-ec-on-surface-variant">
              © {new Date().getFullYear()} espejoCV Interview Systems
            </span>
          </div>

          {/* Links */}
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
    </motion.footer>
  )
}
