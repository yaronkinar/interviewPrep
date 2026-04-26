import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import {
  clampSuggestionCount,
  getQuestionSuggestionErrorMessage,
  resolveQuestionSuggestionModel,
  resolveServerOpenAiKey,
  suggestInterviewQuestions,
} from '@/lib/questions/questionSuggestions'

type SuggestRequest = {
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

  const body = (await req.json().catch(() => null)) as SuggestRequest | null
  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  const company = typeof body?.company === 'string' ? body.company.trim() : ''
  const count = clampSuggestionCount(body?.count)
  const model = resolveQuestionSuggestionModel(body?.model)

  if (!query) {
    return NextResponse.json({ error: 'Search topic is required.' }, { status: 400 })
  }

  const apiKey =
    (typeof body?.apiKey === 'string' ? body.apiKey.trim() : '') ||
    resolveServerOpenAiKey()
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Save an OpenAI key in AI API settings or set OPENAI_API_KEY on the server.' },
      { status: 500 },
    )
  }

  try {
    const questions = await suggestInterviewQuestions({
      apiKey,
      model,
      query,
      company,
      count,
    })
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Failed to suggest questions', error)
    return NextResponse.json({ error: getQuestionSuggestionErrorMessage(error) }, { status: 502 })
  }
}
