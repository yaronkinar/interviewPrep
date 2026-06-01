# Monetization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3-tier freemium monetization (Free / Sprint $25 one-time 30 days / Pro $15/month) with Paddle payments, server-side feature gating, and upgrade UI.

**Architecture:** A `userSubscriptions` MongoDB collection stores plan status per Clerk user ID. A single `getUserPlan(userId)` utility is the source of truth for gating — called at the top of every gated API route. Paddle hosts the checkout page; webhooks update plan status. Client components fetch plan via `GET /api/subscription` and show paywall UI when limits are hit.

**Tech Stack:** `@paddle/paddle-node-sdk`, MongoDB (existing via `getDb()`), Clerk auth (existing), Next.js 16 App Router, Jest + `next/jest` for unit tests on repository logic.

---

## File Map

**New files:**
- `src/lib/models/UserSubscription.ts` — TypeScript interfaces for subscription + AI usage documents
- `src/lib/repositories/subscriptions.ts` — `getUserPlan`, `upsertSubscription`
- `src/lib/repositories/aiUsage.ts` — `checkAndIncrementMockInterview`, `checkAndIncrementCvAnalysis`, `getAiUsage`
- `src/lib/repositories/__tests__/subscriptions.test.ts` — unit tests
- `src/lib/repositories/__tests__/aiUsage.test.ts` — unit tests
- `src/app/api/subscription/route.ts` — GET current plan
- `src/app/api/checkout/route.ts` — POST create Paddle checkout URL
- `src/app/api/webhooks/paddle/route.ts` — Paddle event handler
- `src/app/api/ai-usage/mock-interview/route.ts` — POST check + increment mock interview usage
- `src/app/api/ai-usage/cv-analysis/route.ts` — POST check + increment CV analysis usage
- `src/app/pricing/page.tsx` — public pricing page
- `src/components/PaywallModal.tsx` — modal shown when free user hits limit
- `src/components/UsageCounter.tsx` — banner showing free-tier usage

**Modified files:**
- `.env.example` — add Paddle env vars
- `src/routes.ts` — add `/pricing` route
- `src/Nav.tsx` — add Pricing nav link
- `src/questions/OpenChat.tsx` — check AI usage before first message in session
- `src/questions/CvAnalysisPage.tsx` — check AI usage before analysis
- `jest.config.ts` — new file (Jest setup)

---

## Task 1: Install dependencies and configure environment

**Files:**
- Modify: `package.json` (via npm install)
- Create: `jest.config.ts`
- Modify: `.env.example`

- [ ] **Step 1: Install Paddle SDK and Jest**

```bash
npm install @paddle/paddle-node-sdk
npm install --save-dev jest @types/jest ts-jest
```

- [ ] **Step 2: Create jest.config.ts**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 3: Add test script to package.json**

Open `package.json` and add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 4: Add Paddle env vars to .env.example**

Open `.env.example` and append:
```
# Paddle (payments)
PADDLE_API_KEY=
PADDLE_ENV=sandbox
PADDLE_WEBHOOK_SECRET=
PADDLE_SPRINT_PRICE_ID=
PADDLE_PRO_MONTHLY_PRICE_ID=
PADDLE_PRO_ANNUAL_PRICE_ID=
```

- [ ] **Step 5: Verify jest runs**

```bash
npx jest --passWithNoTests
```

Expected: `No tests found` (or passes with 0 tests).

- [ ] **Step 6: Commit**

```bash
git add jest.config.ts .env.example package.json package-lock.json
git commit -m "chore: add Paddle SDK and Jest test runner"
```

---

## Task 2: Data model interfaces

**Files:**
- Create: `src/lib/models/UserSubscription.ts`

- [ ] **Step 1: Create the interfaces file**

```ts
// src/lib/models/UserSubscription.ts

export type Plan = 'free' | 'sprint' | 'pro'

export interface UserSubscriptionDoc {
  userId: string
  plan: Plan
  paddleCustomerId?: string
  paddleSubscriptionId?: string  // Pro only
  sprintExpiresAt?: Date          // Sprint only
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/models/UserSubscription.ts
git commit -m "feat: add UserSubscription and AiUsage model interfaces"
```

---

## Task 3: Subscription repository

