'use client'
import dynamic from 'next/dynamic'

const AngularHubPage = dynamic(() => import('@/angular/index'), { ssr: false })

export default AngularHubPage
