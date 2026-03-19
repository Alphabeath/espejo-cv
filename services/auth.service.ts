import { ID } from "appwrite"

import { createAppwriteServices } from "@/lib/appwrite"

function getAccount() {
  return createAppwriteServices().account
}

function isUnauthorizedError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 401
  )
}

export async function signUp(name: string, email: string, password: string) {
  return getAccount().create(ID.unique(), email, password, name)
}

export async function signIn(email: string, password: string) {
  return getAccount().createEmailPasswordSession(email, password)
}

export async function signOut() {
  try {
    return await getAccount().deleteSession("current")
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return null
    }

    throw error
  }
}

export async function getCurrentUser() {
  try {
    return await getAccount().get()
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return null
    }

    throw error
  }
}

