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
  const doc = await col.findOne({ userId, month })
  const used = doc?.mockInterviewCount ?? 0

  if (used >= FREE_MOCK_INTERVIEW_LIMIT) {
    return { allowed: false, used, limit: FREE_MOCK_INTERVIEW_LIMIT }
  }

  await col.updateOne(
    { userId, month },
    { $inc: { mockInterviewCount: 1 }, $setOnInsert: { cvAnalysisCount: 0 } },
    { upsert: true },
  )

  return { allowed: true, used: used + 1, limit: FREE_MOCK_INTERVIEW_LIMIT }
}

export async function checkAndIncrementCvAnalysis(
  userId: string,
  plan: Plan,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (plan !== 'free') return { allowed: true, used: 0, limit: Infinity }

  const col = await getCollection()
  const month = getCurrentMonth()
  const doc = await col.findOne({ userId, month })
  const used = doc?.cvAnalysisCount ?? 0

  if (used >= FREE_CV_ANALYSIS_LIMIT) {
    return { allowed: false, used, limit: FREE_CV_ANALYSIS_LIMIT }
  }

  await col.updateOne(
    { userId, month },
    { $inc: { cvAnalysisCount: 1 }, $setOnInsert: { mockInterviewCount: 0 } },
    { upsert: true },
  )

  return { allowed: true, used: used + 1, limit: FREE_CV_ANALYSIS_LIMIT }
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
