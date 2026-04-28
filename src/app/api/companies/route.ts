import { NextResponse } from 'next/server'
import { deterministicCompanyBadgeStyle } from '@/lib/companies/deterministicStyle'
import { listCompaniesMergedWithSeed } from '@/lib/repositories/companies'
import { distinctCompanyTagsFromQuestions } from '@/lib/repositories/questions'
import type { Company } from '@/lib/models/Company'

export async function GET() {
  try {
    const merged = await listCompaniesMergedWithSeed()
    const tags = await distinctCompanyTagsFromQuestions()

    const byLower = new Map<string, Company>()
    for (const c of merged) {
      byLower.set(c.id.toLowerCase(), c)
    }
    for (const t of tags) {
      if (!byLower.has(t.toLowerCase())) {
        byLower.set(t.toLowerCase(), { id: t, ...deterministicCompanyBadgeStyle(t) })
      }
    }

    const companies = [...byLower.values()].sort((a, b) => a.id.localeCompare(b.id))
    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Failed to load companies', error)
    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 })
  }
}
