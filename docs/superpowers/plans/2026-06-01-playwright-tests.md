# Playwright E2E Tests — Monetization Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Playwright and write E2E tests for the three gated monetization features: CV analysis paywall (`/cv`), mock interview paywall (`/questions` OpenChat), and company filter gate (`/questions`).

**Architecture:** Tests run against the real Next.js dev server (`http://localhost:3000`) and real MongoDB. Authentication uses Playwright storage state — a one-time global setup signs in via Clerk's UI and saves the browser session; all tests reuse that session. MongoDB `aiUsage` documents are seeded per-test using a direct MongoDB connection and the existing `MONGODB_URI` env var.

**Tech Stack:** `@playwright/test`, `dotenv`, `tsx` (to run scripts), `mongodb` (already installed), Clerk dev instance magic OTP (`424242` for `+clerk_test` emails)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `playwright.config.ts` | Create | Playwright config: baseURL, storageState, webServer |
| `tests/global-setup.ts` | Create | Signs in via Clerk UI once, saves `tests/.auth/user.json` |
| `tests/.auth/user.json` | Auto-created, gitignored | Saved browser session (cookies + localStorage) |
| `tests/helpers/seedUsage.ts` | Create | MongoDB `aiUsage` upsert/delete helpers |
| `tests/paywall/cv-analysis.spec.ts` | Create | 6 tests for CV analysis paywall |
| `tests/paywall/mock-interview.spec.ts` | Create | 4 tests for mock interview paywall (OpenChat) |
| `tests/filters/company-filter.spec.ts` | Create | 3 tests for company filter gate |
| `scripts/create-clerk-test-user.ts` | Create | One-time script to create the Clerk test user |
| `package.json` | Modify | Add `test:e2e` script, add devDependencies |
| `.env` | Modify | Add `CLERK_TEST_EMAIL`, `CLERK_TEST_USER_ID` |
| `.env.example` | Modify | Add same vars as documentation |
| `.gitignore` | Modify | Ignore `tests/.auth/`, `playwright-report/`, `test-results/` |

---

## Task 0: Install packages and update gitignore

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install @playwright/test, tsx, and dotenv**

```bash
npm install --save-dev @playwright/test tsx dotenv
npx playwright install chromium
```

Expected: chromium downloads to `~/.cache/ms-playwright/`, no errors.

- [ ] **Step 2: Add test:e2e script to package.json**

In `package.json` `"scripts"` section, add after the `"test"` line:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 3: Gitignore Playwright output**

Add to `.gitignore`:
```
# Playwright
tests/.auth/
playwright-report/
test-results/
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add @playwright/test and tsx devDependencies"
```

---

## Task 1: Create Clerk test user (one-time)

**Files:**
- Create: `scripts/create-clerk-test-user.ts`
- Modify: `.env`, `.env.example`

This task runs once. The created user is a permanent free-tier test user in the Clerk dev instance.

- [ ] **Step 1: Create scripts/create-clerk-test-user.ts**

```typescript
import * as dotenv from 'dotenv'
dotenv.config()

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) throw new Error('CLERK_SECRET_KEY is not set in .env')

  const email = 'e2e+clerk_test@interviews-dev.com'

  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [email],
      skip_password_requirement: true,
      skip_password_checks: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Clerk API error ${res.status}: ${err}`)
  }

  const user = (await res.json()) as { id: string }
  console.log('Test user created:')
  console.log(`  CLERK_TEST_EMAIL=${email}`)
  console.log(`  CLERK_TEST_USER_ID=${user.id}`)
  console.log('\nAdd both lines to your .env file.')
}

main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 2: Run the user creation script**

```bash
npx tsx scripts/create-clerk-test-user.ts
```

Expected output:
```
Test user created:
  CLERK_TEST_EMAIL=e2e+clerk_test@interviews-dev.com
  CLERK_TEST_USER_ID=user_2abc123...

Add both lines to your .env file.
```

