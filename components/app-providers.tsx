"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { ToastProvider } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppProviders({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry: false,
						refetchOnWindowFocus: false,
						staleTime: 5 * 60 * 1000,
					},
					mutations: {
						retry: false,
					},
				},
			}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			<ToastProvider>
				<TooltipProvider>{children}</TooltipProvider>
			</ToastProvider>
			{process.env.NODE_ENV === "development" ? (
				<ReactQueryDevtools initialIsOpen={false} />
			) : null}
		</QueryClientProvider>
	)
}