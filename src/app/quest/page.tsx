'use client'
import dynamic from 'next/dynamic'
const QuestPage = dynamic(() => import('@/quest/index'), { ssr: false })
export default QuestPage
