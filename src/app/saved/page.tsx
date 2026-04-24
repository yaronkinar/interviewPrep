'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Bookmark } from 'lucide-react'
import Link from 'next/link'
import { useSavedQuestions } from '@/hooks/useSavedQuestions'
import { QUESTIONS, type Question } from '@/questions/data'
import { PATH_FOR_PAGE } from '@/routes'

export default function SavedPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { saved, loading } = useSavedQuestions()
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([])

  useEffect(() => {
    const ids = new Set(saved.map(s => s.questionId))
    setSavedQuestions(QUESTIONS.filter(q => ids.has(q.id)))
  }, [saved])

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <div className="editorial-page">
        <div className="editorial-panel" style={{ textAlign: 'center', paddingBlock: '4rem' }}>
          <Bookmark size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Sign in to view saved questions</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your bookmarked questions will appear here after you sign in.
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
          Saved Questions
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {savedQuestions.length} bookmarked question{savedQuestions.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        ) : savedQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', paddingBlock: '3rem' }}>
            <Bookmark size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)' }}>
              No saved questions yet. Click the bookmark icon on any question to save it here.
            </p>
            <Link href={PATH_FOR_PAGE.questions} className="home-card-link" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Browse questions →
            </Link>
          </div>
        ) : (
          <div className="questions-stitch-list">
            {savedQuestions.map(q => (
              <article key={q.id} className="q-card q-card--editorial">
                <div className="q-stitch-card-head">
                  <div className="q-stitch-card-head-main">
                    <div className="q-editorial-badges">
                      <span className="q-editorial-badge q-editorial-badge--category">{q.category}</span>
                      <span className={`q-editorial-badge q-editorial-badge--difficulty q-editorial-badge--difficulty-${q.difficulty}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <h3 className="q-title q-title--stitch">{q.title}</h3>
                  </div>
                </div>
                <p className="q-desc q-desc--stitch">{q.description}</p>
                <div style={{ marginTop: '0.75rem' }}>
                  <Link href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent(q.title)}`} className="home-card-link">
                    View question →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
