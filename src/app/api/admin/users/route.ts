import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import { getAdminFlagsByUserIds } from '@/lib/repositories/users'

type AdminUserRow = {
  id: string
  primaryEmail: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
  isAdmin: boolean
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const limitParam = Number(searchParams.get('limit') ?? '50')
  const offsetParam = Number(searchParams.get('offset') ?? '0')

  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50
  const offset = Number.isFinite(offsetParam) ? Math.max(offsetParam, 0) : 0

  const client = await clerkClient()
  const list = await client.users.getUserList({ limit, offset })
  const adminFlags = await getAdminFlagsByUserIds(list.data.map(user => user.id))

  const users: AdminUserRow[] = list.data.map(user => {
    const primaryEmail =
      user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      null

    return {
      id: user.id,
      primaryEmail,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      isAdmin: adminFlags[user.id] ?? false,
    }
  })

  return NextResponse.json({
    users,
    totalCount: list.totalCount,
    limit,
    offset,
  })
}
