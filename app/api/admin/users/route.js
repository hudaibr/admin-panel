import { requireAdmin, jsonError, cleanString, isUuid } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

function normalizeRole(role) {
  return role === 'admin' ? 'admin' : 'user'
}

function mapUsers(users, codes) {
  const codeMap = new Map()

  for (const code of codes || []) {
    const list = codeMap.get(code.user_id) || []
    list.push(code)
    codeMap.set(code.user_id, list)
  }

  return (users || []).map((user) => {
    const userCodes = codeMap.get(user.id) || []

    return {
      ...user,
      activation_codes: userCodes,
      is_activated: userCodes.some((code) => code.is_used),
    }
  })
}

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
  const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10', 10), 1), 100)
  const search = cleanString(searchParams.get('search')).toLowerCase().replace(/[,%]/g, '')
  const status = cleanString(searchParams.get('status'))
  const role = cleanString(searchParams.get('role'))
  const activated = cleanString(searchParams.get('activated'))

  let query = supabaseAdmin
    .from('profiles')
    .select('id,email,full_name,role,is_active', { count: 'exact' })
    .order('email', { ascending: true })

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  if (status === 'active') query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)
  if (role === 'admin' || role === 'user') query = query.eq('role', role)

  const shouldFilterActivated = activated === 'yes' || activated === 'no'
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const pagedQuery = shouldFilterActivated ? query : query.range(from, to)
  const { data: users, count, error } = await pagedQuery

  if (error) return jsonError(error.message, 500)

  const userIds = (users || []).map((user) => user.id)
  const { data: codes, error: codesError } = userIds.length
    ? await supabaseAdmin
        .from('activation_codes')
        .select('id,user_id,code,expires_at,is_used,created_at')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
    : { data: [], error: null }

  if (codesError) return jsonError(codesError.message, 500)

  let mappedUsers = mapUsers(users, codes)
  let filteredTotal = count || 0

  if (activated === 'yes') mappedUsers = mappedUsers.filter((user) => user.is_activated)
  if (activated === 'no') mappedUsers = mappedUsers.filter((user) => !user.is_activated)

  if (shouldFilterActivated) {
    filteredTotal = mappedUsers.length
    mappedUsers = mappedUsers.slice(from, to + 1)
  }

  const { count: totalUsers } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  const { count: activeUsers } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const { data: activatedRows } = await supabaseAdmin
    .from('activation_codes')
    .select('user_id')
    .eq('is_used', true)

  const activatedUsers = new Set((activatedRows || []).map((row) => row.user_id)).size

  const { data: recentUsers } = await supabaseAdmin
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .order('id', { ascending: false })
    .limit(5)

  return Response.json({
    users: mappedUsers,
    pagination: {
      page,
      pageSize,
      total: filteredTotal,
      totalPages: Math.max(Math.ceil(filteredTotal / pageSize), 1),
    },
    stats: {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      activatedUsers,
      recentUsers: recentUsers || [],
    },
  })
}

export async function POST(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => ({}))
  const action = cleanString(body.action)

  if (action === 'set-status' || action === 'bulk-status') {
    const ids = Array.isArray(body.user_ids) ? body.user_ids : [body.user_id]
    const validIds = ids.filter(isUuid)

    if (!validIds.length) return jsonError('Select at least one valid user')
    if (typeof body.is_active !== 'boolean') return jsonError('is_active must be a boolean')

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: body.is_active })
      .in('id', validIds)

    if (error) return jsonError(error.message, 500)

    return Response.json({ success: true })
  }

  const email = cleanString(body.email).toLowerCase()
  const password = cleanString(body.password)
  const fullName = cleanString(body.full_name)
  const role = normalizeRole(body.role)

  if (!email || !email.includes('@')) return jsonError('A valid email is required')
  if (password.length < 8) return jsonError('Password must be at least 8 characters')

  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })

  if (createError) return jsonError(createError.message, 400)

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: authData.user.id,
    email,
    full_name: fullName,
    role,
    is_active: body.is_active !== false,
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return jsonError(profileError.message, 500)
  }

  return Response.json({ success: true, user_id: authData.user.id }, { status: 201 })
}

export async function DELETE(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => ({}))
  const ids = Array.isArray(body.user_ids) ? body.user_ids : [body.user_id]
  const validIds = ids.filter(isUuid)

  if (!validIds.length) return jsonError('Select at least one valid user')
  if (validIds.includes(auth.profile.id)) return jsonError('You cannot delete your own admin account')

  const { error: codesError } = await supabaseAdmin
    .from('activation_codes')
    .delete()
    .in('user_id', validIds)

  if (codesError) return jsonError(codesError.message, 500)

  const { error: profilesError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .in('id', validIds)

  if (profilesError) return jsonError(profilesError.message, 500)

  const authErrors = []

  for (const id of validIds) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) authErrors.push(error.message)
  }

  if (authErrors.length) {
    return jsonError(`Profiles deleted, but auth cleanup failed: ${authErrors.join(', ')}`, 500)
  }

  return Response.json({ success: true })
}
