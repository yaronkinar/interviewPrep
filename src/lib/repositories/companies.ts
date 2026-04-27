import { getDb } from '@/lib/mongodb'
import type { Company, CompanyDocument, CompanyInput } from '@/lib/models/Company'
import { COMPANIES } from '@/questions/data'

const COLLECTION_NAME = 'companies'

let indexesReadyPromise: Promise<unknown> | null = null

async function getCompaniesCollection() {
  const db = await getDb()
  const collection = db.collection<CompanyDocument>(COLLECTION_NAME)

  if (!indexesReadyPromise) {
    indexesReadyPromise = Promise.all([
      collection.createIndex({ id: 1 }, { unique: true }),
      collection.createIndex({ archivedAt: 1, order: 1 }),
    ])
  }

  await indexesReadyPromise
  return collection
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

export function normalizeCompanyInput(raw: unknown): { ok: true; company: CompanyInput } | { ok: false; error: string } {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, error: 'Company payload must be an object.' }
  }

  const input = raw as Record<string, unknown>
  const id = asTrimmedString(input.id)
  const emoji = asTrimmedString(input.emoji)
  const color = asTrimmedString(input.color)
  const order = typeof input.order === 'number' && Number.isFinite(input.order) ? input.order : undefined

  if (!id) return { ok: false, error: 'Company id is required.' }
  if (!emoji) return { ok: false, error: 'Company emoji is required.' }
  if (!color) return { ok: false, error: 'Company color is required.' }
  if (!isHexColor(color)) return { ok: false, error: 'Company color must be a #RRGGBB hex value.' }

  return {
    ok: true,
    company: {
      id,
      emoji,
      color,
      ...(order !== undefined ? { order } : {}),
    },
  }
}

export function toPublicCompany(document: CompanyDocument): Company {
  return {
    id: document.id,
    emoji: document.emoji,
    color: document.color,
  }
}

export async function listCompanies(options: { includeArchived?: boolean } = {}) {
  const companies = await getCompaniesCollection()
  const filter = options.includeArchived ? {} : { archivedAt: null }
  const docs = await companies.find(filter).sort({ order: 1, id: 1 }).toArray()
  return docs.map(toPublicCompany)
}

export async function listCompanyDocuments(options: { includeArchived?: boolean } = {}) {
  const companies = await getCompaniesCollection()
  const filter = options.includeArchived ? {} : { archivedAt: null }
  return companies.find(filter).sort({ order: 1, id: 1 }).toArray()
}

export async function getCompanyById(id: string, options: { includeArchived?: boolean } = {}) {
  const companies = await getCompaniesCollection()
  const filter = options.includeArchived ? { id } : { id, archivedAt: null }
  const doc = await companies.findOne(filter)
  return doc ? toPublicCompany(doc) : null
}

export async function countCompanies() {
  const companies = await getCompaniesCollection()
  return companies.countDocuments({ archivedAt: null })
}

export async function seedCompaniesFromStatic() {
  const companies = await getCompaniesCollection()
  const now = new Date()

  const ops = COMPANIES.map((entry, index) => ({
    updateOne: {
      filter: { id: entry.id },
      update: {
        $set: {
          emoji: entry.emoji,
          color: entry.color,
          order: index,
          updatedAt: now,
          archivedAt: null,
        },
        $setOnInsert: {
          id: entry.id,
          createdAt: now,
        },
      },
      upsert: true,
    },
  }))

  if (ops.length === 0) {
    return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 }
  }

  const result = await companies.bulkWrite(ops)
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  }
}

export async function createCompany(input: CompanyInput) {
  const companies = await getCompaniesCollection()
  const now = new Date()
  const order = input.order ?? (await countCompanies())

  await companies.insertOne({
    id: input.id,
    emoji: input.emoji,
    color: input.color,
    order,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  })

  return getCompanyById(input.id, { includeArchived: true })
}

export async function updateCompany(id: string, input: CompanyInput) {
  const companies = await getCompaniesCollection()
  const now = new Date()

  const result = await companies.findOneAndUpdate(
    { id },
    {
      $set: {
        emoji: input.emoji,
        color: input.color,
        ...(input.order !== undefined ? { order: input.order } : {}),
        updatedAt: now,
      },
    },
    { returnDocument: 'after' },
  )

  return result ? toPublicCompany(result) : null
}

export async function archiveCompany(id: string) {
  const companies = await getCompaniesCollection()
  const now = new Date()
  const result = await companies.findOneAndUpdate(
    { id },
    { $set: { archivedAt: now, updatedAt: now } },
    { returnDocument: 'after' },
  )

  return result ? toPublicCompany(result) : null
}

export async function restoreCompany(id: string) {
  const companies = await getCompaniesCollection()
  const result = await companies.findOneAndUpdate(
    { id },
    { $set: { archivedAt: null, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )

  return result ? toPublicCompany(result) : null
}
