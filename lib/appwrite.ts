import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  ID,
  Locale,
  Permission,
  Query,
  Realtime,
  Role,
  Storage,
  Teams,
} from "appwrite"

export type AppwriteConfig = {
  endpoint: string
  projectId: string
  projectName?: string
  apiKey?: string
}

export function getAppwriteConfig(): AppwriteConfig {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  const projectName = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME
  const apiKey = process.env.APPWRITE_API_KEY

  if (!endpoint || !projectId) {
    throw new Error(
      "Missing Appwrite environment variables. Define NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID.",
    )
  }

  return {
    endpoint,
    projectId,
    projectName,
    apiKey,
  }
}

export function createAppwriteClient() {
  const { endpoint, projectId } = getAppwriteConfig()

  return new Client().setEndpoint(endpoint).setProject(projectId)
}

export function createAppwriteServices(client = createAppwriteClient()) {
  return {
    account: new Account(client),
    avatars: new Avatars(client),
    databases: new Databases(client),
    functions: new Functions(client),
    locale: new Locale(client),
    realtime: new Realtime(client),
    storage: new Storage(client),
    teams: new Teams(client),
  }
}

export const appwrite = {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  ID,
  Locale,
  Permission,
  Query,
  Realtime,
  Role,
  Storage,
  Teams,
}
