import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..")
const ENV_PATH = path.join(PROJECT_ROOT, ".env")
const BUCKET_ID = "cv-files"

function readEnvFile(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

function getEnvValue(envContent, key) {
  const match = envContent.match(new RegExp(`^${key}\\s*=\\s*\"?([^\"\\n]+)\"?$`, "m"))
  if (!match) throw new Error(`Missing ${key} in ${ENV_PATH}`)
  return match[1]
}

const envContent = readEnvFile(ENV_PATH)
const endpoint = getEnvValue(envContent, "NEXT_PUBLIC_APPWRITE_ENDPOINT")
const projectId = getEnvValue(envContent, "NEXT_PUBLIC_APPWRITE_PROJECT_ID")
const apiKey = getEnvValue(envContent, "APPWRITE_API_KEY")

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Key": apiKey,
  "X-Appwrite-Project": projectId,
}

async function request(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  })

  const text = await response.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!response.ok) {
    console.error(`HTTP ${response.status} ${path}`, data)
    throw new Error(`HTTP ${response.status}`)
  }
  return data
}

async function main() {
  console.log("Updating Bucket permissions to allow users to create files...")
  
  // Update bucket to allow all signed-in users to create files, 
  // but keep fileSecurity: true so they can't see each other's files
  await request(`/storage/buckets/${BUCKET_ID}`, {
    method: "PUT",
    body: JSON.stringify({
      name: "CV Files",
      permissions: [
        'create("users")',
        'read("users")',
        'update("users")',
        'delete("users")'
      ],
      fileSecurity: true,
      enabled: true,
      maximumFileSize: 30000000,
      allowedFileExtensions: ["pdf"],
      compression: "gzip",
      encryption: true,
      antivirus: true,
    }),
  })

  console.log("Bucket updated successfully.")
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
