export type Plan = 'free' | 'sprint' | 'pro'

export interface UserSubscriptionDoc {
  userId: string
  plan: Plan
  lsCustomerId?: string
  lsSubscriptionId?: string  // Pro only
  sprintExpiresAt?: Date      // Sprint only
  updatedAt: Date
}

export interface AiUsageDoc {
  userId: string
  month: string              // 'YYYY-MM', e.g. '2026-06'
  mockInterviewCount: number
  cvAnalysisCount: number
}

export const FREE_MOCK_INTERVIEW_LIMIT = 3
export const FREE_CV_ANALYSIS_LIMIT = 1
