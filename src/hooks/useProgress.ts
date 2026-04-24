import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { UserProgress } from '@/lib/models/UserProgress'

export function useProgress(section?: string) {
  const { isSignedIn } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [allProgress, setAllProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSignedIn) {
      setProgress(null)
      setAllProgress([])
      return
    }
    setLoading(true)
    const url = section ? `/api/progress?section=${encodeURIComponent(section)}` : '/api/progress'
    fetch(url)
      .then(r => r.json())
      .then((data: UserProgress | UserProgress[]) => {
        if (section) {
          setProgress(data as UserProgress)
        } else {
          setAllProgress(data as UserProgress[])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isSignedIn, section])

  const markVisited = useCallback(async () => {
    if (!isSignedIn || !section) return
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section }),
    })
  }, [isSignedIn, section])

  const markCompleted = useCallback(
    async (completedQuestionId: string) => {
      if (!isSignedIn || !section) return
      setProgress(prev => {
        if (!prev) {
          return {
            userId: '',
            section: section!,
            completedQuestionIds: [completedQuestionId],
            lastVisitedAt: new Date(),
          }
        }
        return {
          ...prev,
          completedQuestionIds: prev.completedQuestionIds.includes(completedQuestionId)
            ? prev.completedQuestionIds
            : [...prev.completedQuestionIds, completedQuestionId],
        }
      })
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, completedQuestionId }),
      })
    },
    [isSignedIn, section],
  )

  const completedIds = progress?.completedQuestionIds ?? []

  return { progress, allProgress, loading, completedIds, markVisited, markCompleted }
}
