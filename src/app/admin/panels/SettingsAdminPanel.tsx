'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

type AppSettingsResponse = {
  jsSandboxUseSandpack?: boolean
  mockInterviewUseSandpack?: boolean
  error?: string
}

export function SettingsAdminPanel() {
  const { isLoaded, isSignedIn } = useAuth()
  const [jsSandboxUseSandpack, setJsSandboxUseSandpack] = useState(false)
  const [mockInterviewUseSandpack, setMockInterviewUseSandpack] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingField, setSavingField] = useState<'js' | 'mock' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch('/api/admin/app-settings')
      .then(async response => {
        const data = (await response.json().catch(() => null)) as AppSettingsResponse | null
        if (!response.ok) {
          throw new Error(data?.error ?? 'Failed to load settings')
        }
        return data
      })
      .then(data => {
        if (!cancelled && data) {
          if (typeof data.jsSandboxUseSandpack === 'boolean') {
            setJsSandboxUseSandpack(data.jsSandboxUseSandpack)
          }
          if (typeof data.mockInterviewUseSandpack === 'boolean') {
            setMockInterviewUseSandpack(data.mockInterviewUseSandpack)
          }
        }
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load settings')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  const applyServerState = useCallback((data: AppSettingsResponse | null) => {
    if (!data) return
    if (typeof data.jsSandboxUseSandpack === 'boolean') {
      setJsSandboxUseSandpack(data.jsSandboxUseSandpack)
    }
    if (typeof data.mockInterviewUseSandpack === 'boolean') {
      setMockInterviewUseSandpack(data.mockInterviewUseSandpack)
    }
  }, [])

  const toggleJsSandpack = useCallback(async () => {
    setSavingField('js')
    setError(null)
    const next = !jsSandboxUseSandpack
    try {
      const response = await fetch('/api/admin/app-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsSandboxUseSandpack: next }),
      })
      const data = (await response.json().catch(() => null)) as AppSettingsResponse | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to save')
      applyServerState(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingField(null)
    }
  }, [applyServerState, jsSandboxUseSandpack])

  const toggleMockSandpack = useCallback(async () => {
    setSavingField('mock')
    setError(null)
    const next = !mockInterviewUseSandpack
    try {
      const response = await fetch('/api/admin/app-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mockInterviewUseSandpack: next }),
      })
      const data = (await response.json().catch(() => null)) as AppSettingsResponse | null
      if (!response.ok) throw new Error(data?.error ?? 'Failed to save')
      applyServerState(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingField(null)
    }
  }, [applyServerState, mockInterviewUseSandpack])

  const saving = savingField !== null

  if (!isLoaded) return null

  if (!isSignedIn) {
    return <p style={{ color: 'var(--text-muted)' }}>Sign in to manage settings.</p>
  }

  return (
    <section>
      <h2 className="screen-header-title" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
        Feature flags
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '42rem' }}>
        Toggle Sandpack-powered editors vs Monaco + custom tooling. Values are stored in{' '}
        <code>app_settings</code> and read on each visit (no deploy required).
      </p>

      {error && (
        <p style={{ color: 'var(--error, #f87171)', marginBottom: '1rem' }} role="alert">
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            cursor: loading || saving ? 'wait' : 'pointer',
            opacity: loading ? 0.65 : 1,
          }}
        >
          <input
            type="checkbox"
            checked={jsSandboxUseSandpack}
            disabled={loading || saving}
            onChange={() => void toggleJsSandpack()}
            style={{ marginTop: '0.2rem' }}
          />
          <span>
            <strong>JS lab + React sandbox</strong>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              <code>/js</code> and <code>/sandbox</code> use Sandpack instead of Monaco + blob iframe.
            </span>
          </span>
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            cursor: loading || saving ? 'wait' : 'pointer',
            opacity: loading ? 0.65 : 1,
          }}
        >
          <input
            type="checkbox"
            checked={mockInterviewUseSandpack}
            disabled={loading || saving}
            onChange={() => void toggleMockSandpack()}
            style={{ marginTop: '0.2rem' }}
          />
          <span>
            <strong>Mock interview code panel</strong>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              <code>/mock</code> — for Interviewer and Code review modes, replace the VS Code–style Monaco editor with
              Sandpack (TypeScript, same <code>INTERVIEW_PROBLEM</code> typings). Chat, voice, and timers are unchanged.
            </span>
          </span>
        </label>
      </div>
    </section>
  )
}
