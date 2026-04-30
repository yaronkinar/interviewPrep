import { useCallback, useState } from 'react'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { useLocale } from '../i18n/LocaleContext'
import type { Question } from './data'
import type { LlmProvider } from './llmConstants'
import { formatApiError, streamLlmChat } from './llmStream'
import { buildCatalogSnippetsForPrompt } from './questionPromptContext'
import ChatMarkdown from './ChatMarkdown'

export type OpenChatMode = 'explain' | 'practice'

const SYSTEM_EXPLAIN = `You are a friendly technical interview coach for frontend and JavaScript interviews. The user is chatting without a fixed question from the list: they may ask about concepts, compare approaches, paste a problem, or walk through code. Respond clearly and practically. If they describe a coding problem, help them reason through requirements, edge cases, and trade-offs.`

const SYSTEM_PRACTICE = `You are a technical interviewer and coach. The user may share how they would answer a question or explain a topic out loud. Give concise feedback: clarity, gaps, and hints. Prefer Socratic questions over handing them a complete solution unless they explicitly ask for the answer.`

const CATALOG_SEARCH_LIMIT = 8
/** Ignore lexical-search hits below this (scores are weighted sums over matched tokens). */
/** Drop only negligible scores; lexical weights already rank matches (see repositories/questions). */
const MIN_CATALOG_MATCH_SCORE = 1

const CATALOG_HIT_INSTRUCTION = `Below are excerpts from this app's interview question catalog. Prefer them when answering. Name the catalog question title when you rely on a specific entry (you may mention its id from the excerpt header). Synthesize across entries when helpful.`

const CATALOG_MISS_INSTRUCTION = `Catalog lookup ran but no entries scored strongly enough for this message (keywords may not match stored questions). Say that briefly in one sentence, then answer from general frontend and JavaScript interview knowledge—still practical and concise.`

type QuestionSearchMatchDto = {
  question: Question
  score: number
  matchedFields: string[]
  snippet: string
}

