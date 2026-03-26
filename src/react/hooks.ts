import { useState, useEffect, useCallback, useRef } from 'react'

export interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(url: string): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: T) => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch((e: Error) => { if (!cancelled) setState({ data: null, loading: false, error: e.message }) })
    return () => { cancelled = true }
  }, [url, tick])

  const refetch = useCallback(() => setTick(t => t + 1), [])
  return { ...state, refetch }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useRenderCount(): number {
  const count = useRef(0)
  count.current += 1
  return count.current
}
