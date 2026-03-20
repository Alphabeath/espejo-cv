"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import {
	getDashboardDataForUser,
	type DashboardData,
} from "@/services/dashboard.service"

type UseDashboardOptions = {
	limit?: number
}

const emptyDashboardData: DashboardData = {
	metrics: [
		{ label: "SCORE PROMEDIO", value: "0", unit: "%" },
		{ label: "SIMULACIONES", value: "0", unit: "" },
	],
	entries: [],
	summary: {
		averageScore: 0,
		simulations: 0,
		activeSessions: 0,
		completedSessions: 0,
		latestScore: null,
	},
}

export function getDashboardQueryKey(userId: string | null | undefined, limit: number) {
	return ["dashboard", userId ?? "guest", limit] as const
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : null
}

export function useDashboard(options: UseDashboardOptions = {}) {
	const { limit = 4 } = options
	const queryClient = useQueryClient()
	const { user, isCheckingAuth, isAuthenticated } = useAuth()
	const userId = user?.$id
	const queryKey = getDashboardQueryKey(userId, limit)

	const dashboardQuery = useQuery<DashboardData>({
		queryKey,
		queryFn: () => getDashboardDataForUser(userId as string, limit),
		enabled: Boolean(userId),
		placeholderData: (previousData) => previousData,
	})

	const data = dashboardQuery.data ?? emptyDashboardData

	return {
		data,
		entries: data.entries,
		metrics: data.metrics,
		summary: data.summary,
		isLoading: isCheckingAuth || (Boolean(userId) && dashboardQuery.isLoading),
		isFetching: dashboardQuery.isFetching,
		isAuthenticated,
		hasEntries: data.entries.length > 0,
		error: getErrorMessage(dashboardQuery.error),
		refreshDashboard: async () => {
			if (!userId) {
				return emptyDashboardData
			}

			await queryClient.invalidateQueries({ queryKey })
			const result = await dashboardQuery.refetch()
			return result.data ?? emptyDashboardData
		},
	}
}