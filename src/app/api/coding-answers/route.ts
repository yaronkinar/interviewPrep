import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { CodingAnswer } from '@/lib/models/CodingAnswer'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const items = await db
    .collection<CodingAnswer>('codingAnswers')
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray()

  return NextResponse.json(items)
}
