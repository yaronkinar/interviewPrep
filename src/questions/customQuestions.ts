import type { Category, Difficulty, Question } from './data'
import { CATEGORIES } from './data'

export const CUSTOM_QUESTIONS_STORAGE_KEY = 'interviews:customQuestions'

const CATEGORY_SET = new Set<string>(CATEGORIES)

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

function isDifficulty(v: unknown): v is Difficulty {
  return typeof v === 'string' && (DIFFICULTIES as string[]).includes(v)
}

function isCategory(v: unknown): v is Category {
  return typeof v === 'string' && CATEGORY_SET.has(v)
}

function isAnswerType(v: unknown): v is Question['answerType'] {
  return v === 'code' || v === 'text' || v === 'mixed'
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Normalize one raw object into a Question, or null if invalid. */
export function validateCustomQuestion(raw: unknown, reservedIds: Set<string>): Question | null {
  if (raw === null || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>

  let id =
    typeof o.id === 'string' && o.id.trim()
      ? o.id.trim()
      : generateId()
  while (reservedIds.has(id)) {
    id = `${id}-${Math.random().toString(36).slice(2, 6)}`
  }

  const title = typeof o.title === 'string' ? o.title.trim() : ''
  const description = typeof o.description === 'string' ? o.description.trim() : ''
  if (!title || !description) return null

  reservedIds.add(id)

  const difficulty: Difficulty = isDifficulty(o.difficulty) ? o.difficulty : 'medium'
  const category: Category = isCategory(o.category) ? o.category : 'Algorithms'
  const answer = typeof o.answer === 'string' ? o.answer : ''
  const answerType: Question['answerType'] = isAnswerType(o.answerType) ? o.answerType : 'text'
  const tags = asStringArray(o.tags)
  const companies = asStringArray(o.companies)
  const source = typeof o.source === 'string' ? o.source : undefined

  return {
    id,
    title,
    description,
    difficulty,
    category,
    answer,
    answerType,
    tags,
    companies,
    ...(source !== undefined && source !== '' ? { source } : {}),
  }
}

export function parseQuestionsJson(
  text: string,
  reservedIds: Set<string> = new Set(),
): { ok: true; questions: Question[] } | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    return { ok: false, error: 'Invalid JSON.' }
  }

  const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed]
  if (items.length === 0) {
    return { ok: false, error: 'JSON must be one object or an array of objects.' }
  }

  const reserved = new Set(reservedIds)
  const out: Question[] = []

  for (const item of items) {
    const q = validateCustomQuestion(item, reserved)
    if (!q) {
      return {
        ok: false,
        error: 'Each item needs at least title and description (strings). Optional: id, difficulty, category, answer, answerType, tags, companies, source.',
      }
    }
    out.push(q)
  }

  return { ok: true, questions: out }
}

export function loadCustomQuestionsFromStorage(): Question[] {
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const reserved = new Set<string>()
    const out: Question[] = []
    for (const item of parsed) {
      const q = validateCustomQuestion(item, reserved)
      if (q) out.push(q)
    }
    return out
  } catch {
    return []
  }
}

export function saveCustomQuestionsToStorage(questions: Question[]): void {
  try {
    localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(questions))
  } catch {
    // quota exceeded or private mode
  }
}
