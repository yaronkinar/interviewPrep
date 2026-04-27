import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import { seedCompaniesFromStatic } from '@/lib/repositories/companies'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const stats = await seedCompaniesFromStatic()
    return NextResponse.json({ ok: true, stats })
  } catch (error) {
    console.error('Failed to seed companies', error)
    return NextResponse.json({ error: 'Failed to seed companies' }, { status: 500 })
  }
}
