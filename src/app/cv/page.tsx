'use client'
import dynamic from 'next/dynamic'
const CvAnalysisPage = dynamic(() => import('@/questions/CvAnalysisPage'), { ssr: false })
export default CvAnalysisPage
