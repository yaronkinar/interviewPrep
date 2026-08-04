import HomePage from '@/HomePage'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Interview Prep — JavaScript, React & Front-End Interview Practice',
  description:
    'Practice front-end interview questions in the browser: JavaScript patterns, React hooks, TypeScript, Vue, Angular, CSS, company Q&A and AI mock interviews.',
  path: '/',
})

export default function Page() {
  return <HomePage />
}