If it fails with "email already exists", the user was already created — skip to Step 3 and look up the userId in the Clerk dashboard at https://dashboard.clerk.com → Users.

- [ ] **Step 3: Add the env vars to .env**

Open `.env` and append (use the userId from Step 2):
```
# ── E2E Testing ───────────────────────────────────────────────────────────────
CLERK_TEST_EMAIL=e2e+clerk_test@interviews-dev.com
CLERK_TEST_USER_ID=user_2abc123...
```

- [ ] **Step 4: Document vars in .env.example**

In `.env.example`, add after the Clerk section:
```
# ── E2E Testing ───────────────────────────────────────────────────────────────
CLERK_TEST_EMAIL=e2e+clerk_test@interviews-dev.com
CLERK_TEST_USER_ID=
```

- [ ] **Step 5: Commit**

```bash
git add scripts/create-clerk-test-user.ts .env.example
git commit -m "chore: one-time Clerk test user creation script"
```

---

## Task 2: Playwright config and global setup

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/global-setup.ts`

The global setup signs in through Clerk's sign-in page using the `+clerk_test` email. Clerk dev instances accept OTP `424242` for any `+clerk_test` address, meaning no real email is sent.

- [ ] **Step 1: Create playwright.config.ts at repo root**

```typescript
import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    storageState: 'tests/.auth/user.json',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  reporter: 'list',
})
```

- [ ] **Step 2: Create tests/global-setup.ts**

```typescript
import { chromium, type FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

export default async function globalSetup(_config: FullConfig) {
  const authFile = path.join(__dirname, '.auth', 'user.json')
  const authDir = path.dirname(authFile)
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })

  const email = process.env.CLERK_TEST_EMAIL
  if (!email) throw new Error('CLERK_TEST_EMAIL is not set — run: npx tsx scripts/create-clerk-test-user.ts')

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto('http://localhost:3000/sign-in')

  // Fill email in Clerk's sign-in form
  await page.locator('input[type="email"]').fill(email)
  await page.getByRole('button', { name: /continue/i }).click()

  // Clerk dev instance: +clerk_test emails accept OTP 424242 without a real email
  // Clerk renders individual digit inputs; keyboard.type distributes across them
  await page.locator('input[type="text"]').first().waitFor({ state: 'visible' })
  await page.locator('input[type="text"]').first().click()
  await page.keyboard.type('424242')
  await page.getByRole('button', { name: /verify/i }).click()

  // Wait until we are no longer on the sign-in page
  await page.waitForURL((url) => !url.pathname.includes('sign-in'), { timeout: 15_000 })

  await page.context().storageState({ path: authFile })
  await browser.close()
  console.log('Clerk session saved to tests/.auth/user.json')
}
```

- [ ] **Step 3: Verify the global setup works**

Start the dev server in one terminal:
```bash
npm run dev
```

In a second terminal, run the setup:
```bash
npx tsx tests/global-setup.ts
```

Expected: `Clerk session saved to tests/.auth/user.json` with no errors. The file `tests/.auth/user.json` should exist and contain cookies.

If Clerk renders OTP inputs differently (e.g. a single input instead of individual digits), adjust `tests/global-setup.ts` by replacing the individual-input block with:
```typescript
await page.locator('input[autocomplete="one-time-code"]').fill('424242')
```

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/global-setup.ts
git commit -m "chore: Playwright config and Clerk global auth setup"
```

---

## Task 3: MongoDB usage seeder

**Files:**
- Create: `tests/helpers/seedUsage.ts`

The `aiUsage` collection documents have schema `{ userId, month: 'YYYY-MM', cvAnalysisCount, mockInterviewCount }` with a unique index on `{ userId, month }`. This helper upserts/deletes for the current month.

- [ ] **Step 1: Create tests/helpers/seedUsage.ts**

