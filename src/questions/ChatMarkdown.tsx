import type { Components } from 'react-markdown'
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

const PREVIEW_LANG_CLASS = new Set([
  'language-tsx',
  'language-jsx',
  'language-typescript',
  'language-ts',
])

function markdownCodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(markdownCodeText).join('')
  if (isValidElement(node)) return markdownCodeText((node.props as { children?: ReactNode }).children)
  return ''
}

function jsBlockLooksReactish(code: string): boolean {
  const c = code.trim()
  if (!c) return false
  return (
    /<\/?[A-Za-z]/.test(c) ||
    /\b(useState|useEffect|useMemo|useCallback|useRef|useId)\b/.test(c) ||
    /\b(createElement|Fragment)\b/.test(c)
  )
}

function preChildrenCodeInfo(children: ReactNode): { langClass: string; raw: string } | null {
  const arr = Children.toArray(children)
  const codeEl = arr.find((ch) => isValidElement(ch) && ch.type === 'code')
  if (!codeEl || !isValidElement(codeEl)) return null
  const { className, children: inner } = codeEl.props as { className?: string; children?: ReactNode }
  const langClass = (className ?? '').trim()
  const raw = markdownCodeText(inner).replace(/\n$/, '')
  return { langClass, raw }
}

function canOfferInlinePreview(langClass: string, raw: string): boolean {
  if (PREVIEW_LANG_CLASS.has(langClass)) return true
  if (langClass === 'language-javascript' && jsBlockLooksReactish(raw)) return true
  return false
}

function ChatMarkdownPre({ children }: { children?: ReactNode }) {
  const info = preChildrenCodeInfo(children)
  const previewable = info && canOfferInlinePreview(info.langClass, info.raw)

  const frameTitle = useId()
  const blobUrlRef = useRef<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [building, setBuilding] = useState(false)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [compileError, setCompileError] = useState<string | null>(null)

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  useEffect(() => () => revokeBlob(), [revokeBlob])

  const runPreview = useCallback(async () => {
    if (!info?.raw.trim()) return
    revokeBlob()
    setCompileError(null)
    setIframeSrc(null)
    setBuilding(true)
    try {
      const { compileAndBuildPreviewHtml, objectUrlFromHtml } = await import('./compileReactPreview')
      const result = await compileAndBuildPreviewHtml(info.raw)
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
  }, [info, revokeBlob])

  const togglePreview = useCallback(() => {
    if (showPreview) {
      setShowPreview(false)
      revokeBlob()
      setIframeSrc(null)
      setCompileError(null)
      return
    }
    setShowPreview(true)
    void runPreview()
  }, [revokeBlob, runPreview, showPreview])

  const copyCode = useCallback(() => {
    if (!info?.raw || !navigator.clipboard?.writeText) return
    void navigator.clipboard.writeText(info.raw)
  }, [info])

  if (!previewable) {
    return <pre className="q-chat-md-pre">{children}</pre>
  }

  return (
    <div className="q-chat-md-pre-wrap">
      <div className="q-chat-md-pre-toolbar">
        <button
          type="button"
          className="secondary q-chat-md-pre-tool"
          onClick={() => void togglePreview()}
          disabled={building}
          title="Runs in an isolated iframe (React UMD). The snippet needs a root named App, Preview, or Demo."
        >
          {building ? 'Building…' : showPreview ? 'Hide preview' : 'Browser preview'}
        </button>
        <button type="button" className="secondary q-chat-md-pre-tool" onClick={() => void copyCode()}>
          Copy code
        </button>
      </div>
      <pre className="q-chat-md-pre">{children}</pre>
      {showPreview && compileError && <div className="q-chat-md-pre-preview-error">{compileError}</div>}
      {showPreview && iframeSrc && (
        <div className="q-chat-md-pre-preview-frame-wrap">
          <iframe
            title={`React preview ${frameTitle}`}
            className="q-chat-md-pre-preview-frame"
            src={iframeSrc}
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  )
}

const components: Components = {
  pre({ children }) {
    return <ChatMarkdownPre>{children}</ChatMarkdownPre>
  },
  code({ className, children, ...props }) {
    const inline = !className
    if (inline) {
      return (
        <code className="q-chat-md-code-inline" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  a({ href, children, ...props }) {
    return (
      <a className="q-chat-md-a" href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  },
}

export interface ChatMarkdownProps {
  content: string
  className?: string
}

/** Renders assistant (or user) chat text as GitHub-flavored Markdown, sanitized for XSS. */
export default function ChatMarkdown({ content, className }: ChatMarkdownProps) {
  if (!content.trim()) return null
  return (
    <div className={className ?? 'q-chat-md'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
