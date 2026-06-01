# Pricing Modal Design

**Date:** 2026-06-01  
**Status:** Approved

## Summary

A modal-based pricing UI with Paddle inline checkout. Triggered from any paywall in the app. No standalone `/pricing` route. Three plans: Free, Sprint ($25 one-time), Pro ($15/mo or $120/yr).

---

## Component Architecture

### `src/components/PricingModal.tsx`
Radix UI `Dialog` with two internal views controlled by local state:
- `"plans"` — shows the 3 horizontal plan rows
- `"checkout"` — shows the Paddle inline checkout container

Props: `open: boolean`, `onClose: () => void`

### `src/hooks/usePricingModal.ts`
React context + hook that exposes `openPricing()` globally. Any component can call it without prop-drilling. Backed by a simple React context with a boolean + setter at the app root.

### `src/components/PaddleCheckout.tsx`
Thin wrapper that:
- Calls `Paddle.Checkout.open({ method: 'inline', items: [{ priceId, quantity: 1 }], container: '#paddle-checkout-container', customer: { email } })`
- Renders `<div id="paddle-checkout-container">`
- Listens for `checkout.completed` event → calls `onSuccess()`
- Unmounts cleanly on modal close (calls `Paddle.Checkout.close()`)

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle client-side token |
| `NEXT_PUBLIC_PADDLE_SPRINT_PRICE_ID` | Paddle price ID for Sprint ($25 one-time) |
| `NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID` | Paddle price ID for Pro ($15/mo) |
| `NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID` | Paddle price ID for Pro ($120/yr) |
| `PADDLE_WEBHOOK_SECRET` | Server-side webhook signature secret |

Sandbox mode is active when `NODE_ENV !== 'production'`.

---

## Modal Structure

**Width:** 560px max, full-screen on mobile.  
**Header:** "Unlock your full potential" / "Choose the plan that fits your job search."

### Plans View — 3 horizontal rows

| Plan | Price display | Feature summary | CTA |
|---|---|---|---|
| Free | $0 | 20 questions/day · 3 mocks/mo · 1 CV/mo | "Get Started" (or "Current plan" if already on free) |
| Sprint ⚡ | $25 one-time | Unlimited everything · 30-day full access | "Buy Now" |
| Pro | $15/mo or $120/yr | Sprint + new content weekly · priority support | "Subscribe" |

Sprint row has a 2px indigo border highlight.

Each row: left (plan name + price) · middle (feature summary) · right (CTA button).

### Checkout View

- Replaces plan rows when user clicks Buy Now / Subscribe
- Shows `← Back to plans` link at top
- `PaddleCheckout` mounts with the selected price IDs and user's Clerk email pre-filled. For Pro, both monthly and yearly price IDs are passed as items so Paddle's checkout renders its own interval selector. For Sprint, only the one-time price ID is passed.
- On `checkout.completed`: close modal, show success toast "You're all set!"

---

## Paddle Initialization

In `src/app/layout.tsx` (root layout), call `initializePaddle()` once on mount:

```ts
initializePaddle({
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
})
```

---

## Webhook Handler

**Route:** `src/app/api/webhooks/paddle/route.ts`

Handles these Paddle events:
- `subscription.created` / `subscription.activated` → set user plan to `"pro"` in Clerk `publicMetadata`
- `subscription.canceled` / `subscription.paused` → revert to `"free"`
- `transaction.completed` (for Sprint one-time) → set plan to `"sprint"` with expiry 30 days from now

Verifies Paddle webhook signature using `PADDLE_WEBHOOK_SECRET` before processing.

---

## Paywall Integration

`usePricingModal` is provided at app root. Existing paywall trigger points call `openPricing()`:
- Mock interview limit reached (3/month on free)
- CV analysis limit reached (1/month on free)
- Daily question cap reached (20/day on free)

---

## Out of Scope

- Standalone `/pricing` route
- Monthly/yearly toggle UI (billing interval chosen inside Paddle checkout)
- Coupon/promo code UI (handled by Paddle natively)
- Cancellation/upgrade/downgrade management UI (handled by Paddle customer portal)
