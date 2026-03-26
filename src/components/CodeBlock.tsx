import { useState, useMemo } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

interface CodeBlockProps {
  code: string
  language?: string
  children?: React.ReactNode
}

export function CodeBlock({ code, language = 'javascript', children }: CodeBlockProps) {
  const html = useMemo(() => {
    const lang = Prism.languages[language] ?? Prism.languages.javascript
    return Prism.highlight(code.trim(), lang, language)
  }, [code, language])

  return (
    <div className="code-block">
      <pre dangerouslySetInnerHTML={{ __html: html }} />
      {children}
    </div>
  )
}

interface CollapsibleProps {
  label: string
  code: string
  language?: string
  children?: React.ReactNode
}

export function CollapsibleCode({ label, code, language, children }: CollapsibleProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="code-toggle" onClick={() => setOpen(o => !o)}>
        📄 {open ? 'Hide' : 'Show'} {label}
      </button>
      {open && <CodeBlock code={code} language={language}>{children}</CodeBlock>}
    </>
  )
}

interface ExplanationProps {
  steps: Array<{ text: React.ReactNode }>
}

export function Explanation({ steps }: ExplanationProps) {
  return (
    <div className="explanation">
      <div className="explanation-title">// how it works</div>
      {steps.map((s, i) => (
        <div key={i} className="step">
          <span className="step-num">{i + 1}</span>
          <span>{s.text}</span>
        </div>
      ))}
    </div>
  )
}
