import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/repositories/subscriptions'
import { checkAndIncrementMockInterview } from '@/lib/repositories/aiUsage'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserPlan(userId)
  const result = await checkAndIncrementMockInterview(userId, plan)

  return NextResponse.json(result, { status: result.allowed ? 200 : 403 })
}
