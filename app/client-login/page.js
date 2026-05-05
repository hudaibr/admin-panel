'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ClientLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUri = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    // Check if user is active (skipping the admin role check)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile || profile.is_active === false) {
      await supabase.auth.signOut()
      setError('Your account is inactive. Please contact support.')
      setLoading(false)
      return
    }

    if (redirectUri) {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      window.location.href = `${redirectUri}?token=${token}`
    } else {
      router.push('/') // Regular users go to home, not admin dashboard
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-lg border border-[#d8dee6] shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Client Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Connect your desktop automation session.</p>
        
        {error && (
          <div className="mb-4 rounded-md border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        )}
        
        <label className="mb-2 block text-sm font-medium" htmlFor="email">Email</label>
        <input 
          id="email"
          type="email" 
          autoComplete="email"
          className="w-full mb-4 rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <label className="mb-2 block text-sm font-medium" htmlFor="password">Password</label>
        <input 
          id="password"
          type="password" 
          autoComplete="current-password"
          className="w-full mb-6 rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        
        <button 
          className="w-full bg-[#0f766e] text-white p-2.5 rounded-md font-semibold hover:bg-[#115e59] disabled:opacity-50 transition-colors"
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Sign In'}
        </button>
        <p className="mt-6 text-center text-sm text-[#667085]">
          Need an account? <Link href="/client-register" className="text-[#0f766e] font-bold hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">Loading...</div>}>
      <ClientLoginForm />
    </Suspense>
  )
}
