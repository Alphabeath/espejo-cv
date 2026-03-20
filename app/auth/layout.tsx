"use client"

import { AuthGuard } from "@/components/auth/auth-guard"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard mode="guest" redirectTo="/dashboard">
            <section className="quiet-shell flex min-h-svh w-full items-center justify-center px-6 py-10 md:px-10">
                <div className="w-full max-w-md">{children}</div>
            </section>
        </AuthGuard>
    )
}