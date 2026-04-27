import { Suspense } from 'react'
import AdminDashboard from './AdminDashboard'

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
