import type { ReactNode } from 'react'

type ContentSectionProps = {
  children: ReactNode
  className?: string
}

export default function ContentSection({ children, className = '' }: ContentSectionProps) {
  return <section className={`content-section ${className}`.trim()}>{children}</section>
}
