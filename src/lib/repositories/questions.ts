import { getDb } from '@/lib/mongodb'
import type { QuestionDocument, QuestionInput } from '@/lib/models/Question'
import { CATEGORIES, type Category, type Difficulty, type Question } from '@/questions/data'

const COLLECTION_NAME = 'questions'
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const ANSWER_TYPES = ['code', 'text', 'mixed'] as const

let indexesReadyPromise: Promise<unknown> | null = null

async function getQuestionsCollection() {
  const db = await getDb()
  const collection = db.collection<QuestionDocument>(COLLECTION_NAME)

  if (!indexesReadyPromise) {
    indexesReadyPromise = Promise.all([
      collection.createIndex({ id: 1 }, { unique: true }),
      collection.createIndex({ archivedAt: 1, order: 1 }),
      collection.createIndex({ category: 1, difficulty: 1 }),
      collection.createIndex({ companies: 1 }),
      collection.createIndex({ tags: 1 }),
    ])
  }

  await indexesReadyPromise
  return collection
}

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value)
}

function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

function isAnswerType(value: unknown): value is Question['answerType'] {
  return typeof value === 'string' && (ANSWER_TYPES as readonly string[]).includes(value)
}

function asTrimmedStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeQuestionInput(raw: unknown): { ok: true; question: QuestionInput } | { ok: false; error: string } {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, error: 'Question payload must be an object.' }
  }

  const input = raw as Record<string, unknown>
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const answer = typeof input.answer === 'string' ? input.answer : ''
  const id = typeof input.id === 'string' && input.id.trim() ? slugify(input.id) : slugify(title)
  const source = typeof input.source === 'string' ? input.source.trim() : undefined
  const order = typeof input.order === 'number' && Number.isFinite(input.order) ? input.order : undefined

  if (!id) return { ok: false, error: 'Question id is required.' }
  if (!title) return { ok: false, error: 'Question title is required.' }
  if (!description) return { ok: false, error: 'Question description is required.' }
  if (!isDifficulty(input.difficulty)) return { ok: false, error: 'Question difficulty must be easy, medium, or hard.' }
  if (!isCategory(input.category)) return { ok: false, error: 'Question category is invalid.' }
  if (!isAnswerType(input.answerType)) return { ok: false, error: 'Question answerType must be code, text, or mixed.' }

  return {
    ok: true,
    question: {
      id,
      title,
      description,
      difficulty: input.difficulty,
      category: input.category,
      answer,
      answerType: input.answerType,
      tags: asTrimmedStringArray(input.tags),
      companies: asTrimmedStringArray(input.companies),
      ...(order !== undefined ? { order } : {}),
      ...(source ? { source } : {}),
    },
  }
}

export function toPublicQuestion(document: QuestionDocument): Question {
  return {
    id: document.id,
    companies: document.companies,
    title: document.title,
    difficulty: document.difficulty,
    category: document.category,
    description: document.description,
    answer: document.answer,
    answerType: document.answerType,
    tags: document.tags,
    ...(document.source ? { source: document.source } : {}),
  }
}

export async function listQuestions(options: { includeArchived?: boolean } = {}) {
  const questions = await getQuestionsCollection()
  const filter = options.includeArchived ? {} : { archivedAt: null }
  const docs = await questions.find(filter).sort({ order: 1, title: 1 }).toArray()
  return docs.map(toPublicQuestion)
}

export async function listQuestionDocuments(options: { includeArchived?: boolean } = {}) {
  const questions = await getQuestionsCollection()
  const filter = options.includeArchived ? {} : { archivedAt: null }
  return questions.find(filter).sort({ order: 1, title: 1 }).toArray()
}

export async function getQuestionsByIds(ids: string[]) {
  if (ids.length === 0) return []

  const questions = await getQuestionsCollection()
  const docs = await questions
    .find({ id: { $in: ids }, archivedAt: null })
    .sort({ order: 1, title: 1 })
    .toArray()

  return docs.map(toPublicQuestion)
}

export async function getQuestionById(id: string, options: { includeArchived?: boolean } = {}) {
  const questions = await getQuestionsCollection()
  const filter = options.includeArchived ? { id } : { id, archivedAt: null }
  const doc = await questions.findOne(filter)
  return doc ? toPublicQuestion(doc) : null
}

export async function countQuestions() {
  const questions = await getQuestionsCollection()
  return questions.countDocuments({ archivedAt: null })
}

export async function createQuestion(input: QuestionInput) {
  const questions = await getQuestionsCollection()
  const now = new Date()
  const order = input.order ?? (await countQuestions())

  await questions.insertOne({
    ...input,
    order,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  })

  return getQuestionById(input.id, { includeArchived: true })
}

export async function updateQuestion(id: string, input: QuestionInput) {
  const questions = await getQuestionsCollection()
  const now = new Date()

  const result = await questions.findOneAndUpdate(
    { id },
    {
      $set: {
        ...input,
        updatedAt: now,
      },
    },
    { returnDocument: 'after' },
  )

  return result ? toPublicQuestion(result) : null
}

export async function archiveQuestion(id: string) {
  const questions = await getQuestionsCollection()
  const now = new Date()
  const result = await questions.findOneAndUpdate(
    { id },
    { $set: { archivedAt: now, updatedAt: now } },
    { returnDocument: 'after' },
  )

  return result ? toPublicQuestion(result) : null
}

export async function restoreQuestion(id: string) {
  const questions = await getQuestionsCollection()
  const result = await questions.findOneAndUpdate(
    { id },
    { $set: { archivedAt: null, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )

  return result ? toPublicQuestion(result) : null
}
