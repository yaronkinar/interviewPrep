import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import { setUserAdminStatus } from '@/lib/repositories/users'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId: currentUserId } = await auth()
  if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(currentUserId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId: targetUserId } = await params
  const body = (await req.json()) as { isAdmin?: boolean }

  if (typeof body.isAdmin !== 'boolean') {
    return NextResponse.json({ error: 'isAdmin must be a boolean' }, { status: 400 })
  }

  if (!body.isAdmin && targetUserId === currentUserId) {
    return NextResponse.json(
      { error: 'You cannot remove your own admin role.' },
      { status: 400 },
    )
  }

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(targetUserId)
  const primaryEmail =
    clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null

  await setUserAdminStatus({
    userId: targetUserId,
    isAdmin: body.isAdmin,
    email: primaryEmail,
  })

  return NextResponse.json({ ok: true })
}
