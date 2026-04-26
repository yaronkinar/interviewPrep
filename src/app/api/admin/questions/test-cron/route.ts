import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import { runQuestionDiscoveryCron } from '@/lib/questions/questionCron'
import { getQuestionSuggestionErrorMessage } from '@/lib/questions/questionSuggestions'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const result = await runQuestionDiscoveryCron()
    console.log('Question cron manually tested', {
      query: result.query,
      model: result.model,
      suggested: result.suggested,
      created: result.created.length,
      skipped: result.skipped.length,
      failed: result.failed.length,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Question cron manual test failed', error)
    return NextResponse.json({ error: getQuestionSuggestionErrorMessage(error) }, { status: 502 })
  }
}
