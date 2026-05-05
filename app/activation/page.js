'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/AdminShell'
import ActivationTable from '@/components/ActivationTable'
import ConfirmDialog from '@/components/ConfirmDialog'
import { adminFetch } from '@/lib/apiClient'

export default function ActivationPage() {
  return (
    <AdminShell>
      {({ notify }) => <ActivationContent notify={notify} />}
    </AdminShell>
  )
}

function ActivationContent({ notify }) {
  const [codes, setCodes] = useState([])
  const [users, setUsers] = useState([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [codesData, usersData] = await Promise.all([
        adminFetch('/api/admin/activation'),
        adminFetch('/api/admin/users?pageSize=100'),
      ])
      setCodes(codesData.codes)
      setUsers(usersData.users)
      if (!userId && usersData.users[0]) setUserId(usersData.users[0].id)
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function createCode(event) {
    event.preventDefault()
    if (!userId) {
      notify('Select a user first', 'error')
      return
    }

    setLoading(true)
    try {
      await adminFetch('/api/admin/activation', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      })
      notify('Activation code generated')
      await loadData()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code)
      notify('Code copied')
    } catch {
      notify('Copy failed', 'error')
    }
  }

  async function deleteCode(id) {
    setLoading(true)
    try {
      await adminFetch('/api/admin/activation', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      notify('Code deleted')
      setConfirm(null)
      await loadData()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function regenerateCode(item) {
    setLoading(true)
    try {
      await adminFetch('/api/admin/activation', {
        method: 'POST',
        body: JSON.stringify({ action: 'regenerate', id: item.id, user_id: item.user_id }),
      })
      notify('Code regenerated')
      await loadData()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activation Codes</h1>
        <p className="mt-1 text-sm text-[#667085]">Generate, copy, regenerate, and remove user activation codes.</p>
      </div>

      <form onSubmit={createCode} className="mb-6 flex flex-wrap gap-3 rounded-lg border border-[#d8dee6] bg-white p-4">
        <select className="min-w-72 rounded-md border border-[#cfd6df] px-3 py-2 text-sm" value={userId} onChange={(event) => setUserId(event.target.value)}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.email} {user.full_name ? `(${user.full_name})` : ''}</option>
          ))}
        </select>
        <button className="rounded-md bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white" disabled={loading || !users.length} type="submit">
          Generate code
        </button>
      </form>

      <ActivationTable
        codes={codes}
        loading={loading}
        onCopy={copyCode}
        onRegenerate={regenerateCode}
        onDelete={(id) => setConfirm({
          title: 'Delete activation code',
          message: 'Delete this activation code? This cannot be undone.',
          confirmLabel: 'Delete',
          run: () => deleteCode(id),
        })}
      />

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
