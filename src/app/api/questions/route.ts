import { NextResponse } from 'next/server'
import { getQuestionsByIds, listQuestions } from '@/lib/repositories/questions'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = searchParams
      .get('ids')
      ?.split(',')
      .map(id => id.trim())
      .filter(Boolean)

    const questions = ids?.length ? await getQuestionsByIds([...new Set(ids)]) : await listQuestions()
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Failed to load questions', error)
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
  }
}
