'use client'
import dynamic from 'next/dynamic'
const ReactPage = dynamic(() => import('@/react/index'), { ssr: false })
export default ReactPage
