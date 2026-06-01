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
