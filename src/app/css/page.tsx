'use client'
import dynamic from 'next/dynamic'
const CssPage = dynamic(() => import('@/css/index'), { ssr: false })
export default CssPage
