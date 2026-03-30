import type { ReactNode } from 'react'

type FilterRowProps = {
  label: string
  children: ReactNode
  className?: string
}

export default function FilterRow({ label, children, className = '' }: FilterRowProps) {
  return (
    <div className={`q-filter-row ${className}`.trim()}>
      <span className="q-filter-label">{label}</span>
      <div className="q-filter-chips">{children}</div>
    </div>
  )
}
