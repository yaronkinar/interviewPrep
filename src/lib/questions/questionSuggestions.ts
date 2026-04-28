import OpenAI from 'openai'
import type { QuestionInput } from '@/lib/models/Question'
import { listCompaniesMergedWithSeed } from '@/lib/repositories/companies'
import { listQuestionDocuments, normalizeQuestionInput, distinctCompanyTagsFromQuestions } from '@/lib/repositories/questions'
import { CATEGORIES } from '@/questions/data'
import { DEFAULT_OPENAI_MODEL } from '@/questions/openaiConstants'

type SuggestedQuestionPayload = {
  questions?: unknown
}

async function buildKnownCompaniesPromptLine(): Promise<string> {
  const merged = await listCompaniesMergedWithSeed()
  const tags = await distinctCompanyTagsFromQuestions()
  const idByLower = new Map<string, string>()
  for (const c of merged) {
    idByLower.set(c.id.toLowerCase(), c.id)
  }
  for (const t of tags) {
    if (!idByLower.has(t.toLowerCase())) {
      idByLower.set(t.toLowerCase(), t)
    }
  }
  return [...idByLower.values()].sort((a, b) => a.localeCompare(b)).join(', ')
}

export const MAX_QUESTION_SUGGESTIONS = 8

export function clampSuggestionCount(value: unknown, fallback = 5) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(MAX_QUESTION_SUGGESTIONS, Math.max(1, Math.floor(value)))
}

export function getQuestionSuggestionErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Failed to search for suggested questions.'
}

export function resolveQuestionSuggestionModel(model: unknown) {
  return typeof model === 'string' && model.trim()
    ? model.trim()
    : process.env.QUESTION_CRON_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL
}

export function resolveServerOpenAiKey() {
  return process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
}

function extractJsonObject(text: string) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenced?.[1]) return fenced[1].trim()
  return trimmed
}

function parseSuggestionResponse(text: string): SuggestedQuestionPayload {
  const parsed = JSON.parse(extractJsonObject(text)) as unknown
  if (parsed === null || typeof parsed !== 'object') return {}
  return parsed as SuggestedQuestionPayload
}

function normalizedExistingKey(value: string) {
  return value.trim().toLowerCase()
}

function dedupeSuggestions(questions: QuestionInput[], existingIds: Set<string>, existingTitles: Set<string>) {
  const seenIds = new Set<string>()
  const seenTitles = new Set<string>()
  const unique: QuestionInput[] = []

  for (const question of questions) {
    const titleKey = normalizedExistingKey(question.title)
    if (existingIds.has(question.id) || existingTitles.has(titleKey)) continue
    if (seenIds.has(question.id) || seenTitles.has(titleKey)) continue
    seenIds.add(question.id)
    seenTitles.add(titleKey)
    unique.push(question)
  }

  return unique
}