**Files:**
- Create: `src/lib/repositories/subscriptions.ts`
- Create: `src/lib/repositories/__tests__/subscriptions.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/repositories/__tests__/subscriptions.test.ts

import { getUserPlan, upsertSubscription } from '../subscriptions'
import { getDb } from '@/lib/mongodb'

jest.mock('@/lib/mongodb')

const mockFindOne = jest.fn()
const mockUpdateOne = jest.fn()
const mockCreateIndex = jest.fn().mockResolvedValue('idx')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(getDb).mockResolvedValue({
    collection: () => ({
      findOne: mockFindOne,
      updateOne: mockUpdateOne,
      createIndex: mockCreateIndex,
    }),
  } as any)
})

describe('getUserPlan', () => {
  it('returns free when no subscription record exists', async () => {
    mockFindOne.mockResolvedValue(null)
    const result = await getUserPlan('user_abc')
    expect(result).toEqual({ plan: 'free' })
  })

  it('returns pro when plan is pro', async () => {
    mockFindOne.mockResolvedValue({ plan: 'pro' })
    const result = await getUserPlan('user_abc')
    expect(result.plan).toBe('pro')
  })

  it('returns sprint and expiry when sprint is active', async () => {
    const future = new Date(Date.now() + 86_400_000)
    mockFindOne.mockResolvedValue({ plan: 'sprint', sprintExpiresAt: future })
    const result = await getUserPlan('user_abc')
    expect(result.plan).toBe('sprint')
    expect(result.sprintExpiresAt).toEqual(future)
  })

  it('downgrades expired sprint to free and updates DB', async () => {
    const past = new Date(Date.now() - 1000)
    mockFindOne.mockResolvedValue({ plan: 'sprint', sprintExpiresAt: past })
    const result = await getUserPlan('user_abc')
    expect(result).toEqual({ plan: 'free' })
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { userId: 'user_abc' },
      { $set: { plan: 'free', updatedAt: expect.any(Date) } },
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest subscriptions.test.ts
```

Expected: FAIL — `Cannot find module '../subscriptions'`

- [ ] **Step 3: Implement the repository**

```ts
// src/lib/repositories/subscriptions.ts

import { getDb } from '@/lib/mongodb'
import type { UserSubscriptionDoc, Plan } from '@/lib/models/UserSubscription'

const COLLECTION = 'userSubscriptions'
let indexReady: Promise<string> | null = null

async function getCollection() {
  const db = await getDb()
  const col = db.collection<UserSubscriptionDoc>(COLLECTION)
  if (!indexReady) {
    indexReady = col.createIndex({ userId: 1 }, { unique: true })
  }
  await indexReady
  return col
}

export async function getUserPlan(
  userId: string,
): Promise<{ plan: Plan; sprintExpiresAt?: Date }> {
  const col = await getCollection()
  const doc = await col.findOne({ userId })
  if (!doc) return { plan: 'free' }

  if (doc.plan === 'sprint' && doc.sprintExpiresAt && doc.sprintExpiresAt < new Date()) {
    await col.updateOne({ userId }, { $set: { plan: 'free', updatedAt: new Date() } })
    return { plan: 'free' }
  }

  return { plan: doc.plan, sprintExpiresAt: doc.sprintExpiresAt }
}

export async function upsertSubscription(
  data: Omit<UserSubscriptionDoc, 'updatedAt'>,
): Promise<void> {
  const col = await getCollection()
  await col.updateOne(
    { userId: data.userId },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true },
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest subscriptions.test.ts
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories/subscriptions.ts src/lib/repositories/__tests__/subscriptions.test.ts
git commit -m "feat: subscription repository with getUserPlan and upsertSubscription"
```

---

## Task 4: AI usage repository

**Files:**
- Create: `src/lib/repositories/aiUsage.ts`
- Create: `src/lib/repositories/__tests__/aiUsage.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/repositories/__tests__/aiUsage.test.ts

import {
  checkAndIncrementMockInterview,
  checkAndIncrementCvAnalysis,
  getAiUsage,
} from '../aiUsage'
import { getDb } from '@/lib/mongodb'

jest.mock('@/lib/mongodb')

const mockFindOne = jest.fn()
const mockUpdateOne = jest.fn()
const mockCreateIndex = jest.fn().mockResolvedValue('idx')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(getDb).mockResolvedValue({
    collection: () => ({
      findOne: mockFindOne,
      updateOne: mockUpdateOne,
      createIndex: mockCreateIndex,
    }),
  } as any)
})

describe('checkAndIncrementMockInterview', () => {
  it('allows and increments when user is under the limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 1, cvAnalysisCount: 0 })
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(2)
    expect(mockUpdateOne).toHaveBeenCalled()
  })

  it('blocks when user is at the limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 3, cvAnalysisCount: 0 })
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(false)
    expect(mockUpdateOne).not.toHaveBeenCalled()
  })

  it('allows first ever use (no record)', async () => {
    mockFindOne.mockResolvedValue(null)
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(1)
  })

  it('always allows sprint and pro users without touching DB', async () => {
    const sprint = await checkAndIncrementMockInterview('user_abc', 'sprint')
    const pro = await checkAndIncrementMockInterview('user_abc', 'pro')
    expect(sprint.allowed).toBe(true)
    expect(pro.allowed).toBe(true)
    expect(mockFindOne).not.toHaveBeenCalled()
  })
})

describe('checkAndIncrementCvAnalysis', () => {
  it('blocks when user is at the CV limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 0, cvAnalysisCount: 1 })
    const result = await checkAndIncrementCvAnalysis('user_abc', 'free')
    expect(result.allowed).toBe(false)
  })

  it('allows and increments when under the CV limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 0, cvAnalysisCount: 0 })
    const result = await checkAndIncrementCvAnalysis('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest aiUsage.test.ts
```

