import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { markdownToPlainSpeech } from './markdownToPlainSpeech'
import {
  DEFAULT_GOOGLE_CLOUD_TTS_VOICE_NAME,
  languageCodeFromGoogleVoiceName,
} from './googleCloudTtsVoices'
import { friendlyGoogleTtsErrorMessage } from './googleTtsApiErrors'

export function isBrowserSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

interface ChatLike {
  role: string
  content: string
}

export type InterviewerVoiceEngine = 'browser' | 'elevenlabs' | 'google'

/**
 * Speaks new assistant messages with the browser text-to-speech API when `enabled` is true.
 * Skips streaming text; only finalized assistant bubbles trigger speech.
 */
export function useInterviewerSpeech(options: {
  enabled: boolean
  messages: ChatLike[]
  voiceURI?: string
  engine?: InterviewerVoiceEngine
  elevenlabsApiKey?: string
  elevenlabsVoiceId?: string
  googleCloudTtsApiKey?: string
  /** If set, used when `googleCloudTtsApiKey` is empty (same Google Cloud key with TTS + Generative Language enabled). */
  geminiApiKeyForTtsFallback?: string
  googleTtsVoiceName?: string
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
    googleCloudTtsApiKey,
    geminiApiKeyForTtsFallback,
    googleTtsVoiceName,
    speechRate = 0.95,
    disableBrowserFallback = false,
  } = options

  const resolvedGoogleTtsApiKey = useMemo(
    () => googleCloudTtsApiKey?.trim() || geminiApiKeyForTtsFallback?.trim() || '',
    [googleCloudTtsApiKey, geminiApiKeyForTtsFallback],
  )
  const effectiveGoogleVoiceName =
    googleTtsVoiceName?.trim() || DEFAULT_GOOGLE_CLOUD_TTS_VOICE_NAME
  const [speaking, setSpeaking] = useState(false)
  const [activeEngine, setActiveEngine] = useState<'idle' | InterviewerVoiceEngine>('idle')
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

      const playAudioBlob = (blob: Blob, engineLabel: 'elevenlabs' | 'google') => {
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        setActiveEngine(engineLabel)
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
            setLastError(`${engineLabel === 'google' ? 'Google Cloud' : 'ElevenLabs'} audio playback failed.`)
            return
          }
          playBrowserSpeech()
        }
        void audio.play().catch(() => {
          URL.revokeObjectURL(url)
          setSpeaking(false)
          if (audioRef.current === audio) audioRef.current = null
          if (disableBrowserFallback) {
            setActiveEngine('idle')
            setLastError(`${engineLabel === 'google' ? 'Google Cloud' : 'ElevenLabs'} audio could not start (playback blocked).`)
            return
          }
          playBrowserSpeech()
        })
      }

      const useElevenLabs =
        engine === 'elevenlabs' && elevenlabsApiKey?.trim() && elevenlabsVoiceId?.trim()
      const useGoogle = engine === 'google' && resolvedGoogleTtsApiKey.length > 0

      if (!useElevenLabs && !useGoogle) {
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

          if (useElevenLabs) {
            const res = await fetch(
              `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elevenlabsVoiceId!)}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'xi-api-key': elevenlabsApiKey!.trim(),
                  Accept: 'audio/mpeg',
                },
                body: JSON.stringify({
                  text: plain.slice(0, 4500),
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
              throw new Error(`ElevenLabs TTS failed (${res.status}).${detail ? ` ${detail}` : ''}`)
            }
            const blob = await res.blob()
            playAudioBlob(blob, 'elevenlabs')
          } else if (useGoogle) {
            const voiceName = effectiveGoogleVoiceName
            const lang = languageCodeFromGoogleVoiceName(voiceName)
            const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(resolvedGoogleTtsApiKey)}`
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                input: { text: plain.slice(0, 4500) },
                voice: { languageCode: lang, name: voiceName },
                audioConfig: {
                  audioEncoding: 'MP3',
                  speakingRate: Math.min(4, Math.max(0.25, speechRate)),
                },
              }),
              signal: ctrl.signal,
            })
            if (!res.ok) {
              let detail = ''
              try {
                detail = await res.text()
              } catch {
                // ignore
              }
              throw new Error(friendlyGoogleTtsErrorMessage(res.status, detail))
            }
            const json = (await res.json()) as { audioContent?: string }
            if (!json.audioContent) {
              throw new Error('Google Cloud TTS returned no audio.')
            }
            const binary = Uint8Array.from(atob(json.audioContent), (c) => c.charCodeAt(0))
            const blob = new Blob([binary], { type: 'audio/mpeg' })
            playAudioBlob(blob, 'google')
          }
        } catch (e) {
          setSpeaking(false)
          const fromErr = e instanceof Error ? e.message : ''
          const label =
            engine === 'google'
              ? fromErr ||
                'Google Cloud TTS request failed. Enable Cloud Text-to-Speech API on your Google Cloud project and check billing.'
              : fromErr ||
                'ElevenLabs request failed. Check API key, voice access, and credits.'
          setLastError(label)
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
    [
      voiceURI,
      engine,
      elevenlabsApiKey,
      elevenlabsVoiceId,
      resolvedGoogleTtsApiKey,
      effectiveGoogleVoiceName,
      speechRate,
      stop,
      disableBrowserFallback,
    ],
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

  const diagnoseVoice = useCallback(async () => {
    if (engine === 'elevenlabs') {
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
      return
    }

    if (engine === 'google') {
      if (!resolvedGoogleTtsApiKey) {
        setLastError(
          'No Google TTS key: add one under Voice in AI settings (or use your Gemini key if Cloud Text-to-Speech API is enabled on the same Google Cloud project). Keys apply to the session as you type—Save still stores them for next visit.',
        )
        return
      }
      const voiceName = effectiveGoogleVoiceName
      const lang = languageCodeFromGoogleVoiceName(voiceName)
      try {
        setLastError(null)
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(resolvedGoogleTtsApiKey)}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: 'Voice diagnostics check.' },
            voice: { languageCode: lang, name: voiceName },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 1 },
          }),
        })
        if (!res.ok) {
          let detail = ''
          try {
            detail = await res.text()
          } catch {
            // ignore
          }
          setLastError(friendlyGoogleTtsErrorMessage(res.status, detail))
          return
        }
        const json = (await res.json()) as { audioContent?: string }
        if (!json.audioContent) {
          setLastError('Google Cloud TTS diagnosis: empty response.')
          return
        }
        setLastError('Diagnosis passed: Google Cloud TTS request succeeded.')
      } catch (e) {
        setLastError(`Diagnosis error: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
      return
    }

    setLastError('Diagnostics are only available for ElevenLabs or Google Cloud TTS.')
  }, [
    engine,
    elevenlabsApiKey,
    elevenlabsVoiceId,
    resolvedGoogleTtsApiKey,
    effectiveGoogleVoiceName,
  ])

  return {
    supported: isBrowserSpeechSynthesisSupported(),
    elevenlabsEnabled: Boolean(elevenlabsApiKey?.trim()),
    googleCloudTtsEnabled: resolvedGoogleTtsApiKey.length > 0,
    speaking,
    activeEngine,
    lastError,
    stop,
    speakPreview: (text: string) => speak(text),
    diagnoseVoice,
  }
}
