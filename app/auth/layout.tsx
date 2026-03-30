"use client"

import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard mode="guest" redirectTo="/dashboard">
            <section className="quiet-shell flex min-h-svh w-full flex-col items-center justify-center px-6 py-10 md:px-10">
                <div className="mb-6 w-full max-w-md text-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold uppercase tracking-widest text-ec-primary transition-colors hover:text-ec-primary-dim"
                        style={{ fontFamily: "var(--font-headline)" }}
                    >
                        espejoCV
                    </Link>
                </div>
                <div className="w-full max-w-md">{children}</div>
            </section>
        </AuthGuard>
    )
}