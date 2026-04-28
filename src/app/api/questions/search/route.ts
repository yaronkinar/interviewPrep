import { NextResponse } from 'next/server'
import {
  companyIdsSortedForQueryInference,
  ensureCompanyRecorded,
  listCompaniesMergedWithSeed,
} from '@/lib/repositories/companies'
import {
  searchQuestions,
  type QuestionSearchFilters,
  distinctCompanyTagsFromQuestions,
  catalogSearchTokensForAutoCompany,
  questionSupportsAutoCompanyFromToken,
  proposeCompanyDisplayIdFromSearchToken,
} from '@/lib/repositories/questions'
import { CATEGORIES, type Category, type Difficulty } from '@/questions/data'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

function parseDifficulty(value: string | null): Difficulty | undefined {
  return DIFFICULTIES.find(item => item === value)
}

function parseCategory(value: string | null): Category | undefined {
  return CATEGORIES.find(item => item === value)
}

function parseLimit(value: string | null) {
  if (!value) return undefined
  const limit = Number(value)
  return Number.isFinite(limit) ? limit : undefined
}

export async function GET(req: Request) {
  try {
    const mergedCompanies = await listCompaniesMergedWithSeed()
    const tagsFromQuestions = await distinctCompanyTagsFromQuestions()

    const idByLower = new Map<string, string>()
    for (const c of mergedCompanies) idByLower.set(c.id.toLowerCase(), c.id)
    for (const t of tagsFromQuestions) {
      if (!idByLower.has(t.toLowerCase())) idByLower.set(t.toLowerCase(), t)
    }

    const searchableCompanyIds = companyIdsSortedForQueryInference([...idByLower.values()])

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.trim() ?? ''

    if (!query) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 })
    }

    const difficulty = parseDifficulty(searchParams.get('difficulty'))
    const category = parseCategory(searchParams.get('category'))

    const requestedCompanyRaw = searchParams.get('company')?.trim().toLowerCase()
    const companyFromParam = requestedCompanyRaw ? idByLower.get(requestedCompanyRaw) : undefined

    const filters: QuestionSearchFilters = {
      ...(difficulty ? { difficulty } : {}),
      ...(category ? { category } : {}),
      ...(companyFromParam ? { company: companyFromParam } : {}),
    }

    const result = await searchQuestions({
      query,
      limit: parseLimit(searchParams.get('limit')),
      filters,
      searchableCompanyIds,
    })

    if (result.matches.length > 0) {
      const toEnsure = new Set<string>()
      if (result.filters.company) {
        toEnsure.add(result.filters.company)
      }
      for (const match of result.matches) {
        for (const c of match.question.companies) {
          toEnsure.add(c)
        }
      }
      for (const t of catalogSearchTokensForAutoCompany(query, result.filters)) {
        if (idByLower.has(t)) continue
        if (
          result.matches.every(m => !questionSupportsAutoCompanyFromToken(m.question, t))
        ) {
          continue
        }
        toEnsure.add(proposeCompanyDisplayIdFromSearchToken(t))
      }
      await Promise.all([...toEnsure].map(label => ensureCompanyRecorded(label).catch(err => console.warn(err))))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to search questions', error)
    return NextResponse.json({ error: 'Failed to search questions' }, { status: 500 })
  }
}
