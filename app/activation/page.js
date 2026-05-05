'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

function ActivationForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    // Fetch dynamic support number from Supabase
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'whatsapp_number')
          .maybeSingle()
        
        if (data?.value?.whatsapp_number) {
          setWhatsapp(data.value.whatsapp_number)
        }
      } catch (err) {
        console.error('Error fetching config:', err)
      }
    }
    fetchConfig()
  }, [])

  const handleActivate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/client-login')
      return
    }

    try {
      // Using the dedicated activation API which handles code validation and profile update
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ activation_code: code }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Activation failed')
      }

      // SUCCESS: Redirect back to Desktop App to unlock
      window.location.href = `myapp://callback?token=${session.access_token}`
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <div className="mb-8">
          <p className="text-teal-600 font-bold uppercase tracking-wider text-xs mb-1">Desktop Access</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Activate App</h1>
          <p className="text-gray-500 mt-2">Enter your code to unlock the automation tools.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleActivate} className="space-y-6">
          <input 
            type="text" 
            placeholder="XXXX-XXXX" 
            className="w-full p-4 border-2 border-gray-100 rounded-xl text-center text-2xl font-mono tracking-widest focus:border-teal-500 outline-none transition-all"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <button 
            disabled={loading} 
            className="w-full bg-[#0f766e] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#115e59] shadow-lg shadow-[#0f766e]/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Validating...' : 'Activate Now'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-gray-500 mb-4">Need help or a code?</p>
          <a 
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "") || 'YOUR_NUMBER_HERE'}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-3 rounded-full font-bold hover:bg-[#128C7E] shadow-lg shadow-green-500/30 transition-all"
          >
            Chat with Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ActivationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">Loading...</div>}>
      <ActivationForm />
    </Suspense>
  )
}
