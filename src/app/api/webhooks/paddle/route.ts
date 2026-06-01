// src/app/api/webhooks/paddle/route.ts

import { NextResponse } from 'next/server'
import { EventName } from '@paddle/paddle-node-sdk'
import { paddle } from '@/lib/paddle'
import { upsertSubscription } from '@/lib/repositories/subscriptions'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('paddle-signature') ?? ''

  let event: Awaited<ReturnType<typeof paddle.webhooks.unmarshal>>
  try {
    event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature,
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.eventType) {
    case EventName.TransactionCompleted: {
      const customData = (event.data as any).customData as { userId?: string; plan?: string } | null
      if (customData?.plan === 'sprint' && customData.userId) {
        await upsertSubscription({
          userId: customData.userId,
          plan: 'sprint',
          paddleCustomerId: (event.data as any).customerId ?? '',
          sprintExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }, { paddleSubscriptionId: '' })
      } else if (customData?.plan) {
        // Pro annual renewals — subscription events are authoritative, this is informational
        console.info('[paddle] TransactionCompleted for plan', customData.plan, 'userId', customData.userId)
      }
      break
    }

    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated: {
      const sub = event.data as any
      const customData = sub.customData as { userId?: string } | null
      if (customData?.userId) {
        await upsertSubscription({
          userId: customData.userId,
          plan: 'pro',
          paddleCustomerId: sub.customerId ?? '',
          paddleSubscriptionId: sub.id,
        }, { sprintExpiresAt: '' })
      }
      break
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data as any
      const customData = sub.customData as { userId?: string } | null
      if (customData?.userId) {
        await upsertSubscription({
          userId: customData.userId,
          plan: 'free',
          paddleCustomerId: sub.customerId ?? '',
        }, { paddleSubscriptionId: '', sprintExpiresAt: '' })
      }
      break
    }
  }

  return NextResponse.json({ ok: true })
}
