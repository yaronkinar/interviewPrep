'use client'
import dynamic from 'next/dynamic'
const CvThemeGeneratorPage = dynamic(() => import('@/questions/CvThemeGeneratorPage'), { ssr: false })
export default CvThemeGeneratorPage
