import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import {
  QUESTIONS,
  COMPANIES,
  CATEGORIES,
  type Question,
  type Difficulty,
  type Category,
} from './data'
import { useLocale } from '../i18n/LocaleContext'
import ApiKeySettings, { type AiSettingsSnapshot } from './ApiKeySettings'
import ChatMarkdown from './ChatMarkdown'
import { DEFAULT_ANTHROPIC_MODEL } from './anthropicConstants'
import { DEFAULT_GEMINI_MODEL, readDefaultGeminiKeyFromEnv } from './geminiConstants'
import { DEFAULT_OPENAI_MODEL } from './openaiConstants'
import type { LlmProvider } from './llmConstants'
import { formatApiError, streamLlmChat } from './llmStream'
import {
  loadCustomQuestionsFromStorage,
} from './customQuestions'
import {
  MOCK_TRAINING_OPTIONS,
  type MockTrainingStyle,
  buildMockSystemPrompt,
  getMockAutoStartUserMessage,
  mockStyleUsesAutoStart,
} from './mockInterviewPrompts'
import {
  describeMockTimeBudget,
  formatClockHms,
  formatCountdown,
  formatDurationLabel,
  getMockTimeLimitSeconds,
} from './mockInterviewTimer'
import {
  Brain,
  Code2,
  MessageSquare,
  Mic,
  Play,
  Plug,
  Send,
  Terminal,
  User,
} from 'lucide-react'
import { buildMockCodeReviewStarter } from './mockCodeStarter'
import { useSpeechDictation } from './useSpeechDictation'
import { useInterviewerSpeech } from './useInterviewerSpeech'
import {
  isLikelyFemaleVoice,
  labelVoiceOption,
  pickBestInterviewVoice,
  pickFemaleVoice,
} from './ttsVoiceUtils'
import { DEFAULT_ELEVENLABS_VOICE_ID, ELEVENLABS_VOICES } from './elevenlabsVoices'
import { readDefaultGoogleCloudTtsKeyFromEnv } from './googleCloudTtsConstants'
import {
  DEFAULT_GOOGLE_CLOUD_TTS_VOICE_NAME,
  GOOGLE_CLOUD_TTS_VOICES,
} from './googleCloudTtsVoices'
import ScreenHeader from '../components/layout/ScreenHeader'
import FilterRow from '../components/filters/FilterRow'
import FilterChip from '../components/filters/FilterChip'
import FilterSearchBar from '../components/filters/FilterSearchBar'

const VsCodeStyleEditor = lazy(() => import('./VsCodeStyleEditor'))

/** Renders plain text with https URLs turned into links (voice / TTS status lines). */
function TextWithAutoLinks({ text }: { text: string }) {
  const segments = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <>
      {segments.map((segment, i) =>
        /^https?:\/\//.test(segment) ? (
          <a
            key={i}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="mock-voice-status-link"
          >
            {segment}
          </a>
        ) : (
          <span key={i}>{segment}</span>
        ),
      )}
    </>
  )
}

function mockStyleUsesCodeEditor(s: MockTrainingStyle): boolean {
  return s === 'code_review' || s === 'interviewer'
}

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#34d399',
  medium: '#fbbf24',
  hard: '#f87171',
}