Expected: FAIL — `Cannot find module '../aiUsage'`

- [ ] **Step 3: Implement the repository**

```ts
// src/lib/repositories/aiUsage.ts

import { getDb } from '@/lib/mongodb'
import type { AiUsageDoc } from '@/lib/models/UserSubscription'
import {
  FREE_MOCK_INTERVIEW_LIMIT,
  FREE_CV_ANALYSIS_LIMIT,
  type Plan,
} from '@/lib/models/UserSubscription'

const COLLECTION = 'aiUsage'
let indexReady: Promise<string> | null = null

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

async function getCollection() {
  const db = await getDb()
  const col = db.collection<AiUsageDoc>(COLLECTION)
  if (!indexReady) {
    indexReady = col.createIndex({ userId: 1, month: 1 }, { unique: true })
  }
  await indexReady
  return col
}

export async function checkAndIncrementMockInterview(
  userId: string,
  plan: Plan,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (plan !== 'free') return { allowed: true, used: 0, limit: Infinity }

  const col = await getCollection()
  const month = getCurrentMonth()
  const doc = await col.findOne({ userId, month })
  const used = doc?.mockInterviewCount ?? 0

  if (used >= FREE_MOCK_INTERVIEW_LIMIT) {
    return { allowed: false, used, limit: FREE_MOCK_INTERVIEW_LIMIT }
  }

  await col.updateOne(
    { userId, month },
    { $inc: { mockInterviewCount: 1 }, $setOnInsert: { cvAnalysisCount: 0 } },
    { upsert: true },
  )

  return { allowed: true, used: used + 1, limit: FREE_MOCK_INTERVIEW_LIMIT }
}

export async function checkAndIncrementCvAnalysis(
  userId: string,
  plan: Plan,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (plan !== 'free') return { allowed: true, used: 0, limit: Infinity }

  const col = await getCollection()
  const month = getCurrentMonth()
  const doc = await col.findOne({ userId, month })
  const used = doc?.cvAnalysisCount ?? 0

  if (used >= FREE_CV_ANALYSIS_LIMIT) {
    return { allowed: false, used, limit: FREE_CV_ANALYSIS_LIMIT }
  }

  await col.updateOne(
    { userId, month },
    { $inc: { cvAnalysisCount: 1 }, $setOnInsert: { mockInterviewCount: 0 } },
    { upsert: true },
  )

  return { allowed: true, used: used + 1, limit: FREE_CV_ANALYSIS_LIMIT }
}

export async function getAiUsage(
  userId: string,
): Promise<{ mockInterviewCount: number; cvAnalysisCount: number }> {
  const col = await getCollection()
  const month = getCurrentMonth()
  const doc = await col.findOne({ userId, month })
  return {
    mockInterviewCount: doc?.mockInterviewCount ?? 0,
    cvAnalysisCount: doc?.cvAnalysisCount ?? 0,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest aiUsage.test.ts
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Run all tests**

```bash
npx jest
```

Expected: PASS — all 10 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/repositories/aiUsage.ts src/lib/repositories/__tests__/aiUsage.test.ts
git commit -m "feat: AI usage repository with per-month free-tier enforcement"
```

---

## Task 5: GET /api/subscription

**Files:**
- Create: `src/app/api/subscription/route.ts`

- [ ] **Step 1: Create the route**

```ts
// src/app/api/subscription/route.ts

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
```

- [ ] **Step 2: Test manually**

Start the dev server (`npm run dev`) and run:

