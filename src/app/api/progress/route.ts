import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { UserProgress } from '@/lib/models/UserProgress'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const section = searchParams.get('section')

  const db = await getDb()
  const col = db.collection<UserProgress>('userProgress')

  if (section) {
    const item = await col.findOne({ userId, section })
    return NextResponse.json(item ?? { userId, section, completedQuestionIds: [], lastVisitedAt: null })
  }

  const items = await col.find({ userId }).toArray()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { section, completedQuestionId } = (await req.json()) as {
    section: string
    completedQuestionId?: string
  }
  if (!section) {
    return NextResponse.json({ error: 'section required' }, { status: 400 })
  }

  const db = await getDb()
  const col = db.collection<UserProgress>('userProgress')

  const update: Record<string, unknown> = { $set: { lastVisitedAt: new Date() } }
  if (completedQuestionId) {
    update.$addToSet = { completedQuestionIds: completedQuestionId }
  }

  await col.updateOne(
    { userId, section },
    update,
    { upsert: true },
  )

  return NextResponse.json({ ok: true })
}
