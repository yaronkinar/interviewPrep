'use client'
import dynamic from 'next/dynamic'

const TypeScriptHubPage = dynamic(() => import('@/typescript/index'), { ssr: false })

export default TypeScriptHubPage