type QuestionSearchApiResponse = {
  query?: string
  tokens?: string[]
  matches?: QuestionSearchMatchDto[]
  error?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface OpenChatProps {
  apiKey: string
  model: string
  llmProvider: LlmProvider
  /** Navigate to a catalog question (e.g. set \`?question=\` on the questions page). */
  onOpenCatalogQuestion?: (questionId: string) => void
}

function buildOpenChatSystem(params: {
  mode: OpenChatMode
  catalogGrounding: boolean
  catalogSnippets: string
  catalogLookupFailed: boolean
}): string {
  const base = params.mode === 'explain' ? SYSTEM_EXPLAIN : SYSTEM_PRACTICE
  if (!params.catalogGrounding) return base

  if (params.catalogLookupFailed) {
    return `${base}

The user enabled catalog-backed answers, but retrieving catalog excerpts failed this turn. Answer normally without claiming catalog matches.`
  }

  const hasSnippets = params.catalogSnippets.trim().length > 0
  if (hasSnippets) {
    return `${base}

${CATALOG_HIT_INSTRUCTION}

${params.catalogSnippets}`
  }

  return `${base}

${CATALOG_MISS_INSTRUCTION}`
}

async function fetchCatalogMatches(userMessage: string): Promise<
  | { ok: true; questions: Question[]; tokens: string[] }
  | { ok: false; error: string }
> {
  const params = new URLSearchParams({
    q: userMessage,
    limit: String(CATALOG_SEARCH_LIMIT),
  })
  const response = await fetch(`/api/questions/search?${params.toString()}`)
  const data = (await response.json().catch(() => null)) as QuestionSearchApiResponse | null
  if (!response.ok) {
    return { ok: false, error: data?.error ?? 'Catalog search failed.' }
  }

  const tokens = Array.isArray(data?.tokens) ? data.tokens : []
  const matches = Array.isArray(data?.matches) ? data.matches : []

  if (tokens.length === 0) {
    return { ok: true, questions: [], tokens: [] }
  }

  const questions = matches
    .filter((m) => m.score >= MIN_CATALOG_MATCH_SCORE)
    .map((m) => m.question)

  return { ok: true, questions, tokens }
}

export default function OpenChat({
  apiKey,
  model,
  llmProvider,
  onOpenCatalogQuestion,
}: OpenChatProps) {
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<OpenChatMode>('explain')
  const [catalogGrounding, setCatalogGrounding] = useState(true)
  const [includeCatalogAnswers, setIncludeCatalogAnswers] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null)
  const [lastCatalogSources, setLastCatalogSources] = useState<{ id: string; title: string }[]>([])

  const canSend = apiKey.trim().length > 0 && input.trim().length > 0 && !loading

  const clearThread = useCallback(() => {
    setMessages([])
    setStreaming('')
    setError(null)
    setCatalogNotice(null)
    setLastCatalogSources([])
  }, [])

  async function send() {
    if (!canSend) return
    const text = input.trim()
    setInput('')
    setError(null)
    setCatalogNotice(null)
    const userTurn: ChatMessage = { role: 'user', content: text }
    const nextThread = [...messages, userTurn]
    setMessages(nextThread)
    setLoading(true)
    setStreaming('')

    let catalogSnippets = ''
    let catalogLookupFailed = false

    if (catalogGrounding) {
      try {
        const result = await fetchCatalogMatches(text)
        if (!result.ok) {
          catalogLookupFailed = true
          setCatalogNotice(`${result.error} Answering without catalog excerpts.`)
          setLastCatalogSources([])
        } else {
          catalogSnippets = buildCatalogSnippetsForPrompt(result.questions, includeCatalogAnswers)
          setLastCatalogSources(result.questions.map((q) => ({ id: q.id, title: q.title })))
        }
      } catch {
        catalogLookupFailed = true
        setCatalogNotice('Catalog search failed. Answering without catalog excerpts.')
        setLastCatalogSources([])
      }
    } else {
      setLastCatalogSources([])
    }

    const system = buildOpenChatSystem({
      mode,
      catalogGrounding,
      catalogSnippets,
      catalogLookupFailed,
    })

    const apiMessages: MessageParam[] = nextThread.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    let acc = ''
    try {
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
            <p className="q-chat-warn">Add an API key in AI settings above to enable chat.</p>
          )}
          {apiKey.trim() && (
            <p className="q-chat-auto-hint">
              Assistant replies render as <strong>Markdown</strong>. Open the <strong>React sandbox</strong> tab to paste a
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
          <label className="q-chat-checkbox">
            <input
              type="checkbox"
              checked={catalogGrounding}
              onChange={(e) => setCatalogGrounding(e.target.checked)}
            />
            Ground replies in question catalog (search MongoDB excerpts each send)
          </label>
          <label className="q-chat-checkbox">
            <input
              type="checkbox"
              checked={includeCatalogAnswers}
              onChange={(e) => setIncludeCatalogAnswers(e.target.checked)}
              disabled={!catalogGrounding}
            />
            Include reference answers in catalog context
          </label>
          <div className="q-chat-actions-top">
            <button
              type="button"
              className="secondary"
              onClick={clearThread}
              disabled={messages.length === 0 && !streaming && !error && !catalogNotice}
            >
              Clear conversation
            </button>
          </div>
          {catalogNotice && <div className="q-chat-warn">{catalogNotice}</div>}
          {lastCatalogSources.length > 0 && catalogGrounding && (
            <div className="q-open-chat-sources" aria-live="polite">
              <span className="q-open-chat-sources-label">Catalog sources (last send)</span>
              <div className="q-open-chat-sources-chips">
                {lastCatalogSources.map((s) =>
                  onOpenCatalogQuestion ? (
                    <button
                      key={s.id}
                      type="button"
                      className="secondary q-open-chat-source-chip"
                      onClick={() => onOpenCatalogQuestion(s.id)}
                    >
                      {s.title}
                    </button>
                  ) : (
                    <span key={s.id} className="q-open-chat-source-chip q-open-chat-source-chip--text">
                      {s.title}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
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
