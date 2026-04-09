import { useRef, useState } from 'react'
import Editor, { type BeforeMount } from '@monaco-editor/react'
import { memoize, debounce, throttle } from './utils'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'

type SandboxLine = { text: string; type: 'log' | 'warn' | 'error' | 'info' | 'ret' | 'sep' }

const DEFAULT_CODE = `// Globals available: memoize, debounce, throttle
// Ctrl+Enter to run

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1)
}

for (let i = 1; i <= 8; i++) {
  console.log(\`\${i}! = \${factorial(i)}\`)
}

const memoFact = memoize(factorial)
console.log('memoFact(10):', memoFact(10))
console.log('memoFact(10) again:', memoFact(10))
`

const beforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('interviews-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword',           foreground: 'c792ea', fontStyle: 'bold' },
      { token: 'string',            foreground: 'c3e88d' },
      { token: 'number',            foreground: 'f78c6c' },
      { token: 'comment',           foreground: '546e7a', fontStyle: 'italic' },
      { token: 'type',              foreground: '82aaff' },
      { token: 'delimiter.bracket', foreground: 'c792ea' },
    ],
    colors: {
      'editor.background':                  '#0a0c12',
      'editor.foreground':                  '#e2e8f0',
      'editor.lineHighlightBackground':     '#1e2130',
      'editor.selectionBackground':         '#2d3148aa',
      'editorLineNumber.foreground':        '#2d3148',
      'editorLineNumber.activeForeground':  '#64748b',
      'editorCursor.foreground':            '#818cf8',
      'editorWidget.background':            '#1e2130',
      'editorWidget.border':                '#2d3148',
      'editorSuggestWidget.background':     '#1e2130',
      'editorSuggestWidget.border':         '#2d3148',
      'editorSuggestWidget.selectedBackground': '#2d3148',
      'editorSuggestWidget.highlightForeground': '#818cf8',
      'editorHoverWidget.background':       '#1e2130',
      'editorHoverWidget.border':           '#2d3148',
      'focusBorder':                        '#818cf8',
      'scrollbarSlider.background':         '#2d314880',
    },
  })

  monaco.languages.typescript.javascriptDefaults.addExtraLib(`
    /** Memoizes fn — caches results keyed by JSON-serialized args. */
    declare function memoize<T extends (...args: any[]) => any>(fn: T, maxSize?: number): T;
    /** Debounces fn — delays invocation until delay ms have passed since the last call. */
    declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T;
    /** Throttles fn — at most one call per delay ms window (leading + trailing). */
    declare function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T;
  `, 'globals.d.ts')

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
  })
}

function fmt(a: unknown): string {
  if (a === null) return 'null'
  if (a === undefined) return 'undefined'
  if (typeof a === 'object') { try { return JSON.stringify(a, null, 2) } catch { return String(a) } }
  return String(a)
}

// Wrap the memoize so it exposes a plain function for the sandbox
function sandboxMemoize(fn: (...args: unknown[]) => unknown, maxSize?: number) {
  const wrapped = memoize(fn, maxSize)
  return (...args: unknown[]) => {
    const result = wrapped(...args) as { value: unknown }
    return result.value
  }
}

export default function Sandbox() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const [output, setOutput] = useState<SandboxLine[]>([])
  const [focused, setFocused] = useState(false)
  const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  function addLine(text: string, type: SandboxLine['type']) {
    setOutput(prev => [...prev, { text, type }])
    setTimeout(() => {
      if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
    }, 0)
  }

  function run() {
    const code = editorRef.current?.getValue() ?? ''
    setOutput(prev => prev.length ? [...prev, { text: '', type: 'sep' }] : prev)

    const _log = console.log, _warn = console.warn, _error = console.error, _info = console.info
    console.log   = (...a) => { _log(...a);   addLine(a.map(fmt).join(' '), 'log') }
    console.warn  = (...a) => { _warn(...a);  addLine(a.map(fmt).join(' '), 'warn') }
    console.error = (...a) => { _error(...a); addLine(a.map(fmt).join(' '), 'error') }
    console.info  = (...a) => { _info(...a);  addLine(a.map(fmt).join(' '), 'info') }

    try {
      const fn = new Function('memoize', 'debounce', 'throttle', code)
      const ret = fn(sandboxMemoize, debounce, throttle)
      if (ret !== undefined) addLine(`↩ ${fmt(ret)}`, 'ret')
    } catch (e) {
      const err = e as Error
      addLine(`${err.name}: ${err.message}`, 'error')
    } finally {
      console.log = _log; console.warn = _warn; console.error = _error; console.info = _info
    }
  }

  return (
    <div className="card sandbox-wrap" style={{ marginTop: 0 }}>
      <div className="sandbox-header">
        <div className="sandbox-header-left">
          <span className="card-title">{ui.js.sandbox.title}</span>
          <span className="sandbox-hint">{ui.js.sandbox.hint}</span>
        </div>
        <div className="sandbox-actions">
          <button onClick={run}>▶ {ui.js.sandbox.runButton}</button>
          <button className="secondary" onClick={() => setOutput([])}>{ui.js.sandbox.clearOutput}</button>
          <button className="secondary" onClick={() => { editorRef.current?.setValue(DEFAULT_CODE); setOutput([]) }}>{ui.js.sandbox.reset}</button>
        </div>
      </div>
      <p className="card-desc">
        {ui.js.sandbox.description}
      </p>

      <div className="sandbox-body">
        <div className={`sandbox-editor${focused ? ' focused' : ''}`}>
          <Editor
            defaultValue={DEFAULT_CODE}
            language="javascript"
            theme="interviews-dark"
            beforeMount={beforeMount}
            onMount={(editor) => {
              editorRef.current = editor
              const monacoGlobal = (window as { monaco?: { KeyMod: { CtrlCmd: number }; KeyCode: { Enter: number } } }).monaco
              const keybinding = monacoGlobal
                ? monacoGlobal.KeyMod.CtrlCmd | monacoGlobal.KeyCode.Enter
                : 2097
              editor.addCommand(keybinding, run)
              editor.onDidFocusEditorWidget(() => setFocused(true))
              editor.onDidBlurEditorWidget(() => setFocused(false))
            }}
            options={{
              fontSize: 13,
              fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              overviewRulerLanes: 0,
              scrollbar: { verticalScrollbarSize: 6 },
              quickSuggestions: { other: true, comments: false, strings: false },
              parameterHints: { enabled: true },
            }}
          />
        </div>

        <div ref={outputRef} className="sandbox-output">
          <div className="sandbox-output-label">{ui.js.sandbox.outputLabel}</div>
          {output.map((line, i) =>
            <div key={i} className={`sandbox-line ${line.type}`}>{line.text}</div>
          )}
        </div>
      </div>

    </div>
  )
}
