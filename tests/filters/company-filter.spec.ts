import { test, expect } from '@playwright/test'

test.describe('Company filter gate (free tier)', () => {
  test('locked company filter link is visible for free user', async ({ page }) => {
    await page.goto('/questions')

    const lockedLink = page.locator('a[href="/pricing"][aria-label*="Sprint or Pro required"]')
    await expect(lockedLink).toBeVisible({ timeout: 10_000 })
  })

  test('locked company filter link has correct aria-label', async ({ page }) => {
    await page.goto('/questions')

    const lockedLink = page.locator('a[href="/pricing"][aria-label*="Sprint or Pro required"]')
    await expect(lockedLink).toHaveAttribute(
      'aria-label',
      'Company filter — Sprint or Pro required',
    )
  })

  test('clicking locked company filter navigates to /pricing', async ({ page }) => {
    await page.goto('/questions')

    const lockedLink = page.locator('a[href="/pricing"][aria-label*="Sprint or Pro required"]')
    await lockedLink.click()

    await expect(page).toHaveURL(/\/pricing/)
  })
})
