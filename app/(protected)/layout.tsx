"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardSidebar } from "@/components/dashboard"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard mode="protected">
      <div className="min-h-svh text-ec-on-surface md:flex md:items-start">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AuthGuard>
  )
}