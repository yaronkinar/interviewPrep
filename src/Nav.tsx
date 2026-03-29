import type { Page } from './App'

interface NavProps {
  page: Page
  setPage: (p: Page) => void
}

const TABS: { id: Page; label: string }[] = [
  { id: 'js',        label: 'JS Patterns' },
  { id: 'react',     label: 'React Questions' },
  { id: 'sandbox',   label: 'React sandbox' },
  { id: 'mock',      label: 'Mock interview' },
  { id: 'questions', label: '🏢 Company Q&A' },
]

export default function Nav({ page, setPage }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="nav-logo">Interview Prep</span>
        <div className="nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab${page === tab.id ? ' active' : ''}`}
              onClick={() => setPage(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
