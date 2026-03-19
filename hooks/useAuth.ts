"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Models } from "appwrite"

import {
	getCurrentUser,
	signIn,
	signOut,
	signUp,
} from "@/services/auth.service"

export type AuthUser = Models.User<Models.Preferences>

type AuthCredentials = {
	email: string
	password: string
}

const authUserQueryKey = ["auth", "user"] as const

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback
}

export function useAuth() {
	const queryClient = useQueryClient()

	const userQuery = useQuery({
		queryKey: authUserQueryKey,
		queryFn: getCurrentUser,
		retry: false,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})

	const loginMutation = useMutation({
		mutationFn: async ({ email, password }: AuthCredentials) => {
			await signIn(email, password)
			return getCurrentUser()
		},
		onSuccess: (user) => {
			queryClient.setQueryData(authUserQueryKey, user)
		},
	})

	const registerMutation = useMutation({
		mutationFn: async ({ name, email, password }: AuthCredentials & { name: string }) => {
			return signUp(name, email, password)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: authUserQueryKey })
		},
	})

	const logoutMutation = useMutation({
		mutationFn: signOut,
		onSuccess: () => {
			queryClient.setQueryData(authUserQueryKey, null)
		},
	})

	return {
		user: userQuery.data ?? null,
		isLoading:
			userQuery.isLoading ||
			loginMutation.isPending ||
			registerMutation.isPending ||
			logoutMutation.isPending,
		error:
			getErrorMessage(userQuery.error, "") ||
			getErrorMessage(loginMutation.error, "") ||
			getErrorMessage(registerMutation.error, "") ||
			getErrorMessage(logoutMutation.error, "") ||
			null,
		login: async (credentials: AuthCredentials) => loginMutation.mutateAsync(credentials),
		register: async (credentials: AuthCredentials) => registerMutation.mutateAsync(credentials),
		logout: async () => logoutMutation.mutateAsync(),
		refreshUser: async () => {
			await queryClient.invalidateQueries({ queryKey: authUserQueryKey })
			return userQuery.refetch()
		},
		isAuthenticated: Boolean(userQuery.data),
	}
}
