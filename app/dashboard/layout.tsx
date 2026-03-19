"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Settings, UserRound } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false)
      }
    }

    window.addEventListener("mousedown", handlePointerDown)
    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("mousedown", handlePointerDown)
      window.removeEventListener("keydown", handleEscape)
    }
  }, [])

  async function handleLogout() {
    try {
      await logout()
      setIsUserMenuOpen(false)
      router.push("/auth/login")
    } catch {
      return
    }
  }

  return (
    <div className="min-h-svh bg-white text-ec-on-surface">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 flex h-14 items-center border-b border-ec-outline-variant/20 bg-white px-6 shadow-[0_1px_0_rgba(43,52,55,0.06)]">
        <span className="mr-10 text-base font-bold text-ec-on-surface">
          espejoCV
        </span>
        <nav className="flex flex-1 items-center gap-7 text-sm">
          <Link
            href="/dashboard"
            className="border-b-2 border-ec-primary pb-px font-semibold text-ec-primary"
          >
            Panel
          </Link>
          <Link
            href="/practica"
            className="pb-px text-ec-on-surface-variant hover:text-ec-on-surface"
          >
            Práctica
          </Link>
          <Link
            href="/dashboard#feedback"
            className="pb-px text-ec-on-surface-variant hover:text-ec-on-surface"
          >
            Feedback
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-ec-on-surface-variant">
          <Bell className="size-[18px]" />
          <Settings className="size-[18px]" />
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              className="flex size-8 items-center justify-center rounded-full bg-ec-primary-container transition-colors hover:bg-ec-primary-container/80"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label="Abrir menú de usuario"
            >
              <UserRound className="size-4 text-ec-on-primary-container" />
            </button>

            {isUserMenuOpen ? (
              <div className="absolute right-0 top-11 w-56 overflow-hidden rounded-2xl border border-ec-outline-variant/20 bg-white shadow-lg shadow-black/5">
                <div className="border-b border-ec-outline-variant/15 px-4 py-3">
                  <p className="text-sm font-semibold text-ec-on-surface">
                    {user?.name ?? "Usuario"}
                  </p>
                  <p className="truncate text-xs text-ec-on-surface-variant">
                    {user?.email ?? "Cuenta activa"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="size-4" />
                  {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
