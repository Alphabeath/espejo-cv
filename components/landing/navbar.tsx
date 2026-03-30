"use client"

import Link from "next/link"
import { User } from "lucide-react"
import * as motion from "motion/react-client"

import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Características", href: "#caracteristicas" },
]

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="quiet-glass fixed top-0 z-50 w-full border-b border-ec-outline-variant/15"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold uppercase tracking-widest text-ec-primary transition-colors hover:text-ec-primary-dim"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          espejoCV
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="pb-1 text-sm font-medium tracking-tight text-ec-on-surface-variant transition-colors hover:text-ec-primary"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden px-5 text-sm font-semibold md:inline-flex"
          >
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg md:hidden"
            aria-label="Cuenta de usuario"
          >
            <User className="h-5 w-5 text-ec-on-surface-variant" />
          </Button>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-ec-outline-variant/25 to-transparent" />
    </motion.nav>
  )
}
