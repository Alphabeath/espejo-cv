import fs from "node:fs"

const WORKSPACE_ROOT = "/home/bryan/Proyectos/hackaton-cubepath"
const ENV_PATH = `${WORKSPACE_ROOT}/.env`
const DATABASE_ID = "espejo_cv"
const BUCKET_ID = "cv-files"

function readEnvFile(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

function getEnvValue(envContent, key) {
  const match = envContent.match(new RegExp(`^${key} = \"([^\"]+)\"$`, "m"))

  if (!match) {
    throw new Error(`Missing ${key} in ${ENV_PATH}`)
  }

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

const collections = [
  {
    id: "cv_sessions",
    name: "CV Sessions",
    attributes: [
      { key: "userId", type: "string", size: 255, required: true },
      { key: "cvFileId", type: "string", size: 255, required: true },
      { key: "cvText", type: "string", size: 65535, required: true },
      { key: "jobOfferText", type: "string", size: 65535, required: true },
      { key: "jobOfferSource", type: "string", size: 64, required: true },
      { key: "jobOfferTitle", type: "string", size: 255, required: false },
      { key: "status", type: "string", size: 64, required: true },
      { key: "matchScore", type: "integer", required: false },
      { key: "strengthsCount", type: "integer", required: false },
      { key: "gapsCount", type: "integer", required: false },
      { key: "questionCount", type: "integer", required: false },
      { key: "startedAt", type: "datetime", required: true },
      { key: "completedAt", type: "datetime", required: false },
      { key: "lastActivityAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "idx_user_startedAt", type: "key", attributes: ["userId", "startedAt"] },
      { key: "idx_user_status", type: "key", attributes: ["userId", "status"] },
      { key: "idx_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "job_offers",
    name: "Job Offers",
    attributes: [
      { key: "sessionId", type: "string", size: 255, required: true },
      { key: "title", type: "string", size: 255, required: false },
      { key: "company", type: "string", size: 255, required: false },
      { key: "sourceUrl", type: "string", size: 2048, required: false },
      { key: "rawText", type: "string", size: 65535, required: true },
      { key: "normalizedText", type: "string", size: 65535, required: true },
      { key: "requirementsJson", type: "string", size: 65535, required: false },
      { key: "seniority", type: "string", size: 128, required: false },
      { key: "keywords", type: "string", size: 65535, required: false },
      { key: "riskSignals", type: "string", size: 65535, required: false },
      { key: "createdAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "idx_sessionId", type: "key", attributes: ["sessionId"] },
      { key: "idx_title", type: "key", attributes: ["title"] },
    ],
  },
  {
    id: "interview_turns",
    name: "Interview Turns",
    attributes: [
      { key: "sessionId", type: "string", size: 255, required: true },
      { key: "turnIndex", type: "integer", required: true },
      { key: "question", type: "string", size: 8192, required: true },
      { key: "answer", type: "string", size: 65535, required: false },
      { key: "expectedSignal", type: "string", size: 2048, required: false },
      { key: "score", type: "integer", required: false },
      { key: "feedback", type: "string", size: 65535, required: false },
      { key: "status", type: "string", size: 64, required: true },
      { key: "askedAt", type: "datetime", required: true },
      { key: "answeredAt", type: "datetime", required: false },
    ],
    indexes: [
      { key: "idx_sessionId", type: "key", attributes: ["sessionId"] },
      { key: "idx_session_turnIndex", type: "key", attributes: ["sessionId", "turnIndex"] },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    attributes: [
      { key: "sessionId", type: "string", size: 255, required: true },
      { key: "overallScore", type: "integer", required: true },
      { key: "summary", type: "string", size: 65535, required: true },
      { key: "strengths", type: "string", size: 65535, required: false },
      { key: "gaps", type: "string", size: 65535, required: false },
      { key: "recommendations", type: "string", size: 65535, required: false },
      { key: "confidence", type: "integer", required: false },
      { key: "generatedAt", type: "datetime", required: true },
      { key: "modelVersion", type: "string", size: 128, required: false },
    ],
    indexes: [
      { key: "idx_sessionId_unique", type: "unique", attributes: ["sessionId"] },
      { key: "idx_overallScore", type: "key", attributes: ["overallScore"] },
    ],
  },
]

const bucket = {
  bucketId: BUCKET_ID,
  name: "CV Files",
  permissions: [],
  fileSecurity: true,
  enabled: true,
  maximumFileSize: 30000000,
  allowedFileExtensions: ["pdf"],
  compression: "gzip",
  encryption: true,
  antivirus: true,
}

async function request(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} ${path}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

async function ensureDatabase() {
  try {
    const database = await request(`/databases/${DATABASE_ID}`)
    console.log(`database ${DATABASE_ID}: exists`)
    return database
  } catch (error) {
    if (error.status !== 404) throw error
  }

  const created = await request("/databases", {
    method: "POST",
    body: JSON.stringify({
      databaseId: DATABASE_ID,
      name: "Espejo CV",
      enabled: true,
    }),
  })

  console.log(`database ${DATABASE_ID}: created`)
  return created
}

async function ensureBucket() {
  try {
    const existing = await request(`/storage/buckets/${BUCKET_ID}`)
    console.log(`bucket ${BUCKET_ID}: exists`)
    return existing
  } catch (error) {
    if (error.status !== 404) throw error
  }

  const created = await request("/storage/buckets", {
    method: "POST",
    body: JSON.stringify(bucket),
  })

  console.log(`bucket ${BUCKET_ID}: created`)
  return created
}

async function ensureCollection(collection) {
  try {
    const existing = await request(`/databases/${DATABASE_ID}/collections/${collection.id}`)
    console.log(`collection ${collection.id}: exists`)
    return existing
  } catch (error) {
    if (error.status !== 404) throw error
  }

  const created = await request(`/databases/${DATABASE_ID}/collections`, {
    method: "POST",
    body: JSON.stringify({
      collectionId: collection.id,
      name: collection.name,
      permissions: [],
      documentSecurity: true,
      enabled: true,
    }),
  })

  console.log(`collection ${collection.id}: created`)
  return created
}

async function listAttributes(collectionId) {
  const result = await request(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes`)
  return result.attributes ?? []
}

async function ensureAttribute(collectionId, attribute) {
  const attributes = await listAttributes(collectionId)

  if (attributes.some((item) => item.key === attribute.key)) {
    console.log(`attribute ${collectionId}.${attribute.key}: exists`)
    return
  }

  const payload = {
    key: attribute.key,
    required: attribute.required,
    array: false,
  }

  if (attribute.type === "string") {
    payload.size = attribute.size
  }

  await request(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${attribute.type}`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  console.log(`attribute ${collectionId}.${attribute.key}: created`)
}

async function waitForAttributes(collectionId, keys) {
  const timeoutAt = Date.now() + 120000

  while (Date.now() < timeoutAt) {
    const attributes = await listAttributes(collectionId)
    const states = new Map(attributes.map((attribute) => [attribute.key, attribute.status]))
    const failed = keys.filter((key) => ["failed", "stuck"].includes(states.get(key)))

    if (failed.length > 0) {
      throw new Error(`Attributes failed in ${collectionId}: ${failed.join(", ")}`)
    }

    if (keys.every((key) => states.get(key) === "available")) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  throw new Error(`Timeout waiting for attributes in ${collectionId}`)
}

async function listIndexes(collectionId) {
  const result = await request(`/databases/${DATABASE_ID}/collections/${collectionId}/indexes`)
  return result.indexes ?? []
}

async function waitForIndex(collectionId, indexKey) {
  const timeoutAt = Date.now() + 120000

  while (Date.now() < timeoutAt) {
    const indexes = await listIndexes(collectionId)
    const index = indexes.find((item) => item.key === indexKey)

    if (!index) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      continue
    }

    if (index.status === "available") {
      return index
    }

    if (index.status === "failed" || index.status === "stuck") {
      const error = new Error(`Index ${collectionId}.${indexKey} failed`)
      error.data = index
      throw error
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  throw new Error(`Timeout waiting for index ${collectionId}.${indexKey}`)
}

async function recreateIntegerAttribute(collectionId, attributeKey) {
  const documents = await request(`/databases/${DATABASE_ID}/collections/${collectionId}/documents`)

  if (documents.total !== 0) {
    throw new Error(`Cannot recreate ${collectionId}.${attributeKey} because the collection already has documents`)
  }

  await request(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${attributeKey}`, {
    method: "DELETE",
  })

  await request(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes/integer`, {
    method: "POST",
    body: JSON.stringify({ key: attributeKey, required: true, array: false }),
  })

  await waitForAttributes(collectionId, [attributeKey])
}

async function ensureIndex(collectionId, index) {
  const indexes = await listIndexes(collectionId)
  const existing = indexes.find((item) => item.key === index.key)

  if (existing?.status === "available") {
    console.log(`index ${collectionId}.${index.key}: exists`)
    return
  }

  if (existing) {
    await request(`/databases/${DATABASE_ID}/collections/${collectionId}/indexes/${index.key}`, {
      method: "DELETE",
    })
  }

  await request(`/databases/${DATABASE_ID}/collections/${collectionId}/indexes`, {
    method: "POST",
    body: JSON.stringify({
      key: index.key,
      type: index.type,
      attributes: index.attributes,
      orders: index.attributes.map(() => "ASC"),
    }),
  })

  try {
    await waitForIndex(collectionId, index.key)
  } catch (error) {
    const isReportsOverallScore = collectionId === "reports" && index.key === "idx_overallScore"
    const isMissingOverallScore = error.data?.error?.includes("overallScore")

    if (!isReportsOverallScore || !isMissingOverallScore) {
      throw error
    }

    console.log("index reports.idx_overallScore: recreating attribute and retrying")
    await request(`/databases/${DATABASE_ID}/collections/${collectionId}/indexes/${index.key}`, {
      method: "DELETE",
    })
    await recreateIntegerAttribute(collectionId, "overallScore")
    await request(`/databases/${DATABASE_ID}/collections/${collectionId}/indexes`, {
      method: "POST",
      body: JSON.stringify({
        key: index.key,
        type: index.type,
        attributes: index.attributes,
        orders: index.attributes.map(() => "ASC"),
      }),
    })
    await waitForIndex(collectionId, index.key)
  }

  console.log(`index ${collectionId}.${index.key}: ready`)
}

async function provisionCollection(collection) {
  await ensureCollection(collection)

  for (const attribute of collection.attributes) {
    await ensureAttribute(collection.id, attribute)
  }

  await waitForAttributes(
    collection.id,
    collection.attributes.map((attribute) => attribute.key),
  )

  for (const index of collection.indexes) {
    await ensureIndex(collection.id, index)
  }
}

async function main() {
  await ensureDatabase()
  await ensureBucket()

  for (const collection of collections) {
    await provisionCollection(collection)
  }

  console.log("provisioning: complete")
}

main().catch((error) => {
  console.error("provisioning: failed")
  console.error(error.data ? JSON.stringify(error.data, null, 2) : error.message)
  process.exitCode = 1
})