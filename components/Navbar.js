'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar({ profile }) {
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#d8dee6] bg-white px-4 md:px-6">
      <div>
        <p className="text-sm font-semibold text-[#0f766e]">Admin Panel</p>
        <p className="text-xs text-[#667085]">{profile?.email || 'Loading account'}</p>
      </div>
      <button
        className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium hover:bg-[#f2f4f7]"
        onClick={signOut}
        type="button"
      >
        Sign out
      </button>
    </header>
  )
}
