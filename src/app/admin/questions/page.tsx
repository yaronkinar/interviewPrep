'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { CATEGORIES, COMPANIES, type Category, type Difficulty, type Question } from '@/questions/data'
import { preloadQuestionCatalog } from '@/questions/useQuestionCatalog'
import {
  DEFAULT_OPENAI_MODEL,
  OPENAI_API_KEY_LOCAL_KEY,
  OPENAI_API_KEY_SESSION_KEY,
  OPENAI_MODEL_STORAGE_KEY,
  normalizeOpenaiModel,
  readDefaultOpenaiKeyFromEnv,
} from '@/questions/openaiConstants'

type AdminQuestion = Question & {
  order: number
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

type QuestionForm = {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  category: Category
  answer: string
  answerType: Question['answerType']
  tags: string
  companies: string
  source: string
  order: string
}

const emptyForm: QuestionForm = {
  id: '',
  title: '',
  description: '',
  difficulty: 'medium',
  category: 'Algorithms',
  answer: '',
  answerType: 'text',
  tags: '',
  companies: '',
  source: '',
  order: '',
}

function loadOpenaiSearchModel(): string {
  try {
    return normalizeOpenaiModel(localStorage.getItem(OPENAI_MODEL_STORAGE_KEY))
  } catch {
    return DEFAULT_OPENAI_MODEL
  }
}

function loadOpenaiSearchKey(): string {
  try {
    return (
      sessionStorage.getItem(OPENAI_API_KEY_SESSION_KEY)?.trim() ||
      localStorage.getItem(OPENAI_API_KEY_LOCAL_KEY)?.trim() ||
      readDefaultOpenaiKeyFromEnv()
    )
  } catch {
    return readDefaultOpenaiKeyFromEnv()
  }
}

function questionToForm(question: AdminQuestion): QuestionForm {
  return {
    id: question.id,
    title: question.title,
    description: question.description,
    difficulty: question.difficulty,
    category: question.category,
    answer: question.answer,
    answerType: question.answerType,
    tags: question.tags.join(', '),
    companies: question.companies.join(', '),
    source: question.source ?? '',
    order: String(question.order),
  }
}

function formToPayload(form: QuestionForm) {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    difficulty: form.difficulty,
    category: form.category,
    answer: form.answer,
    answerType: form.answerType,
    tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    companies: form.companies.split(',').map(company => company.trim()).filter(Boolean),
    source: form.source.trim() || undefined,
    order: form.order.trim() ? Number(form.order) : undefined,
  }
}

