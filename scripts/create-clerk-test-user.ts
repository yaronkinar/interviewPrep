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