export async function suggestInterviewQuestions(params: {
  apiKey: string
  model: string
  query: string
  company?: string
  count: number
}) {
  const existing = await listQuestionDocuments({ includeArchived: true })
  const existingIds = new Set(existing.map(question => question.id))
  const existingTitles = new Set(existing.map(question => normalizedExistingKey(question.title)))
  const existingContext = existing
    .slice(-40)
    .map(question => `- ${question.title} (${question.id})`)
    .join('\n')

  const knownCompaniesLine = await buildKnownCompaniesPromptLine()

  const client = new OpenAI({ apiKey: params.apiKey })
  const completion = await client.chat.completions.create({
    model: params.model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You generate structured frontend interview questions for a MongoDB-backed question catalog. ' +
          'Return only valid JSON: a single object with exactly one property "questions" (an array of question objects). ' +
          'Do not add any other top-level keys (no sources, notes, or summaries). Do not include markdown.',
      },
      {
        role: 'user',
        content: [
          `Create ${params.count} new interview questions for this search topic: ${params.query}`,
          params.company ? `Preferred company tag: ${params.company}` : '',
          '',
          `Allowed categories: ${CATEGORIES.join(', ')}`,
          `Known companies: ${knownCompaniesLine}`,
          'Each question must include: id, title, description, difficulty, category, answerType, tags, companies, source, answer.',
          'Use lowercase kebab-case ids. difficulty must be easy, medium, or hard. answerType must be text, code, or mixed.',
          params.company
            ? 'Use the preferred company in the companies array unless the question clearly fits additional known companies.'
            : 'No preferred company is set. Choose relevant known company tags only when appropriate; otherwise use an empty companies array for general frontend questions.',
          'Make answers concise but interview-ready, with practical bullets and trade-offs.',
          'Avoid duplicates or near-duplicates of these existing recent questions:',
          existingContext,
        ].filter(Boolean).join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content
  if (!content) {
    throw new Error('Question search returned no content.')
  }

  const parsed = parseSuggestionResponse(content)
  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : []
  const normalized: QuestionInput[] = []

  for (const rawQuestion of rawQuestions) {
    const result = normalizeQuestionInput(rawQuestion)
    if (result.ok) normalized.push(result.question)
  }

  return dedupeSuggestions(normalized, existingIds, existingTitles)
}

export async function suggestInterviewQuestionsFromWebContext(params: {
  apiKey: string
  model: string
  query: string
  company?: string
  count: number
  webContext: string
}) {
  const existing = await listQuestionDocuments({ includeArchived: true })
  const existingIds = new Set(existing.map(question => question.id))
  const existingTitles = new Set(existing.map(question => normalizedExistingKey(question.title)))
  const existingContext = existing
    .slice(-40)
    .map(question => `- ${question.title} (${question.id})`)
    .join('\n')

  const knownCompaniesLine = await buildKnownCompaniesPromptLine()

  const client = new OpenAI({ apiKey: params.apiKey })
  const completion = await client.chat.completions.create({
    model: params.model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You generate structured frontend interview questions for a MongoDB-backed question catalog, grounded in the provided web search context. ' +
          'If the context is weak or off-topic, still output plausible, accurate frontend interview content; put the most relevant page URL in each question "source" field when possible. ' +
          'Return only valid JSON: a single object with exactly one property "questions" (an array of question objects). ' +
          'Do not add any other top-level keys (no sources, notes, or summaries). Do not include markdown.',
      },
      {
        role: 'user',
        content: [
          `User topic: ${params.query}`,
          params.company ? `Preferred company tag: ${params.company}` : '',
          '',
          'Use this web context as primary inspiration (paraphrase; do not copy long passages verbatim):',
          params.webContext,
          '',
          `Create ${params.count} new interview questions aligned with the user topic. Prefer themes that the web context supports; avoid inventing false claims about specific companies or products.`,
          `Allowed categories: ${CATEGORIES.join(', ')}`,
          `Known companies: ${knownCompaniesLine}`,
          'Each question must include: id, title, description, difficulty, category, answerType, tags, companies, source, answer.',
          'The "source" field should be a short citation string, ideally including a URL from the context when relevant.',
          'Use lowercase kebab-case ids. difficulty must be easy, medium, or hard. answerType must be text, code, or mixed.',
          params.company
            ? 'Use the preferred company in the companies array unless the question clearly fits additional known companies.'
            : 'No preferred company is set. Choose relevant known company tags only when appropriate; otherwise use an empty companies array for general frontend questions.',
          'Make answers concise but interview-ready, with practical bullets and trade-offs.',
          'Avoid duplicates or near-duplicates of these existing recent questions:',
          existingContext,
        ].filter(Boolean).join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content
  if (!content) {
    throw new Error('Web-assisted question search returned no content.')
  }

  const parsed = parseSuggestionResponse(content)
  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : []
  const normalized: QuestionInput[] = []

  for (const rawQuestion of rawQuestions) {
    const result = normalizeQuestionInput(rawQuestion)
    if (result.ok) normalized.push(result.question)
  }

  return dedupeSuggestions(normalized, existingIds, existingTitles)
}
