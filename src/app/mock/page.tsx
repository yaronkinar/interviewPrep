import MockInterviewPage from '@/questions/MockInterviewPage'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'AI Mock Interview Practice',
  description:
    'Run a realistic mock technical interview in your browser: live coding, spoken questions and instant feedback from an AI interviewer.',
  path: '/mock',
})

export default function Page() {
  return <MockInterviewPage />
}
