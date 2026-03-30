"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronUp, CirclePlus, LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

import { dashboardNavItems } from "./dashboard-data"

function getUserInitials(name?: string | null) {
  const value = name?.trim()

  if (!value) {
    return "EC"
  }

  const [first = "", second = ""] = value.split(/\s+/)
  return `${first.charAt(0)}${second.charAt(0) || first.charAt(1) || ""}`.toUpperCase()
}

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardSidebar({
  newPracticeHref = "/dashboard/practice",
}: {
  newPracticeHref?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoggingOut } = useAuth()
  const navigationItems = dashboardNavItems.filter((item) => item.href !== newPracticeHref)
  const userInitials = getUserInitials(user?.name)
  const isPracticeRoute = pathname === newPracticeHref || pathname.startsWith(`${newPracticeHref}/`)

  async function handleLogout() {
    try {
      await logout()
      router.replace("/")
    } catch {
      return
    }
  }

  return (
    <aside className="w-full shrink-0 px-4 py-4 md:sticky md:top-0 md:self-start md:w-72 md:max-h-screen md:overflow-y-auto md:px-5 md:py-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="quiet-surface flex flex-col rounded-[2rem] border border-ec-outline-variant/15 p-4 md:min-h-[calc(100svh-2.5rem)]">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3 rounded-[1.35rem] px-3 py-3 transition-colors hover:bg-ec-surface-container-low"
        >
          <div className="signature-gradient flex size-11 shrink-0 items-center justify-center rounded-[1.15rem] shadow-[0_18px_42px_-24px_oklch(0.27_0.015_210/0.45)]">
            <span className="font-headline text-sm font-black tracking-[0.2em] text-ec-on-primary">
              EC
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-lg font-bold uppercase tracking-[0.2em] text-ec-primary transition-colors group-hover:text-ec-primary-dim"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              espejoCV
            </p>
            <p className="truncate text-xs text-ec-on-surface-variant">
              Panel de preparación
            </p>
          </div>
        </Link>

        <Separator className="my-5 bg-ec-outline-variant/15" />

        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ec-on-surface-variant">
            Navegación
          </p>

          <nav className="mt-3 flex flex-col gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isCurrent = isCurrentRoute(pathname, item.href)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
                    isCurrent
                      ? "bg-ec-primary-container/55 font-semibold text-ec-on-primary-container shadow-[0_18px_42px_-28px_oklch(0.27_0.015_210/0.4)] ring-1 ring-ec-primary/10"
                      : "text-ec-on-surface-variant hover:bg-ec-surface-container-low hover:text-ec-on-surface",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isCurrent
                        ? "bg-ec-surface-container-lowest/80 text-ec-primary"
                        : "bg-ec-surface-container text-ec-on-surface-variant",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="mt-6 space-y-3">
          {!isPracticeRoute && (
            <Button
              asChild
              size="lg"
              className="w-full justify-center rounded-2xl text-sm font-semibold"
            >
              <Link href={newPracticeHref}>
                <CirclePlus className="size-4" />
                Nueva práctica
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl border border-ec-outline-variant/15 bg-ec-surface-container-low px-3.5 py-3 text-left transition-colors hover:bg-ec-surface-container"
              >
                <Avatar size="lg" className="bg-ec-primary-container text-ec-on-primary-container after:border-transparent">
                  <AvatarFallback className="bg-transparent font-semibold text-ec-on-primary-container">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ec-on-surface">
                    {user?.name ?? "Usuario"}
                  </p>
                  <p className="truncate text-xs text-ec-on-surface-variant">
                    {user?.email ?? "Cuenta activa"}
                  </p>
                </div>

                <ChevronUp className="size-4 shrink-0 text-ec-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="rounded-2xl border border-ec-outline-variant/15 bg-ec-surface-container-lowest p-2 shadow-[0_24px_60px_-36px_oklch(0.27_0.015_210/0.28)]"
            >
              <DropdownMenuLabel className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ec-on-surface-variant">
                Sesión activa
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-ec-outline-variant/15" />
              <DropdownMenuItem
                variant="destructive"
                disabled={isLoggingOut}
                onSelect={() => void handleLogout()}
                className="rounded-xl px-3 py-2 text-sm font-medium"
              >
                <LogOut className="size-4" />
                {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}