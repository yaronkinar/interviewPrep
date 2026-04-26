import { createQuestion } from '@/lib/repositories/questions'
import {
  clampSuggestionCount,
  getQuestionSuggestionErrorMessage,
  resolveQuestionSuggestionModel,
  resolveServerOpenAiKey,
  suggestInterviewQuestions,
} from '@/lib/questions/questionSuggestions'

const DEFAULT_TOPICS = [
  'senior React frontend interview questions',
  'frontend performance questions for large React applications',
  'React accessibility questions for complex user interfaces',
  'TypeScript architecture questions for frontend engineers',
  'frontend system design questions for SaaS dashboards',
  'async JavaScript and browser API interview questions',
]

function parseTopics(value: string | undefined) {
  const topics = value
    ?.split(/[;\n]/)
    .map(topic => topic.trim())
    .filter(Boolean)

  return topics?.length ? topics : DEFAULT_TOPICS
}

function pickDailyTopic(topics: string[]) {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return topics[dayIndex % topics.length] ?? topics[0]!
}

function isDuplicateKeyError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 11000)
}

export async function runQuestionDiscoveryCron() {
  const apiKey = resolveServerOpenAiKey()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.')
  }

  const topics = parseTopics(process.env.QUESTION_CRON_TOPICS)
  const query = pickDailyTopic(topics)
  const company = process.env.QUESTION_CRON_COMPANY?.trim() || undefined
  const count = clampSuggestionCount(Number(process.env.QUESTION_CRON_COUNT), 2)
  const model = resolveQuestionSuggestionModel(process.env.QUESTION_CRON_MODEL)

  const suggestions = await suggestInterviewQuestions({
    apiKey,
    model,
    query,
    company,
    count,
  })

  const created: string[] = []
  const skipped: string[] = []
  const failed: string[] = []

  for (const question of suggestions) {
    try {
      const createdQuestion = await createQuestion(question)
      if (createdQuestion) {
        created.push(createdQuestion.id)
      }
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        skipped.push(question.id)
      } else {
        failed.push(`${question.id}: ${getQuestionSuggestionErrorMessage(error)}`)
      }
    }
  }

  return {
    ok: failed.length === 0,
    query,
    model,
    suggested: suggestions.length,
    created,
    skipped,
    failed,
  }
}
