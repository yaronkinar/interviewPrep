'use client'
import dynamic from 'next/dynamic'

const FullStackHubPage = dynamic(() => import('@/fullstack/index'), { ssr: false })

export default function Page() {
  return <FullStackHubPage />
}
