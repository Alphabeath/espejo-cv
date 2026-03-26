"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import {
  listCurrentUserCvFiles,
  type UserCvFile,
} from "@/services/interview.service"

const emptyCvList: UserCvFile[] = []

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null
}

export function getUserCvsQueryKey(userId: string | null | undefined) {
  return ["user-cvs", userId ?? "guest"] as const
}

export function useUserCvs() {
  const queryClient = useQueryClient()
  const { user, isCheckingAuth, isAuthenticated } = useAuth()
  const userId = user?.$id
  const queryKey = getUserCvsQueryKey(userId)

  const userCvsQuery = useQuery<UserCvFile[]>({
    queryKey,
    queryFn: listCurrentUserCvFiles,
    enabled: Boolean(userId),
    placeholderData: (previousData) => previousData,
  })

  return {
    cvList: userCvsQuery.data ?? emptyCvList,
    isLoading: isCheckingAuth || (Boolean(userId) && userCvsQuery.isLoading),
    isFetching: userCvsQuery.isFetching,
    isAuthenticated,
    error: getErrorMessage(userCvsQuery.error),
    refreshCvs: async () => {
      if (!userId) {
        return emptyCvList
      }

      await queryClient.invalidateQueries({ queryKey })
      const result = await userCvsQuery.refetch()
      return result.data ?? emptyCvList
    },
  }
}