```typescript
import { MongoClient } from 'mongodb'

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

async function connect() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME ?? 'interviews'
  if (!uri) throw new Error('MONGODB_URI is not set in .env')
  const client = new MongoClient(uri)
  await client.connect()
  return { col: client.db(dbName).collection('aiUsage'), client }
}

export async function seedAiUsage(
  userId: string,
  counts: { cvAnalysisCount?: number; mockInterviewCount?: number },
) {
  const { col, client } = await connect()
  try {
    await col.updateOne(
      { userId, month: currentMonth() },
      {
        $set: {
          userId,
          month: currentMonth(),
          cvAnalysisCount: counts.cvAnalysisCount ?? 0,
          mockInterviewCount: counts.mockInterviewCount ?? 0,
        },
      },
      { upsert: true },
    )
  } finally {
    await client.close()
  }
}

export async function clearAiUsage(userId: string) {
  const { col, client } = await connect()
  try {
    await col.deleteOne({ userId, month: currentMonth() })
  } finally {
    await client.close()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/helpers/seedUsage.ts
git commit -m "test: MongoDB aiUsage seed/clear helpers for E2E tests"
```

---

## Task 4: CV analysis paywall tests

**Files:**
- Create: `tests/paywall/cv-analysis.spec.ts`

**How the paywall triggers:** User navigates to `/cv`, fills the CV textarea (`#cv-analysis-cv`), and clicks "Analyze CV". The handler calls `POST /api/ai-usage/cv-analysis`. If `cvAnalysisCount >= 1` (free limit), the server returns `{ allowed: false }` and the component sets `showPaywall = true`, rendering `PaywallModal`. The modal backdrop is `.fixed.inset-0`.

- [ ] **Step 1: Create tests/paywall/cv-analysis.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { seedAiUsage, clearAiUsage } from '../helpers/seedUsage'

const USER_ID = process.env.CLERK_TEST_USER_ID!

test.describe('CV analysis paywall', () => {
  test.beforeEach(async () => {
    await clearAiUsage(USER_ID)
  })

  test.afterEach(async () => {
    await clearAiUsage(USER_ID)
  })

  test('no paywall modal on page load with 0 uses', async ({ page }) => {
    await page.goto('/cv')
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible()
  })

  test('paywall appears after clicking Analyze when at free limit', async ({ page }) => {
    await seedAiUsage(USER_ID, { cvAnalysisCount: 1 })
    await page.goto('/cv')

    await page.locator('#cv-analysis-cv').fill(
      'Jane Doe\nSoftware Engineer\n5 years React and Node experience',
    )
    await page.getByRole('button', { name: 'Analyze CV' }).click()

    await expect(page.locator('.fixed.inset-0')).toBeVisible({ timeout: 10_000 })
  })

  test('paywall modal copy mentions 1 free CV analysis', async ({ page }) => {
    await seedAiUsage(USER_ID, { cvAnalysisCount: 1 })
    await page.goto('/cv')
    await page.locator('#cv-analysis-cv').fill('Jane Doe\nSoftware Engineer')
    await page.getByRole('button', { name: 'Analyze CV' }).click()
    await page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 10_000 })

    await expect(page.getByText(/1 free CV analysis/i)).toBeVisible()
  })

  test('paywall modal shows Sprint and Pro plan buttons', async ({ page }) => {
    await seedAiUsage(USER_ID, { cvAnalysisCount: 1 })
    await page.goto('/cv')
    await page.locator('#cv-analysis-cv').fill('Jane Doe\nSoftware Engineer')
    await page.getByRole('button', { name: 'Analyze CV' }).click()
    await page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 10_000 })

    await expect(page.getByRole('button', { name: /sprint/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /pro/i })).toBeVisible()
  })

  test('"Maybe later" closes the paywall modal', async ({ page }) => {
    await seedAiUsage(USER_ID, { cvAnalysisCount: 1 })
    await page.goto('/cv')
    await page.locator('#cv-analysis-cv').fill('Jane Doe\nSoftware Engineer')
    await page.getByRole('button', { name: 'Analyze CV' }).click()
    await page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 10_000 })

    await page.getByRole('button', { name: /maybe later/i }).click()
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible()
  })

  test('clicking backdrop closes the paywall modal', async ({ page }) => {
    await seedAiUsage(USER_ID, { cvAnalysisCount: 1 })
    await page.goto('/cv')
    await page.locator('#cv-analysis-cv').fill('Jane Doe\nSoftware Engineer')
    await page.getByRole('button', { name: 'Analyze CV' }).click()
    await page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 10_000 })

    // Click the top-left corner of the backdrop (outside the modal card)
    await page.locator('.fixed.inset-0').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npx playwright test tests/paywall/cv-analysis.spec.ts --headed
