import type { ReactNode, Ref } from 'react'
import { Search } from 'lucide-react'

type FilterSearchBarProps = {
  placeholder: string
  value: string
  onChange: (value: string) => void
  showClear: boolean
  onClear: () => void
  clearLabel: string
  className?: string
  rightSlot?: ReactNode
  /** Leading search icon (Company Q&A mock) */
  showSearchIcon?: boolean
  inputRef?: Ref<HTMLInputElement>
  /** Passed to the input (`search` is appropriate for question/title filters). */
  autoComplete?: string
  /** Overrides `aria-label` on the input (defaults to `placeholder`). */
  ariaLabel?: string
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
  showSearchIcon = false,
  inputRef,
  autoComplete = 'search',
  ariaLabel,
}: FilterSearchBarProps) {
  return (
    <div
      className={`q-search-wrap${showSearchIcon ? ' q-search-wrap--with-icon' : ''}${className ? ` ${className}` : ''}`.trim()}
    >
      {showSearchIcon && (
        <Search className="q-search-icon" size={20} strokeWidth={2} aria-hidden />
      )}
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        enterKeyHint="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-label={ariaLabel ?? placeholder}
        className={`q-search${showSearchIcon ? ' q-search--padded-icon' : ''}`.trim()}
      />
      {showClear && (
        <button type="button" className="secondary" onClick={onClear}>
          ✕ {clearLabel}
        </button>
      )}
      {rightSlot}
    </div>
  )
}
