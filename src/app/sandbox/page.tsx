'use client'
import dynamic from 'next/dynamic'
const ReactSandboxPage = dynamic(() => import('@/ReactSandboxPage'), { ssr: false })
export default ReactSandboxPage
