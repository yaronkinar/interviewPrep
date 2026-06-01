import { getDb } from '@/lib/mongodb'
import type { AiUsageDoc } from '@/lib/models/UserSubscription'
import {
  FREE_MOCK_INTERVIEW_LIMIT,
  FREE_CV_ANALYSIS_LIMIT,
  type Plan,
} from '@/lib/models/UserSubscription'

const COLLECTION = 'aiUsage'
let indexReady: Promise<string> | null = null

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

async function getCollection() {
  const db = await getDb()
  const col = db.collection<AiUsageDoc>(COLLECTION)
  if (!indexReady) {
    indexReady = col.createIndex({ userId: 1, month: 1 }, { unique: true })
  }
  await indexReady
  return col
}

export async function checkAndIncrementMockInterview(
  userId: string,
  plan: Plan,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (plan !== 'free') return { allowed: true, used: 0, limit: Infinity }

  const col = await getCollection()
  const month = getCurrentMonth()

  // Atomic: only increment if currently under the limit
  const result = await col.findOneAndUpdate(
    { userId, month, mockInterviewCount: { $lt: FREE_MOCK_INTERVIEW_LIMIT } },
    {
      $inc: { mockInterviewCount: 1 },
      $setOnInsert: { cvAnalysisCount: 0 },
    },
    { upsert: true, returnDocument: 'after' },
  )

  if (!result) {
    // Document already at or above limit (filter didn't match)
    const doc = await col.findOne({ userId, month })
    return { allowed: false, used: doc?.mockInterviewCount ?? FREE_MOCK_INTERVIEW_LIMIT, limit: FREE_MOCK_INTERVIEW_LIMIT }
  }

  return { allowed: true, used: result.mockInterviewCount, limit: FREE_MOCK_INTERVIEW_LIMIT }
}

export async function checkAndIncrementCvAnalysis(
  userId: string,
  plan: Plan,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (plan !== 'free') return { allowed: true, used: 0, limit: Infinity }

  const col = await getCollection()
  const month = getCurrentMonth()

  // Atomic: only increment if currently under the limit
  const result = await col.findOneAndUpdate(
    { userId, month, cvAnalysisCount: { $lt: FREE_CV_ANALYSIS_LIMIT } },
    {
      $inc: { cvAnalysisCount: 1 },
      $setOnInsert: { mockInterviewCount: 0 },
    },
    { upsert: true, returnDocument: 'after' },
  )

  if (!result) {
    // Document already at or above limit (filter didn't match)
    const doc = await col.findOne({ userId, month })
    return { allowed: false, used: doc?.cvAnalysisCount ?? FREE_CV_ANALYSIS_LIMIT, limit: FREE_CV_ANALYSIS_LIMIT }
  }

  return { allowed: true, used: result.cvAnalysisCount, limit: FREE_CV_ANALYSIS_LIMIT }
}

export async function getAiUsage(
  userId: string,
): Promise<{ mockInterviewCount: number; cvAnalysisCount: number }> {
  const col = await getCollection()
  const month = getCurrentMonth()
  const doc = await col.findOne({ userId, month })
  return {
    mockInterviewCount: doc?.mockInterviewCount ?? 0,
    cvAnalysisCount: doc?.cvAnalysisCount ?? 0,
  }
}
