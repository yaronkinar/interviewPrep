'use client'
import dynamic from 'next/dynamic'
const JsPage = dynamic(() => import('@/js/index'), { ssr: false })
export default JsPage
