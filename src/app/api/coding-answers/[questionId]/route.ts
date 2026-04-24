import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { CodingAnswer } from '@/lib/models/CodingAnswer'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionId } = await params
  const db = await getDb()
  const item = await db
    .collection<CodingAnswer>('codingAnswers')
    .findOne({ userId, questionId })

  return NextResponse.json(item ?? null)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionId } = await params
  const { code, section, language } = (await req.json()) as {
    code: string
    section: string
    language?: string
  }

  if (code === undefined || !section) {
    return NextResponse.json({ error: 'code and section required' }, { status: 400 })
  }

  const db = await getDb()
  await db.collection<CodingAnswer>('codingAnswers').updateOne(
    { userId, questionId },
    {
      $set: {
        userId,
        questionId,
        section,
        code,
        language: language ?? 'typescript',
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  )

  return NextResponse.json({ ok: true })
}
