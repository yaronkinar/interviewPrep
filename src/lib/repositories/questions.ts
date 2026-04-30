import {
  normalizeCatalogSearchText as normalizeForSearch,
  tokenizeCatalogSearchQuery as tokenizeForSearch,
} from '@/lib/questions/catalogSearchTokens'
import { getDb } from '@/lib/mongodb'
import type { QuestionDocument, QuestionInput } from '@/lib/models/Question'
import { CATEGORIES, type Category, type Difficulty, type Question } from '@/questions/data'

const COLLECTION_NAME = 'questions'
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const ANSWER_TYPES = ['code', 'text', 'mixed'] as const
const DEFAULT_SEARCH_LIMIT = 8
const MAX_SEARCH_LIMIT = 20

const SEARCH_FIELD_WEIGHTS = {
  title: 12,
  tags: 9,
  category: 7,
  companies: 6,
  description: 3,
} as const

type QuestionSearchField = keyof typeof SEARCH_FIELD_WEIGHTS

export type QuestionSearchMatch = {
  question: Question
  score: number
  matchedFields: QuestionSearchField[]
  snippet: string
}

export type QuestionSearchFilters = {
  difficulty?: Difficulty
  category?: Category
  company?: string
}

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

function clampSearchLimit(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_SEARCH_LIMIT
  return Math.min(MAX_SEARCH_LIMIT, Math.max(1, Math.floor(value)))
}

function boundedLevenshtein(a: string, b: string, maxDistance: number) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  const current = new Array<number>(b.length + 1)

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i
    let rowMin = current[0]

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      )
      rowMin = Math.min(rowMin, current[j])
    }

    if (rowMin > maxDistance) return maxDistance + 1
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j]
  }

  return previous[b.length]
}

function fuzzyDistanceForToken(token: string) {
  if (token.length >= 7) return 2
  if (token.length >= 4) return 1
  return 0
}

function scoreTokenAgainstField(token: string, fieldText: string) {
  const normalized = normalizeForSearch(fieldText)
  if (!normalized) return 0

  const fieldTokens = normalized.split(/\s+/).filter(Boolean)
  if (fieldTokens.includes(token)) return 1
  if (normalized.includes(token)) return 0.82

  for (const fieldToken of fieldTokens) {
    if (fieldToken.startsWith(token) || token.startsWith(fieldToken)) return 0.72
  }

  const maxDistance = fuzzyDistanceForToken(token)
  if (maxDistance === 0) return 0

  for (const fieldToken of fieldTokens) {
    if (Math.min(token.length, fieldToken.length) < 4) continue
    if (boundedLevenshtein(token, fieldToken, maxDistance) <= maxDistance) return 0.62
  }

  return 0
}

function fieldText(question: Question, field: QuestionSearchField) {
  if (field === 'title') return question.title
  if (field === 'description') return question.description
  if (field === 'category') return question.category
  if (field === 'tags') return question.tags.join(' ')
  return question.companies.join(' ')
}

function buildSearchSnippet(question: Question, tokens: string[]) {
  const sources = [question.description, question.title, question.tags.join(', ')]
  const fallback = question.description || question.title

  for (const source of sources) {
    const normalized = normalizeForSearch(source)
    const token = tokens.find(item => normalized.includes(item))
    if (!token) continue

    const lower = source.toLowerCase()
    const index = lower.indexOf(token)
    if (index < 0) return source.slice(0, 180)

    const start = Math.max(0, index - 70)
    const end = Math.min(source.length, index + token.length + 120)
    return `${start > 0 ? '...' : ''}${source.slice(start, end).trim()}${end < source.length ? '...' : ''}`
  }

  return fallback.length > 190 ? `${fallback.slice(0, 190).trim()}...` : fallback
}

function removeFilterTerms(query: string, filters: QuestionSearchFilters) {
  let normalized = ` ${normalizeForSearch(query)} `
  if (filters.difficulty) normalized = normalized.replace(` ${filters.difficulty} `, ' ')
  if (filters.company) normalizeForSearch(filters.company).split(/\s+/).forEach(token => {
    normalized = normalized.replace(` ${token} `, ' ')
  })
  if (filters.category) normalizeForSearch(filters.category).split(/\s+/).forEach(token => {
    normalized = normalized.replace(` ${token} `, ' ')
  })
  return normalized.trim()
}

function inferQuestionSearchFilters(
  query: string,
  explicitFilters: QuestionSearchFilters,
  searchableCompanyIds: readonly string[],
): QuestionSearchFilters {
  const normalized = ` ${normalizeForSearch(query)} `
  const difficulty = explicitFilters.difficulty ?? DIFFICULTIES.find(item => normalized.includes(` ${item} `))
  const company =
    explicitFilters.company ??
    searchableCompanyIds.find(id => normalized.includes(` ${normalizeForSearch(id)} `))
  const category = explicitFilters.category ?? CATEGORIES.find(categoryItem =>
    normalizeForSearch(categoryItem)
      .split(/\s+/)
      .some(token => token.length > 3 && normalized.includes(` ${token} `)),
  )

  return {
    ...explicitFilters,
    ...(difficulty ? { difficulty } : {}),
    ...(company ? { company } : {}),
    ...(category ? { category } : {}),
  }
}

