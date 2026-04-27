'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

type AdminUser = {
  id: string
  primaryEmail: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
  isAdmin: boolean
}

type AdminUsersResponse = {
  users: AdminUser[]
  totalCount: number
  limit: number
  offset: number
}

export function UsersAdminPanel() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        if (response.status === 403) {
          setError('You do not have permission to access this page.')
          setUsers([])
          return
        }
        throw new Error('Failed to fetch users')
      }

      const data = (await response.json()) as AdminUsersResponse
      setUsers(data.users)
    } catch {
      setError('Something went wrong while loading users.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    loadUsers()
  }, [isLoaded, isSignedIn, loadUsers])

  const toggleAdmin = useCallback(
    async (targetUserId: string, isAdmin: boolean) => {
      setUpdatingUserId(targetUserId)
      setError(null)

      try {
        const response = await fetch(`/api/admin/users/${targetUserId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isAdmin }),
        })

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(data?.error ?? 'Failed to update admin status')
        }

        setUsers(prev =>
          prev.map(user => (user.id === targetUserId ? { ...user, isAdmin } : user)),
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update admin status'
        setError(message)
      } finally {
        setUpdatingUserId(null)
      }
    },
    [],
  )

  return (
    <>
      <h2 className="screen-header-title" style={{ marginBottom: '0.25rem' }}>
        Connected users
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Manage admin access for all Clerk users.
      </p>

      {error && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
      ) : users.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
      ) : (
        <div className="questions-stitch-list">
          {users.map(user => {
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'No name'
            const isUpdating = updatingUserId === user.id
            const isSelfDemotion = user.id === userId && user.isAdmin

            return (
              <article key={user.id} className="q-card q-card--editorial">
                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                  <img
                    src={user.imageUrl}
                    alt={fullName}
                    width={40}
                    height={40}
                    style={{ borderRadius: '999px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 className="q-title q-title--stitch" style={{ marginBottom: '0.125rem' }}>
                      {fullName}
                    </h3>
                    <p className="q-desc q-desc--stitch" style={{ marginBottom: '0.25rem' }}>
                      {user.primaryEmail ?? 'No email'}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.id}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="q-editorial-badge q-editorial-badge--category"
                      style={{ marginBottom: '0.5rem', display: 'inline-block' }}
                    >
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                    <div>
                      <button
                        type="button"
                        className="home-card-link"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: isUpdating ? 'wait' : 'pointer',
                          opacity: isUpdating || isSelfDemotion ? 0.6 : 1,
                          pointerEvents: isUpdating ? 'none' : 'auto',
                        }}
                        disabled={isUpdating || isSelfDemotion}
                        onClick={() => toggleAdmin(user.id, !user.isAdmin)}
                      >
                        {user.isAdmin ? 'Remove admin' : 'Make admin'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
