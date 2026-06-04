import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { normalizeToSupported, type Locale } from '@/i18n/locale'
import { getDb } from '@/lib/mongodb'
import type { UserCvSelfIntro } from '@/lib/models/UserCvSelfIntro'

const COLLECTION = 'cvSelfIntros'
const MAX_MARKDOWN_BYTES = 400_000

function parseLocaleParam(value: string | null): Locale {
  return normalizeToSupported(value)
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const locale = parseLocaleParam(searchParams.get('locale'))

  const db = await getDb()
  const doc = await db.collection<UserCvSelfIntro>(COLLECTION).findOne({ userId, locale })
  if (!doc?.markdown?.trim()) {
    return NextResponse.json({ markdown: null, savedAt: null, locale })
  }
  return NextResponse.json({
    markdown: doc.markdown,
    savedAt: doc.savedAt instanceof Date ? doc.savedAt.toISOString() : String(doc.savedAt),
    locale: doc.locale,
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { markdown?: string; locale?: string }
  const markdown =
    typeof body.markdown === 'string' ? body.markdown : typeof body.markdown === 'undefined' ? '' : String(body.markdown)
  const locale = typeof body.locale === 'string' ? parseLocaleParam(body.locale) : parseLocaleParam(null)
  const trimmed = markdown.trim()
  if (!trimmed) {
    return NextResponse.json({ error: 'markdown is required and must not be empty' }, { status: 400 })
  }
  if (trimmed.length > MAX_MARKDOWN_BYTES) {
    return NextResponse.json({ error: 'markdown too large' }, { status: 413 })
  }

  const db = await getDb()
  const col = db.collection<UserCvSelfIntro>(COLLECTION)
  const now = new Date()
  await col.updateOne(
    { userId, locale },
    { $set: { userId, locale, markdown: trimmed, savedAt: now } },
    { upsert: true },
  )

  return NextResponse.json({ ok: true, savedAt: now.toISOString(), locale })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const locale = parseLocaleParam(searchParams.get('locale'))

  const db = await getDb()
  await db.collection(COLLECTION).deleteOne({ userId, locale })
  return NextResponse.json({ ok: true })
}
