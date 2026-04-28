'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { pathToProgressSection } from '@/lib/progress/pathToProgressSection'
import { postProgressVisit } from '@/lib/progress/postProgressVisit'

/** Records `/api/progress` last-visited timestamps when signed-in users open each training section. */
export default function TrackProgressVisit() {
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()
  const prevSectionRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const section = pathToProgressSection(pathname ?? '')
    if (!section) {
      prevSectionRef.current = null
      return
    }
    if (prevSectionRef.current === section) return
    prevSectionRef.current = section
    postProgressVisit(section).catch(() => {
      prevSectionRef.current = null
    })
  }, [isLoaded, isSignedIn, pathname])

  return null
}
