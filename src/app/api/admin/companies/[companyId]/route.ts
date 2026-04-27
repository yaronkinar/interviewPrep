import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/auth/admin'
import {
  archiveCompany,
  normalizeCompanyInput,
  restoreCompany,
  updateCompany,
} from '@/lib/repositories/companies'

type Params = {
  params: Promise<{ companyId: string }>
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { companyId } = await params
  const body = await req.json()

  if (body && typeof body === 'object' && 'archived' in body && Object.keys(body).length === 1) {
    const next = body.archived ? await archiveCompany(companyId) : await restoreCompany(companyId)
    if (!next) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    return NextResponse.json({ company: next })
  }

  const normalized = normalizeCompanyInput(body)
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 })
  }

  if (normalized.company.id !== companyId) {
    return NextResponse.json({ error: 'Company id cannot be changed.' }, { status: 400 })
  }

  try {
    const company = await updateCompany(companyId, normalized.company)
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    return NextResponse.json({ company })
  } catch (error) {
    console.error('Failed to update company', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await hasAdminAccess(userId)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { companyId } = await params
  const company = await archiveCompany(companyId)
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  return NextResponse.json({ company })
}
