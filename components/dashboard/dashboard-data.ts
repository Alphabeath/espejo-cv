import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, MessageSquareText, ReceiptText, Settings } from "lucide-react"

export type {
  DashboardHistoryEntry as PracticeHistoryEntry,
  DashboardMetric,
} from "@/services/dashboard.service"

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Práctica", href: "/dashboard/practice", icon: ReceiptText },
  { label: "Feedback", href: "/dashboard/feedback", icon: MessageSquareText },
  { label: "Configuración", href: "/dashboard/settings", icon: Settings },
]

