import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useCodingAnswer(questionId: string, section: string, language = 'typescript') {
  const { isSignedIn } = useAuth()
  const [initialCode, setInitialCode] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestCodeRef = useRef<string>('')

  useEffect(() => {
    if (!isSignedIn || !questionId) return
    fetch(`/api/coding-answers/${encodeURIComponent(questionId)}`)
      .then(r => r.json())
      .then((data: { code: string } | null) => {
        if (data?.code !== undefined) {
          setInitialCode(data.code)
          latestCodeRef.current = data.code
        }
      })
      .catch(() => {})
  }, [isSignedIn, questionId])

  const onCodeChange = useCallback(
    (code: string) => {
      if (!isSignedIn) return
      latestCodeRef.current = code
      setSaveStatus('saving')

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/coding-answers/${encodeURIComponent(questionId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: latestCodeRef.current, section, language }),
          })
          setSaveStatus(res.ok ? 'saved' : 'error')
        } catch {
          setSaveStatus('error')
        }
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 1000)
    },
    [isSignedIn, questionId, section, language],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return { initialCode, saveStatus, onCodeChange }
}
