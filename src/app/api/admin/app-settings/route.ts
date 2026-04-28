import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import type { AppSettings } from '@/lib/repositories/appSettings'
import { getAppSettings, updateAppSettings } from '@/lib/repositories/appSettings'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const settings = await getAppSettings()
  return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as {
    jsSandboxUseSandpack?: boolean
    mockInterviewUseSandpack?: boolean
  }

  const patch: Partial<AppSettings> = {}
  if (typeof body.jsSandboxUseSandpack === 'boolean') {
    patch.jsSandboxUseSandpack = body.jsSandboxUseSandpack
  }
  if (typeof body.mockInterviewUseSandpack === 'boolean') {
    patch.mockInterviewUseSandpack = body.mockInterviewUseSandpack
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: 'Provide jsSandboxUseSandpack and/or mockInterviewUseSandpack (boolean)' },
      { status: 400 },
    )
  }

  const settings = await updateAppSettings(patch)
  return NextResponse.json(settings)
}
