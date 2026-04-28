'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Company } from '@/lib/models/Company'
import { deterministicCompanyBadgeStyle } from '@/lib/companies/deterministicStyle'
import { COMPANIES } from './data'

type CompaniesResponse = {
  companies?: Company[]
  error?: string
}

let cache: Company[] | null = null
let inflight: Promise<Company[]> | null = null
const listeners = new Set<() => void>()

function notifyCompaniesListeners() {
  listeners.forEach(listener => listener())
}

function seedCompaniesFallback(): Company[] {
  return COMPANIES.map(row => ({ ...row }))
}

async function fetchCompaniesMerged(): Promise<Company[]> {
  const response = await fetch('/api/companies')
  const data = (await response.json().catch(() => null)) as CompaniesResponse | null
  if (!response.ok || !data?.companies || data.companies.length === 0) {
    return seedCompaniesFallback()
  }
  return data.companies
}

export function preloadCompaniesCatalog(options: { force?: boolean } = {}) {
  if (!options.force && cache) return Promise.resolve(cache)
  if (!options.force && inflight) return inflight

  inflight = fetchCompaniesMerged()
    .then(list => {
      cache = list
      notifyCompaniesListeners()
      return list
    })
    .catch(() => {
      cache = seedCompaniesFallback()
      notifyCompaniesListeners()
      return cache
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function useCompaniesCatalog() {
  const initial = useMemo(() => cache ?? seedCompaniesFallback(), [])
  const [companies, setCompanies] = useState<Company[]>(initial)
  const [loading, setLoading] = useState(cache === null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void preloadCompaniesCatalog()
      .then(list => {
        if (!cancelled) setCompanies(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    const listener = () => {
      if (!cancelled) setCompanies(cache ?? seedCompaniesFallback())
    }
    listeners.add(listener)
    return () => {
      cancelled = true
      listeners.delete(listener)
    }
  }, [])

  const reload = useCallback(() => {
    cache = null
    notifyCompaniesListeners()
    return preloadCompaniesCatalog({ force: true }).then(setCompanies)
  }, [])

  return { companies, loading, reload }
}
