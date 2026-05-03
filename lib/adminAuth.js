import { supabaseAdmin } from '@/lib/supabaseAdmin'

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function requireAdmin(req) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return { error: jsonError('Authentication required', 401) }
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

  if (userError || !userData?.user) {
    return { error: jsonError('Invalid session', 401) }
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin' || profile.is_active === false) {
    return { error: jsonError('Admin access required', 403) }
  }

  return { user: userData.user, profile }
}

export function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '')
}
