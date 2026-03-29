import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import AppBrowserConsole from './components/AppBrowserConsole'
import Nav from './Nav'
import JsPage from './js/index'
import ReactPage from './react/index'
import ReactSandboxPage from './ReactSandboxPage'
import MockInterviewPage from './questions/MockInterviewPage'
import QuestionsPage from './questions/QuestionsPage'

export type Page = 'js' | 'react' | 'sandbox' | 'mock' | 'questions'

export default function App() {
  const [page, setPage] = useState<Page>('js')

  return (
    <>
      <Nav page={page} setPage={setPage} />
      <main className="main">
        {page === 'js'        && <JsPage />}
        {page === 'react'     && <ReactPage />}
        {page === 'sandbox'   && <ReactSandboxPage />}
        {page === 'mock'      && <MockInterviewPage />}
        {page === 'questions' && <QuestionsPage />}
      </main>
      <Analytics />
      <AppBrowserConsole />
    </>
  )
}