function scoreQuestionSearchMatch(question: Question, tokens: string[]) {
  if (tokens.length === 0) {
    return { score: 1, matchedFields: [] as QuestionSearchField[] }
  }

  let score = 0
  let matchedTokenCount = 0
  const matchedFields = new Set<QuestionSearchField>()

  for (const token of tokens) {
    let bestTokenScore = 0

    for (const field of Object.keys(SEARCH_FIELD_WEIGHTS) as QuestionSearchField[]) {
      const fieldScore = scoreTokenAgainstField(token, fieldText(question, field))
      if (fieldScore <= 0) continue

      bestTokenScore = Math.max(bestTokenScore, fieldScore)
      matchedFields.add(field)
      score += fieldScore * SEARCH_FIELD_WEIGHTS[field]
    }

    if (bestTokenScore > 0) matchedTokenCount += 1
  }

  if (matchedTokenCount === 0) {
    return { score: 0, matchedFields: [] as QuestionSearchField[] }
  }

  const coverage = matchedTokenCount / tokens.length
  if (tokens.length > 1 && coverage < 0.5) {
    return { score: 0, matchedFields: [] as QuestionSearchField[] }
  }

  return {
    score: Math.round(score * coverage * 100) / 100,
    matchedFields: [...matchedFields],
  }
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
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
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

/** Every company string stored on non-archived questions (for search filter inference). */
export async function distinctCompanyTagsFromQuestions() {
  const questions = await getQuestionsCollection()
  const values = await questions.distinct('companies', { archivedAt: null })
  return [...new Set(values.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map(s => s.trim()))]
}

/** Tokens from the catalog search query worth considering as a company name (normalized lowercase). */
export function catalogSearchTokensForAutoCompany(
  rawQuery: string,
  inferredFilters: QuestionSearchFilters,
): string[] {
  const stripped = removeFilterTerms(rawQuery.trim(), inferredFilters)
  const tokens = tokenizeForSearch(stripped)
  return tokens.filter(
    t =>
      t.length >= 4 &&
      !DIFFICULTIES.some(d => d === t),
  )
}

/** True if matched question body mentions the token (titles, descriptions, tags, company tags)—not category label alone. */
export function questionSupportsAutoCompanyFromToken(question: Question, normalizedLowerToken: string): boolean {
  if (normalizedLowerToken.length < 4) return false
  const hay = normalizeForSearch(
    [question.title, question.description, question.tags.join(' '), question.companies.join(' ')].join(' '),
  )
  const words = new Set(hay.split(/\s+/).filter(Boolean))
  if (words.has(normalizedLowerToken)) return true
  if (normalizedLowerToken.length >= 6 && hay.includes(normalizedLowerToken)) return true
  return false
}

export function proposeCompanyDisplayIdFromSearchToken(normalizedLowerToken: string): string {
  const t = normalizedLowerToken.trim()
  if (!t) return t
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

export async function searchQuestions(options: {
  query: string
  limit?: number
  filters?: QuestionSearchFilters
  searchableCompanyIds: readonly string[]
}) {
  const inferredFilters = inferQuestionSearchFilters(options.query, options.filters ?? {}, options.searchableCompanyIds)
  const queryWithoutFilters = removeFilterTerms(options.query, inferredFilters)
  const tokens = tokenizeForSearch(queryWithoutFilters)
  const limit = clampSearchLimit(options.limit)
  const collection = await getQuestionsCollection()
  const filter: Partial<QuestionDocument> = { archivedAt: null }

  if (inferredFilters.difficulty) filter.difficulty = inferredFilters.difficulty
  if (inferredFilters.category) filter.category = inferredFilters.category

  const docs = await collection.find(filter).sort({ order: 1, title: 1 }).toArray()
  const companyFilter = inferredFilters.company ? normalizeForSearch(inferredFilters.company) : ''

  const matches = docs
    .map(toPublicQuestion)
    .filter(question => {
      if (!companyFilter) return true
      return question.companies.some(company => normalizeForSearch(company) === companyFilter)
    })
    .map(question => {
      const { score, matchedFields } = scoreQuestionSearchMatch(question, tokens)
      return {
        question,
        score,
        matchedFields,
        snippet: buildSearchSnippet(question, tokens),
      }
    })
    .filter(match => tokens.length === 0 || match.score > 0)
    .sort((a, b) => b.score - a.score || a.question.title.localeCompare(b.question.title))
    .slice(0, limit)

  return {
    query: options.query,
    tokens,
    filters: inferredFilters,
    matches,
  }
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
