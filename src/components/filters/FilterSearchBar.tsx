import type { ReactNode } from 'react'

type FilterSearchBarProps = {
  placeholder: string
  value: string
  onChange: (value: string) => void
  showClear: boolean
  onClear: () => void
  clearLabel: string
  className?: string
  rightSlot?: ReactNode
}

export default function FilterSearchBar({
  placeholder,
  value,
  onChange,
  showClear,
  onClear,
  clearLabel,
  className = '',
  rightSlot,
}: FilterSearchBarProps) {
  return (
    <div className={`q-search-wrap ${className}`.trim()}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="q-search"
      />
      {showClear && (
        <button className="secondary" onClick={onClear}>
          ✕ {clearLabel}
        </button>
      )}
      {rightSlot}
    </div>
  )
}
