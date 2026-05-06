'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

function ActivationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUri = searchParams.get('redirect')

  const [activationCode, setActivationCode] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch WhatsApp number from Supabase app_config table
  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'whatsapp_number')
          .maybeSingle()
        
        if (data?.value?.whatsapp_number) {
          setWhatsappNumber(data.value.whatsapp_number)
        }
      } catch (err) {
        console.error('Error fetching config:', err)
      }
    }
    fetchConfig()
  }, [])

  const handleActivate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/client-login')
        return
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      
      // Call your API to verify code and activate the user
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ activation_code: activationCode })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Invalid activation code')

      // Redirect back to desktop app on success
      if (redirectUri) {
        window.location.href = redirectUri
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleActivate} className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Activate Desktop App</h1>
        
        {error && (
          <div className="mb-4 rounded-md border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        )}
        
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="activationCode">
          Activation Code
        </label>
        <input
          id="activationCode"
          className="w-full p-2 border rounded mb-6 outline-none focus:ring-2 focus:ring-teal-600 border-gray-300"
          placeholder="Enter Activation Code"
          value={activationCode}
          onChange={(e) => setActivationCode(e.target.value)}
          required
        />

        <button 
          className="w-full bg-[#0f766e] text-white p-2.5 rounded-md font-bold hover:bg-[#115e59] transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Activating...' : 'Activate Now'}
        </button>

        {whatsappNumber && (
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-500 mb-4">Need help?</p>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-bold hover:bg-[#128C7E] transition-colors shadow-sm"
            >
              Contact Support on WhatsApp
            </a>
          </div>
        )}
      </form>
    </div>
  )
}

export default function ActivationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <ActivationForm />
    </Suspense>
  )
}