```bash
curl http://localhost:3000/api/subscription
```

Expected: `{"error":"Unauthorized"}` (since no session cookie).

Sign in via the UI, then use browser devtools to call `fetch('/api/subscription').then(r=>r.json()).then(console.log)`.

Expected: `{ plan: "free", sprintExpiresAt: null, aiUsage: { mockInterviewCount: 0, cvAnalysisCount: 0 } }`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/subscription/route.ts
git commit -m "feat: GET /api/subscription returns current plan and AI usage"
```

---

## Task 6: POST /api/ai-usage — mock interview and CV analysis gates

**Files:**
- Create: `src/app/api/ai-usage/mock-interview/route.ts`
- Create: `src/app/api/ai-usage/cv-analysis/route.ts`

- [ ] **Step 1: Create mock interview usage route**

```ts
// src/app/api/ai-usage/mock-interview/route.ts

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
```

- [ ] **Step 2: Create CV analysis usage route**

```ts
// src/app/api/ai-usage/cv-analysis/route.ts

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/repositories/subscriptions'
import { checkAndIncrementCvAnalysis } from '@/lib/repositories/aiUsage'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await getUserPlan(userId)
  const result = await checkAndIncrementCvAnalysis(userId, plan)

  return NextResponse.json(result, { status: result.allowed ? 200 : 403 })
}
```

- [ ] **Step 3: Test manually (signed in via browser devtools)**

```js
// In browser devtools, signed in as a free user:
fetch('/api/ai-usage/mock-interview', { method: 'POST' })
  .then(r => r.json()).then(console.log)
// Expected: { allowed: true, used: 1, limit: 3 }

// Call 3 more times, on the 4th:
// Expected: { allowed: false, used: 3, limit: 3 } with HTTP 403
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ai-usage/
git commit -m "feat: AI usage gate routes for mock interview and CV analysis"
```

---

## Task 7: POST /api/checkout — create Paddle checkout URL

**Files:**
- Create: `src/app/api/checkout/route.ts`

- [ ] **Step 1: Create the route**

```ts
// src/app/api/checkout/route.ts

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
```

- [ ] **Step 2: Set up Paddle sandbox**

1. Create a free Paddle sandbox account at sandbox.paddle.com
2. Create three products: Sprint ($25), Pro Monthly ($15/mo), Pro Annual ($120/yr)
3. Copy the price IDs and API key into your local `.env.local`:

```
PADDLE_API_KEY=your_sandbox_api_key
PADDLE_ENV=sandbox
PADDLE_SPRINT_PRICE_ID=pri_...
PADDLE_PRO_MONTHLY_PRICE_ID=pri_...
PADDLE_PRO_ANNUAL_PRICE_ID=pri_...
```

- [ ] **Step 3: Test manually**

```js
// In browser devtools, signed in:
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ plan: 'sprint' })
}).then(r => r.json()).then(console.log)
// Expected: { checkoutUrl: "https://sandbox-checkout.paddle.com/checkout/..." }
```

Open the URL in a browser — Paddle sandbox checkout page should appear.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat: POST /api/checkout creates Paddle hosted checkout URL"
```

---

## Task 8: POST /api/webhooks/paddle — handle Paddle events

**Files:**
- Create: `src/app/api/webhooks/paddle/route.ts`

- [ ] **Step 1: Create the webhook handler**

```ts
// src/app/api/webhooks/paddle/route.ts

import { NextResponse } from 'next/server'
import { Paddle, EventName, Environment } from '@paddle/paddle-node-sdk'
import { upsertSubscription } from '@/lib/repositories/subscriptions'

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.PADDLE_ENV === 'production'
      ? Environment.production
      : Environment.sandbox,
})

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
      // Sprint is a one-time purchase — identified by customData.plan === 'sprint'
      const customData = (event.data as any).customData as
        | { userId?: string; plan?: string }
        | null
      if (customData?.plan === 'sprint' && customData.userId) {
        await upsertSubscription({
          userId: customData.userId,
          plan: 'sprint',
          paddleCustomerId: (event.data as any).customerId ?? '',
          sprintExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
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
        })
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
        })
      }
      break
    }
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Set PADDLE_WEBHOOK_SECRET in .env.local**

In Paddle sandbox dashboard → Notifications → Add endpoint → `https://your-tunnel.ngrok.io/api/webhooks/paddle`. Copy the signing secret.

```
PADDLE_WEBHOOK_SECRET=pdl_ntfset_...
```

To test locally, use ngrok or the Paddle CLI to forward webhooks to localhost.

