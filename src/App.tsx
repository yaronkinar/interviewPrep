import { useState } from 'react'
import Nav from './Nav'
import JsPage from './js/index'
import ReactPage from './react/index'
import QuestionsPage from './questions/QuestionsPage'

export type Page = 'js' | 'react' | 'questions'

export default function App() {
  const [page, setPage] = useState<Page>('js')

  return (
    <>
      <Nav page={page} setPage={setPage} />
      <main className="main">
        {page === 'js'        && <JsPage />}
        {page === 'react'     && <ReactPage />}
        {page === 'questions' && <QuestionsPage />}
      </main>
    </>
  )
}
