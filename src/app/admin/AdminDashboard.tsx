'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { CompaniesAdminPanel } from './panels/CompaniesAdminPanel'
import { QuestionsAdminPanel } from './panels/QuestionsAdminPanel'
import { UsersAdminPanel } from './panels/UsersAdminPanel'

const VALID_TABS = ['questions', 'companies', 'users'] as const
type AdminTab = (typeof VALID_TABS)[number]

function parseTab(value: string | null): AdminTab {
  if (value && (VALID_TABS as readonly string[]).includes(value)) {
    return value as AdminTab
  }
  return 'questions'
}

export default function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))

  const setTab = useCallback(
    (next: AdminTab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', next)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <div className="editorial-page">
        <div className="editorial-panel" style={{ textAlign: 'center', paddingBlock: '4rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Sign in to access admin</h1>
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
        <h1 className="screen-header-title" style={{ marginBottom: '0.25rem' }}>
          Admin
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Questions, companies, and user roles in one place.
        </p>

        <div
          role="tablist"
          aria-label="Admin sections"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
            paddingBottom: '0.75rem',
          }}
        >
          {([
            { id: 'questions' as const, label: 'Questions' },
            { id: 'companies' as const, label: 'Companies' },
            { id: 'users' as const, label: 'Users' },
          ]).map(({ id, label }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? 'nav-tab active' : 'nav-tab'}
                style={{
                  border: 'none',
                  background: active ? 'var(--surface-elevated, rgba(255,255,255,0.06))' : 'transparent',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                }}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div role="tabpanel">
          {tab === 'questions' && <QuestionsAdminPanel />}
          {tab === 'companies' && <CompaniesAdminPanel />}
          {tab === 'users' && <UsersAdminPanel />}
        </div>
      </div>
    </div>
  )
}
