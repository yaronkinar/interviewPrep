import { useCallback, useMemo, useState } from 'react'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { extractReactCodeFromMarkdown } from './extractReactCodeFromMarkdown'
import { DEFAULT_REACT_PREVIEW_SNIPPET } from './defaultCodeSnippets'
import { makeReactSandpackFiles, toUserPreviewModule } from './reactSandpackFiles'

function SandpackToolbar({
  pasteRaw,
  setPasteRaw,
  compileError,
  setCompileError,
  onReset,
}: {
  pasteRaw: string
  setPasteRaw: (v: string) => void
  compileError: string | null
  setCompileError: (v: string | null) => void
  onReset: () => void
}) {
  const { sandpack } = useSandpack()

  const loadFromPaste = useCallback(() => {
    if (!pasteRaw.trim()) {
      setCompileError('Paste text that contains the code into the box above first.')
      return
    }
    const extracted = extractReactCodeFromMarkdown(pasteRaw)
    if (!extracted) {
      setCompileError(
        'Could not parse code from that text. Paste the component directly into UserPreview.tsx, or paste the full message into the box above and try again.',
      )
      return
    }
    sandpack.updateFile('/UserPreview.tsx', toUserPreviewModule(extracted))
    setCompileError(null)
    void sandpack.runSandpack()
  }, [pasteRaw, sandpack, setCompileError])

  return (
    <>
      <label className="q-react-preview-paste-label">
        Paste markdown or a Claude reply (to extract fenced or plain TSX)
        <textarea
          className="q-react-preview-paste"
          rows={3}
          spellCheck={false}
          placeholder="Paste the full assistant message here, then click Extract…"
          value={pasteRaw}
          onChange={(e) => setPasteRaw(e.target.value)}
        />
      </label>
      <div className="q-react-preview-toolbar">
        <button type="button" className="secondary" onClick={loadFromPaste} disabled={!pasteRaw.trim()}>
          Extract from pasted text
        </button>
        <button type="button" className="secondary" onClick={onReset}>
          Reset to sample
        </button>
      </div>
      {compileError && <div className="q-react-preview-error">{compileError}</div>}
    </>
  )
}

export default function ChatReactPreviewSandpack() {
  const [pasteRaw, setPasteRaw] = useState('')
  const [compileError, setCompileError] = useState<string | null>(null)
  const [providerKey, setProviderKey] = useState(0)

  const files = useMemo(
    () => makeReactSandpackFiles(DEFAULT_REACT_PREVIEW_SNIPPET),
    [providerKey],
  )

  const reset = useCallback(() => {
    setPasteRaw('')
    setCompileError(null)
    setProviderKey(k => k + 1)
  }, [])

  return (
    <div className="q-react-preview q-react-preview--page q-react-preview-sandpack">
      <SandpackProvider
        key={providerKey}
        template="react-ts"
        theme="dark"
        files={files}
        options={{
          activeFile: '/UserPreview.tsx',
          visibleFiles: ['/UserPreview.tsx'],
          autorun: true,
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 400,
          initMode: 'lazy',
        }}
      >
        <div className="q-react-preview-panel q-react-preview-panel--page">
          <p className="q-react-preview-hint">
            Edit <code>UserPreview.tsx</code>. React hooks are imported from <code>react</code> at the top of that file.
            Export <code>App</code>, <code>Preview</code>, or <code>Demo</code> (or use <code>function App</code> — it is
            upgraded automatically). Extract from pasted text strips <code>import</code> lines like the legacy sandbox.
            Preview updates as you type.
          </p>
          <SandpackToolbar
            pasteRaw={pasteRaw}
            setPasteRaw={setPasteRaw}
            compileError={compileError}
            setCompileError={setCompileError}
            onReset={reset}
          />
          <SandpackLayout>
            <SandpackCodeEditor
              showTabs={false}
              showLineNumbers
              style={{ height: 'min(48vh, 420px)', minHeight: 280 }}
            />
            <SandpackPreview showNavigator={false} showRefreshButton={false} style={{ minHeight: 280 }} />
          </SandpackLayout>
        </div>
      </SandpackProvider>
    </div>
  )
}
