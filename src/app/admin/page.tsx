import { Suspense } from 'react'
import AdminDashboard from './AdminDashboard'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Admin',
  description: 'Internal admin dashboard.',
  path: '/admin',
  noIndex: true,
})

function AdminFallback() {
  return (
    <div className="editorial-page">
      <div className="editorial-panel">
        <p style={{ color: 'var(--text-muted)' }}>Loading admin…</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminDashboard />
    </Suspense>
  )
}
