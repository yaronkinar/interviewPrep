# Playwright E2E Tests — Monetization Branch

## Goal

Add Playwright end-to-end tests for the three gated features shipped on `feat/monetization`:
- CV analysis paywall (free tier: 1 use)
- Mock interview paywall (free tier: 3 uses)
- Company-tagged question filtering gate

Tests run against the real Next.js dev server and real MongoDB. Authentication is injected via `@clerk/testing` (no UI sign-in flow).

## Infrastructure

### Packages
- `@playwright/test` — test runner
- `@clerk/testing` — token injection for Clerk dev instances

### Config: `playwright.config.ts` (repo root)
- `baseURL: 'http://localhost:3000'`
- Browser: Chromium only
- `reuseExistingServer: true` — dev server must be running before `npx playwright test`
- Timeout: 30s per test

### New env vars
Add to `.env` and `.env.example`:
```
CLERK_TEST_USER_ID=user_xxx   # Clerk userId of a free-tier test user
```

### File layout
```
tests/
  helpers/
    auth.ts           # setupClerkTestingToken wrapper
    seedUsage.ts      # MongoDB upsert/delete for aiUsage collection
  paywall/
    cv-analysis.spec.ts
    mock-interview.spec.ts
  filters/
    company-filter.spec.ts
```

## Helpers

### `tests/helpers/auth.ts`
- Exports a `setupAuth(page)` function
- Calls `setupClerkTestingToken({ userId: process.env.CLERK_TEST_USER_ID })` to inject a real Clerk session into the browser without going through the sign-in UI
- Called in `beforeAll` of each spec

### `tests/helpers/seedUsage.ts`
- Connects to MongoDB using existing `MONGODB_URI` + `MONGODB_DB_NAME` env vars
- Exports `seedAiUsage(userId, { cvAnalysisCount, mockInterviewCount })` — upserts the `aiUsage` document
- Exports `clearAiUsage(userId)` — deletes the document
- Each spec calls seed in `beforeEach`, clear in `afterEach`

## Test Scenarios

### `tests/paywall/cv-analysis.spec.ts` — route `/cv`

| # | Setup | Action | Expected |
|---|-------|--------|----------|
| 1 | 0 CV uses in DB | Page load | No paywall modal visible |
| 2 | 1 CV use in DB (at limit) | Click Analyze button | PaywallModal appears |
| 3 | 1 CV use in DB | Paywall visible | Modal title contains "1 free CV analysis" |
| 4 | 1 CV use in DB | Paywall visible | Sprint ($25) and Pro ($15/mo) buttons present |
| 5 | 1 CV use in DB | Click "Maybe later" | Modal closes |
| 6 | 1 CV use in DB | Click backdrop | Modal closes |

### `tests/paywall/mock-interview.spec.ts` — route `/mock`

| # | Setup | Action | Expected |
|---|-------|--------|----------|
| 1 | 3 mock uses in DB (at limit) | Click Start Session | PaywallModal appears |
| 2 | 3 mock uses in DB | Paywall visible | Modal title contains "3 free mock interviews" |
| 3 | 3 mock uses in DB | Paywall visible | Sprint and Pro buttons present |
| 4 | 3 mock uses in DB | Click "Maybe later" | Modal closes |

### `tests/filters/company-filter.spec.ts` — route `/js`

Free users see a locked `<a>` link (with a Lock icon) in place of the company filter `<select>`. Clicking it navigates to `/pricing`.

| # | Setup | Action | Expected |
|---|-------|--------|----------|
| 1 | Free user | Page load | Company filter is a locked link, not a `<select>` |
| 2 | Free user | Page load | Locked link has `aria-label` containing "Sprint or Pro required" |
| 3 | Free user | Click locked company link | Navigates to `/pricing` |

## Test User

A single Clerk user in the `promoted-aphid-67` dev instance, stored as `CLERK_TEST_USER_ID`. This user:
- Has no Paddle subscription (free tier)
- Has no MongoDB subscription record
- Its `aiUsage` document is seeded/cleared per test

## Out of Scope

- Paid-tier flows (checkout redirect, Paddle webhooks)
- Sign-in / sign-up UI flows
- Admin panel
- Non-Chromium browsers
