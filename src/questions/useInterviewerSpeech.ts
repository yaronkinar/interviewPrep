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
  engine?: 'browser' | 'elevenlabs'
  elevenlabsApiKey?: string
  elevenlabsVoiceId?: string
  speechRate?: number
  disableBrowserFallback?: boolean
}) {
  const {
    enabled,
    messages,
    voiceURI,
    engine = 'browser',
    elevenlabsApiKey,
    elevenlabsVoiceId,
    speechRate = 0.95,
    disableBrowserFallback = false,
  } = options
  const [speaking, setSpeaking] = useState(false)
  const [activeEngine, setActiveEngine] = useState<'idle' | 'browser' | 'elevenlabs'>('idle')
  const [lastError, setLastError] = useState<string | null>(null)
  const lastSpokenAssistantIndexRef = useRef(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const requestAbortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    requestAbortRef.current?.abort()
    requestAbortRef.current = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (isBrowserSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (markdown: string) => {
      const plain = markdownToPlainSpeech(markdown)
      if (!plain.trim()) return

      const playBrowserSpeech = () => {
        if (!isBrowserSpeechSynthesisSupported()) return
        setActiveEngine('browser')
        setLastError(null)
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(plain)
        u.lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
        // Slightly slower pace + neutral pitch tends to sound more natural for coaching.
        u.rate = speechRate
        u.pitch = 1
        if (voiceURI) {
          const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI)
          if (voice) {
            u.voice = voice
            if (voice.lang) u.lang = voice.lang
          }
        }
        u.onstart = () => setSpeaking(true)
        u.onend = () => setSpeaking(false)
        u.onerror = () => {
          setSpeaking(false)
          setActiveEngine('idle')
          setLastError('Browser speech synthesis failed.')
        }
        window.speechSynthesis.speak(u)
      }

      if (engine !== 'elevenlabs' || !elevenlabsApiKey?.trim() || !elevenlabsVoiceId?.trim()) {
        playBrowserSpeech()
        return
      }

      void (async () => {
        try {
          stop()
          const ctrl = new AbortController()
          requestAbortRef.current = ctrl
          setSpeaking(true)
          setLastError(null)
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elevenlabsVoiceId)}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': elevenlabsApiKey.trim(),
                Accept: 'audio/mpeg',
              },
              body: JSON.stringify({
                text: plain.slice(0, 4500),
                // Closer to Voice Library preview behavior for natural conversational delivery.
                model_id: 'eleven_turbo_v2_5',
                voice_settings: {
                  stability: 0.28,
                  similarity_boost: 0.9,
                  style: 0.42,
                  use_speaker_boost: true,
                },
                output_format: 'mp3_44100_128',
              }),
              signal: ctrl.signal,
            },
          )
          if (!res.ok) {
            let detail = ''
            try {
              detail = await res.text()
            } catch {
              // ignore
            }
            const msg = `ElevenLabs TTS failed (${res.status}).${detail ? ` ${detail}` : ''}`
            throw new Error(msg)
          }
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audioRef.current = audio
          setActiveEngine('elevenlabs')
          audio.onended = () => {
            URL.revokeObjectURL(url)
            setSpeaking(false)
            setActiveEngine('idle')
            if (audioRef.current === audio) audioRef.current = null
          }
          audio.onerror = () => {
            URL.revokeObjectURL(url)
            setSpeaking(false)
            if (audioRef.current === audio) audioRef.current = null
            if (disableBrowserFallback) {
              setActiveEngine('idle')
              setLastError('ElevenLabs audio playback failed.')
              return
            }
            playBrowserSpeech()
          }
          await audio.play()
        } catch {
          setSpeaking(false)
          setLastError('ElevenLabs request failed. Check API key, voice access, and credits.')
          if (disableBrowserFallback) {
            setActiveEngine('idle')
            return
          }
          playBrowserSpeech()
        } finally {
          requestAbortRef.current = null
        }
      })()
    },
    [voiceURI, engine, elevenlabsApiKey, elevenlabsVoiceId, speechRate, stop, disableBrowserFallback],
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
    elevenlabsEnabled: Boolean(elevenlabsApiKey?.trim()),
    speaking,
    activeEngine,
    lastError,
    stop,
    speakPreview: (text: string) => speak(text),
    diagnoseVoice: async () => {
      if (!elevenlabsApiKey?.trim() || !elevenlabsVoiceId?.trim()) {
        setLastError('Missing ElevenLabs API key or voice ID.')
        return
      }
      try {
        setLastError(null)
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elevenlabsVoiceId)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': elevenlabsApiKey.trim(),
              Accept: 'audio/mpeg',
            },
            body: JSON.stringify({
              text: 'Voice diagnostics check.',
              model_id: 'eleven_turbo_v2_5',
            }),
          },
        )
        if (!res.ok) {
          let detail = ''
          try {
            detail = await res.text()
          } catch {
            // ignore
          }
          setLastError(`Diagnosis failed (${res.status}).${detail ? ` ${detail}` : ''}`)
          return
        }
        setLastError('Diagnosis passed: ElevenLabs voice request succeeded.')
      } catch (e) {
        setLastError(`Diagnosis error: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
    },
  }
}