function buildSolveGuide(question: Question): { focus: string; steps: string[] } {
  const title = question.title.toLowerCase()

  if (title.includes('debounce')) {
    return {
      focus: 'This checks closures, timers, and handling repeated user events efficiently.',
      steps: [
        'Keep a timer variable in a closure around the returned function.',
        'On each call, clear the previous timer and schedule a new one.',
        'When the timer fires, call the original function with the latest arguments and `this`.',
        'Briefly mention common use cases (search input, resize handlers) and complexity.',
      ],
    }
  }

  if (title.includes('throttle')) {
    return {
      focus: 'This checks rate-limiting logic, closure state, and event-performance trade-offs.',
      steps: [
        'Track the last execution time and (optionally) a trailing timer.',
        'If enough time passed, execute immediately (leading call).',
        'Otherwise schedule one trailing call with the latest arguments.',
        'Explain leading vs trailing behavior and why this helps scroll/resize performance.',
      ],
    }
  }

  if (question.category === 'Async & Promises') {
    return {
      focus: 'This checks async control flow, Promise behavior, and error propagation.',
      steps: [
        'Define the exact settle behavior first (resolve/reject conditions).',
        'Initialize tracking state (results, counters, or queue pointers).',
        'Wire each async branch to update shared state safely and in order.',
        'Cover edge cases: empty input, rejection path, and stale/cancelled work.',
      ],
    }
  }

  if (question.category === 'Algorithms') {
    return {
      focus: 'This checks data-structure choice, complexity reasoning, and edge-case handling.',
      steps: [
        'State a brute-force baseline and why it is insufficient.',
        'Pick the target data structure (Map, Set, stack, recursion, etc.).',
        'Implement the core pass clearly, then validate edge cases.',
        'Close with time/space complexity and trade-offs.',
      ],
    }
  }

  if (question.category === 'System Design') {
    return {
      focus: 'This checks product-level thinking, architecture trade-offs, and robustness.',
      steps: [
        'Clarify requirements and non-functional goals (latency, scale, UX).',
        'Propose a simple baseline architecture end-to-end.',
        'Address failure modes: retries, race conditions, observability, and fallbacks.',
        'Discuss scaling path and what you would measure in production.',
      ],
    }
  }

  return {
    focus: 'This checks problem understanding, implementation clarity, and interview communication.',
    steps: [
      'Restate the problem and confirm assumptions out loud.',
      'Outline your approach before coding, including key edge cases.',
      'Implement incrementally and narrate trade-offs as you go.',
      'Finish with complexity and quick test cases.',
    ],
  }
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

type VoiceAvailability = 'unknown' | 'checking' | 'ok' | 'blocked'

interface MockInterviewSessionProps {
  question: Question
  style: MockTrainingStyle
  includeRefAnswer: boolean
  apiKey: string
  model: string
  llmProvider: LlmProvider
  elevenLabsApiKey: string
  googleCloudTtsApiKey: string
  geminiApiKey: string
}

function MockInterviewSession({
  question,
  style,
  includeRefAnswer,
  apiKey,
  model,
  llmProvider,
  elevenLabsApiKey,
  googleCloudTtsApiKey,
  geminiApiKey,
}: MockInterviewSessionProps) {
  const { locale } = useLocale()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [codeDraft, setCodeDraft] = useState(() =>
    mockStyleUsesCodeEditor(style) ? buildMockCodeReviewStarter(question) : '',
  )
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null)
  const [, setTimerTick] = useState(0)

  const autoStartLockRef = useRef(false)
  const streamGenerationRef = useRef(0)
  const chatLogRef = useRef<HTMLDivElement>(null)
  const composeRef = useRef<HTMLTextAreaElement>(null)

  const speechDisabled = !apiKey.trim() || loading
  const speech = useSpeechDictation({
    value: input,
    onChange: setInput,
    disabled: speechDisabled,
  })

  const [speakInterviewer, setSpeakInterviewer] = useState(() => style === 'interviewer')
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('')
  const [voiceEngine, setVoiceEngine] = useState<'browser' | 'elevenlabs' | 'google'>('browser')
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState<string>(DEFAULT_ELEVENLABS_VOICE_ID)
  const [googleTtsVoiceName, setGoogleTtsVoiceName] = useState<string>(DEFAULT_GOOGLE_CLOUD_TTS_VOICE_NAME)
  const [speechRate, setSpeechRate] = useState(0.95)
  const [disableBrowserFallback, setDisableBrowserFallback] = useState(false)
  const [voiceAvailability, setVoiceAvailability] = useState<Record<string, VoiceAvailability>>({})
  const [scanningVoices, setScanningVoices] = useState(false)
  const {
    stop: stopInterviewerSpeech,
    supported: interviewerTtsSupported,
    elevenlabsEnabled,
    googleCloudTtsEnabled,
    speaking: interviewerSpeaking,
    activeEngine,
    lastError: voiceStatus,
    speakPreview,
    diagnoseVoice,
  } = useInterviewerSpeech({
    enabled: speakInterviewer && apiKey.trim().length > 0,
    messages,
    voiceURI: selectedVoiceURI || undefined,
    engine: voiceEngine,
    elevenlabsApiKey: elevenLabsApiKey,
    elevenlabsVoiceId: elevenLabsVoiceId,
    googleCloudTtsApiKey,
    geminiApiKeyForTtsFallback: geminiApiKey,
    googleTtsVoiceName,
    speechRate,
    disableBrowserFallback,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const updateVoices = () => {
      const available = synth.getVoices()
      setTtsVoices(available)
      if (!available.some((v) => v.voiceURI === selectedVoiceURI)) {
        const preferred =
          typeof navigator !== 'undefined'
            ? pickBestInterviewVoice(available, navigator.language)
            : available.find((v) => v.default) ?? available[0]
        setSelectedVoiceURI(preferred?.voiceURI ?? '')
      }
    }
    updateVoices()
    synth.addEventListener('voiceschanged', updateVoices)
    return () => {
      synth.removeEventListener('voiceschanged', updateVoices)
    }
  }, [selectedVoiceURI])

  const womanVoiceAvailable = useMemo(
    () =>
      ttsVoices.length > 0 &&
      pickFemaleVoice(ttsVoices, typeof navigator !== 'undefined' ? navigator.language : 'en-US') != null,
    [ttsVoices],
  )

  const timeLimitSec = useMemo(() => getMockTimeLimitSeconds(question), [question])
  const selectedElevenLabsVoice = useMemo(
    () => ELEVENLABS_VOICES.find((v) => v.id === elevenLabsVoiceId) ?? ELEVENLABS_VOICES[0],
    [elevenLabsVoiceId],
  )
  const availableVoices = useMemo(
    () => ELEVENLABS_VOICES.filter((v) => voiceAvailability[v.id] === 'ok'),
    [voiceAvailability],
  )

  useEffect(() => {
    if (voiceEngine !== 'elevenlabs' || !elevenLabsApiKey.trim()) return
    if (scanningVoices) return
    // Skip if already scanned all configured voices.
    const allKnown = ELEVENLABS_VOICES.every((v) => voiceAvailability[v.id] && voiceAvailability[v.id] !== 'unknown')
    if (allKnown) return

    let cancelled = false
    setScanningVoices(true)
    setVoiceAvailability((prev) => {
      const next = { ...prev }
      ELEVENLABS_VOICES.forEach((v) => {
        if (!next[v.id]) next[v.id] = 'checking'
      })
      return next
    })

    void (async () => {
      for (const voice of ELEVENLABS_VOICES) {
        if (cancelled) break
        try {
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice.id)}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': elevenLabsApiKey.trim(),
                Accept: 'audio/mpeg',
              },
              body: JSON.stringify({
                text: 'Voice availability check.',
                model_id: 'eleven_turbo_v2_5',
              }),
            },
          )
          const status: VoiceAvailability = res.ok ? 'ok' : res.status === 402 || res.status === 403 ? 'blocked' : 'blocked'
          if (!cancelled) {
            setVoiceAvailability((prev) => ({ ...prev, [voice.id]: status }))
          }
        } catch {
          if (!cancelled) {
            setVoiceAvailability((prev) => ({ ...prev, [voice.id]: 'blocked' }))
          }
        }
      }
      if (!cancelled) setScanningVoices(false)
    })()

    return () => {
      cancelled = true
    }
  }, [voiceEngine, elevenLabsApiKey, scanningVoices, voiceAvailability])

  useEffect(() => {
    if (voiceEngine !== 'elevenlabs') return
    if (availableVoices.length === 0) return
    if (!availableVoices.some((v) => v.id === elevenLabsVoiceId)) {
      setElevenLabsVoiceId(availableVoices[0].id)
    }
  }, [availableVoices, elevenLabsVoiceId, voiceEngine])

  const canSend =
    apiKey.trim().length > 0 &&
    !loading &&
    (mockStyleUsesCodeEditor(style)
      ? codeDraft.trim().length > 0 || input.trim().length > 0
      : input.trim().length > 0)

  const composePlaceholder =
    style === 'verbal_practice'
      ? 'Type or use Voice to dictate what you would say in the interview, then send for feedback…'
      : style === 'code_review'
        ? 'Optional notes, questions, or context (sent together with the editor code)…'
        : style === 'interviewer'
          ? 'Verbal answer or extra context (optional — sent with the code above)…'
          : 'Follow-up message…'

  const clearThread = useCallback(() => {
    stopInterviewerSpeech()
    streamGenerationRef.current += 1
    setMessages([])
    setStreaming('')
    setError(null)
    setSessionStartedAt(null)
    setCodeDraft(mockStyleUsesCodeEditor(style) ? buildMockCodeReviewStarter(question) : '')
    setInput('')
    autoStartLockRef.current = false
  }, [style, question, stopInterviewerSpeech])

  useEffect(() => {
    if (messages.length === 0) {
      setSessionStartedAt(null)
      return
    }
    setSessionStartedAt((prev) => prev ?? Date.now())
  }, [messages.length])

  useEffect(() => {
    if (sessionStartedAt == null) return
    const id = window.setInterval(() => setTimerTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [sessionStartedAt])

  const elapsedSec =
    sessionStartedAt == null ? 0 : Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000))
  const remainingSec = Math.max(0, timeLimitSec - elapsedSec)
  const timeUp = sessionStartedAt != null && remainingSec <= 0
  const timerUrgent = sessionStartedAt != null && remainingSec > 0 && remainingSec <= 120

  const runStreamTurn = useCallback(
    async (thread: ChatMessage[]) => {
      const gen = streamGenerationRef.current
      const system = buildMockSystemPrompt(question, style, includeRefAnswer)
      const apiMessages: MessageParam[] = thread.map((m) => ({
        role: m.role,
        content: m.content,
      }))
      let acc = ''
      await streamLlmChat({
        provider: llmProvider,
        apiKey: apiKey.trim(),
        model: model.trim(),
        system,
        locale,
        messages: apiMessages,
        onTextDelta: (d) => {
          acc += d
          setStreaming(acc)
        },
      })
      if (gen !== streamGenerationRef.current) return
      setMessages((prev) => [...prev, { role: 'assistant', content: acc }])
      setStreaming('')
    },
    [apiKey, model, question, style, includeRefAnswer, locale, llmProvider],
  )

  const kickoffInterview = useCallback(async () => {
    if (!apiKey.trim() || loading) return
    if (messages.length > 0) {
      chatLogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      composeRef.current?.focus()
      return
    }
    if (mockStyleUsesAutoStart(style)) {
      chatLogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      composeRef.current?.focus()
      return
    }
    setError(null)
    const userTurn: ChatMessage = { role: 'user', content: "I'm ready to begin the interview." }
    setMessages([userTurn])
    setLoading(true)
    setStreaming('')
    try {
      await runStreamTurn([userTurn])
    } catch (e) {
      setError(formatApiError(e))
      setStreaming('')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [apiKey, loading, messages.length, style, runStreamTurn])

  useEffect(() => {
    if (!apiKey.trim() || !mockStyleUsesAutoStart(style)) return
    if (messages.length > 0 || loading || autoStartLockRef.current) return

    const starter = getMockAutoStartUserMessage(style)
    if (!starter) return

    autoStartLockRef.current = true
    setError(null)
    const userTurn: ChatMessage = { role: 'user', content: starter }
    setMessages([userTurn])
    setLoading(true)
    setStreaming('')

    ;(async () => {
      try {
        await runStreamTurn([userTurn])
      } catch (e) {
        setError(formatApiError(e))
        setStreaming('')
        setMessages([])
        autoStartLockRef.current = true
      } finally {
        setLoading(false)
      }
    })()
  }, [apiKey, style, messages.length, loading, runStreamTurn])

  useEffect(() => {
    if (style !== 'code_review') return
    const el = chatLogRef.current
    if (!el) return
    const id = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
    return () => cancelAnimationFrame(id)
  }, [style, messages, streaming, loading])

  async function send() {
    if (!canSend) return
    let text: string
    if (mockStyleUsesCodeEditor(style)) {
      const parts: string[] = []
      const code = codeDraft.trim()
      const notes = input.trim()
      if (code) {
        const intro =
          style === 'code_review'
            ? 'Here is my solution:'
            : 'As the candidate, here is my code:'
        parts.push(`${intro}\n\n\`\`\`ts\n${code}\n\`\`\``)
      }
      if (notes) parts.push(notes)
      text = parts.join('\n\n')
      if (!text) return
    } else {
      text = input.trim()
    }
    setInput('')
    setError(null)
    const userTurn: ChatMessage = { role: 'user', content: text }
    const nextThread = [...messages, userTurn]
    setMessages(nextThread)
    setLoading(true)
    setStreaming('')

    try {
      await runStreamTurn(nextThread)
    } catch (e) {
      setError(formatApiError(e))
      setStreaming('')
    } finally {
      setLoading(false)
    }
  }

  const hint =
    style === 'verbal_practice'
      ? 'Send your spoken-style answer; Claude will reply with structured feedback.'
        : style === 'code_review'
        ? 'Edit code in the VS Code–style editor below, add optional notes, then send for review. Follow-ups can be notes-only or include updated code.'
        : style === 'interviewer'
          ? 'Reply as the candidate: use the VS Code–style editor for code, optional notes for what you would say out loud. Claude stays in interviewer character. Turn on Speak Claude\'s replies to hear each reply (browser text-to-speech).'
          : 'Ask follow-ups to go deeper on approach, trade-offs, or edge cases.'

  const modeLabel = MOCK_TRAINING_OPTIONS.find((opt) => opt.id === style)?.label ?? style
  const localeLabel = locale === 'en' ? 'English (US)' : locale.toUpperCase()
  const sessionClock = sessionStartedAt != null ? formatClockHms(elapsedSec) : '00:00:00'
  const apiStable = Boolean(apiKey.trim()) && !error
  const micLabel = !speech.supported ? 'Unavailable' : speech.listening ? 'Active' : 'Ready'
  const micDotClass = !speech.supported
    ? ' mis-status-dot--warn'
    : speech.listening
      ? ' mis-status-dot--on'
      : ' mis-status-dot--idle'

  const voiceAdvanced = (
    <>
      {!speech.supported && (
        <p className="mock-voice-unavailable">
          Voice-to-text is not available in this browser. Try Chrome, Edge, or Safari.
        </p>
      )}
      {(speech.supported || interviewerTtsSupported) && (
        <div className="mock-voice-toolbar mis-voice-toolbar-inner">
          {speech.supported && (
            <>
              <button
                type="button"
                className={`secondary mock-voice-btn${speech.listening ? ' mock-voice-btn--active' : ''}`}
                onClick={() => {
                  speech.clearError()
                  speech.toggle()
                }}
                disabled={speechDisabled}
                aria-pressed={speech.listening}
                title={
                  speech.listening
                    ? 'Stop voice input'
                    : 'Dictate with your microphone (browser speech-to-text)'
                }
              >
                {speech.listening ? 'Stop voice' : 'Voice'}
              </button>
              {speech.listening && <span className="mock-voice-live">Listening… speak now</span>}
              {speech.error && (
                <span className="mock-voice-err" role="alert">
                  {speech.error}{' '}
                  <button type="button" className="mock-voice-dismiss" onClick={speech.clearError}>
                    Dismiss
                  </button>
                </span>
              )}
            </>
          )}
          {interviewerTtsSupported && (
            <>
              <div className="mock-voice-engine-row" role="radiogroup" aria-label="Voice engine">
                <span className="mock-voice-select-label">Voice engine</span>
                <label className="mock-voice-tts-label">
                  <input
                    type="radio"
                    name="mock-voice-engine"
                    checked={voiceEngine === 'browser'}
                    onChange={() => {
                      setVoiceEngine('browser')
                      stopInterviewerSpeech()
                    }}
                  />
                  Browser
                </label>
                <label className="mock-voice-tts-label">
                  <input
                    type="radio"
                    name="mock-voice-engine"
                    checked={voiceEngine === 'elevenlabs'}
                    onChange={() => {
                      setVoiceEngine('elevenlabs')
                      stopInterviewerSpeech()
                    }}
                  />
                  ElevenLabs {elevenlabsEnabled ? '' : '(fallback active)'}
                </label>
                <label className="mock-voice-tts-label">
                  <input
                    type="radio"
                    name="mock-voice-engine"
                    checked={voiceEngine === 'google'}
                    onChange={() => {
                      setVoiceEngine('google')
                      stopInterviewerSpeech()
                    }}
                  />
                  Google Cloud TTS {googleCloudTtsEnabled ? '' : '(fallback active)'}
                </label>
              </div>
              <label className="mock-voice-rate">
                <span className="mock-voice-select-label">Voice speed: {speechRate.toFixed(2)}x</span>
                <input
                  type="range"
                  min={0.8}
                  max={1.15}
                  step={0.05}
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                />
              </label>
              {(voiceEngine === 'elevenlabs' || voiceEngine === 'google') && (
                <label className="mock-voice-tts-label">
                  <input
                    type="checkbox"
                    checked={disableBrowserFallback}
                    onChange={(e) => setDisableBrowserFallback(e.target.checked)}
                  />
                  Force cloud voice only (no browser fallback)
                </label>
              )}
              <span className="mock-voice-engine-status">
                Active engine: <strong>{activeEngine}</strong>
              </span>
              <label className="mock-voice-tts-label">
                <input
                  type="checkbox"
                  checked={speakInterviewer}
                  onChange={(e) => {
                    setSpeakInterviewer(e.target.checked)
                    if (!e.target.checked) stopInterviewerSpeech()
                  }}
                  disabled={!apiKey.trim()}
                />
                Speak Claude&apos;s replies
              </label>
              {speakInterviewer && voiceEngine === 'browser' && ttsVoices.length > 0 && (
                <label className="mock-voice-select-wrap">
                  <span className="mock-voice-select-label">Voice</span>
                  <select
                    className="mock-voice-select"
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  >
                    {ttsVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {labelVoiceOption(v, isLikelyFemaleVoice(v))}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="secondary mock-voice-woman-btn"
                    disabled={!womanVoiceAvailable}
                    title={
                      womanVoiceAvailable
                        ? 'Pick a woman voice if your system exposes one (name-based guess)'
                        : 'No woman-labelled voice detected — choose from the list or install OS voices'
                    }
                    onClick={() => {
                      const v = pickFemaleVoice(ttsVoices, navigator.language)
                      if (v) setSelectedVoiceURI(v.voiceURI)
                    }}
                  >
                    Woman voice
                  </button>
                </label>
              )}
              {speakInterviewer && voiceEngine === 'google' && (
                <label className="mock-voice-select-wrap">
                  <span className="mock-voice-select-label">Google Neural2 voice</span>
                  <select
                    className="mock-voice-select"
                    value={googleTtsVoiceName}
                    onChange={(e) => setGoogleTtsVoiceName(e.target.value)}
                  >
                    {GOOGLE_CLOUD_TTS_VOICES.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                  {!googleCloudTtsEnabled && (
                    <span className="mock-voice-elevenlabs-fallback">
                      Add a Google Cloud TTS key in AI settings, or a Gemini key if your Google Cloud project has Cloud
                      Text-to-Speech enabled on that key. Keys sync to the session as you type.
                    </span>
                  )}
                </label>
              )}
              {speakInterviewer && voiceEngine === 'elevenlabs' && (
                <div className="mock-voice-elevenlabs-picker">
                  <div className="mock-voice-elevenlabs-head">
                    <span className="mock-voice-select-label">Premium voices</span>
                    {scanningVoices && (
                      <span className="mock-voice-elevenlabs-fallback">Scanning voices available on your plan…</span>
                    )}
                    {!elevenlabsEnabled && (
                      <span className="mock-voice-elevenlabs-fallback">
                        Add ElevenLabs key in API settings to enable premium audio.
                      </span>
                    )}
                  </div>
                  <div className="mock-voice-avatar-grid">
                    {(availableVoices.length > 0 ? availableVoices : ELEVENLABS_VOICES).map((voice) => (
                      <button
                        key={voice.id}
                        type="button"
                        className={`mock-voice-avatar-card${
                          elevenLabsVoiceId === voice.id ? ' mock-voice-avatar-card--active' : ''
                        }${voice.requiresPaidPlan ? ' mock-voice-avatar-card--locked' : ''}`}
                        onClick={() => {
                          if (voice.requiresPaidPlan) return
                          setElevenLabsVoiceId(voice.id)
                        }}
                        disabled={Boolean(voice.requiresPaidPlan)}
                        title={
                          voice.requiresPaidPlan
                            ? 'Paid ElevenLabs plan required for API usage'
                            : undefined
                        }
                      >
                        <img src={voice.avatarPath} alt={`${voice.name} voice avatar`} />
                        <span className="mock-voice-avatar-name">{voice.name}</span>
                        <span className="mock-voice-avatar-meta">
                          {voice.accent} - {voice.vibe}
                        </span>
                        {voice.requiresPaidPlan && (
                          <span className="mock-voice-avatar-badge">Paid plan required</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mock-voice-selected">
                    Selected: <strong>{selectedElevenLabsVoice.name}</strong> ({selectedElevenLabsVoice.vibe})
                  </div>
                </div>
              )}
              {speakInterviewer && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    speakPreview(
                      'This is a voice test. I will guide you through your interview answer with concise feedback.',
                    )
                  }
                  disabled={!apiKey.trim()}
                >
                  Play sample
                </button>
              )}
              {(voiceEngine === 'elevenlabs' || voiceEngine === 'google') && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => void diagnoseVoice()}
                  disabled={!apiKey.trim()}
                >
                  Diagnose voice
                </button>
              )}
              {interviewerSpeaking && (
                <button
                  type="button"
                  className="secondary mock-voice-btn mock-voice-btn--active"
                  onClick={() => stopInterviewerSpeech()}
                  title="Stop reading the reply aloud"
                >
                  Stop speech
                </button>
              )}
            </>
          )}
        </div>
      )}
      {voiceStatus && (
        <p className="mock-voice-status">
          <TextWithAutoLinks text={voiceStatus} />
        </p>
      )}
    </>
  )

  return (
    <div className="q-chat-panel mock-interview-session mockv2-session mis-root">
      {!apiKey.trim() && (
        <p className="q-chat-warn mis-warn">Add an API key in AI settings above to start the mock session.</p>
      )}
      {apiKey.trim() && <p className="q-chat-auto-hint mis-hint">{hint}</p>}

      <header className="mis-session-chrome">
        <div className="mis-session-chrome-inner">
          <div className="mis-locale-chip" aria-hidden>
            <span className="mis-locale-chip-label">{localeLabel}</span>
          </div>
          <div
            className={`mis-session-timer-block${timeUp ? ' mis-session-timer-block--up' : ''}${timerUrgent && !timeUp ? ' mis-session-timer-block--urgent' : ''}`}
            role="timer"
            aria-live="polite"
            aria-label={
              sessionStartedAt == null
                ? `Question time budget ${formatCountdown(timeLimitSec)}`
                : timeUp
                  ? 'Time is up'
                  : `${formatCountdown(remainingSec)} remaining of ${formatCountdown(timeLimitSec)}`
            }
          >
            <span className="mis-session-timer-kicker">Question timer</span>
            <span className="mis-session-timer-clock">{sessionClock}</span>
            <span className="mis-session-timer-budget-inline" title={describeMockTimeBudget(question)}>
              {timeUp ? (
                <span>Time&apos;s up · budget {formatCountdown(timeLimitSec)}</span>
              ) : sessionStartedAt != null ? (
                <span>
                  <strong>{formatCountdown(remainingSec)}</strong> left · budget{' '}
                  <strong>{formatCountdown(timeLimitSec)}</strong>
                </span>
              ) : (
                <span>
                  Budget <strong>{formatDurationLabel(timeLimitSec)}</strong>
                  <span className="mis-session-timer-meta"> ({describeMockTimeBudget(question)})</span>
                </span>
              )}
            </span>
          </div>
          <button type="button" className="mis-btn-end" onClick={clearThread}>
            Reset session
          </button>
        </div>
      </header>

      {timeUp && (
        <p className="mis-timeup-banner">
          Budget used for this question—you can keep chatting or reset for a fresh timer.
        </p>
      )}

      <div className="mis-layout">
        <div className="mis-col mis-col--left">
          <section className="mis-card">
            <h2 className="mis-card-title">Session context</h2>
            <div className="mis-setup-rows">
              <div className="mis-setup-row">
                <span className="mis-setup-key">Target role</span>
                <span className="mis-setup-pill mis-setup-pill--wide">Frontend Engineer (Interview focus)</span>
              </div>
              <div className="mis-setup-row mis-setup-row--stack">
                <span className="mis-setup-key">Question</span>
                <span className="mis-setup-val">{question.title}</span>
              </div>
              <div className="mis-setup-row">
                <span className="mis-setup-key">Mode</span>
                <span className="mis-setup-pill">{modeLabel}</span>
              </div>
            </div>
            <div className="mis-setup-actions">
              <button
                type="button"
                className="mis-btn-primary"
                onClick={() => void kickoffInterview()}
                disabled={!apiKey.trim() || loading}
              >
                Start session
              </button>
              <button
                type="button"
                className="mis-btn-secondary"
                onClick={clearThread}
                disabled={messages.length === 0 && !streaming && !error}
              >
                Reset session
              </button>
            </div>
          </section>

          <section className="mis-card">
            <h2 className="mis-card-title">Voice &amp; AI</h2>
            <div className="mis-status-rows">
              <div className="mis-status-row">
                <div className="mis-status-left">
                  <Mic className="mis-status-icon" aria-hidden strokeWidth={2} size={20} />
                  <span className="mis-status-label">Microphone</span>
                </div>
                <div className="mis-status-right">
                  <span className={`mis-status-dot${micDotClass}`} />
                  <span className="mis-status-tag">{micLabel}</span>
                </div>
              </div>
              <div className="mis-status-row">
                <div className="mis-status-left">
                  <Plug className="mis-status-icon" aria-hidden strokeWidth={2} size={20} />
                  <span className="mis-status-label">API connection</span>
                </div>
                <div className="mis-status-right">
                  <span className={`mis-status-dot${apiStable ? ' mis-status-dot--on' : ' mis-status-dot--warn'}`} />
                  <span className="mis-status-tag">{apiStable ? 'Stable' : apiKey.trim() ? 'Error' : 'Key needed'}</span>
                </div>
              </div>
            </div>
            <div
              className={`mis-audio-orb${loading || interviewerSpeaking ? ' mis-audio-orb--pulse' : ''}`}
              aria-hidden
            >
              <span className="mis-audio-orb-inner" />
            </div>
          </section>

          <details className="mis-voice-details">
            <summary>Voice &amp; speech settings</summary>
            {voiceAdvanced}
          </details>
        </div>

        <div className="mis-col mis-col--right">
          <section className="mis-transcript-shell">
            <div className="mis-transcript-head">
              <div className="mis-transcript-head-left">
                <MessageSquare className="mis-transcript-head-icon" aria-hidden size={20} strokeWidth={2} />
                <h3 className="mis-transcript-title">Live transcript</h3>
              </div>
              <span className="mis-live-pill">Live</span>
            </div>
            <div ref={chatLogRef} className="q-chat-log mis-transcript-log" aria-live="polite">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mis-msg${m.role === 'user' ? ' mis-msg--user' : ' mis-msg--assistant'}`}
                >
                  <div className="mis-msg-avatar" aria-hidden>
                    {m.role === 'user' ? (
                      <User size={20} strokeWidth={2} />
                    ) : (
                      <Brain size={20} strokeWidth={2} />
                    )}
                  </div>
                  <div className={`mis-msg-bubble q-chat-bubble q-chat-bubble--${m.role}`}>
                    <span className="q-chat-role mis-msg-role">
                      {m.role === 'user' ? 'You' : 'Claude'}
                    </span>
                    {m.role === 'assistant' ? (
                      <ChatMarkdown content={m.content} />
                    ) : (
                      <div className="q-chat-text">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {(streaming || loading) && (
                <div className="mis-msg mis-msg--assistant">
                  <div className="mis-msg-avatar" aria-hidden>
                    <Brain size={20} strokeWidth={2} />
                  </div>
                  <div className="mis-msg-bubble q-chat-bubble q-chat-bubble--assistant">
                    <span className="q-chat-role mis-msg-role">Claude</span>
                    {streaming ? (
                      <ChatMarkdown content={streaming} />
                    ) : (
                      <div className="q-chat-text">
                        <span className="q-chat-typing">…</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mis-compose-wrap">
              <div className="mis-compose-pill">
                <textarea
                  ref={composeRef}
                  className="q-chat-input mis-compose-input"
                  rows={mockStyleUsesCodeEditor(style) ? 2 : style === 'verbal_practice' ? 4 : 2}
                  placeholder={composePlaceholder}
                  value={input}
                  onChange={(e) => speech.onControlledInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' || e.shiftKey) return
                    if (mockStyleUsesCodeEditor(style)) {
                      if (e.metaKey || e.ctrlKey) {
                        e.preventDefault()
                        void send()
                      }
                      return
                    }
                    e.preventDefault()
                    void send()
                  }}
                  disabled={!apiKey.trim() || loading}
                />
                <div className="mis-compose-actions">
                  {speech.supported && (
                    <button
                      type="button"
                      className={`mis-icon-btn${speech.listening ? ' mis-icon-btn--active' : ''}`}
                      onClick={() => {
                        speech.clearError()
                        speech.toggle()
                      }}
                      disabled={speechDisabled}
                      aria-pressed={speech.listening}
                      title={
                        speech.listening
                          ? 'Stop voice input'
                          : 'Dictate with your microphone (browser speech-to-text)'
                      }
                    >
                      <Mic size={20} strokeWidth={2} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="mis-send-btn"
                    onClick={() => void send()}
                    disabled={!canSend}
                    title="Send"
                  >
                    <Send size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>
              {mockStyleUsesCodeEditor(style) && (
                <p className="mis-compose-hint">Tip: ⌃/⌘+Enter sends from the notes field.</p>
              )}
            </div>
          </section>

          {error && <div className="q-chat-error mis-console-error">{error}</div>}

          {mockStyleUsesCodeEditor(style) && (
            <section className="mis-code-shell">
              <div className="mis-code-head">
                <div className="mis-code-head-left">
                  <Code2 className="mis-code-head-icon" aria-hidden size={22} strokeWidth={2} />
                  <div>
                    <h3 className="mis-code-title">{question.title}</h3>
                    <p className="mis-code-sub">
                      {question.category} · {describeMockTimeBudget(question)}
                    </p>
                  </div>
                </div>
                <span className={`mis-diff-pill mis-diff-pill--${question.difficulty}`}>
                  {question.difficulty}
                </span>
              </div>
              <div className="mis-editor-wrap">
                <Suspense
                  fallback={
                    <div className="vscode-chrome vscode-chrome--loading" aria-busy>
                      Loading editor…
                    </div>
                  }
                >
                  <VsCodeStyleEditor
                    question={question}
                    value={codeDraft}
                    onChange={setCodeDraft}
                    height="min(42vh, 360px)"
                    windowTitle={
                      style === 'code_review' ? 'Mock interview — code' : 'Mock interview — interviewer'
                    }
                  />
                </Suspense>
                <div className="mis-editor-actions">
                  <button
                    type="button"
                    className="mis-editor-fab"
                    onClick={() => setCodeDraft(buildMockCodeReviewStarter(question))}
                  >
                    Reset
                  </button>
                  <button type="button" className="mis-editor-run" disabled title="Not available in this trainer">
                    <Play size={18} strokeWidth={2} aria-hidden />
                    Run tests
                  </button>
                </div>
              </div>
              <div className="mis-terminal">
                <div className="mis-terminal-head">
                  <Terminal size={16} strokeWidth={2} aria-hidden />
                  <span>Output console</span>
                </div>
                <div className="mis-terminal-body">
                  <p className="mis-terminal-muted">&gt; Editor ready. Send a message to get interviewer feedback.</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mis-coach-float">
        <div className="mis-coach-avatar" aria-hidden>
          SJ
        </div>
        <div>
          <p className="mis-coach-name">Sarah Jenkins</p>
          <p className="mis-coach-meta">Senior Engineering Manager</p>
        </div>
      </div>
    </div>
  )
}

export default function MockInterviewPage() {
  const [search, setSearch] = useState('')
  const [company, setCompany] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [category, setCategory] = useState<Category | null>(null)

  const [customQuestions] = useState<Question[]>(() => loadCustomQuestionsFromStorage())

  const [selectedId, setSelectedId] = useState<string>(() => QUESTIONS[0]?.id ?? '')
  const [style, setStyle] = useState<MockTrainingStyle>('understand')
  const [includeRefAnswer, setIncludeRefAnswer] = useState(false)

  const [aiSettings, setAiSettings] = useState<AiSettingsSnapshot>(() => ({
    provider: 'anthropic',
    anthropicApiKey: '',
    anthropicModel: DEFAULT_ANTHROPIC_MODEL,
    geminiApiKey: readDefaultGeminiKeyFromEnv(),
    geminiModel: DEFAULT_GEMINI_MODEL,
    openaiApiKey: '',
    openaiModel: DEFAULT_OPENAI_MODEL,
  }))
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('')
  const [googleCloudTtsApiKey, setGoogleCloudTtsApiKey] = useState(() => readDefaultGoogleCloudTtsKeyFromEnv())

  const onAiSettingsChange = useCallback((s: AiSettingsSnapshot) => {
    setAiSettings(s)
  }, [])

  const sessionApiKey =
    aiSettings.provider === 'gemini'
      ? aiSettings.geminiApiKey
      : aiSettings.provider === 'openai'
        ? aiSettings.openaiApiKey
        : aiSettings.anthropicApiKey
  const sessionModel =
    aiSettings.provider === 'gemini'
      ? aiSettings.geminiModel
      : aiSettings.provider === 'openai'
        ? aiSettings.openaiModel
        : aiSettings.anthropicModel

  const allQuestions = useMemo(() => [...QUESTIONS, ...customQuestions], [customQuestions])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allQuestions.filter((question) => {
      if (company && !question.companies.includes(company)) return false
      if (difficulty && question.difficulty !== difficulty) return false
      if (category && question.category !== category) return false
      if (
        q &&
        !question.title.toLowerCase().includes(q) &&
        !question.description.toLowerCase().includes(q) &&
        !question.tags.some((t) => t.includes(q))
      )
        return false
      return true
    })
  }, [search, company, difficulty, category, allQuestions])

  const selectedQuestion = useMemo(() => {
    if (filtered.length === 0) return undefined
    const inFilter = filtered.find((q) => q.id === selectedId)
    if (inFilter) return inFilter
    return filtered[0]
  }, [filtered, selectedId])

  const selectedGuide = useMemo(
    () => (selectedQuestion ? buildSolveGuide(selectedQuestion) : null),
    [selectedQuestion],
  )

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((q) => q.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const hasFilters = search || company || difficulty || category

  function clearFilters() {
    setSearch('')
    setCompany(null)
    setDifficulty(null)
    setCategory(null)
  }

  return (
    <div className="editorial-page editorial-page--mock mockv2-page">
      <ScreenHeader title="Mock interview" lead="Practice in a realistic interview dashboard." />

      <div className="mockv2-layout">
        <aside className="mockv2-sidebar">
          <div className="mockv2-brand">
            <div className="mockv2-brand-title">Interview Bot</div>
            <div className="mockv2-brand-status">v3.2 Active</div>
          </div>
          <nav className="mockv2-side-nav" aria-label="Mock interview sections">
            <button type="button" className="mockv2-side-link">
              <span className="mockv2-side-link-icon" aria-hidden>⚙</span>
              <span className="mockv2-side-link-label">Setup</span>
            </button>
            <button type="button" className="mockv2-side-link">
              <span className="mockv2-side-link-icon" aria-hidden>📚</span>
              <span className="mockv2-side-link-label">Library</span>
            </button>
            <button type="button" className="mockv2-side-link">
              <span className="mockv2-side-link-icon" aria-hidden>📈</span>
              <span className="mockv2-side-link-label">Analytics</span>
            </button>
            <button type="button" className="mockv2-side-link active" aria-current="page">
              <span className="mockv2-side-link-icon" aria-hidden>💬</span>
              <span className="mockv2-side-link-label">Practice</span>
            </button>
            <button type="button" className="mockv2-side-link">
              <span className="mockv2-side-link-icon" aria-hidden>🛠</span>
              <span className="mockv2-side-link-label">Settings</span>
            </button>
          </nav>
          <div className="mockv2-sidebar-footer">
            <button type="button" className="mockv2-start-btn">
              Start session
            </button>
          </div>
        </aside>

        <section className="mockv2-main">
          <div className="mockv2-main-top">
            <h2 className="mockv2-title">Practice</h2>
            <div className="mockv2-top-right">Multi-provider mock interview (Claude, Gemini, OpenAI)</div>
          </div>

          <section className="mockv2-overview-grid">
            <article className="mockv2-overview-card">
              <div className="mockv2-overview-label">Current interviewer</div>
              <div className="mockv2-interviewer-row">
                <div className="mockv2-avatar" aria-hidden>
                  SJ
                </div>
                <div>
                  <div className="mockv2-interviewer-name">Sarah Jenkins</div>
                  <div className="mockv2-interviewer-role">Senior Engineering Manager</div>
                </div>
              </div>
              <div className="mockv2-listening-strip">
                <span>Live voice feedback</span>
                <span>Listening</span>
              </div>
            </article>

            <article className="mockv2-overview-card">
              <div className="mockv2-overview-label">Session context</div>
              <p className="mockv2-overview-text">
                Target role: Fullstack Engineer (System design focus)
              </p>
              <p className="mockv2-overview-text">
                Focus area: {selectedQuestion?.category ?? 'Interview practice'}
              </p>
            </article>
          </section>

          <section className="editorial-panel editorial-panel--tight">
            <ApiKeySettings
              onAiSettingsChange={onAiSettingsChange}
              onElevenLabsChange={setElevenLabsApiKey}
              onGoogleCloudTtsChange={setGoogleCloudTtsApiKey}
            />
          </section>

          <section className="mock-interview-setup editorial-panel mockv2-setup">
            <h2 className="mock-interview-h2">1. Choose a question</h2>
            <FilterSearchBar
              className="mock-interview-search"
              placeholder="Search title, description, tags…"
              value={search}
              onChange={setSearch}
              showClear={Boolean(hasFilters)}
              onClear={clearFilters}
              clearLabel="Clear filters"
            />

            <FilterRow label="Company" className="mock-interview-filters">
              {COMPANIES.map((c) => (
                <FilterChip
                  key={c.id}
                  active={company === c.id}
                  style={{ '--chip-color': c.color } as CSSProperties}
                  onClick={() => setCompany(company === c.id ? null : c.id)}
                >
                  {c.emoji} {c.id}
                </FilterChip>
              ))}
            </FilterRow>

            <FilterRow label="Difficulty" className="mock-interview-filters">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <FilterChip
                  key={d}
                  active={difficulty === d}
                  style={{ '--chip-color': DIFFICULTY_COLOR[d] } as CSSProperties}
                  onClick={() => setDifficulty(difficulty === d ? null : d)}
                >
                  {d}
                </FilterChip>
              ))}
            </FilterRow>

            <FilterRow label="Category" className="mock-interview-filters">
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat}
                  active={category === cat}
                  onClick={() => setCategory(category === cat ? null : cat)}
                >
                  {cat}
                </FilterChip>
              ))}
            </FilterRow>

            {filtered.length === 0 ? (
              <p className="q-empty">No questions match. Clear filters or search.</p>
            ) : (
              <label className="mock-interview-select-label">
                <span className="mock-interview-select-title">Question</span>
                <select
                  className="mock-interview-select"
                  value={selectedQuestion?.id ?? ''}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {filtered.map((q) => (
                    <option key={q.id} value={q.id}>
                      [{q.difficulty}] {q.title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedQuestion && (
              <div className="mock-interview-preview-card">
                <div className="mock-interview-preview-meta">
                  <span className="q-category-label">{selectedQuestion.category}</span>
                  <span className="q-difficulty" style={{ color: DIFFICULTY_COLOR[selectedQuestion.difficulty] }}>
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <div className="q-title">{selectedQuestion.title}</div>
                <p className="q-desc mock-interview-desc">{selectedQuestion.description}</p>
                {selectedGuide && (
                  <div className="mock-interview-solve-guide">
                    <p className="mock-interview-solve-focus">
                      <strong>What this question tests:</strong> {selectedGuide.focus}
                    </p>
                    <p className="mock-interview-solve-title">
                      <strong>How to solve (interview flow):</strong>
                    </p>
                    <ol className="mock-interview-solve-steps">
                      {selectedGuide.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {selectedQuestion.tags.length > 0 && (
                  <div className="q-tags">
                    {selectedQuestion.tags.map((t) => (
                      <span key={t} className="q-tag">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mock-interview-timer-hint">
                  Session timer: <strong>{formatDurationLabel(getMockTimeLimitSeconds(selectedQuestion))}</strong> —{' '}
                  {describeMockTimeBudget(selectedQuestion)}.
                </p>
              </div>
            )}

            <h2 className="mock-interview-h2">2. How do you want to train?</h2>
            <div className="mock-style-grid">
              {MOCK_TRAINING_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`mock-style-card${style === opt.id ? ' mock-style-card--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="mock-training-style"
                    checked={style === opt.id}
                    onChange={() => setStyle(opt.id)}
                  />
                  <span className="mock-style-card-title">{opt.label}</span>
                  <span className="mock-style-card-blurb">{opt.blurb}</span>
                </label>
              ))}
            </div>

            <label className="q-chat-checkbox mock-interview-ref">
              <input
                type="checkbox"
                checked={includeRefAnswer}
                onChange={(e) => setIncludeRefAnswer(e.target.checked)}
              />
              Include reference answer in the model&apos;s context (stronger feedback; may reduce discovery)
            </label>

            <h2 className="mock-interview-h2">3. Session</h2>
            {selectedQuestion && (
              <MockInterviewSession
                key={`${selectedQuestion.id}-${style}`}
                question={selectedQuestion}
                style={style}
                includeRefAnswer={includeRefAnswer}
                apiKey={sessionApiKey}
                model={sessionModel}
                llmProvider={aiSettings.provider}
                elevenLabsApiKey={elevenLabsApiKey}
                googleCloudTtsApiKey={googleCloudTtsApiKey}
                geminiApiKey={aiSettings.geminiApiKey}
              />
            )}
          </section>
        </section>
      </div>
    </div>
  )
}
