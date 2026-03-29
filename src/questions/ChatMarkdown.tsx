import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

const components: Components = {
  pre({ children }) {
    return <pre className="q-chat-md-pre">{children}</pre>
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
