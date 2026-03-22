import { ID, Permission, Role } from "appwrite"
import { createAppwriteServices } from "@/lib/appwrite"

const CV_FILES_BUCKET_ID = "cv-files"

function getAccount() {
  return createAppwriteServices().account
}

function getStorage() {
  return createAppwriteServices().storage
}

export async function updateUserName(name: string) {
  return await getAccount().updateName(name)
}

export async function updateUserEmail(email: string, password: string) {
  return await getAccount().updateEmail(email, password)
}

export async function updatePreferences(prefs: Record<string, any>) {
  return await getAccount().updatePrefs(prefs)
}

export async function uploadCvFile(file: File) {
  const user = await getAccount().get()
  
  // Appwrite requires explicit permissions when File Security is enabled on the bucket
  const permissions = [
    Permission.read(Role.user(user.$id)),
    Permission.write(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id))
  ]

  return await getStorage().createFile(
    CV_FILES_BUCKET_ID, 
    ID.unique(), 
    file,
    permissions
  )
}

export async function deleteCvFile(fileId: string) {
  return await getStorage().deleteFile(CV_FILES_BUCKET_ID, fileId)
}

// For downloading, we can resolve the download URL directly
export function getCvDownloadUrl(fileId: string) {
  const { storage } = createAppwriteServices()
  return storage.getFileDownload(CV_FILES_BUCKET_ID, fileId).toString()
}
