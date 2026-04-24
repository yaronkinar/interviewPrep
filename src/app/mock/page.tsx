'use client'
import dynamic from 'next/dynamic'
const MockInterviewPage = dynamic(() => import('@/questions/MockInterviewPage'), { ssr: false })
export default MockInterviewPage