```

Expected: 6 tests pass. If any fail, check:
- "Dev server running?" — `npm run dev` must be running on port 3000
- "Storage state valid?" — re-run `npx tsx tests/global-setup.ts` if session expired
- "API key set?" — `NEXT_PUBLIC_ANTHROPIC_API_KEY` must be set in `.env` for the Analyze button to be enabled

- [ ] **Step 3: Commit**

```bash
git add tests/paywall/cv-analysis.spec.ts
git commit -m "test: E2E CV analysis paywall tests"
```

---

## Task 5: Mock interview paywall tests

**Files:**
- Create: `tests/paywall/mock-interview.spec.ts`

**How the paywall triggers:** The mock interview paywall lives in the `OpenChat` component on `/questions`. The panel is collapsed by default — click "Ask anything (no specific question)" to expand it. Type a message in the textarea (`.q-chat-input`) and click "Send". On the first send, `OpenChat` calls `POST /api/ai-usage/mock-interview`. If `mockInterviewCount >= 3`, the server returns `{ allowed: false }` and `PaywallModal` appears.

The "Send" button requires `apiKey` to be non-empty. `NEXT_PUBLIC_ANTHROPIC_API_KEY` in `.env` is auto-loaded by `ApiKeySettings` as the default key, so no manual key entry is needed in tests.

- [ ] **Step 1: Create tests/paywall/mock-interview.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { seedAiUsage, clearAiUsage } from '../helpers/seedUsage'

const USER_ID = process.env.CLERK_TEST_USER_ID!

test.describe('Mock interview paywall (OpenChat)', () => {
  test.beforeEach(async () => {
    await clearAiUsage(USER_ID)
  })

  test.afterEach(async () => {
    await clearAiUsage(USER_ID)
  })

  test('paywall appears when free user hits mock interview limit', async ({ page }) => {
    await seedAiUsage(USER_ID, { mockInterviewCount: 3 })
    await page.goto('/questions')

    // Expand the OpenChat panel
    await page.getByRole('button', { name: /ask anything/i }).click()

    // Type a message and send
    await page.locator('.q-chat-input').fill('What is a closure in JavaScript?')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.locator('.fixed.inset-0')).toBeVisible({ timeout: 10_000 })
  })

  test('paywall modal copy mentions 3 free mock interviews', async ({ page }) => {
    await seedAiUsage(USER_ID, { mockInterviewCount: 3 })
    await page.goto('/questions')
    await page.getByRole('button', { name: /ask anything/i }).click()
    await page.locator('.q-chat-input').fill('What is a closure in JavaScript?')
    await page.getByRole('button', { name: 'Send' }).click()
    await page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 10_000 })

    await expect(page.getByText(/3 free mock interviews/i)).toBeVisible()
  })

  test('paywall modal shows Sprint and Pro plan buttons', async ({ page }) => {
    await seedAiUsage(USER_ID, { mockInterviewCount: 3 })
    await page.goto('/questions')
    await page.getByRole('button', { name: /ask anything/i }).click()
    await page.locator('.q-chat-input').fill('What is a closure in JavaScript?')
    await page.getByRole('button', { name: 'Send' }).click()
    await page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 10_000 })

    await expect(page.getByRole('button', { name: /sprint/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /pro/i })).toBeVisible()
  })

  test('"Maybe later" closes the mock interview paywall modal', async ({ page }) => {
    await seedAiUsage(USER_ID, { mockInterviewCount: 3 })
    await page.goto('/questions')
    await page.getByRole('button', { name: /ask anything/i }).click()
    await page.locator('.q-chat-input').fill('What is a closure in JavaScript?')
    await page.getByRole('button', { name: 'Send' }).click()
    await page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 10_000 })

    await page.getByRole('button', { name: /maybe later/i }).click()
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npx playwright test tests/paywall/mock-interview.spec.ts --headed
```

