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
