import { randomUUID } from 'crypto'
import { requireAdmin, jsonError, cleanString, isUuid } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

function createActivationCode() {
  return randomUUID()
}

function expiresInThirtyDays() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString()
}

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const userId = cleanString(searchParams.get('user_id'))

  let query = supabaseAdmin
    .from('activation_codes')
    .select('id,user_id,code,expires_at,is_used,created_at')
    .order('created_at', { ascending: false })

  if (userId) {
    if (!isUuid(userId)) return jsonError('Invalid user_id')
    query = query.eq('user_id', userId)
  }

  const { data: codes, error } = await query

  if (error) return jsonError(error.message, 500)

  const userIds = [...new Set((codes || []).map((code) => code.user_id).filter(Boolean))]
  const { data: users, error: usersError } = userIds.length
    ? await supabaseAdmin
        .from('profiles')
        .select('id,email,full_name,role,is_active')
        .in('id', userIds)
    : { data: [], error: null }

  if (usersError) return jsonError(usersError.message, 500)

  const userMap = new Map((users || []).map((user) => [user.id, user]))
  const mappedCodes = (codes || []).map((code) => ({
    ...code,
    user: userMap.get(code.user_id) || null,
  }))

  return Response.json({ codes: mappedCodes })
}

export async function POST(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => ({}))
  const userId = cleanString(body.user_id)
  const codeId = cleanString(body.id)

  if (!isUuid(userId)) return jsonError('Valid user_id is required')

  const { data: user, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (userError || !user) return jsonError('User not found', 404)

  if (body.action === 'regenerate') {
    if (!isUuid(codeId)) return jsonError('Valid code id is required')

    const { error } = await supabaseAdmin
      .from('activation_codes')
      .update({
        code: createActivationCode(),
        expires_at: expiresInThirtyDays(),
        is_used: false,
      })
      .eq('id', codeId)
      .eq('user_id', userId)

    if (error) return jsonError(error.message, 500)

    return Response.json({ success: true })
  }

  const { error } = await supabaseAdmin.from('activation_codes').insert({
    user_id: userId,
    code: cleanString(body.code) || createActivationCode(),
    expires_at: expiresInThirtyDays(),
    is_used: false,
  })

  if (error) return jsonError(error.message, 500)

  return Response.json({ success: true }, { status: 201 })
}

export async function DELETE(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => ({}))
  const id = cleanString(body.id)

  if (!isUuid(id)) return jsonError('Valid code id is required')

  const { error } = await supabaseAdmin
    .from('activation_codes')
    .delete()
    .eq('id', id)

  if (error) return jsonError(error.message, 500)

  return Response.json({ success: true })
}
