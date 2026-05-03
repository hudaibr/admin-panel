'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminShell from '@/components/AdminShell'
import ConfirmDialog from '@/components/ConfirmDialog'
import UserTable from '@/components/UserTable'
import { adminFetch } from '@/lib/apiClient'

const emptyForm = {
  email: '',
  password: '',
  full_name: '',
  role: 'user',
  is_active: true,
}

export default function UsersPage() {
  return (
    <AdminShell>
      {({ notify }) => <UsersContent notify={notify} />}
    </AdminShell>
  )
}

function UsersContent({ notify }) {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState({ search: '', status: '', role: '', activated: '' })
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      pageSize: String(pagination.pageSize),
    })

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    return params.toString()
  }, [filters, pagination.page, pagination.pageSize])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadUsers()
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [query])

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await adminFetch(`/api/admin/users?${query}`)
      setUsers(data.users)
      setPagination(data.pagination)
      setSelected([])
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function setFilter(key, value) {
    setPagination((current) => ({ ...current, page: 1 }))
    setFilters((current) => ({ ...current, [key]: value }))
  }

  async function createUser(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm(emptyForm)
      notify('User created')
      await loadUsers()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function setUserStatus(id, isActive) {
    setLoading(true)
    try {
      await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ action: 'set-status', user_id: id, is_active: isActive }),
      })
      notify(isActive ? 'User activated' : 'User suspended')
      await loadUsers()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function requestDelete(ids) {
    setConfirm({
      title: 'Delete user',
      message: `Delete ${ids.length} selected user${ids.length === 1 ? '' : 's'}? This also removes activation codes and auth accounts.`,
      confirmLabel: 'Delete',
      run: () => deleteUsers(ids),
    })
  }

  async function deleteUsers(ids) {
    setLoading(true)
    try {
      await adminFetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ user_ids: ids }),
      })
      notify('User deleted')
      setConfirm(null)
      await loadUsers()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function bulkStatus(isActive) {
    if (!selected.length) {
      notify('Select users first', 'error')
      return
    }

    setLoading(true)
    try {
      await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ action: 'bulk-status', user_ids: selected, is_active: isActive }),
      })
      notify(isActive ? 'Selected users activated' : 'Selected users suspended')
      await loadUsers()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-[#667085]">Search, filter, create, suspend, and delete accounts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium" disabled={loading} onClick={() => bulkStatus(true)} type="button">
            Activate selected
          </button>
          <button className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium" disabled={loading} onClick={() => bulkStatus(false)} type="button">
            Suspend selected
          </button>
          <button className="rounded-md border border-[#f2b8b5] px-3 py-2 text-sm font-medium text-[#b42318]" disabled={loading || !selected.length} onClick={() => requestDelete(selected)} type="button">
            Delete selected
          </button>
        </div>
      </div>

      <form onSubmit={createUser} className="mb-6 grid gap-3 rounded-lg border border-[#d8dee6] bg-white p-4 md:grid-cols-6">
        <input className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm md:col-span-2" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <input className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm" placeholder="Full name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
        <select className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="rounded-md bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white" disabled={loading} type="submit">
          Add user
        </button>
      </form>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm" placeholder="Search email or name" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} />
        <select className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm" value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm" value={filters.role} onChange={(event) => setFilter('role', event.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm" value={filters.activated} onChange={(event) => setFilter('activated', event.target.value)}>
          <option value="">All activation</option>
          <option value="yes">Activated</option>
          <option value="no">Not activated</option>
        </select>
      </div>

      <UserTable
        users={users}
        selected={selected}
        loading={loading}
        onDelete={requestDelete}
        onStatus={setUserStatus}
        onSelect={(id, checked) => setSelected((current) => checked ? [...current, id] : current.filter((item) => item !== id))}
        onSelectAll={(checked) => setSelected(checked ? users.map((user) => user.id) : [])}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-[#667085]">
        <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} users</span>
        <div className="flex gap-2">
          <button className="rounded-md border border-[#cfd6df] px-3 py-1.5" disabled={loading || pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} type="button">
            Previous
          </button>
          <button className="rounded-md border border-[#cfd6df] px-3 py-1.5" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} type="button">
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        loading={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm?.run()}
      />
    </div>
  )
}