- [ ] **Step 3: Test with Paddle sandbox**

Complete a Sprint checkout in the sandbox. Check MongoDB `userSubscriptions` collection — a document with `plan: 'sprint'` and `sprintExpiresAt` set 30 days from now should appear.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/paddle/route.ts
git commit -m "feat: Paddle webhook handler for sprint/pro subscription events"
```

---

## Task 9: Pricing page

**Files:**
- Create: `src/app/pricing/page.tsx`

- [ ] **Step 1: Create the pricing page**

```tsx
// src/app/pricing/page.tsx

import { auth } from '@clerk/nextjs/server'
import { getUserPlan } from '@/lib/repositories/subscriptions'
import PricingCards from './PricingCards'

export default async function PricingPage() {
  const { userId } = await auth()
  const planInfo = userId ? await getUserPlan(userId) : { plan: 'free' as const }

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-3">Simple, honest pricing</h1>
        <p className="text-center text-muted-foreground mb-12">
          Land the job or keep growing — there&apos;s a plan for both.
        </p>
        <PricingCards currentPlan={planInfo.plan} isSignedIn={Boolean(userId)} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create the client PricingCards component**

```tsx
// src/app/pricing/PricingCards.tsx

'use client'

import { useState } from 'react'
import type { Plan } from '@/lib/models/UserSubscription'

interface Props {
  currentPlan: Plan
  isSignedIn: boolean
}

export default function PricingCards({ currentPlan, isSignedIn }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(plan: string) {
    if (!isSignedIn) {
      window.location.href = '/sign-in'
      return
    }
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Free */}
      <div className="rounded-xl border p-6 flex flex-col">
        <div className="mb-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Free</p>
          <p className="text-4xl font-bold">$0</p>
          <p className="text-sm text-muted-foreground mt-1">Forever</p>
        </div>
        <ul className="space-y-2 text-sm flex-1 mb-6">
          <li>✅ 20 questions/day</li>
          <li>✅ 2 learning tracks</li>
          <li>✅ 3 mock interviews/month</li>
          <li>✅ 1 CV analysis/month</li>
          <li>✅ Daily challenge</li>
          <li className="text-muted-foreground">❌ Company-tagged questions</li>
          <li className="text-muted-foreground">❌ All tracks</li>
          <li className="text-muted-foreground">❌ Solve guides</li>
        </ul>
        {currentPlan === 'free' ? (
          <button disabled className="w-full py-2 rounded-lg border text-sm text-muted-foreground">
            Current plan
          </button>
        ) : null}
      </div>

      {/* Sprint */}
      <div className="rounded-xl border-2 border-amber-500 p-6 flex flex-col relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          FOR JOB SEEKERS
        </div>
        <div className="mb-6">
          <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide mb-1">Sprint</p>
          <p className="text-4xl font-bold">$25</p>
          <p className="text-sm text-muted-foreground mt-1">One-time · 30 days full access</p>
        </div>
        <ul className="space-y-2 text-sm flex-1 mb-6">
          <li>✅ Everything in Free</li>
          <li>✅ Unlimited questions</li>
          <li>✅ All 8 learning tracks</li>
          <li>✅ Unlimited mock interviews</li>
          <li>✅ Unlimited CV analyses</li>
          <li>✅ Company-tagged questions</li>
          <li>✅ Solve guides & answers</li>
        </ul>
        {currentPlan === 'sprint' ? (
          <button disabled className="w-full py-2 rounded-lg border border-amber-500 text-sm text-amber-500">
            Current plan
          </button>
        ) : (
          <button
            onClick={() => handleCheckout('sprint')}
            disabled={loading === 'sprint'}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loading === 'sprint' ? 'Loading...' : 'Get Sprint — $25'}
          </button>
        )}
      </div>

      {/* Pro */}
      <div className="rounded-xl border-2 border-indigo-500 p-6 flex flex-col relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          BEST VALUE
        </div>
        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wide mb-1">Pro</p>
          <p className="text-4xl font-bold">$15<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
          <p className="text-sm text-muted-foreground mt-1">or $120/year — save 33%</p>
        </div>
        <ul className="space-y-2 text-sm flex-1 mb-6">
          <li>✅ Everything in Sprint</li>
          <li>✅ Unlimited access, always</li>
          <li>✅ New content as it ships</li>
          <li>✅ Priority support</li>
          <li>✅ Cancel anytime</li>
        </ul>
        {currentPlan === 'pro' ? (
          <button disabled className="w-full py-2 rounded-lg border border-indigo-500 text-sm text-indigo-400">
            Current plan
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => handleCheckout('pro-monthly')}
              disabled={loading === 'pro-monthly'}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading === 'pro-monthly' ? 'Loading...' : 'Get Pro — $15/month'}
            </button>
            <button
              onClick={() => handleCheckout('pro-annual')}
              disabled={loading === 'pro-annual'}
              className="w-full py-2 rounded-lg border border-indigo-500 hover:bg-indigo-500/10 text-indigo-400 text-sm transition-colors disabled:opacity-50"
            >
              {loading === 'pro-annual' ? 'Loading...' : 'Annual — $120/year'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add pricing route to src/routes.ts**

Open `src/routes.ts`. Find where routes are defined and add:
```ts
pricing: '/pricing',
```

- [ ] **Step 4: Add Pricing link to Nav**

Open `src/Nav.tsx`. Find the `PUBLIC_TAB_IDS` array (around line 44-59) and add a pricing entry. Also add the link in the navigation render section, following the same pattern as other nav links.

Look for how other public routes are rendered (the pattern with `href` and `label`), and add:
```tsx
{ id: 'pricing', href: '/pricing', label: 'Pricing' }
```

- [ ] **Step 5: Test in browser**

Navigate to `http://localhost:3000/pricing`. Expected: three-column pricing page showing Free / Sprint / Pro tiers with correct prices and feature lists.

Click "Get Sprint" while signed in. Expected: redirect to Paddle sandbox checkout.

- [ ] **Step 6: Commit**

```bash
git add src/app/pricing/ src/routes.ts src/Nav.tsx
git commit -m "feat: pricing page with 3-tier plans and Paddle checkout"
```

---

## Task 10: PaywallModal component

**Files:**
- Create: `src/components/PaywallModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/PaywallModal.tsx

'use client'

import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  feature: 'mockInterview' | 'cvAnalysis'
}

const FEATURE_LABELS: Record<Props['feature'], string> = {
  mockInterview: 'mock interviews',
  cvAnalysis: 'CV analyses',
}

const FEATURE_EMOJIS: Record<Props['feature'], string> = {
  mockInterview: '🎯',
  cvAnalysis: '📄',
}

const FREE_LIMITS: Record<Props['feature'], string> = {
  mockInterview: '3 free mock interviews',
  cvAnalysis: '1 free CV analysis',
}

export default function PaywallModal({ open, onClose, feature }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!open) return null

  async function handleCheckout(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{FEATURE_EMOJIS[feature]}</div>
          <h2 className="text-xl font-bold mb-2">
            You&apos;ve used your {FREE_LIMITS[feature]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Unlock unlimited {FEATURE_LABELS[feature]} plus all tracks, solve guides, and company questions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleCheckout('sprint')}
            disabled={loading === 'sprint'}
            className="border-2 border-amber-500 rounded-xl p-4 text-left hover:bg-amber-500/10 transition-colors disabled:opacity-50"
          >
            <p className="font-bold text-amber-500 text-sm">Sprint</p>
            <p className="text-2xl font-black mt-1">$25</p>
            <p className="text-xs text-muted-foreground">30 days, one-time</p>
          </button>
          <button
            onClick={() => handleCheckout('pro-monthly')}
            disabled={loading === 'pro-monthly'}
            className="border-2 border-indigo-500 rounded-xl p-4 text-left bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
          >
            <p className="font-bold text-indigo-400 text-sm">Pro</p>
            <p className="text-2xl font-black mt-1">$15<span className="text-sm font-normal">/mo</span></p>
            <p className="text-xs text-muted-foreground">Ongoing · cancel anytime</p>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-xs text-muted-foreground hover:text-foreground py-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PaywallModal.tsx
git commit -m "feat: PaywallModal component for AI usage limit upgrade prompt"
```

---

## Task 11: UsageCounter component

**Files:**
- Create: `src/components/UsageCounter.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/UsageCounter.tsx

'use client'

import Link from 'next/link'

interface Props {
  used: number
  limit: number
  feature: 'mockInterview' | 'cvAnalysis'
}

const LABELS: Record<Props['feature'], string> = {
  mockInterview: 'mock interview',
  cvAnalysis: 'CV analysis',
}

export default function UsageCounter({ used, limit, feature }: Props) {
  if (used === 0 || limit === Infinity) return null

  const remaining = limit - used
  const isLastOne = remaining === 1

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm mb-4">
      <span>
        ⚡ <strong>{used} of {limit}</strong> free {LABELS[feature]}s used this month
        {isLastOne && ' — last one!'}
      </span>
      <Link
        href="/pricing"
        className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs whitespace-nowrap ml-3"
      >
        Upgrade for unlimited →
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UsageCounter.tsx
git commit -m "feat: UsageCounter banner for free-tier usage warning"
```

---

## Task 12: Gate mock interviews in OpenChat

**Files:**
- Modify: `src/questions/OpenChat.tsx`

- [ ] **Step 1: Read the current OpenChat.tsx**

Open `src/questions/OpenChat.tsx` and find:
- The `messages` state (tracks conversation history)
- The function that handles user message submission (look for where `streamLlmChat` is called, around the `handleSend` or similar function)

- [ ] **Step 2: Add subscription state and gate logic**

At the top of the `OpenChat` component function, add state for tracking usage and paywall visibility:

```tsx
import { useEffect, useState, useCallback } from 'react'
import PaywallModal from '@/components/PaywallModal'
import UsageCounter from '@/components/UsageCounter'

// Inside the component, after existing state declarations:
const [aiUsage, setAiUsage] = useState<{ used: number; limit: number } | null>(null)
const [showPaywall, setShowPaywall] = useState(false)
const [plan, setPlan] = useState<'free' | 'sprint' | 'pro'>('free')
```

- [ ] **Step 3: Fetch subscription on mount**

Add a `useEffect` after the state declarations:

```tsx
useEffect(() => {
  fetch('/api/subscription')
    .then(r => r.json())
    .then(data => {
      setPlan(data.plan)
      if (data.plan === 'free') {
        setAiUsage({
          used: data.aiUsage.mockInterviewCount,
          limit: 3,
        })
      }
    })
    .catch(() => {})
}, [])
```

- [ ] **Step 4: Add gate check before the first message in a session**

Find the message-send handler in OpenChat.tsx (the function called when the user submits a message). Add this check at the **start** of that function, before calling `streamLlmChat`, but only when `messages.length === 0` (first message = new session):

```tsx
// Add at the start of the send handler, before streamLlmChat is called:
if (messages.length === 0 && plan === 'free') {
  const res = await fetch('/api/ai-usage/mock-interview', { method: 'POST' })
  const data = await res.json()
  if (!data.allowed) {
    setShowPaywall(true)
    return
  }
  setAiUsage({ used: data.used, limit: data.limit })
}
```

- [ ] **Step 5: Add PaywallModal and UsageCounter to the JSX**

In the component's return JSX, add:

```tsx
{/* Below the existing chat UI, above the input: */}
{aiUsage && plan === 'free' && (
  <UsageCounter used={aiUsage.used} limit={aiUsage.limit} feature="mockInterview" />
)}
<PaywallModal
  open={showPaywall}
  onClose={() => setShowPaywall(false)}
  feature="mockInterview"
/>
```

- [ ] **Step 6: Test in browser**

1. Sign in as a free user
2. Use the mock interview feature 3 times (send first message in 3 separate sessions)
3. On the 4th session first message: PaywallModal should appear
4. UsageCounter should show "2 of 3 free mock interviews used" after 2 uses

- [ ] **Step 7: Commit**

```bash
git add src/questions/OpenChat.tsx
git commit -m "feat: gate mock interviews for free tier with paywall modal"
```

---

## Task 13: Gate CV analysis in CvAnalysisPage

**Files:**
- Modify: `src/questions/CvAnalysisPage.tsx`

- [ ] **Step 1: Read the current CvAnalysisPage.tsx**

Open `src/questions/CvAnalysisPage.tsx` and find:
- The "Analyze" button handler (where `streamLlmChat` is called for CV analysis, around lines 417-439)
- Existing state declarations near the top

- [ ] **Step 2: Add subscription state**

```tsx
import PaywallModal from '@/components/PaywallModal'
import UsageCounter from '@/components/UsageCounter'

// Inside component, after existing state:
const [cvUsage, setCvUsage] = useState<{ used: number; limit: number } | null>(null)
const [showPaywall, setShowPaywall] = useState(false)
const [plan, setPlan] = useState<'free' | 'sprint' | 'pro'>('free')
```

- [ ] **Step 3: Fetch subscription on mount**

```tsx
useEffect(() => {
  fetch('/api/subscription')
    .then(r => r.json())
    .then(data => {
      setPlan(data.plan)
      if (data.plan === 'free') {
        setCvUsage({
          used: data.aiUsage.cvAnalysisCount,
          limit: 1,
        })
      }
    })
    .catch(() => {})
}, [])
```

- [ ] **Step 4: Add gate before CV analysis call**

Find the function that calls `streamLlmChat` for CV analysis (the analyze button handler, around line 417). Add at the start of that function:

```tsx
if (plan === 'free') {
  const res = await fetch('/api/ai-usage/cv-analysis', { method: 'POST' })
  const data = await res.json()
  if (!data.allowed) {
    setShowPaywall(true)
    return
  }
  setCvUsage({ used: data.used, limit: data.limit })
}
```

- [ ] **Step 5: Add UsageCounter and PaywallModal to JSX**

In the component's return JSX, near the analyze button, add:

```tsx
{cvUsage && plan === 'free' && (
  <UsageCounter used={cvUsage.used} limit={cvUsage.limit} feature="cvAnalysis" />
)}
<PaywallModal
  open={showPaywall}
  onClose={() => setShowPaywall(false)}
  feature="cvAnalysis"
/>
```

- [ ] **Step 6: Test in browser**

1. Sign in as a free user
2. Upload a CV and click Analyze — works first time
3. Click Analyze again — PaywallModal should appear

- [ ] **Step 7: Commit**

```bash
git add src/questions/CvAnalysisPage.tsx
git commit -m "feat: gate CV analysis for free tier with paywall modal"
```

---

## Task 14: Gate company-tagged questions

**Files:**
- Modify: `src/app/api/questions/search/route.ts` (or wherever the questions search API lives — check `src/app/api/` for the questions endpoint)

- [ ] **Step 1: Find the questions search API**

```bash
find src/app/api -name "route.ts" | sort
```

Look for a file under `src/app/api/questions/` that handles search/filtering.

- [ ] **Step 2: Add company filter gating**

In the questions search route, add plan check before returning company-filtered results. After the existing `auth()` call:

```ts
import { getUserPlan } from '@/lib/repositories/subscriptions'

// In the handler, after auth():
const { userId } = await auth()
// userId may be null for unauthenticated users — treat as free
const planInfo = userId ? await getUserPlan(userId) : { plan: 'free' as const }

// When the request includes a company filter:
const companyFilter = searchParams.get('company')
if (companyFilter && planInfo.plan === 'free') {
  return NextResponse.json(
    { error: 'Company-tagged questions require Sprint or Pro', upgrade: true },
    { status: 403 },
  )
}
```

- [ ] **Step 3: Handle the 403 in the questions UI**

In the questions page component (find it in `src/app/` or `src/questions/`), when the company filter returns a 403 with `{ upgrade: true }`, show a link to `/pricing`:

```tsx
if (data.upgrade) {
  // Show inline upgrade prompt instead of results
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-3">
        🏢 Company-tagged questions are available on Sprint and Pro.
      </p>
      <a href="/pricing" className="text-indigo-400 hover:underline font-semibold">
        View plans →
      </a>
    </div>
  )
}
```

- [ ] **Step 4: Test in browser**

1. Sign in as a free user
2. On the questions page, filter by a company (e.g. Google)
3. Expected: upgrade prompt appears instead of results

- [ ] **Step 5: Commit**

```bash
git add src/app/api/questions/
git commit -m "feat: gate company-tagged question filtering for free tier"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| Free tier: 3 mock interviews/month | Task 4 (repository) + Task 6 (API) + Task 12 (UI) |
| Free tier: 1 CV analysis/month | Task 4 (repository) + Task 6 (API) + Task 13 (UI) |
| Sprint: $25, 30 days, one-time | Task 7 (webhook) + Task 9 (pricing page) |
| Pro: $15/month subscription | Task 7 (webhook) + Task 9 (pricing page) |
| Paddle payment integration | Task 7 (checkout) + Task 8 (webhook) |
| Sprint expiry → downgrade to Free | Task 3 (getUserPlan auto-downgrades) |
| Pricing page /pricing | Task 9 |
| Paywall modal | Task 10 |
| Usage counter | Task 11 |
| Company questions gated | Task 14 |
| Nav link to /pricing | Task 9 (step 4) |
| UserSubscription MongoDB model | Task 2 + Task 3 |
| AiUsage MongoDB model | Task 2 + Task 4 |
| GET /api/subscription | Task 5 |
| POST /api/checkout | Task 7 |
| POST /api/webhooks/paddle | Task 8 |

**Not in scope (per spec):** Solve guide gating (requires identifying answer sections in question data), question daily limit (requires view tracking), saved question limit, Sprint expiry notification.
