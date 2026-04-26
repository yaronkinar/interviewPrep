'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Question } from './data'

type QuestionsResponse = {
  questions?: Question[]
  error?: string
}

export function useQuestionCatalog(ids?: string[]) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const idsProvided = ids !== undefined
  const idsKey = ids?.join(',') ?? ''

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
      const params = idsKey ? `?ids=${encodeURIComponent(idsKey)}` : ''
      const response = await fetch(`/api/questions${params}`)
      const data = (await response.json().catch(() => null)) as QuestionsResponse | null

      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to load questions')
      }

      setQuestions(Array.isArray(data?.questions) ? data.questions : [])
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

  return { questions, loading, error, reload: loadQuestions }
}
