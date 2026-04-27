import { NextResponse } from 'next/server'
import { searchQuestions, type QuestionSearchFilters } from '@/lib/repositories/questions'
import { CATEGORIES, COMPANIES, type Category, type Difficulty } from '@/questions/data'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

function parseDifficulty(value: string | null): Difficulty | undefined {
  return DIFFICULTIES.find(item => item === value)
}

function parseCategory(value: string | null): Category | undefined {
  return CATEGORIES.find(item => item === value)
}

function parseCompany(value: string | null): string | undefined {
  if (!value) return undefined
  return COMPANIES.find(item => item.id.toLowerCase() === value.toLowerCase())?.id
}

function parseLimit(value: string | null) {
  if (!value) return undefined
  const limit = Number(value)
  return Number.isFinite(limit) ? limit : undefined
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.trim() ?? ''

    if (!query) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 })
    }

    const difficulty = parseDifficulty(searchParams.get('difficulty'))
    const category = parseCategory(searchParams.get('category'))
    const company = parseCompany(searchParams.get('company'))
    const filters: QuestionSearchFilters = {
      ...(difficulty ? { difficulty } : {}),
      ...(category ? { category } : {}),
      ...(company ? { company } : {}),
    }
    const result = await searchQuestions({
      query,
      limit: parseLimit(searchParams.get('limit')),
      filters,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to search questions', error)
    return NextResponse.json({ error: 'Failed to search questions' }, { status: 500 })
  }
}