Expected: 4 tests pass. If "Send" button stays disabled, check that `NEXT_PUBLIC_ANTHROPIC_API_KEY` is set in `.env` and that the dev server was restarted after adding it.

- [ ] **Step 3: Commit**

```bash
git add tests/paywall/mock-interview.spec.ts
git commit -m "test: E2E mock interview paywall tests"
```

---

## Task 6: Company filter gate tests

**Files:**
- Create: `tests/filters/company-filter.spec.ts`

**How the gate works:** In `QuestionsPage` at `/questions`, free users see a locked `<a href="/pricing">` in place of the company filter `<select>`. The link has `aria-label="Company filter — Sprint or Pro required"`. The test user is always free-tier (no subscription seeding needed here).

- [ ] **Step 1: Create tests/filters/company-filter.spec.ts**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Company filter gate (free tier)', () => {
  test('locked company filter link is visible for free user', async ({ page }) => {
    await page.goto('/questions')

    const lockedLink = page.locator('a[aria-label*="Sprint or Pro required"]')
    await expect(lockedLink).toBeVisible({ timeout: 10_000 })
  })

  test('locked company filter link has correct aria-label', async ({ page }) => {
    await page.goto('/questions')

    const lockedLink = page.locator('a[aria-label*="Sprint or Pro required"]')
    await expect(lockedLink).toHaveAttribute(
      'aria-label',
      'Company filter — Sprint or Pro required',
    )
  })

  test('clicking locked company filter navigates to /pricing', async ({ page }) => {
    await page.goto('/questions')

    const lockedLink = page.locator('a[aria-label*="Sprint or Pro required"]')
    await lockedLink.click()

    await expect(page).toHaveURL(/\/pricing/)
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npx playwright test tests/filters/company-filter.spec.ts --headed
```

Expected: 3 tests pass. If the locked link is not found, verify the test user's subscription state — the `/api/subscription` route must return `{ plan: 'free' }` (no subscription record in MongoDB for this user).

- [ ] **Step 3: Run the full suite**

```bash
npx playwright test
```

Expected output:
```
Running 13 tests using 1 worker

  ✓ ... cv-analysis.spec.ts (6)
  ✓ ... mock-interview.spec.ts (4)
  ✓ ... company-filter.spec.ts (3)

  13 passed
```

- [ ] **Step 4: Commit**

```bash
git add tests/filters/company-filter.spec.ts
git commit -m "test: E2E company filter gate tests"
```

---

## Troubleshooting Reference

| Symptom | Fix |
|---------|-----|
| `CLERK_TEST_EMAIL is not set` | Add to `.env`, re-run `create-clerk-test-user.ts` |
| Global setup fails on OTP step | Try `page.locator('input[autocomplete="one-time-code"]').fill('424242')` instead |
| `storageState` error on test run | Delete `tests/.auth/user.json` and re-run `npx tsx tests/global-setup.ts` |
| "Send" button disabled | Ensure `NEXT_PUBLIC_ANTHROPIC_API_KEY` is set and dev server restarted |
| Paywall not showing after seed | Confirm `CLERK_TEST_USER_ID` matches the signed-in user's Clerk userId |
| Company filter shows `<select>` instead of locked link | Test user has a subscription in MongoDB; run `db.subscriptions.deleteOne({ userId: "..." })` |
