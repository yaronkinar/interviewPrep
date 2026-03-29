import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppBrowserConsole from './components/AppBrowserConsole'
import HomePage from './HomePage'
import { LocaleProvider, useLocale } from './i18n/LocaleContext'
import Nav from './Nav'
import { ThemeProvider } from './theme/ThemeContext'
import JsPage from './js/index'
import ReactPage from './react/index'
import ReactSandboxPage from './ReactSandboxPage'
import MockInterviewPage from './questions/MockInterviewPage'
import QuestionsPage from './questions/QuestionsPage'
import type { Page } from './page'
import { pageFromPathname } from './routes'
import { AUTHOR_LINKEDIN_URL } from './site'

export type { Page }

function AppShell() {
  const location = useLocation()
  const page = pageFromPathname(location.pathname)
  const { strings } = useLocale()

  useEffect(() => {
    if (page === 'home') {
      document.title = strings.home.metaTitle
    } else if (page) {
      document.title = 'Interview Prep'
    }
  }, [page, strings.home.metaTitle])

  return (
    <div className="app-shell">
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/js" element={<JsPage />} />
          <Route path="/react" element={<ReactPage />} />
          <Route path="/sandbox" element={<ReactSandboxPage />} />
          <Route path="/mock" element={<MockInterviewPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p className="site-footer-inner">
          {strings.siteCreditPrefix}
          <a
            className="site-footer-link"
            href={AUTHOR_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {strings.siteCreditName}
          </a>
        </p>
      </footer>
      <Analytics />
      <AppBrowserConsole />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LocaleProvider>
          <AppShell />
        </LocaleProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
