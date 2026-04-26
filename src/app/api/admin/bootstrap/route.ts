import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { countAdmins, setUserAdminStatus } from '@/lib/repositories/users'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bootstrapUserId = process.env.ADMIN_BOOTSTRAP_USER_ID
  if (!bootstrapUserId) {
    return NextResponse.json({ error: 'ADMIN_BOOTSTRAP_USER_ID is not configured' }, { status: 400 })
  }

  if (userId !== bootstrapUserId) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        ...(process.env.NODE_ENV !== 'production'
          ? { currentUserId: userId, expectedUserId: bootstrapUserId }
          : {}),
      },
      { status: 403 },
    )
  }

  const adminCount = await countAdmins()
  if (adminCount > 0) {
    return NextResponse.json({ error: 'At least one admin already exists' }, { status: 409 })
  }

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const primaryEmail =
    clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null

  await setUserAdminStatus({
    userId,
    isAdmin: true,
    email: primaryEmail,
  })

  return NextResponse.json({ ok: true })
}
