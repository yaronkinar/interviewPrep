import { useCallback, useEffect, useRef, useState } from 'react'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { useLocale } from '../i18n/LocaleContext'
import type { Question } from './data'
import { formatApiError, streamChatMessage } from './anthropicClient'
import ChatMarkdown from './ChatMarkdown'

export type ChatMode = 'explain' | 'practice'

function buildQuestionContext(q: Question): string {
  const lines = [
    `Question title: ${q.title}`,
    `Category: ${q.category}`,
    `Difficulty: ${q.difficulty}`,
  ]
  if (q.tags.length) lines.push(`Tags: ${q.tags.join(', ')}`)
  if (q.companies.length) lines.push(`Companies (where this often comes up): ${q.companies.join(', ')}`)
  lines.push('', 'Description:', q.description)
  return lines.join('\n')
}

function buildSystemPrompt(q: Question, mode: ChatMode, includeRefAnswer: boolean): string {
  const base = buildQuestionContext(q)
  const ref =
    includeRefAnswer && q.answer.trim()
      ? `

Reference answer (context only—do not paste verbatim unless it helps the learner):
${q.answer}`
      : ''

  if (mode === 'explain') {
    return `You are a friendly technical interview coach for frontend and JavaScript interviews.

${base}${ref}

Help the user understand the problem, compare approaches, and clarify trade-offs. If they ask for a full solution, you may provide it.`
  }

  return `You are a technical interviewer and coach. The user is practicing how they would answer in an interview.

${base}${ref}

Give concise feedback on their attempts: clarity, gaps, and hints. Prefer Socratic questions over handing them a complete solution unless they explicitly ask for the answer.`
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface QuestionChatProps {
  question: Question
  apiKey: string
  model: string
}

const AUTO_EXPLAIN_USER =
  'Explain this interview question for me: what it is testing, how you would approach it in an interview (steps, not necessarily full code), and common pitfalls. Stay concise; do not give a complete solution unless I ask for it in a follow-up.'

export default function QuestionChat({ question, apiKey, model }: QuestionChatProps) {
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ChatMode>('explain')
  const [includeRefAnswer, setIncludeRefAnswer] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const autoExplainLockRef = useRef(false)
  const streamGenerationRef = useRef(0)

  const canSend = apiKey.trim().length > 0 && input.trim().length > 0 && !loading

  const clearThread = useCallback(() => {
    streamGenerationRef.current += 1
    setMessages([])
    setStreaming('')
    setError(null)
    autoExplainLockRef.current = false
  }, [])

  const runStreamTurn = useCallback(
    async (thread: ChatMessage[], chatMode: ChatMode, includeRef: boolean) => {
      const gen = streamGenerationRef.current
      const system = buildSystemPrompt(question, chatMode, includeRef)
      const apiMessages: MessageParam[] = thread.map((m) => ({
        role: m.role,
        content: m.content,
      }))
      let acc = ''
      await streamChatMessage({
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
    [apiKey, model, question, locale],
  )

  useEffect(() => {
    if (!open || !apiKey.trim() || messages.length > 0 || loading || autoExplainLockRef.current) return

    autoExplainLockRef.current = true
    setError(null)
    const userTurn: ChatMessage = { role: 'user', content: AUTO_EXPLAIN_USER }
    setMessages([userTurn])
    setLoading(true)
    setStreaming('')

    ;(async () => {
      try {
        await runStreamTurn([userTurn], 'explain', includeRefAnswer)
      } catch (e) {
        setError(formatApiError(e))
        setStreaming('')
        setMessages([])
        // Keep lock true so we do not auto-retry in a loop; Clear conversation resets.
        autoExplainLockRef.current = true
      } finally {
        setLoading(false)
      }
    })()
  }, [open, apiKey, messages.length, includeRefAnswer, runStreamTurn])

  async function send() {
    if (!canSend) return
    const text = input.trim()
    setInput('')
    setError(null)
    const userTurn: ChatMessage = { role: 'user', content: text }
    const nextThread = [...messages, userTurn]
    setMessages(nextThread)
    setLoading(true)
    setStreaming('')

    try {
      await runStreamTurn(nextThread, mode, includeRefAnswer)
    } catch (e) {
      setError(formatApiError(e))
      setStreaming('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="q-chat-wrap">
      <button type="button" className="code-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide' : 'Chat with Claude'}
      </button>
      {open && (
        <div className="q-chat-panel">
          {!apiKey.trim() && (
            <p className="q-chat-warn">Add an Anthropic API key above to enable chat.</p>
          )}
          {apiKey.trim() && (
            <p className="q-chat-auto-hint">
              Claude receives the full question (title, category, difficulty, tags, companies, description). An explanation
              starts automatically when you open this panel with an empty thread. Replies render as <strong>Markdown</strong>{' '}
              below. Use the <strong>React sandbox</strong> tab to paste replies and preview TSX.
            </p>
          )}
          <div className="q-chat-modes">
            <span className="q-ai-label-inline">Mode</span>
            <label className="q-ai-radio">
              <input
                type="radio"
                name={`mode-${question.id}`}
                checked={mode === 'explain'}
                onChange={() => setMode('explain')}
              />
              Explain / solution help
            </label>
            <label className="q-ai-radio">
              <input
                type="radio"
                name={`mode-${question.id}`}
                checked={mode === 'practice'}
                onChange={() => setMode('practice')}
              />
              Practice (feedback on my answer)
            </label>
          </div>
          <label className="q-chat-checkbox">
            <input
              type="checkbox"
              checked={includeRefAnswer}
              onChange={(e) => setIncludeRefAnswer(e.target.checked)}
            />
            Include reference answer in context
          </label>
          <div className="q-chat-actions-top">
            <button
              type="button"
              className="secondary"
              onClick={clearThread}
              disabled={messages.length === 0 && !streaming && !error}
            >
              Clear conversation
            </button>
          </div>
          <div className="q-chat-log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`q-chat-bubble q-chat-bubble--${m.role}`}>
                <span className="q-chat-role">{m.role === 'user' ? 'You' : 'Claude'}</span>
                {m.role === 'assistant' ? (
                  <ChatMarkdown content={m.content} />
                ) : (
                  <div className="q-chat-text">{m.content}</div>
                )}
              </div>
            ))}
            {(streaming || loading) && (
              <div className="q-chat-bubble q-chat-bubble--assistant">
                <span className="q-chat-role">Claude</span>
                {streaming ? (
                  <ChatMarkdown content={streaming} />
                ) : (
                  <div className="q-chat-text">
                    <span className="q-chat-typing">…</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {error && <div className="q-chat-error">{error}</div>}
          <div className="q-chat-compose">
            <textarea
              className="q-chat-input"
              rows={3}
              placeholder="Follow-up question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              disabled={!apiKey.trim() || loading}
            />
            <button type="button" className="secondary" onClick={() => void send()} disabled={!canSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
