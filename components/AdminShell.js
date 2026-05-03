'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Toast from '@/components/Toast'

export default function AdminShell({ children }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,full_name,role,is_active')
        .eq('id', userData.user.id)
        .single()

      if (error || !data || data.role !== 'admin' || data.is_active === false) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      if (mounted) {
        setProfile(data)
        setReady(true)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [router])

  function notify(message, type = 'success') {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3500)
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] text-sm text-[#667085]">
        Loading admin panel...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#1f2933]">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="md:flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Navbar profile={profile} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
            {children({ notify, profile })}
          </main>
        </div>
      </div>
    </div>
  )
}
