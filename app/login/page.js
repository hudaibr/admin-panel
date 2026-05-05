'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role,is_active')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin' || profile.is_active === false) {
      await supabase.auth.signOut()
      setError('Only active admin users can access this panel.')
      setLoading(false)
      return
    }

    if (redirectUri) {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      window.location.href = `${redirectUri}?token=${token}`
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 text-[#1f2933]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <form onSubmit={handleLogin} className="w-full rounded-lg border border-[#d8dee6] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f766e]">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
            <p className="mt-2 text-sm text-[#667085]">Use an active admin account to continue.</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
              {error}
            </div>
          ) : null}

          <label className="mb-2 block text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            className="mb-4 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className="mb-2 block text-sm font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            className="mb-6 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            className="w-full rounded-md bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-6 text-center text-sm text-[#667085]">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-[#0f766e] hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
