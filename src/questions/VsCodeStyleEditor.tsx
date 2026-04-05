import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'
import type { Question } from './data'
import { buildQuestionAmbientTypes, questionTsxFileName } from './mockCodeStarter'
import { configureMonacoInterviewTypeScript } from './monacoTsxInterview'

const beforeMount: BeforeMount = (monaco) => {
  configureMonacoInterviewTypeScript(monaco)
}

export interface VsCodeStyleEditorProps {
  value: string
  onChange: (value: string) => void
  /** Height of the editor area (number = px, or any CSS length for the wrapper) */
  height?: string | number
  /** Tab label (e.g. debounce.tsx) */
  fileLabel?: string
  /** Window title in the fake title bar */
  windowTitle?: string
  readOnly?: boolean
  /**
   * Full virtual path for the TypeScript worker (must end with .tsx for TSX / JSX IntelliSense).
   * If omitted, derived from `question` or `fileLabel`.
   */
  modelPath?: string
  /** Adds typed `INTERVIEW_PROBLEM` ambient lib for this card. */
  question?: Question | null
}

function resolveModelPath(
  modelPath: string | undefined,
  question: Question | null | undefined,
  fileLabel: string,
): string {
  if (modelPath?.trim()) {
    return modelPath.startsWith('file:///') ? modelPath : `file:///${modelPath.replace(/^\//, '')}`
  }
  if (question) {
    return `file:///interview/${questionTsxFileName(question)}`
  }
  const name = fileLabel.includes('.') ? fileLabel : `${fileLabel}.tsx`
  return `file:///interview/${name.replace(/^\//, '')}`
}

export default function VsCodeStyleEditor({
  value,
  onChange,
  height = 320,
  fileLabel = 'Solution.tsx',
  windowTitle = 'Interview Prep',
  readOnly = false,
  modelPath,
  question = null,
}: VsCodeStyleEditorProps) {
  const surfaceHeight = typeof height === 'number' ? `${height}px` : height
  const resolvedPath = resolveModelPath(modelPath, question, fileLabel)
  const tabLabel = question
    ? questionTsxFileName(question)
    : fileLabel.endsWith('.tsx')
      ? fileLabel
      : `${fileLabel.replace(/\.ts$/i, '')}.tsx`
  const isTsx = resolvedPath.endsWith('.tsx') || tabLabel.endsWith('.tsx')

  const ambientDisposableRef = useRef<{ dispose: () => void } | null>(null)
  const [narrowViewport, setNarrowViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const sync = () => setNarrowViewport(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const onMount: OnMount = (_editor, monaco) => {
    ambientDisposableRef.current?.dispose()
    ambientDisposableRef.current = null
    if (question) {
      const key = question.id.replace(/[^a-zA-Z0-9_-]/g, '_') || 'q'
      ambientDisposableRef.current = monaco.languages.typescript.typescriptDefaults.addExtraLib(
        buildQuestionAmbientTypes(question),
        `file:///interview/__ambient_${key}.d.ts`,
      )
    }
  }

  useEffect(
    () => () => {
      ambientDisposableRef.current?.dispose()
      ambientDisposableRef.current = null
    },
    [],
  )

  return (
    <div className="vscode-chrome">
      <div className="vscode-titlebar">
        <span className="vscode-traffic" aria-hidden>
          <span className="vscode-dot vscode-dot--r" />
          <span className="vscode-dot vscode-dot--y" />
          <span className="vscode-dot vscode-dot--g" />
        </span>
        <span className="vscode-titlebar-title">{windowTitle}</span>
      </div>
      <div className="vscode-tabrow">
        <div className="vscode-tab vscode-tab--active">
          <span className="vscode-tab-icon" aria-hidden>
            {isTsx ? 'TSX' : 'TS'}
          </span>
          <span className="vscode-tab-name">{tabLabel}</span>
        </div>
      </div>
      <div className="vscode-editor-surface" style={{ height: surfaceHeight }}>
        <Editor
          key={`${resolvedPath + (question?.id ?? '')}-${narrowViewport ? 'm' : 'd'}`}
          height="100%"
          theme="vs-dark"
          path={resolvedPath}
          defaultLanguage="typescript"
          value={value}
          onChange={(v) => onChange(v ?? '')}
          beforeMount={beforeMount}
          onMount={onMount}
          options={{
            readOnly,
            /** Suggest widget escapes parents with `overflow: hidden` (e.g. `.vscode-chrome`). */
            fixedOverflowWidgets: true,
            minimap: { enabled: !narrowViewport, scale: 0.85 },
            fontSize: narrowViewport ? 12 : 13,
            lineHeight: 20,
            fontFamily: '"Cascadia Code", "Segoe UI Mono", "Consolas", monospace',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 8, bottom: 8 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
            /** `comments: false` leaves an open-but-empty suggest box while typing in JSDoc / block comments. */
            quickSuggestions: { other: true, comments: true, strings: true },
            quickSuggestionsDelay: 50,
            wordBasedSuggestions: 'all',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            snippetSuggestions: 'top',
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
              showClasses: true,
              showVariables: true,
              showFields: true,
            },
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>
    </div>
  )
}
