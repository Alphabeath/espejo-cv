"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { label: "Panel", href: "/" },
  { label: "Práctica", href: "/practica" },
  { label: "Retroalimentación", href: "/feedback" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="quiet-glass fixed top-0 z-50 w-full border-b border-ec-outline-variant/15">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold uppercase tracking-widest text-ec-primary"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          espejoCV
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={
                  isActive
                    ? "relative pb-1 text-sm font-semibold tracking-tight text-ec-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-ec-primary"
                    : "pb-1 text-sm font-medium tracking-tight text-ec-on-surface-variant transition-colors hover:text-ec-primary"
                }
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* User icon */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg"
            aria-label="Cuenta de usuario"
          >
            <User className="h-5 w-5 text-ec-on-surface-variant" />
          </Button>
        </div>
      </div>

      {/* Bottom separator — tonal transition, no harsh border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-ec-outline-variant/25 to-transparent" />
    </nav>
  )
}
