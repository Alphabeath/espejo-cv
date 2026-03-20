"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/hooks/useAuth"

type AuthGuardMode = "protected" | "guest"

type AuthGuardProps = {
  children: React.ReactNode
  mode: AuthGuardMode
  redirectTo?: string
}

function buildLoginRedirect(pathname: string) {
  const params = new URLSearchParams({ redirectTo: pathname })
  return `/auth/login?${params.toString()}`
}

function GuardFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <div className="quiet-glass rounded-3xl px-6 py-4 text-sm text-ec-on-surface-variant">
        Verificando sesión...
      </div>
    </div>
  )
}

export function AuthGuard({ children, mode, redirectTo }: AuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isCheckingAuth } = useAuth()

  useEffect(() => {
    if (isCheckingAuth) {
      return
    }

    if (mode === "protected" && !isAuthenticated) {
      router.replace(redirectTo ?? buildLoginRedirect(pathname))
    }

    if (mode === "guest" && isAuthenticated) {
      router.replace(redirectTo ?? "/dashboard")
    }
  }, [isAuthenticated, isCheckingAuth, mode, pathname, redirectTo, router])

  if (isCheckingAuth) {
    return <GuardFallback />
  }

  if (mode === "protected" && !isAuthenticated) {
    return <GuardFallback />
  }

  if (mode === "guest" && isAuthenticated) {
    return <GuardFallback />
  }

  return <>{children}</>
}