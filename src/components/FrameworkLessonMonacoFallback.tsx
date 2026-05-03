'use client'

import Editor from '@monaco-editor/react'
import Link from 'next/link'
import { PATH_FOR_PAGE } from '@/routes'

type FrameworkLessonMonacoFallbackProps = {
  title: string
  description: string
  /** Lesson snippet shown when Sandpack is disabled — editable for copy/paste. */
  code: string
  /** Monaco language id (e.g. `typescript`, `html`, `plaintext`). */
  language: string
  editorMinHeight: number
}

export default function FrameworkLessonMonacoFallback({
  title,
  description,
  code,
  language,
  editorMinHeight,
}: FrameworkLessonMonacoFallbackProps) {
  return (
    <div className="card sandbox-wrap framework-lesson-monaco-fallback" style={{ marginTop: 0 }}>
      <div className="sandbox-header">
        <div className="sandbox-header-left">
          <span className="card-title">{title}</span>
        </div>
      </div>
      <p className="card-desc">{description}</p>
      <p className="card-desc" style={{ fontSize: '0.9rem', marginBottom: '0.75rem', opacity: 0.92 }}>
        Sandpack is off (same setting as <code>/js</code>). Below is the starter snippet — enable{' '}
        <strong>JS lab + React sandbox → Sandpack</strong> in Admin → Settings for live preview here, or use the{' '}
        <Link className="home-card-link" href={PATH_FOR_PAGE.sandbox}>
          React sandbox
        </Link>{' '}
        for runnable experiments.
      </p>
      <div className="sandbox-body" style={{ minHeight: editorMinHeight }}>
        <Editor
          height={`${editorMinHeight}px`}
          language={language}
          defaultValue={code}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            fontSize: 13,
          }}
        />
      </div>
    </div>
  )
}
