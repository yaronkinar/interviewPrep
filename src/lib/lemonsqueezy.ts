import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! })

const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!

export async function createLemonSqueezyCheckout(
  variantId: string,
  customData: Record<string, string>,
) {
  return createCheckout(STORE_ID, variantId, {
    checkoutData: { custom: customData },
  })
}
