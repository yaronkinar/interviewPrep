import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/repositories/subscriptions'
import { getAiUsage } from '@/lib/repositories/aiUsage'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [planInfo, aiUsage] = await Promise.all([
    getUserPlan(userId),
    getAiUsage(userId),
  ])

  return NextResponse.json({
    plan: planInfo.plan,
    sprintExpiresAt: planInfo.sprintExpiresAt ?? null,
    aiUsage,
  })
}
