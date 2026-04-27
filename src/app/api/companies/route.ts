import { NextResponse } from 'next/server'
import { listCompanies } from '@/lib/repositories/companies'

export async function GET() {
  try {
    const companies = await listCompanies()
    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Failed to load companies', error)
    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 })
  }
}
