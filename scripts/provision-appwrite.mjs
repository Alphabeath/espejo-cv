import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..")
const ENV_PATH = path.join(PROJECT_ROOT, ".env")
const DATABASE_ID = "espejo_cv"
const BUCKET_ID = "cv-files"
const TTS_BUCKET_ID = "tts-audio"

function readEnvFile(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

function getEnvValue(envContent, key) {
  const match = envContent.match(new RegExp(`^${key}\\s*=\\s*\"?([^\"\\n]+)\"?$`, "m"))

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
      { key: "userId", type: "varchar", size: 255, required: true },
      { key: "cvFileId", type: "varchar", size: 255, required: true },
      { key: "cvText", type: "longtext", required: true },
      { key: "status", type: "varchar", size: 64, required: true },
      { key: "startedAt", type: "datetime", required: true },
      { key: "completedAt", type: "datetime", required: false },
      { key: "lastActivityAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "idx_user_startedAt", type: "key", attributes: ["userId", "startedAt"] },
      { key: "idx_user_status", type: "key", attributes: ["userId", "status"] },
      { key: "idx_status_lastActivityAt", type: "key", attributes: ["status", "lastActivityAt"] },
    ],
  },
  {
    id: "job_offers",
    name: "Job Offers",
    attributes: [
      { key: "title", type: "varchar", size: 255, required: false },
      { key: "company", type: "varchar", size: 255, required: false },
      { key: "sourceUrl", type: "url", required: false },
      { key: "rawText", type: "longtext", required: true },
      { key: "normalizedText", type: "longtext", required: true },
      { key: "seniority", type: "varchar", size: 128, required: false },
      { key: "createdAt", type: "datetime", required: true },
    ],
    indexes: [],
  },
  {
    id: "interview_turns",
    name: "Interview Turns",
    attributes: [
      { key: "turnIndex", type: "integer", required: true },
      { key: "question", type: "text", required: true },
      { key: "answer", type: "longtext", required: false },
      { key: "score", type: "integer", required: false },
      { key: "feedback", type: "longtext", required: false },
      { key: "status", type: "varchar", size: 64, required: true },
      { key: "askedAt", type: "datetime", required: true },
      { key: "answeredAt", type: "datetime", required: false },
      { key: "questionAudioFileId", type: "varchar", size: 255, required: false },
    ],
    indexes: [
      { key: "idx_status_askedAt", type: "key", attributes: ["status", "askedAt"] },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    attributes: [
      { key: "overallScore", type: "integer", required: true },
      { key: "summary", type: "longtext", required: true },
      { key: "strengths", type: "longtext", required: false },
      { key: "gaps", type: "longtext", required: false },
      { key: "recommendations", type: "longtext", required: false },
      { key: "confidence", type: "integer", required: false },
      { key: "generatedAt", type: "datetime", required: true },
      { key: "modelVersion", type: "varchar", size: 128, required: false },
    ],
    indexes: [
      { key: "idx_overallScore", type: "key", attributes: ["overallScore"] },
      { key: "idx_generatedAt", type: "key", attributes: ["generatedAt"] },
    ],
  },
]

const relationships = [
  {
    collectionId: "cv_sessions",
    key: "jobOffer",
    relatedCollectionId: "job_offers",
    type: "oneToOne",
    twoWay: true,
    twoWayKey: "cvSession",
    onDelete: "cascade",
  },
  {
    collectionId: "cv_sessions",
    key: "interviewTurns",
    relatedCollectionId: "interview_turns",
    type: "oneToMany",
    twoWay: true,
    twoWayKey: "cvSession",
    onDelete: "cascade",
  },
  {
    collectionId: "cv_sessions",
    key: "report",
    relatedCollectionId: "reports",
    type: "oneToOne",
    twoWay: true,
    twoWayKey: "cvSession",
    onDelete: "cascade",
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

const ttsBucket = {
  bucketId: TTS_BUCKET_ID,
  name: "TTS Audio",
  permissions: [],
  fileSecurity: true,
  enabled: true,
  maximumFileSize: 5000000,
  allowedFileExtensions: ["mp3"],
  compression: "none",
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

async function ensureTtsBucket() {
  try {
    const existing = await request(`/storage/buckets/${TTS_BUCKET_ID}`)
    console.log(`bucket ${TTS_BUCKET_ID}: exists`)
    return existing
  } catch (error) {
    if (error.status !== 404) throw error
  }

  const created = await request("/storage/buckets", {
    method: "POST",
    body: JSON.stringify(ttsBucket),
  })

  console.log(`bucket ${TTS_BUCKET_ID}: created`)
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

async function getAttribute(collectionId, attributeKey) {
  const attributes = await listAttributes(collectionId)
  return attributes.find((item) => item.key === attributeKey) ?? null
}

async function ensureAttribute(collectionId, attribute) {
  const existing = await getAttribute(collectionId, attribute.key)

  if (existing) {
    console.log(`attribute ${collectionId}.${attribute.key}: exists`)
    return
  }

  const payload = {
    key: attribute.key,
    required: attribute.required,
    array: false,
  }

  if (attribute.type === "string" || attribute.type === "varchar") {
    payload.size = attribute.size
  }

  await request(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${attribute.type}`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  console.log(`attribute ${collectionId}.${attribute.key}: created`)
}

async function ensureRelationship(relationship) {
  const existing = await getAttribute(relationship.collectionId, relationship.key)

  if (existing) {
    if (existing.type === "relationship") {
      console.log(`relationship ${relationship.collectionId}.${relationship.key}: exists`)
      return
    }

    throw new Error(
      `Attribute ${relationship.collectionId}.${relationship.key} already exists and is not a relationship`,
    )
  }

  await request(
    `/databases/${DATABASE_ID}/collections/${relationship.collectionId}/attributes/relationship`,
    {
      method: "POST",
      body: JSON.stringify({
        relatedCollectionId: relationship.relatedCollectionId,
        type: relationship.type,
        twoWay: relationship.twoWay,
        key: relationship.key,
        twoWayKey: relationship.twoWayKey,
        onDelete: relationship.onDelete,
      }),
    },
  )

  console.log(`relationship ${relationship.collectionId}.${relationship.key}: created`)
}

async function waitForRelationship(relationship) {
  const keys = [relationship.key]
  await waitForAttributes(relationship.collectionId, keys)

  if (relationship.twoWay && relationship.twoWayKey) {
    await waitForAttributes(relationship.relatedCollectionId, [relationship.twoWayKey])
  }
}

async function getDocumentsTotal(collectionId) {
  const result = await request(`/databases/${DATABASE_ID}/collections/${collectionId}/documents`)
  return result.total ?? 0
}

function getAttributeDefinition(collectionId, attributeKey) {
  const collection = collections.find((item) => item.id === collectionId)
  return collection?.attributes.find((attribute) => attribute.key === attributeKey) ?? null
}

async function recreateAttribute(collectionId, attribute) {
  await request(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${attribute.key}`, {
    method: "DELETE",
  })

  await ensureAttribute(collectionId, attribute)
}

async function recoverStuckAttributes(collectionId, keys) {
  const total = await getDocumentsTotal(collectionId)

  if (total !== 0) {
    return false
  }

  const attributes = await listAttributes(collectionId)
  const stuckKeys = keys.filter((key) => {
    const status = attributes.find((attribute) => attribute.key === key)?.status
    return status === "processing" || status === "stuck" || status === "failed"
  })

  if (stuckKeys.length === 0) {
    return false
  }

  for (const key of stuckKeys) {
    const attribute = getAttributeDefinition(collectionId, key)

    if (!attribute) {
      continue
    }

    console.log(`attribute ${collectionId}.${key}: recreating after stalled processing`)
    await recreateAttribute(collectionId, attribute)
  }

  return true
}

async function waitForAttributes(collectionId, keys, attempt = 0) {
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

  if (attempt === 0) {
    const recovered = await recoverStuckAttributes(collectionId, keys)

    if (recovered) {
      return waitForAttributes(collectionId, keys, 1)
    }
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
  await ensureTtsBucket()

  for (const collection of collections) {
    await ensureCollection(collection)
  }

  for (const collection of collections) {
    for (const attribute of collection.attributes) {
      await ensureAttribute(collection.id, attribute)
    }
  }

  for (const collection of collections) {
    await waitForAttributes(
      collection.id,
      collection.attributes.map((attribute) => attribute.key),
    )
  }

  for (const relationship of relationships) {
    await ensureRelationship(relationship)
  }

  for (const relationship of relationships) {
    await waitForRelationship(relationship)
  }

  for (const collection of collections) {
    for (const index of collection.indexes) {
      await ensureIndex(collection.id, index)
    }
  }

  console.log("provisioning: complete")
}

main().catch((error) => {
  console.error("provisioning: failed")
  console.error(error.data ? JSON.stringify(error.data, null, 2) : error.message)
  process.exitCode = 1
})