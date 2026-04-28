import { NextResponse } from 'next/server'
import { getAppSettings } from '@/lib/repositories/appSettings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await getAppSettings()
  return NextResponse.json({
    jsSandboxUseSandpack: settings.jsSandboxUseSandpack,
    mockInterviewUseSandpack: settings.mockInterviewUseSandpack,
  })
}
