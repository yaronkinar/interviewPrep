import { useCallback, useEffect, useRef, useState } from 'react'
import { markdownToPlainSpeech } from './markdownToPlainSpeech'

export function isBrowserSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

interface ChatLike {
  role: string
  content: string
}

/**
 * Speaks new assistant messages with the browser text-to-speech API when `enabled` is true.
 * Skips streaming text; only finalized assistant bubbles trigger speech.
 */
export function useInterviewerSpeech(options: {
  enabled: boolean
  messages: ChatLike[]
  voiceURI?: string
}) {
  const { enabled, messages, voiceURI } = options
  const [speaking, setSpeaking] = useState(false)
  const lastSpokenAssistantIndexRef = useRef(-1)

  const stop = useCallback(() => {
    if (!isBrowserSpeechSynthesisSupported()) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (markdown: string) => {
    if (!isBrowserSpeechSynthesisSupported()) return
    const plain = markdownToPlainSpeech(markdown)
    if (!plain.trim()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(plain)
    u.lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
    if (voiceURI) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI)
      if (voice) {
        u.voice = voice
        if (voice.lang) u.lang = voice.lang
      }
    }
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
    },
    [voiceURI],
  )

  useEffect(() => {
    if (!enabled) {
      stop()
      return
    }
    const len = messages.length
    if (len === 0) {
      lastSpokenAssistantIndexRef.current = -1
      stop()
      return
    }
    const lastIdx = len - 1
    const last = messages[lastIdx]
    if (last.role !== 'assistant') return
    if (lastIdx === lastSpokenAssistantIndexRef.current) return
    lastSpokenAssistantIndexRef.current = lastIdx
    speak(last.content)
  }, [messages, enabled, speak, stop])

  useEffect(() => {
    return () => {
      if (isBrowserSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return {
    supported: isBrowserSpeechSynthesisSupported(),
    speaking,
    stop,
  }
}
