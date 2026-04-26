'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Question } from './data'

type QuestionsResponse = {
  questions?: Question[]
  error?: string
}

let catalogCache: Question[] | null = null
let catalogPromise: Promise<Question[]> | null = null
let catalogError: string | null = null
const listeners = new Set<() => void>()

function notifyCatalogListeners() {
  listeners.forEach(listener => listener())
}

async function fetchQuestionCatalog(idsKey = '') {
  const params = idsKey ? `?ids=${encodeURIComponent(idsKey)}` : ''
  const response = await fetch(`/api/questions${params}`)
  const data = (await response.json().catch(() => null)) as QuestionsResponse | null

  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load questions')
  }

  return Array.isArray(data?.questions) ? data.questions : []
}

function filterCachedQuestionsByIds(ids: string[]) {
  if (!catalogCache) return []

  const byId = new Map(catalogCache.map(question => [question.id, question]))
  return ids.map(id => byId.get(id)).filter((question): question is Question => Boolean(question))
}

export function preloadQuestionCatalog(options: { force?: boolean } = {}) {
  if (!options.force && catalogCache) return Promise.resolve(catalogCache)
  if (!options.force && catalogPromise) return catalogPromise

  catalogPromise = fetchQuestionCatalog()
    .then(questions => {
      catalogCache = questions
      catalogError = null
      notifyCatalogListeners()
      return questions
    })
    .catch(error => {
      catalogError = error instanceof Error ? error.message : 'Failed to load questions'
      notifyCatalogListeners()
      throw error
    })
    .finally(() => {
      catalogPromise = null
    })

  return catalogPromise
}

export function useQuestionCatalog(ids?: string[]) {
  const idsProvided = ids !== undefined
  const idsKey = ids?.join(',') ?? ''
  const initialQuestions = idsProvided && ids ? filterCachedQuestionsByIds(ids) : (catalogCache ?? [])
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [loading, setLoading] = useState(!catalogCache && !catalogError)
  const [error, setError] = useState<string | null>(catalogError)

  const loadQuestions = useCallback(async () => {
    if (idsProvided && !idsKey) {
      setQuestions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (idsProvided) {
        const requestedIds = idsKey.split(',').filter(Boolean)
        const catalog = catalogCache ?? await preloadQuestionCatalog()
        const byId = new Map(catalog.map(question => [question.id, question]))
        setQuestions(requestedIds.map(id => byId.get(id)).filter((question): question is Question => Boolean(question)))
      } else {
        setQuestions(await preloadQuestionCatalog())
      }
    } catch (err) {
      setQuestions([])
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [idsKey, idsProvided])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  useEffect(() => {
    if (idsProvided) return

    const listener = () => {
      setQuestions(catalogCache ?? [])
      setError(catalogError)
      setLoading(Boolean(catalogPromise))
    }

    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [idsProvided])

  return { questions, loading, error, reload: loadQuestions }
}
