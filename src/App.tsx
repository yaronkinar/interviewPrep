import { useEffect, useState } from 'react'
import { trackEvent, trackPageView } from './analytics'
import Nav from './Nav'
import JsPage from './js/index'
import ReactPage from './react/index'
import QuestionsPage from './questions/QuestionsPage'

export type Page = 'js' | 'react' | 'questions'

const PAGE_TITLES: Record<Page, string> = {
  js: 'JS Patterns',
  react: 'React Questions',
  questions: 'Company Q&A',
}

export default function App() {
  const [page, setPage] = useState<Page>('js')

  useEffect(() => {
    const path = `/${page}`
    trackPageView(path, `${PAGE_TITLES[page]} · Interview Prep`)
  }, [page])

  return (
    <>
      <Nav
        page={page}
        setPage={p => {
          setPage(p)
          trackEvent('tab_change', { tab: p })
        }}
      />
      <main className="main">
        {page === 'js'        && <JsPage />}
        {page === 'react'     && <ReactPage />}
        {page === 'questions' && <QuestionsPage />}
      </main>
    </>
  )
}
