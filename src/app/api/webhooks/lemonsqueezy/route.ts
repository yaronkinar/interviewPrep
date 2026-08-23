// src/app/api/webhooks/lemonsqueezy/route.ts

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { upsertSubscription } from '@/lib/repositories/subscriptions'

function isValidSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const digestBuffer = Buffer.from(digest, 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')
  return (
    digestBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(digestBuffer, signatureBuffer)
  )
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload.meta?.event_name as string | undefined
  const customData = payload.meta?.custom_data as { user_id?: string; plan?: string } | null
  const attributes = payload.data?.attributes ?? {}

  switch (eventName) {
    case 'order_created': {
      if (customData?.plan === 'sprint' && customData.user_id) {
        await upsertSubscription({
          userId: customData.user_id,
          plan: 'sprint',
          lsCustomerId: String(attributes.customer_id ?? ''),
          sprintExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }, { lsSubscriptionId: '' })
      }
      break
    }

    case 'subscription_created':
    case 'subscription_updated': {
      if (customData?.user_id && attributes.status === 'active') {
        await upsertSubscription({
          userId: customData.user_id,
          plan: 'pro',
          lsCustomerId: String(attributes.customer_id ?? ''),
          lsSubscriptionId: String(payload.data.id),
        }, { sprintExpiresAt: '' })
      }
      break
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      if (customData?.user_id) {
        await upsertSubscription({
          userId: customData.user_id,
          plan: 'free',
          lsCustomerId: String(attributes.customer_id ?? ''),
        }, { lsSubscriptionId: '', sprintExpiresAt: '' })
      }
      break
    }
  }

  return NextResponse.json({ ok: true })
}
