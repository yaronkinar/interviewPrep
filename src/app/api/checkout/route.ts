import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Paddle, Environment } from '@paddle/paddle-node-sdk'

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.PADDLE_ENV === 'production'
      ? Environment.production
      : Environment.sandbox,
})

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
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const transaction = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customData: { userId, plan },
  })

  return NextResponse.json({ checkoutUrl: transaction.checkout?.url })
}
