'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/AdminShell'
import { adminFetch } from '@/lib/apiClient'

export default function DashboardPage() {
  return (
    <AdminShell>
      {({ notify }) => <DashboardContent notify={notify} />}
    </AdminShell>
  )
}

function DashboardContent({ notify }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      const data = await adminFetch('/api/admin/users?pageSize=5')
      setStats(data.stats)
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { label: 'Total users', value: stats?.totalUsers ?? 0 },
    { label: 'Active users', value: stats?.activeUsers ?? 0 },
    { label: 'Activated users', value: stats?.activatedUsers ?? 0 },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-[#667085]">A quick pulse on users and activation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-[#d8dee6] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#667085]">{card.label}</p>
            <p className="mt-3 text-3xl font-bold">{loading ? '-' : card.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-[#d8dee6] bg-white shadow-sm">
        <div className="border-b border-[#e4e7ec] px-5 py-4">
          <h2 className="font-semibold">Recent users</h2>
        </div>
        <div className="divide-y divide-[#e4e7ec]">
          {(stats?.recentUsers || []).map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-[#667085]">{user.full_name || 'No name'} · {user.role}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.is_active ? 'bg-[#ecfdf3] text-[#067647]' : 'bg-[#fff4f2] text-[#b42318]'}`}>
                {user.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
          ))}
          {!loading && !(stats?.recentUsers || []).length ? (
            <p className="px-5 py-8 text-center text-sm text-[#667085]">No users yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
