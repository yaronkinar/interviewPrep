'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { CATEGORIES, COMPANIES, type Category, type Difficulty, type Question } from '@/questions/data'

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

  const editingQuestion = useMemo(
    () => questions.find(question => question.id === editingId) ?? null,
    [questions, editingId],
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
      await loadQuestions()
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
      await loadQuestions()
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
