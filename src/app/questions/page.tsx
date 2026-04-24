'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const QuestionsPage = dynamic(() => import('@/questions/QuestionsPage'), { ssr: false })

export default function Page() {
  return (
    <Suspense>
      <QuestionsPage />
    </Suspense>
  )
}
