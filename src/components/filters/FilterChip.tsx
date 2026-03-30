import type { CSSProperties, ReactNode } from 'react'

type FilterChipProps = {
  active?: boolean
  onClick: () => void
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function FilterChip({
  active = false,
  onClick,
  children,
  style,
  className = '',
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={`q-chip${active ? ' active' : ''} ${className}`.trim()}
      style={style}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
