import { Suspense } from 'react'
import QuestionsPage from '@/questions/QuestionsPage'
import QuestionIndex from './QuestionIndex'
import { buildMetadata } from '@/lib/seo'

/** Matches the per-question pages so the index and the pages refresh together. */
export const revalidate = 3600

export const metadata = buildMetadata({
  title: 'Company Interview Questions — Google, Meta, Amazon & More',
  description:
    'Browse real technical interview questions asked at Google, Meta, Amazon, Apple, Netflix, Stripe, Uber and more, with worked answers and code examples.',
  path: '/questions',
})

export default function Page() {
  return (
    <>
      <Suspense>
        <QuestionsPage />
      </Suspense>
      <QuestionIndex />
    </>
  )
}
