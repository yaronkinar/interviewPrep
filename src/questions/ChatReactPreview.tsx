import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { extractReactCodeFromMarkdown } from './extractReactCodeFromMarkdown'
import { DEFAULT_REACT_PREVIEW_SNIPPET } from './defaultCodeSnippets'

const VsCodeStyleEditor = lazy(() => import('./VsCodeStyleEditor'))

export default function ChatReactPreview() {
  const [code, setCode] = useState(DEFAULT_REACT_PREVIEW_SNIPPET)
  const [pasteRaw, setPasteRaw] = useState('')
  const [compileError, setCompileError] = useState<string | null>(null)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [building, setBuilding] = useState(false)
  const blobUrlRef = useRef<string | null>(null)

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  useEffect(() => () => revokeBlob(), [revokeBlob])

  const runPreview = useCallback(async () => {
    revokeBlob()
    setCompileError(null)
    setIframeSrc(null)
    setBuilding(true)
    try {
      const { compileAndBuildPreviewHtml, objectUrlFromHtml } = await import('./compileReactPreview')
      const result = await compileAndBuildPreviewHtml(code)
      if ('error' in result) {
        setCompileError(result.error)
        return
      }
      const url = objectUrlFromHtml(result.html)
      blobUrlRef.current = url
      setIframeSrc(url)
    } finally {
      setBuilding(false)
    }
  }, [code, revokeBlob])

  function tryExtractFrom(source: string, emptyMsg: string) {
    if (!source.trim()) {
      setCompileError(emptyMsg)
      return
    }
    const extracted = extractReactCodeFromMarkdown(source)
    if (extracted) {
      setCode(extracted)
      setCompileError(null)
    } else {
      setCompileError(
        'Could not parse code from that text. Paste the component directly into the editor below, or paste the full message into the box above and try again.',
      )
    }
  }

  function loadFromPaste() {
    tryExtractFrom(pasteRaw, 'Paste text that contains the code into the box above first.')
  }

  return (
    <div className="q-react-preview q-react-preview--page">
      <div className="q-react-preview-panel q-react-preview-panel--page">
        <p className="q-react-preview-hint">
          Strips <code>import</code> lines; hooks (<code>useState</code>, etc.) are injected for you. Root component must
          be named <code>App</code>, <code>Preview</code>, or <code>Demo</code>. No npm imports in the iframe.
        </p>
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
          <button type="button" className="secondary" onClick={() => void runPreview()} disabled={building || !code.trim()}>
            {building ? 'Building…' : 'Update preview'}
          </button>
        </div>
        <Suspense
          fallback={
            <div className="vscode-chrome vscode-chrome--loading" aria-busy>
              Loading editor…
            </div>
          }
        >
          <VsCodeStyleEditor
            value={code}
            onChange={setCode}
            height="min(48vh, 420px)"
            fileLabel="Preview.tsx"
            windowTitle="React sandbox"
          />
        </Suspense>
        {compileError && <div className="q-react-preview-error">{compileError}</div>}
        {iframeSrc && (
          <div className="q-react-preview-frame-wrap">
            <iframe title="React preview" className="q-react-preview-frame" src={iframeSrc} sandbox="allow-scripts" />
          </div>
        )}
      </div>
    </div>
  )
}
