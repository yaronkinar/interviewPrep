import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { SavedQuestion } from '@/lib/models/SavedQuestion'

export function useSavedQuestions() {
  const { isSignedIn } = useAuth()
  const [saved, setSaved] = useState<SavedQuestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSignedIn) {
      setSaved([])
      return
    }
    setLoading(true)
    fetch('/api/saved-questions')
      .then(r => r.json())
      .then((data: SavedQuestion[]) => setSaved(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isSignedIn])

  const isSaved = useCallback(
    (questionId: string) => saved.some(s => s.questionId === questionId),
    [saved],
  )

  const saveQuestion = useCallback(
    async (questionId: string, section: string) => {
      if (!isSignedIn) return
      setSaved(prev => [...prev, { userId: '', questionId, section, savedAt: new Date() }])
      await fetch('/api/saved-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, section }),
      })
    },
    [isSignedIn],
  )

  const unsaveQuestion = useCallback(
    async (questionId: string) => {
      if (!isSignedIn) return
      setSaved(prev => prev.filter(s => s.questionId !== questionId))
      await fetch('/api/saved-questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      })
    },
    [isSignedIn],
  )

  const toggleSaved = useCallback(
    (questionId: string, section: string) => {
      if (isSaved(questionId)) {
        unsaveQuestion(questionId)
      } else {
        saveQuestion(questionId, section)
      }
    },
    [isSaved, saveQuestion, unsaveQuestion],
  )

  return { saved, loading, isSaved, saveQuestion, unsaveQuestion, toggleSaved }
}
