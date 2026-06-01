# Monetization Design

**Date:** 2026-06-01
**Status:** Approved

## Goal

Build a sustainable business around the interview prep platform. Target meaningful MRR growth, not just cost coverage. Serve both active job seekers (high urgency, short window) and upskilling developers (ongoing, recurring).

---

## Pricing Model: 3-Tier Freemium

### Free — $0 forever
Entry point and conversion funnel.

- 20 questions/day (browsing + reading answers)
- 2 learning tracks (JS + one other)
- 3 mock interview sessions/month
- 1 CV analysis/month
- Daily challenge
- Progress tracking
- Save up to 10 questions

**Gated (not available on Free):**
- Company-tagged questions (Google, Meta, Amazon, etc.)
- Full track library (TypeScript, Vue, Angular, CSS, Full Stack, Full Stack)
- Solve guides and detailed answers
- Unlimited mock interviews
- Unlimited CV analyses
- Unlimited saved questions

### Sprint — $25 one-time
Targets active job seekers who have a defined interviewing window and don't want a recurring subscription.

- Full access to everything for **30 days**
- Expires after 30 days, user drops back to Free
- No auto-renewal, no subscription

### Pro — $15/month · $120/year (33% saving)
Targets developers who want ongoing access for continuous upskilling. Annual plan drives upfront commitment.

- Everything in Sprint, permanently
- New content as it ships
- Priority support
- Cancel anytime

**Conversion path:** Free → Sprint is the primary job-seeker funnel (urgency + one-time cost = low friction). Sprint → Pro targets users who land a job and want to keep upskilling, or who need more than 30 days.

---

## Payment Infrastructure

**Provider:** LemonSqueezy (Stripe is unavailable in Israel; LemonSqueezy acts as merchant of record, handles international VAT/taxes automatically, and supports Israeli sellers)

**Checkout flow:** LemonSqueezy hosted checkout (overlay or redirect). Avoids PCI compliance burden, ships fast. LemonSqueezy handles all tax compliance globally.

**LemonSqueezy product setup:**
- Sprint: one-time variant, $25
- Pro monthly: subscription variant, $15/month
- Pro annual: subscription variant, $120/year

**Webhook events handled** at `/api/webhooks/lemonsqueezy`:
- `order_created` → set Sprint plan + expiry in MongoDB
- `subscription_created` → set Pro plan in MongoDB
- `subscription_updated` → sync Pro status
- `subscription_cancelled` / `subscription_expired` → downgrade to Free
- Sprint sets `sprintExpiresAt = now + 30 days`; no subscription created

---

## Data Model

### New collection: `UserSubscription`

```ts
{
  userId: string,                    // Clerk user ID
  plan: 'free' | 'sprint' | 'pro',
  lemonSqueezyCustomerId: string,
  lemonSqueezySubscriptionId?: string, // Pro only
  sprintExpiresAt?: Date,              // Sprint only
  updatedAt: Date
}
```

### New collection: `AiUsage`

Tracks monthly AI usage for free-tier enforcement.

```ts
{
  userId: string,
  month: string,                 // e.g. "2026-06"
  mockInterviewCount: number,
  cvAnalysisCount: number
}
```

---

## Feature Gating Architecture

**Core utility:** `getUserPlan(userId): Promise<{ plan, sprintExpiresAt? }>`

- Reads `UserSubscription` from MongoDB
- If Sprint and `sprintExpiresAt < now`, returns `free` and downgrades record
- Called at the top of every gated API route and Server Component — no per-feature logic scattered across the codebase

**Gating layers:**

1. **API routes** — check plan before returning gated data (company questions, solve guides, AI sessions beyond free limits)
2. **Server Components** — receive `plan` as prop; render Pro badge, lock overlays, usage counters
3. **Usage enforcement** — AI routes increment `AiUsage` and reject if over free-tier limit before calling Claude/OpenAI

**Free-tier limits enforced server-side:**
- Mock interviews: 3/month (checked against `AiUsage.mockInterviewCount`)
- CV analyses: 1/month (checked against `AiUsage.cvAnalysisCount`)
- Questions/day: 20 (checked via simple daily counter or rate-limiting middleware)

---

## New Routes

| Route | Purpose |
|-------|---------|
| `/pricing` | Public pricing page, always accessible |
| `/api/webhooks/lemonsqueezy` | LemonSqueezy event handler |
| `/api/checkout` | POST — creates LemonSqueezy checkout URL for given plan |
| `/api/subscription` | GET — returns current user's plan (for client components) |

---

## UI Conversion Touchpoints

### 1. Inline content gate
Shown on gated content (company-tagged questions, solve guides). Renders a PRO badge on the item and an unlock banner below with an "Upgrade →" CTA.

### 2. Paywall modal
Shown when a free user hits their AI usage limit (mock interviews or CV analysis). Displays Sprint and Pro side-by-side with prices. "Maybe later" dismiss option.

### 3. Usage counter
Shown on mock interview and CV analysis pages as user approaches their free limit (e.g., "2 of 3 free mock interviews used this month"). Warm warning that primes the upgrade before the hard block. Includes an "Upgrade for unlimited →" link.

### 4. Pricing page (`/pricing`)
Standalone public page showing all three tiers side-by-side. Linked from nav and all upgrade CTAs.

---

## Out of Scope (for now)

- Teams / B2B / bootcamp plans — valid future direction, not in this phase
- Credits / pay-per-use model
- Referral or affiliate program
- In-app notifications for expiring Sprint
