'use client'
import dynamic from 'next/dynamic'

const VueHubPage = dynamic(() => import('@/vue/index'), { ssr: false })

export default VueHubPage
