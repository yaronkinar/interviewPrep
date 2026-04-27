'use client'

import { useRouter } from 'next/navigation'
import QuestionFinderChat from './QuestionFinderChat'
import type { Question } from './data'

export default function GlobalQuestionFinderChat() {
  const router = useRouter()

  function openQuestionSearch(query: string) {
    const params = new URLSearchParams({ q: query })
    router.push(`/questions?${params.toString()}`)
  }

  function openQuestion(question: Question) {
    const params = new URLSearchParams({ question: question.id })
    router.push(`/questions?${params.toString()}`)
  }

  return (
    <QuestionFinderChat
      variant="floating"
      onApplySearch={openQuestionSearch}
      onOpenQuestion={openQuestion}
    />
  )
}
