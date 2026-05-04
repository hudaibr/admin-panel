import { cleanString, isUuid, jsonError, requireUserSession } from '@/lib/desktopAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const auth = await requireUserSession(req)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => ({}))
  const userId = cleanString(body.user_id)
  const activationCode = cleanString(body.activation_code)

  if (!isUuid(userId)) {
    return jsonError('Valid user_id is required')
  }

  if (auth.user.id !== userId) {
    return jsonError('Session does not match user_id', 403)
  }

  if (!activationCode) {
    return jsonError('Activation code is required')
  }

  const { data: code, error: codeError } = await supabaseAdmin
    .from('activation_codes')
    .select('id,user_id,code,expires_at,is_used')
    .eq('user_id', userId)
    .eq('code', activationCode)
    .maybeSingle()

  if (codeError) {
    return jsonError(codeError.message, 500)
  }

  if (!code) {
    return jsonError('Invalid activation code', 404)
  }

  if (code.is_used) {
    return jsonError('Activation code has already been used', 409)
  }

  if (!code.expires_at || new Date(code.expires_at).getTime() <= Date.now()) {
    return jsonError('Activation code has expired', 410)
  }

  const { data: updatedCode, error: updateCodeError } = await supabaseAdmin
    .from('activation_codes')
    .update({ is_used: true })
    .eq('id', code.id)
    .eq('is_used', false)
    .select('id')
    .single()

  if (updateCodeError || !updatedCode) {
    return jsonError('Activation code could not be used', 409)
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: true })
    .eq('id', userId)

  if (profileError) {
    return jsonError(profileError.message, 500)
  }

  return Response.json({
    success: true,
    activated: true,
  })
}
