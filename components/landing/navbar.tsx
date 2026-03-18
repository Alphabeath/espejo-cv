"use client"

import Link from "next/link"
import { User } from "lucide-react"

const navLinks = [
  { label: "Panel", href: "#", active: true },
  { label: "Práctica", href: "#", active: false },
  { label: "Retroalimentación", href: "#", active: false },
]

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-ec-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-[var(--font-headline)] text-xl font-bold tracking-widest text-ec-on-surface"
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
              className={
                link.active
                  ? "border-b-2 border-ec-on-surface pb-1 text-sm font-semibold tracking-tight text-ec-on-surface"
                  : "pb-1 text-sm font-medium tracking-tight text-ec-on-surface-variant transition-colors hover:text-ec-primary"
              }
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User icon */}
        <button
          className="rounded-lg p-2 transition-all duration-200 hover:bg-ec-surface-container-high"
          aria-label="Cuenta de usuario"
        >
          <User className="h-5 w-5 text-ec-primary" />
        </button>
      </div>

      {/* Bottom separator — tonal transition, no harsh border */}
      <div className="h-px w-full bg-ec-surface-container-high" />
    </nav>
  )
}
