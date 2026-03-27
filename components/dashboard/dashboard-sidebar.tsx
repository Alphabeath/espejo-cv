"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CirclePlus, LogOut, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

import { dashboardNavItems } from "./dashboard-data"

export function DashboardSidebar({
  newPracticeHref = "/dashboard/practice",
}: {
  newPracticeHref?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoggingOut } = useAuth()

  async function handleLogout() {
    try {
      await logout()
      router.replace("/auth/login")
    } catch {
      return
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-ec-outline-variant/15 bg-ec-surface-container-low px-3 py-6 md:min-h-svh md:w-60 md:border-b-0 md:border-r">
      <div className="mb-5 flex items-center gap-3 px-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ec-primary-container">
          <UserRound className="size-4 text-ec-on-primary-container" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user?.name ?? "Usuario"}</p>
          <p className="truncate text-xs text-ec-on-surface-variant">
            {user?.email ?? "Cuenta activa"}
          </p>
        </div>
      </div>

      <Separator className="mb-4 mt-4 bg-ec-outline-variant/20" />

      <nav className="flex flex-col gap-0.5">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon
          const isCurrent = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-r-xl py-2.5 pl-4 pr-3 text-sm transition-colors",
                isCurrent
                  ? "font-medium text-ec-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.75 before:rounded-full before:bg-ec-primary"
                  : "text-ec-on-surface-variant hover:bg-ec-surface-container-high/60 hover:text-ec-on-surface",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <div className="mt-6 space-y-3">
        <Button
          asChild
          className="signature-gradient w-full justify-center rounded-xl text-sm text-ec-on-primary shadow-md shadow-ec-primary/15"
        >
          <Link href={newPracticeHref}>
            <CirclePlus className="size-4" />
            Nueva práctica
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-center rounded-xl border-red-200 bg-red-50 text-sm text-red-700 hover:bg-red-100"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </Button>
      </div>
    </aside>
  )
}
