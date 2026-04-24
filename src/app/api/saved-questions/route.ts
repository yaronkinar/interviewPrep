import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { SavedQuestion } from '@/lib/models/SavedQuestion'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const items = await db
    .collection<SavedQuestion>('savedQuestions')
    .find({ userId })
    .sort({ savedAt: -1 })
    .toArray()

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionId, section } = (await req.json()) as { questionId: string; section: string }
  if (!questionId || !section) {
    return NextResponse.json({ error: 'questionId and section required' }, { status: 400 })
  }

  const db = await getDb()
  const col = db.collection<SavedQuestion>('savedQuestions')

  const existing = await col.findOne({ userId, questionId })
  if (!existing) {
    await col.insertOne({ userId, questionId, section, savedAt: new Date() })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionId } = (await req.json()) as { questionId: string }
  if (!questionId) {
    return NextResponse.json({ error: 'questionId required' }, { status: 400 })
  }

  const db = await getDb()
  await db.collection<SavedQuestion>('savedQuestions').deleteOne({ userId, questionId })

  return NextResponse.json({ ok: true })
}
