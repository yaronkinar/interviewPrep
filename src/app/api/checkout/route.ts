import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { paddle } from '@/lib/paddle'

const PRICE_IDS: Record<string, string> = {
  sprint: process.env.PADDLE_SPRINT_PRICE_ID!,
  'pro-monthly': process.env.PADDLE_PRO_MONTHLY_PRICE_ID!,
  'pro-annual': process.env.PADDLE_PRO_ANNUAL_PRICE_ID!,
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = (await req.json()) as { plan: string }
  const priceId = PRICE_IDS[plan]
  if (!priceId || priceId === 'undefined') {
    return NextResponse.json({ error: 'Plan not configured' }, { status: 503 })
  }

  let transaction: Awaited<ReturnType<typeof paddle.transactions.create>>
  try {
    transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { userId, plan },
    })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Payment provider error' }, { status: 502 })
  }

  return NextResponse.json({ transactionId: transaction.id })
}
