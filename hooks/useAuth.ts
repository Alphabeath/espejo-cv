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

type RegisterCredentials = AuthCredentials & {
	name: string
}

const authUserQueryKey = ["auth", "user"] as const

const AUTH_ERROR_MESSAGES = {
	login: "No pudimos iniciar sesión en este momento. Verifica tus credenciales e inténtalo nuevamente.",
	register: "No pudimos crear tu cuenta en este momento. Intenta nuevamente.",
	logout: "No pudimos cerrar tu sesión en este momento. Intenta nuevamente.",
	default: "Ocurrió un problema con la autenticación. Intenta nuevamente.",
} as const

function getErrorMessage(error: unknown, fallback: string) {
	return error ? fallback : ""
}

export function useAuth() {
	const queryClient = useQueryClient()

	const userQuery = useQuery<AuthUser | null>({
		queryKey: authUserQueryKey,
		queryFn: getCurrentUser,
		retry: false,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})

	const loginMutation = useMutation<AuthUser | null, Error, AuthCredentials>({
		mutationFn: async ({ email, password }: AuthCredentials) => {
			await signIn(email, password)
			return getCurrentUser()
		},
		onSuccess: (user: AuthUser | null) => {
			queryClient.setQueryData(authUserQueryKey, user)
		},
	})

	const registerMutation = useMutation<AuthUser, Error, RegisterCredentials>({
		mutationFn: async ({ name, email, password }: RegisterCredentials) => {
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
			loginMutation.isPending ||
			registerMutation.isPending ||
			logoutMutation.isPending,
		isCheckingAuth: userQuery.isLoading,
		isLoggingIn: loginMutation.isPending,
		isRegistering: registerMutation.isPending,
		isLoggingOut: logoutMutation.isPending,
		error:
			getErrorMessage(userQuery.error, AUTH_ERROR_MESSAGES.default) ||
			getErrorMessage(loginMutation.error, AUTH_ERROR_MESSAGES.login) ||
			getErrorMessage(registerMutation.error, AUTH_ERROR_MESSAGES.register) ||
			getErrorMessage(logoutMutation.error, AUTH_ERROR_MESSAGES.logout) ||
			null,
		login: async (credentials: AuthCredentials) => loginMutation.mutateAsync(credentials),
		register: async (credentials: RegisterCredentials) => registerMutation.mutateAsync(credentials),
		logout: async () => logoutMutation.mutateAsync(),
		clearError: () => {
			loginMutation.reset()
			registerMutation.reset()
			logoutMutation.reset()
		},
		refreshUser: async () => {
			await queryClient.invalidateQueries({ queryKey: authUserQueryKey })
			return userQuery.refetch()
		},
		isAuthenticated: Boolean(userQuery.data),
	}
}
