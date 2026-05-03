'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/AdminShell'
import { adminFetch } from '@/lib/apiClient'

export default function SettingsPage() {
  return (
    <AdminShell>
      {({ notify }) => <SettingsContent notify={notify} />}
    </AdminShell>
  )
}

function SettingsContent({ notify }) {
  const [number, setNumber] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const data = await adminFetch('/api/admin/settings')
      setNumber(data.config?.value?.whatsapp_number || '')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await adminFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ whatsapp_number: number }),
      })
      notify('WhatsApp number saved')
      await loadSettings()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-[#667085]">Manage application configuration.</p>
      </div>

      <form onSubmit={saveSettings} className="max-w-xl rounded-lg border border-[#d8dee6] bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-medium" htmlFor="whatsapp">WhatsApp number</label>
        <input
          id="whatsapp"
          className="w-full rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
          placeholder="+923001234567"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          required
        />
        <p className="mt-2 text-xs text-[#667085]">Saved in app_config as JSON with key whatsapp_number.</p>
        <button className="mt-5 rounded-md bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white" disabled={loading} type="submit">
          {loading ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
