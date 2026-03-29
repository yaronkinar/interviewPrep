import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0?: { transcript?: string }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionErrorEventLike = {
  error: string
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isBrowserSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

/**
 * Streams speech-to-text into a controlled text field. Uses the browser Web Speech API
 * (Chrome/Edge/Safari). Requires HTTPS (or localhost) and microphone permission.
 */
export function useSpeechDictation(options: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}) {
  const { value, onChange, disabled } = options
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const wantListenRef = useRef(false)
  const baseRef = useRef('')
  const finalsRef = useRef('')

  const stop = useCallback(() => {
    wantListenRef.current = false
    const r = recRef.current
    recRef.current = null
    if (r) {
      r.onend = null
      try {
        r.stop()
      } catch {
        /* already stopped */
      }
    }
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor || disabled) return
    setError(null)
    wantListenRef.current = true
    baseRef.current = valueRef.current
    finalsRef.current = ''

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US'

    rec.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        const piece = r[0]?.transcript ?? ''
        if (r.isFinal) {
          finalsRef.current += piece
        } else {
          interim += piece
        }
      }
      onChange(baseRef.current + finalsRef.current + interim)
    }

    rec.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'aborted') return
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        return
      }
      if (event.error === 'not-allowed') {
        setError('Microphone access denied.')
      } else {
        setError(`Voice input: ${event.error}`)
      }
      wantListenRef.current = false
      recRef.current = null
      setListening(false)
    }

    rec.onend = () => {
      if (!wantListenRef.current) {
        recRef.current = null
        setListening(false)
        return
      }
      if (recRef.current !== rec) return
      try {
        rec.start()
      } catch {
        wantListenRef.current = false
        recRef.current = null
        setListening(false)
      }
    }

    recRef.current = rec
    setListening(true)
    try {
      rec.start()
    } catch {
      setError('Could not start voice input.')
      wantListenRef.current = false
      recRef.current = null
      setListening(false)
    }
  }, [disabled, onChange])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, stop, start])

  useEffect(() => {
    if (disabled && listening) stop()
  }, [disabled, listening, stop])

  useEffect(() => {
    return () => {
      wantListenRef.current = false
      const r = recRef.current
      recRef.current = null
      if (r) {
        r.onend = null
        try {
          r.stop()
        } catch {
          /* */
        }
      }
    }
  }, [])

  /** Call from the text field when the user types — keeps voice merge consistent. */
  const onControlledInput = useCallback(
    (next: string) => {
      if (listening) {
        baseRef.current = next
        finalsRef.current = ''
      }
      onChange(next)
    },
    [listening, onChange],
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    supported: isBrowserSpeechRecognitionSupported(),
    listening,
    error,
    clearError,
    toggle,
    onControlledInput,
  }
}
