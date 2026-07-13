'use client'

import { initializePaddle, type Paddle } from '@paddle/paddle-js'

let paddlePromise: Promise<Paddle | undefined> | null = null

export function getPaddleClient(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
    })
  }
  return paddlePromise
}

export async function openPaddleCheckout(transactionId: string) {
  const paddle = await getPaddleClient()
  paddle?.Checkout.open({ transactionId })
}
