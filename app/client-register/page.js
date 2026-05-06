'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUri = searchParams.get('redirect')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      // Redirect directly to activation page
      const activationUrl = `/client-activation${redirectUri ? `?redirect=${encodeURIComponent(redirectUri)}` : ''}`
      router.push(activationUrl)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 text-[#1f2933]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <form onSubmit={handleRegister} className="w-full rounded-lg border border-[#d8dee6] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f766e]">Client Portal</p>
            <h1 className="mt-2 text-3xl font-bold">Create account</h1>
            <p className="mt-2 text-sm text-[#667085]">Fill in your details to register.</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="phone">Phone (Optional)</label>
              <input
                id="phone"
                name="phone"
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            className="mt-8 w-full rounded-md bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="mt-6 text-center text-sm text-[#667085]">
            Already have an account?{' '}
            <Link href="/client-login" className="font-semibold text-[#0f766e] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}

