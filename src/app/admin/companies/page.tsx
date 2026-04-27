'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import type { Company } from '@/lib/models/Company'

type AdminCompany = Company & {
  order: number
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

type CompanyForm = {
  id: string
  emoji: string
  color: string
  order: string
}

const emptyForm: CompanyForm = {
  id: '',
  emoji: '',
  color: '#000000',
  order: '',
}

function companyToForm(company: AdminCompany): CompanyForm {
  return {
    id: company.id,
    emoji: company.emoji,
    color: company.color,
    order: String(company.order),
  }
}

function formToPayload(form: CompanyForm) {
  return {
    id: form.id,
    emoji: form.emoji,
    color: form.color,
    order: form.order.trim() ? Number(form.order) : undefined,
  }
}

export default function AdminCompaniesPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CompanyForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const editingCompany = useMemo(
    () => companies.find(company => company.id === editingId) ?? null,
    [companies, editingId],
  )

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/companies?includeArchived=${includeArchived}`)
      const data = (await response.json().catch(() => null)) as { companies?: AdminCompany[]; error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to load companies')
      setCompanies(Array.isArray(data?.companies) ? data.companies : [])
    } catch (err) {
      setCompanies([])
      setError(err instanceof Error ? err.message : 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [includeArchived])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    loadCompanies()
  }, [isLoaded, isSignedIn, loadCompanies])

  function updateForm<K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setNotice(null)
    setError(null)
  }

  function startEdit(company: AdminCompany) {
    setEditingId(company.id)
    setForm(companyToForm(company))
    setNotice(null)
    setError(null)
  }

  async function seedFromStaticList() {
    setSeeding(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/admin/companies/seed', { method: 'POST' })
      const data = (await response.json().catch(() => null)) as {
        error?: string
        stats?: { matchedCount?: number; modifiedCount?: number; upsertedCount?: number }
      } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to seed companies')
      const s = data?.stats
      setNotice(
        s
          ? `Seeded: ${s.upsertedCount ?? 0} inserted, ${s.modifiedCount ?? 0} updated, ${s.matchedCount ?? 0} matched.`
          : 'Seeded from static list.',
      )
      await loadCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed companies')
    } finally {
      setSeeding(false)
    }
  }

  async function saveCompany() {
    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      const payload = formToPayload(form)
      const path = editingId
        ? `/api/admin/companies/${encodeURIComponent(editingId)}`
        : '/api/admin/companies'
      const response = await fetch(path, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to save company')

      setNotice(editingId ? 'Company updated.' : 'Company created.')
      startCreate()
      await loadCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  async function setArchived(company: AdminCompany, archived: boolean) {
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/admin/companies/${encodeURIComponent(company.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to update company')

      setNotice(archived ? 'Company archived.' : 'Company restored.')
      await loadCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company')
    }
  }

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <div className="editorial-page">
        <div className="editorial-panel" style={{ textAlign: 'center', paddingBlock: '4rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Sign in to manage companies</h1>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="screen-header-title" style={{ marginBottom: '0.25rem' }}>
              Admin — Companies
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage companies stored in MongoDB (used as tags on questions).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/admin/questions" className="home-card-link">
              Questions →
            </Link>
            <Link href="/admin/users" className="home-card-link">
              Users →
            </Link>
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
        {notice && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>{notice}</p>}

        <section className="q-card q-card--editorial" style={{ marginBottom: '1.5rem' }}>
          <h2 className="q-title q-title--stitch" style={{ marginBottom: '0.75rem' }}>
            Seed from built-in list
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Upserts every company from the static catalog (same ids, emoji, and colors as in code) into MongoDB.
          </p>
          <button type="button" className="home-card-link" disabled={seeding} onClick={seedFromStaticList}>
            {seeding ? 'Seeding...' : 'Seed all companies'}
          </button>
        </section>

        <section className="q-card q-card--editorial" style={{ marginBottom: '1.5rem' }}>
          <h2 className="q-title q-title--stitch" style={{ marginBottom: '1rem' }}>
            {editingCompany ? `Edit ${editingCompany.id}` : 'Create company'}
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '32rem' }}>
            <input
              className="questions-stitch-select"
              placeholder="Id (e.g. Google) — matches question company tags"
              value={form.id}
              disabled={Boolean(editingId)}
              onChange={e => updateForm('id', e.target.value)}
            />
            <input
              className="questions-stitch-select"
              placeholder="Emoji"
              value={form.emoji}
              onChange={e => updateForm('emoji', e.target.value)}
            />
            <input
              className="questions-stitch-select"
              placeholder="#RRGGBB"
              value={form.color}
              onChange={e => updateForm('color', e.target.value)}
            />
            <input
              className="questions-stitch-select"
              placeholder="Sort order (optional)"
              value={form.order}
              onChange={e => updateForm('order', e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="home-card-link" disabled={saving} onClick={saveCompany}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create company'}
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
          Include archived companies
        </label>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading companies...</p>
        ) : companies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No companies yet. Run seed or create one.</p>
        ) : (
          <div className="questions-stitch-list">
            {companies.map(company => (
              <article key={company.id} className="q-card q-card--editorial">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.75rem', lineHeight: 1 }} aria-hidden>{company.emoji}</span>
                    <div>
                      <div className="q-editorial-badges" style={{ marginBottom: '0.5rem' }}>
                        <span
                          className="q-editorial-badge q-editorial-badge--category"
                          style={{ borderColor: company.color, color: company.color }}
                        >
                          {company.id}
                        </span>
                        {company.archivedAt && <span className="q-editorial-badge q-editorial-badge--category">Archived</span>}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {company.color} · order {company.order}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button type="button" className="home-card-link" onClick={() => startEdit(company)}>
                      Edit
                    </button>
                    <button type="button" className="home-card-link" onClick={() => setArchived(company, !company.archivedAt)}>
                      {company.archivedAt ? 'Restore' : 'Archive'}
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
