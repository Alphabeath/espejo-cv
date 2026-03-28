"use client"

import { useCallback, useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import { useUserCvs, getUserCvsQueryKey } from "@/hooks/useUserCvs"
import {
  updateUserName,
  hideCvFile,
  uploadCvFile,
  getUserPracticeHistory,
  type PracticeHistoryEntry,
} from "@/services/settings.service"

const emptyHistory: PracticeHistoryEntry[] = []

function getHistoryQueryKey(userId: string | null | undefined) {
  return ["settings-history", userId ?? "guest"] as const
}

export function useSettings() {
  const queryClient = useQueryClient()
  const { user, isCheckingAuth, refreshUser } = useAuth()
  const { cvList, isLoading: isLoadingCvs, refreshCvs } = useUserCvs()
  const userId = user?.$id

  // Practice history query
  const historyQuery = useQuery<PracticeHistoryEntry[]>({
    queryKey: getHistoryQueryKey(userId),
    queryFn: getUserPracticeHistory,
    enabled: Boolean(userId),
    placeholderData: (previousData) => previousData,
  })

  // Update name mutation
  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      await updateUserName(name)
    },
    onSuccess: () => {
      void refreshUser()
    },
  })

  // Hide CV mutation
  const hideCvMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await hideCvFile(fileId)
    },
    onSuccess: () => {
      void refreshCvs()
    },
  })

  // Upload CV mutation
  const uploadCvMutation = useMutation({
    mutationFn: async (file: File) => {
      return await uploadCvFile(file)
    },
    onSuccess: () => {
      void refreshCvs()
    },
  })

  return {
    // User profile
    user,
    isCheckingAuth,

    // CVs
    cvList,
    isLoadingCvs,

    // Practice history
    practiceHistory: historyQuery.data ?? emptyHistory,
    isLoadingHistory: isCheckingAuth || (Boolean(userId) && historyQuery.isLoading),
    hasPracticeHistory: (historyQuery.data ?? emptyHistory).length > 0,

    // Mutations
    updateName: updateNameMutation.mutateAsync,
    isUpdatingName: updateNameMutation.isPending,
    updateNameError: updateNameMutation.error,

    hideCv: hideCvMutation.mutateAsync,
    isHidingCv: hideCvMutation.isPending,

    uploadCv: uploadCvMutation.mutateAsync,
    isUploadingCv: uploadCvMutation.isPending,

    // Refresh
    refreshHistory: async () => {
      await queryClient.invalidateQueries({ queryKey: getHistoryQueryKey(userId) })
    },
  }
}
