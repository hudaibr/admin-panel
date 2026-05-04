import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status })
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

export function getBearerToken(req) {
  const header = req.headers.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

export function createPasswordAuthClient() {
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

export async function requireUserSession(req) {
  const token = getBearerToken(req)

  if (!token) {
    return { error: jsonError('Authentication required', 401) }
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data?.user) {
    return { error: jsonError('Invalid session', 401) }
  }

  return { user: data.user, token }
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
  return supabaseAdmin
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .eq('id', userId)
    .single()
}

export async function getLatestValidActivationCode(userId) {
  const now = new Date().toISOString()

  return supabaseAdmin
    .from('activation_codes')
    .select('id,user_id,code,expires_at,is_used,created_at')
    .eq('user_id', userId)
    .eq('is_used', false)
    .gt('expires_at', now)
    .order('expires_at', { ascending: true })
    .limit(1)
    .maybeSingle()
}
