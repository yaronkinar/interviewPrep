'use client'

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackFiles,
  type SandpackPredefinedTemplate,
} from '@codesandbox/sandpack-react'
import { useJsSandboxUseSandpack } from '@/hooks/useJsSandboxUseSandpack'
import FrameworkLessonMonacoFallback from './FrameworkLessonMonacoFallback'

type FrameworkSandpackCardProps = {
  template: SandpackPredefinedTemplate
  title: string
  description: string
  files?: SandpackFiles
  visibleFiles: string[]
  activeFile: string
  editorMinHeight?: number
  /** Shown when Sandpack is disabled via Admin — same toggle as `/js` + `/sandbox`. */
  fallbackCode: string
  /** Monaco language id for the fallback editor. */
  fallbackLanguage: string
}

/**
 * Embedded Sandpack for framework lesson pages, gated by `jsSandboxUseSandpack` like `/js` Sandbox.tsx.
 */
export default function FrameworkSandpackCard({
  template,
  title,
  description,
  files,
  visibleFiles,
  activeFile,
  editorMinHeight = 260,
  fallbackCode,
  fallbackLanguage,
}: FrameworkSandpackCardProps) {
  const useSandpack = useJsSandboxUseSandpack()

  if (useSandpack === null) {
    return (
      <div
        className="card sandbox-wrap framework-sandpack-card framework-sandpack-card--loading"
        style={{ marginTop: 0, minHeight: '14rem', opacity: 0.65 }}
        aria-busy="true"
        aria-label="Loading sandbox options"
      />
    )
  }

  if (!useSandpack) {
    return (
      <FrameworkLessonMonacoFallback
        title={title}
        description={description}
        code={fallbackCode}
        language={fallbackLanguage}
        editorMinHeight={editorMinHeight}
      />
    )
  }

  return (
    <div className="card sandbox-wrap sandbox-sandpack framework-sandpack-card" style={{ marginTop: 0 }}>
      <SandpackProvider
        template={template}
        theme="dark"
        {...(files ? { files } : {})}
        options={{
          visibleFiles,
          activeFile,
          autorun: true,
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 450,
          initMode: 'lazy',
        }}
      >
        <div className="sandbox-header">
          <div className="sandbox-header-left">
            <span className="card-title">{title}</span>
          </div>
        </div>
        <p className="card-desc">{description}</p>
        <div className="sandbox-body sandbox-body--sandpack">
          <SandpackLayout>
            <SandpackCodeEditor showLineNumbers style={{ height: editorMinHeight, minWidth: 0 }} showTabs />
            <SandpackPreview showNavigator={false} showRefreshButton={false} style={{ minHeight: 200 }} />
          </SandpackLayout>
        </div>
      </SandpackProvider>
    </div>
  )
}
