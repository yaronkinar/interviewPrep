import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import {
  archiveQuestion,
  normalizeQuestionInput,
  restoreQuestion,
  updateQuestion,
} from '@/lib/repositories/questions'

type Params = {
  params: Promise<{ questionId: string }>
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { questionId } = await params
  const body = await req.json()

  if (body && typeof body === 'object' && 'archived' in body && Object.keys(body).length === 1) {
    const next = body.archived ? await archiveQuestion(questionId) : await restoreQuestion(questionId)
    if (!next) return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    return NextResponse.json({ question: next })
  }

  const normalized = normalizeQuestionInput(body)
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 })
  }

  if (normalized.question.id !== questionId) {
    return NextResponse.json({ error: 'Question id cannot be changed.' }, { status: 400 })
  }

  try {
    const question = await updateQuestion(questionId, normalized.question)
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    return NextResponse.json({ question })
  } catch (error) {
    console.error('Failed to update question', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { questionId } = await params
  const question = await archiveQuestion(questionId)
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  return NextResponse.json({ question })
}
