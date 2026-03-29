import { useCallback, useState } from 'react'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { formatApiError, streamChatMessage } from './anthropicClient'
import ChatMarkdown from './ChatMarkdown'

export type OpenChatMode = 'explain' | 'practice'

const SYSTEM_EXPLAIN = `You are a friendly technical interview coach for frontend and JavaScript interviews. The user is chatting without a fixed question from the list: they may ask about concepts, compare approaches, paste a problem, or walk through code. Respond clearly and practically. If they describe a coding problem, help them reason through requirements, edge cases, and trade-offs.`

const SYSTEM_PRACTICE = `You are a technical interviewer and coach. The user may share how they would answer a question or explain a topic out loud. Give concise feedback: clarity, gaps, and hints. Prefer Socratic questions over handing them a complete solution unless they explicitly ask for the answer.`

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface OpenChatProps {
  apiKey: string
  model: string
}

export default function OpenChat({ apiKey, model }: OpenChatProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<OpenChatMode>('explain')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSend = apiKey.trim().length > 0 && input.trim().length > 0 && !loading

  const clearThread = useCallback(() => {
    setMessages([])
    setStreaming('')
    setError(null)
  }, [])

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

    const system = mode === 'explain' ? SYSTEM_EXPLAIN : SYSTEM_PRACTICE
    const apiMessages: MessageParam[] = nextThread.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    let acc = ''
    try {
      await streamChatMessage({
        apiKey: apiKey.trim(),
        model: model.trim(),
        system,
        messages: apiMessages,
        onTextDelta: (d) => {
          acc += d
          setStreaming(acc)
        },
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: acc }])
      setStreaming('')
    } catch (e) {
      setError(formatApiError(e))
      setStreaming('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="q-open-chat">
      <button type="button" className="q-open-chat-toggle code-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '▼' : '▶'} Ask anything (no specific question)
      </button>
      {!open && (
        <p className="q-open-chat-lead">
          Chat about any topic—concepts, a problem you paste, or interview practice—without picking a card below.
        </p>
      )}
      {open && (
        <div className="q-chat-panel q-open-chat-panel">
          {!apiKey.trim() && (
            <p className="q-chat-warn">Add an Anthropic API key above to enable chat.</p>
          )}
          {apiKey.trim() && (
            <p className="q-chat-auto-hint">
              Claude’s replies render as <strong>Markdown</strong>. Open the <strong>React sandbox</strong> tab to paste a
              reply and run TSX in the preview iframe.
            </p>
          )}
          <div className="q-chat-modes">
            <span className="q-ai-label-inline">Mode</span>
            <label className="q-ai-radio">
              <input
                type="radio"
                name="open-chat-mode"
                checked={mode === 'explain'}
                onChange={() => setMode('explain')}
              />
              Explain / general help
            </label>
            <label className="q-ai-radio">
              <input
                type="radio"
                name="open-chat-mode"
                checked={mode === 'practice'}
                onChange={() => setMode('practice')}
              />
              Practice (feedback on my answer)
            </label>
          </div>
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
              placeholder="Ask about a concept, paste a problem, or practice an answer…"
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
    </section>
  )
}
