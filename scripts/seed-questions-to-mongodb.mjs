import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadDotEnv() {
  const envPath = path.join(rootDir, '.env')

  try {
    const text = readFileSync(envPath, 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (!match) continue
      const [, key, rawValue] = match
      if (process.env[key] !== undefined) continue
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
    }
  } catch {
    // The script also supports env vars supplied by the shell/CI.
  }
}

loadDotEnv()

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME ?? 'interviews'

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set.')
}

const seedPath = path.join(rootDir, 'scripts', 'questions.seed.json')
const questions = JSON.parse(readFileSync(seedPath, 'utf8'))

if (!Array.isArray(questions)) {
  throw new Error('scripts/questions.seed.json must contain an array.')
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const collection = client.db(dbName).collection('questions')

  await collection.createIndex({ id: 1 }, { unique: true })
  await collection.createIndex({ archivedAt: 1, order: 1 })
  await collection.createIndex({ category: 1, difficulty: 1 })
  await collection.createIndex({ companies: 1 })
  await collection.createIndex({ tags: 1 })

  const now = new Date()
  const operations = questions.map((question, index) => ({
    updateOne: {
      filter: { id: question.id },
      update: {
        $set: {
          ...question,
          order: typeof question.order === 'number' ? question.order : index,
          updatedAt: now,
          archivedAt: null,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      upsert: true,
    },
  }))

  if (operations.length > 0) {
    const result = await collection.bulkWrite(operations, { ordered: false })
    console.log(
      `Seeded ${operations.length} questions into ${dbName}.questions ` +
        `(inserted: ${result.upsertedCount}, matched: ${result.matchedCount}, modified: ${result.modifiedCount}).`,
    )
  } else {
    console.log('No questions found in scripts/questions.seed.json.')
  }
} finally {
  await client.close()
}