export default function AdminQuestionsPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<QuestionForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [searchTopic, setSearchTopic] = useState('')
  const [searchCompany, setSearchCompany] = useState('PlainID')
  const [searchCount, setSearchCount] = useState('5')
  const [searchModel, setSearchModel] = useState(loadOpenaiSearchModel)
  const [searchApiKey, setSearchApiKey] = useState(loadOpenaiSearchKey)
  const [searchingQuestions, setSearchingQuestions] = useState(false)
  const [addingSuggestions, setAddingSuggestions] = useState(false)
  const [testingCron, setTestingCron] = useState(false)
  const [suggestions, setSuggestions] = useState<Question[]>([])
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<Set<string>>(new Set())
  const [recentCronCreatedIds, setRecentCronCreatedIds] = useState<string[]>([])

  const editingQuestion = useMemo(
    () => questions.find(question => question.id === editingId) ?? null,
    [questions, editingId],
  )
  const selectedSuggestions = useMemo(
    () => suggestions.filter(question => selectedSuggestionIds.has(question.id)),
    [selectedSuggestionIds, suggestions],
  )
  const recentCronQuestions = useMemo(
    () => recentCronCreatedIds
      .map(id => questions.find(question => question.id === id))
      .filter((question): question is AdminQuestion => Boolean(question)),
    [questions, recentCronCreatedIds],
  )

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/questions?includeArchived=${includeArchived}`)
      const data = (await response.json().catch(() => null)) as { questions?: AdminQuestion[]; error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to load questions')
      setQuestions(Array.isArray(data?.questions) ? data.questions : [])
    } catch (err) {
      setQuestions([])
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [includeArchived])

  async function refreshQuestionData() {
    await Promise.all([
      loadQuestions(),
      preloadQuestionCatalog({ force: true }).catch(() => {
        // The admin list is the source of truth here; public pages can surface catalog errors.
      }),
    ])
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    loadQuestions()
  }, [isLoaded, isSignedIn, loadQuestions])

  function updateForm<K extends keyof QuestionForm>(key: K, value: QuestionForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setNotice(null)
    setError(null)
  }

  function startEdit(question: AdminQuestion) {
    setEditingId(question.id)
    setForm(questionToForm(question))
    setNotice(null)
    setError(null)
  }

  function toggleSuggestion(id: string) {
    setSelectedSuggestionIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function searchNewQuestions() {
    setSearchingQuestions(true)
    setError(null)
    setNotice(null)

    try {
      const model = searchModel.trim() || DEFAULT_OPENAI_MODEL
      localStorage.setItem(OPENAI_MODEL_STORAGE_KEY, model)
      const response = await fetch('/api/admin/questions/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchTopic,
          company: searchCompany,
          count: Number(searchCount),
          model,
          apiKey: searchApiKey.trim() || undefined,
        }),
      })
      const data = (await response.json().catch(() => null)) as { questions?: Question[]; error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to search for questions')

      const nextSuggestions = Array.isArray(data?.questions) ? data.questions : []
      setSuggestions(nextSuggestions)
      setSelectedSuggestionIds(new Set(nextSuggestions.map(question => question.id)))
      setNotice(nextSuggestions.length ? `Found ${nextSuggestions.length} suggested questions.` : 'No new suggestions found.')
    } catch (err) {
      setSuggestions([])
      setSelectedSuggestionIds(new Set())
      setError(err instanceof Error ? err.message : 'Failed to search for questions')
    } finally {
      setSearchingQuestions(false)
    }
  }

  async function addSelectedSuggestions() {
    if (selectedSuggestions.length === 0) return

    setAddingSuggestions(true)
    setError(null)
    setNotice(null)

    const createdIds: string[] = []
    const failed: string[] = []

    try {
      for (const question of selectedSuggestions) {
        try {
          const response = await fetch('/api/admin/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(question),
          })
          const data = (await response.json().catch(() => null)) as { error?: string } | null
          if (!response.ok) throw new Error(data?.error ?? 'Failed to create question')
          createdIds.push(question.id)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to create question'
          failed.push(`${question.title}: ${message}`)
        }
      }

      setSuggestions(prev => prev.filter(question => !createdIds.includes(question.id)))
      setSelectedSuggestionIds(prev => {
        const next = new Set(prev)
        createdIds.forEach(id => next.delete(id))
        return next
      })

      if (createdIds.length > 0) {
        await refreshQuestionData()
      }

      if (failed.length > 0) {
        setError(`Created ${createdIds.length}; failed ${failed.length}. ${failed.join(' | ')}`)
      } else {
        setNotice(`Created ${createdIds.length} questions.`)
      }
    } finally {
      setAddingSuggestions(false)
    }
  }

  async function testQuestionCron() {
    setTestingCron(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/admin/questions/test-cron', {
        method: 'POST',
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
        query?: string
        suggested?: number
        created?: string[]
        skipped?: string[]
        failed?: string[]
      } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to test cron')

      if (data?.created?.length) {
        setRecentCronCreatedIds(data.created)
        await refreshQuestionData()
      } else {
        setRecentCronCreatedIds([])
      }

      setNotice(
        `Cron test completed. Topic: ${data?.query ?? 'unknown'}. ` +
        `Suggested: ${data?.suggested ?? 0}, created: ${data?.created?.length ?? 0}, ` +
        `skipped: ${data?.skipped?.length ?? 0}, failed: ${data?.failed?.length ?? 0}.`,
      )
      if (data?.failed?.length) {
        setError(data.failed.join(' | '))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test cron')
    } finally {
      setTestingCron(false)
    }
  }

  async function saveQuestion() {
    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(editingId ? `/api/admin/questions/${editingId}` : '/api/admin/questions', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formToPayload(form)),
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to save question')

      setNotice(editingId ? 'Question updated.' : 'Question created.')
      startCreate()
      await refreshQuestionData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  async function setArchived(question: AdminQuestion, archived: boolean) {
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to update question')

      setNotice(archived ? 'Question archived.' : 'Question restored.')
      await refreshQuestionData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question')
    }
  }

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <div className="editorial-page">
        <div className="editorial-panel" style={{ textAlign: 'center', paddingBlock: '4rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Sign in to manage questions</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Only admin users can view this section.
          </p>
          <Link href="/sign-in" className="home-card-link">
            Sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="editorial-page">
      <div className="editorial-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="screen-header-title" style={{ marginBottom: '0.25rem' }}>
              Admin - Questions
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage MongoDB-backed interview questions.
            </p>
          </div>
          <Link href="/admin/users" className="home-card-link">
            Manage users →
          </Link>
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
        {notice && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>{notice}</p>}

        {recentCronQuestions.length > 0 && (
          <section className="q-card q-card--editorial" style={{ marginBottom: '1.5rem' }}>
            <h2 className="q-title q-title--stitch" style={{ marginBottom: '0.75rem' }}>
              Recently created by cron test
            </h2>
            <div className="questions-stitch-list">
              {recentCronQuestions.map(question => (
                <article key={question.id} className="q-card q-card--editorial">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div className="q-editorial-badges" style={{ marginBottom: '0.5rem' }}>
                        <span className="q-editorial-badge q-editorial-badge--category">{question.category}</span>
                        <span className={`q-editorial-badge q-editorial-badge--difficulty q-editorial-badge--difficulty-${question.difficulty}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <h3 className="q-title q-title--stitch">{question.title}</h3>
                      <p className="q-desc q-desc--stitch" style={{ marginTop: '0.5rem' }}>
                        {question.description}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        {question.id} · order {question.order}
                      </p>
                    </div>
                    <button type="button" className="home-card-link" onClick={() => startEdit(question)}>
                      Edit
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="q-card q-card--editorial" style={{ marginBottom: '1.5rem' }}>
          <h2 className="q-title q-title--stitch" style={{ marginBottom: '0.5rem' }}>
            Search new questions
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Search for a frontend topic, preview suggested questions, then add selected items to MongoDB.
          </p>
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'minmax(220px, 1fr) minmax(150px, 220px) minmax(160px, 220px) minmax(160px, 220px) minmax(100px, 140px)' }}>
            <input
              className="questions-stitch-select"
              placeholder="Topic, e.g. React accessibility for authorization admin UI"
              value={searchTopic}
              onChange={e => setSearchTopic(e.target.value)}
            />
            <select className="questions-stitch-select" value={searchCompany} onChange={e => setSearchCompany(e.target.value)}>
              <option value="">No company tag</option>
              {COMPANIES.map(company => (
                <option key={company.id} value={company.id}>{company.id}</option>
              ))}
            </select>
            <input
              className="questions-stitch-select"
              placeholder={DEFAULT_OPENAI_MODEL}
              value={searchModel}
              onChange={e => setSearchModel(e.target.value)}
              title="OpenAI model for question search"
            />
            <input
              className="questions-stitch-select"
              type="password"
              placeholder="OpenAI API key"
              value={searchApiKey}
              onChange={e => setSearchApiKey(e.target.value)}
              title="OpenAI API key for question search"
              autoComplete="off"
            />
            <input
              className="questions-stitch-select"
              type="number"
              min={1}
              max={8}
              value={searchCount}
              onChange={e => setSearchCount(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button type="button" className="home-card-link" disabled={searchingQuestions || !searchTopic.trim()} onClick={searchNewQuestions}>
              {searchingQuestions ? 'Searching...' : 'Search questions'}
            </button>
            <button type="button" className="home-card-link" disabled={testingCron} onClick={testQuestionCron}>
              {testingCron ? 'Testing cron...' : 'Test cron now'}
            </button>
            <button type="button" className="home-card-link" disabled={addingSuggestions || selectedSuggestions.length === 0} onClick={addSelectedSuggestions}>
              {addingSuggestions ? 'Adding...' : `Add selected (${selectedSuggestions.length})`}
            </button>
            {suggestions.length > 0 && (
              <button
                type="button"
                className="home-card-link"
                onClick={() => {
                  setSuggestions([])
                  setSelectedSuggestionIds(new Set())
                }}
              >
                Clear suggestions
              </button>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="questions-stitch-list" style={{ marginTop: '1rem' }}>
              {suggestions.map(question => (
                <article key={question.id} className="q-card q-card--editorial">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedSuggestionIds.has(question.id)}
                      onChange={() => toggleSuggestion(question.id)}
                      style={{ marginTop: '0.35rem' }}
                    />
                    <span>
                      <span className="q-editorial-badges" style={{ marginBottom: '0.5rem' }}>
                        <span className="q-editorial-badge q-editorial-badge--category">{question.category}</span>
                        <span className={`q-editorial-badge q-editorial-badge--difficulty q-editorial-badge--difficulty-${question.difficulty}`}>
                          {question.difficulty}
                        </span>
                      </span>
                      <strong className="q-title q-title--stitch" style={{ display: 'block' }}>{question.title}</strong>
                      <span className="q-desc q-desc--stitch" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {question.description}
                      </span>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        {question.id} · {question.companies.join(', ') || 'No company'} · {question.tags.join(', ')}
                      </span>
                    </span>
                  </label>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="q-card q-card--editorial" style={{ marginBottom: '1.5rem' }}>
          <h2 className="q-title q-title--stitch" style={{ marginBottom: '1rem' }}>
            {editingQuestion ? `Edit ${editingQuestion.title}` : 'Create question'}
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <input className="questions-stitch-select" placeholder="id" value={form.id} disabled={Boolean(editingId)} onChange={e => updateForm('id', e.target.value)} />
            <input className="questions-stitch-select" placeholder="Title" value={form.title} onChange={e => updateForm('title', e.target.value)} />
            <textarea className="questions-stitch-select" rows={4} placeholder="Description" value={form.description} onChange={e => updateForm('description', e.target.value)} />
            <textarea className="questions-stitch-select" rows={8} placeholder="Answer" value={form.answer} onChange={e => updateForm('answer', e.target.value)} />
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              <select className="questions-stitch-select" value={form.difficulty} onChange={e => updateForm('difficulty', e.target.value as Difficulty)}>
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
              <select className="questions-stitch-select" value={form.category} onChange={e => updateForm('category', e.target.value as Category)}>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select className="questions-stitch-select" value={form.answerType} onChange={e => updateForm('answerType', e.target.value as Question['answerType'])}>
                <option value="text">text</option>
                <option value="code">code</option>
                <option value="mixed">mixed</option>
              </select>
              <input className="questions-stitch-select" placeholder="Order" value={form.order} onChange={e => updateForm('order', e.target.value)} />
            </div>
            <input className="questions-stitch-select" placeholder="Tags, comma separated" value={form.tags} onChange={e => updateForm('tags', e.target.value)} />
            <input
              className="questions-stitch-select"
              placeholder={`Companies, comma separated. Known: ${COMPANIES.map(company => company.id).join(', ')}`}
              value={form.companies}
              onChange={e => updateForm('companies', e.target.value)}
            />
            <input className="questions-stitch-select" placeholder="Source" value={form.source} onChange={e => updateForm('source', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="home-card-link" disabled={saving} onClick={saveQuestion}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create question'}
            </button>
            {editingId && (
              <button type="button" className="home-card-link" onClick={startCreate}>
                Cancel edit
              </button>
            )}
          </div>
        </section>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={e => setIncludeArchived(e.target.checked)}
          />
          Include archived questions
        </label>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading questions...</p>
        ) : questions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No questions found.</p>
        ) : (
          <div className="questions-stitch-list">
            {questions.map(question => (
              <article key={question.id} className="q-card q-card--editorial">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div className="q-editorial-badges" style={{ marginBottom: '0.5rem' }}>
                      <span className="q-editorial-badge q-editorial-badge--category">{question.category}</span>
                      <span className={`q-editorial-badge q-editorial-badge--difficulty q-editorial-badge--difficulty-${question.difficulty}`}>
                        {question.difficulty}
                      </span>
                      {question.archivedAt && <span className="q-editorial-badge q-editorial-badge--category">Archived</span>}
                    </div>
                    <h3 className="q-title q-title--stitch">{question.title}</h3>
                    <p className="q-desc q-desc--stitch" style={{ marginTop: '0.5rem' }}>
                      {question.description}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      {question.id} · order {question.order}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button type="button" className="home-card-link" onClick={() => startEdit(question)}>
                      Edit
                    </button>
                    <button type="button" className="home-card-link" onClick={() => setArchived(question, !question.archivedAt)}>
                      {question.archivedAt ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
