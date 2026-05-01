'use client'

import { useAuth, useClerk } from '@clerk/nextjs'
import { useCallback } from 'react'

/**
 * If the user is signed in, returns true.
 * Otherwise opens the Clerk sign-in modal (same behavior as {@link SignInButton} mode="modal") and returns false.
 */
export function useRequireSignIn() {
  const { isSignedIn, isLoaded } = useAuth()
  const { openSignIn } = useClerk()

  const requireSignIn = useCallback((): boolean => {
    if (!isLoaded) return false
    if (isSignedIn) return true
    const url = typeof window !== 'undefined' ? window.location.href : '/'
    openSignIn({ fallbackRedirectUrl: url })
    return false
  }, [isLoaded, isSignedIn, openSignIn])

  return { requireSignIn, isSignedIn, isLoaded }
}
