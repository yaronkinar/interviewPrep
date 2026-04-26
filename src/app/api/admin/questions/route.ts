import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import {
  createQuestion,
  listQuestionDocuments,
  normalizeQuestionInput,
  toPublicQuestion,
} from '@/lib/repositories/questions'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const includeArchived = searchParams.get('includeArchived') === 'true'
  const documents = await listQuestionDocuments({ includeArchived })

  return NextResponse.json({
    questions: documents.map(document => ({
      ...toPublicQuestion(document),
      order: document.order,
      archivedAt: document.archivedAt?.toISOString() ?? null,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    })),
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const normalized = normalizeQuestionInput(await req.json())
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 })
  }

  try {
    const question = await createQuestion(normalized.question)
    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'A question with this id already exists.' }, { status: 409 })
    }

    console.error('Failed to create question', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
