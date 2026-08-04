import { listQuestions } from '@/lib/repositories/questions'
import type { Question } from '@/questions/data'

/**
 * Shared, briefly-memoised catalog read for server-rendered question pages.
 *
 * Static generation renders hundreds of question pages, and each one needs the
 * whole catalog to resolve its slug. Without this every page opened its own
 * MongoDB connection, which overloaded the driver during `next build`. The TTL
 * is short so the daily question cron still shows up within a revalidation
 * window rather than being pinned for the process lifetime.
 */
const TTL_MS = 60_000

let cached: { questions: Question[]; at: number } | null = null
let inFlight: Promise<Question[]> | null = null

export async function loadQuestionCatalog(): Promise<Question[]> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.questions
  if (inFlight) return inFlight

  inFlight = listQuestions()
    .then(questions => {
      cached = { questions, at: Date.now() }
      return questions
    })
    .catch(error => {
      // Callers degrade to a 404 or an empty index rather than failing the build.
      console.error('Failed to load question catalog', error)
      return cached?.questions ?? []
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}
