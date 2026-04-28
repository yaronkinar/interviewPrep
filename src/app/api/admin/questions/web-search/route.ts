import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import {
  clampSuggestionCount,
  getQuestionSuggestionErrorMessage,
  resolveQuestionSuggestionModel,
  resolveServerOpenAiKey,
  suggestInterviewQuestionsFromWebContext,
} from '@/lib/questions/questionSuggestions'
import { ensureCompanyRecorded } from '@/lib/repositories/companies'
import { formatTavilyResultsForPrompt, resolveTavilyApiKey, tavilySearch } from '@/lib/search/tavilySearch'

const MAX_TAVILY_RESULTS = 8

type WebSearchRequest = {
  query?: unknown
  company?: unknown
  count?: unknown
  model?: unknown
  apiKey?: unknown
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json().catch(() => null)) as WebSearchRequest | null
  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  const company = typeof body?.company === 'string' ? body.company.trim() : ''
  const count = clampSuggestionCount(body?.count, 3)
  const model = resolveQuestionSuggestionModel(body?.model)

  if (!query) {
    return NextResponse.json({ error: 'Search topic is required.' }, { status: 400 })
  }

  const tavilyKey = resolveTavilyApiKey()
  if (!tavilyKey) {
    return NextResponse.json(
      { error: 'Tavily is not configured. Set TAVILY_API_KEY on the server (see .env.example).' },
      { status: 500 },
    )
  }

  const openAiKey = (typeof body?.apiKey === 'string' ? body.apiKey.trim() : '') || resolveServerOpenAiKey()
  if (!openAiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Set OPENAI_API_KEY on the server or pass apiKey in the request.' },
      { status: 500 },
    )
  }

  try {
    const { results, answer } = await tavilySearch({
      query,
      apiKey: tavilyKey,
      maxResults: MAX_TAVILY_RESULTS,
    })

    if (results.length === 0) {
      return NextResponse.json({
        questions: [],
        note: 'Web search returned no results for this query.',
      })
    }

    const webContext = formatTavilyResultsForPrompt(results, answer)
    const questions = await suggestInterviewQuestionsFromWebContext({
      apiKey: openAiKey,
      model,
      query,
      company,
      count,
      webContext,
    })

    if (questions.length > 0 && company) {
      try {
        await ensureCompanyRecorded(company)
      } catch (error) {
        console.warn('ensure company from web-search skipped', error)
      }
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Failed web search question generation', error)
    return NextResponse.json({ error: getQuestionSuggestionErrorMessage(error) }, { status: 502 })
  }
}
