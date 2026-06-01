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
