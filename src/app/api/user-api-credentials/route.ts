import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import {
  getUserCredentialsClientSnapshot,
  sanitizePutBody,
  upsertUserApiCredentialsPartial,
} from '@/lib/repositories/userApiCredentials'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dto = await getUserCredentialsClientSnapshot(userId)
    return NextResponse.json(dto)
  } catch {
    return NextResponse.json({ error: 'Failed to load credentials' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = sanitizePutBody(body && typeof body === 'object' ? body : {})
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }

  const res = await upsertUserApiCredentialsPartial(userId, parsed.dto)
  if (res.error === 'encryption_unavailable') {
    return NextResponse.json(
      {
        error:
          'Credential encryption is unavailable. Set USER_CREDENTIALS_ENCRYPTION_KEY to a passphrase (recommended; stored values are hashed to an AES key) or ensure NODE_ENV allows dev plaintext fallback.',
      },
      { status: 503 },
    )
  }

  return NextResponse.json({ ok: true })
}
