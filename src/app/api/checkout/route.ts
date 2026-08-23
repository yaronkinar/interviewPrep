import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createLemonSqueezyCheckout } from '@/lib/lemonsqueezy'

const VARIANT_IDS: Record<string, string> = {
  sprint: process.env.LEMONSQUEEZY_SPRINT_VARIANT_ID!,
  'pro-monthly': process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
  'pro-annual': process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID!,
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = (await req.json()) as { plan: string }
  const variantId = VARIANT_IDS[plan]
  if (!variantId || variantId === 'undefined') {
    return NextResponse.json({ error: 'Plan not configured' }, { status: 503 })
  }

  let checkout: Awaited<ReturnType<typeof createLemonSqueezyCheckout>>
  try {
    checkout = await createLemonSqueezyCheckout(variantId, { user_id: userId, plan })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Payment provider error' }, { status: 502 })
  }

  const url = checkout.data?.data.attributes.url
  if (!url) return NextResponse.json({ error: 'Checkout URL unavailable' }, { status: 500 })
  return NextResponse.json({ checkoutUrl: url })
}
