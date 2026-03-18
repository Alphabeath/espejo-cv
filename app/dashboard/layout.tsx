import Link from "next/link"
import { Bell, Settings, UserRound } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <div className="flex size-8 items-center justify-center rounded-full bg-ec-primary-container">
            <UserRound className="size-4 text-ec-on-primary-container" />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
