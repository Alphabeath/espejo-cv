"use client"

import Link from "next/link"
import { User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navLinks = [
  { label: "Panel", href: "#", active: true },
  { label: "Práctica", href: "#", active: false },
  { label: "Retroalimentación", href: "#", active: false },
]

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/40 bg-ec-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-[var(--font-headline)] text-xl font-bold tracking-widest text-ec-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            espejoCV
          </Link>
          <Badge
            variant="outline"
            className="hidden border-ec-outline-variant/60 bg-white/70 text-[10px] uppercase tracking-[0.24em] text-ec-on-surface-variant md:inline-flex"
          >
            AI Interview Lab
          </Badge>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.label}
              asChild
              variant={link.active ? "secondary" : "ghost"}
              size="sm"
              className={link.active ? "bg-white/80 text-ec-on-surface shadow-xs" : "text-ec-on-surface-variant hover:text-ec-primary"}
            >
              <Link href={link.href} style={{ fontFamily: "var(--font-headline)" }}>
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full border-ec-outline-variant/50 bg-white/70 hover:bg-white"
          aria-label="Cuenta de usuario"
        >
          <Avatar size="sm" className="bg-ec-primary/10 text-ec-primary after:border-transparent">
            <AvatarFallback className="bg-transparent text-ec-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      <Separator className="bg-ec-surface-container-high/80" />
    </nav>
  )
}
