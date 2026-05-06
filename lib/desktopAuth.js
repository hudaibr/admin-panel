import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function requireUserSession(req) {
  const authHeader = req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: jsonError('Missing Authorization header', 401) }
  }

  const token = authHeader.split(' ')[1]

  // 🔥 CALL SUPABASE AUTH DIRECTLY
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // IMPORTANT
      },
    }
  )

  const user = await res.json()

  if (!res.ok || !user?.id) {
    console.error("AUTH FAILED:", user)
    return { error: jsonError('Unauthorized', 401) }
  }

  return {
    user,
    token,
  }
}

export function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '')
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')
}

export function createPasswordAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    user_metadata: user.user_metadata || {},
  }
}

export async function getProfile(userId) {
  return supabase
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .eq('id', userId)
    .single()
}
