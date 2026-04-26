import { NextResponse } from 'next/server'
import { runQuestionDiscoveryCron } from '@/lib/questions/questionCron'
import { getQuestionSuggestionErrorMessage } from '@/lib/questions/questionSuggestions'

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 500 })
  }

  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runQuestionDiscoveryCron()

    console.log('Question cron completed', {
      query: result.query,
      model: result.model,
      suggested: result.suggested,
      created: result.created.length,
      skipped: result.skipped.length,
      failed: result.failed.length,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Question cron failed', error)
    return NextResponse.json({ error: getQuestionSuggestionErrorMessage(error) }, { status: 502 })
  }
}
