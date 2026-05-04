import { cleanString, getLatestValidActivationCode, getProfile, isUuid, jsonError, requireUserSession } from '@/lib/desktopAuth'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const auth = await requireUserSession(req)
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const requestedUserId = cleanString(searchParams.get('user_id'))
  const userId = requestedUserId || auth.user.id

  if (!isUuid(userId)) {
    return jsonError('Valid user_id is required')
  }

  if (userId !== auth.user.id) {
    return jsonError('Session does not match user_id', 403)
  }

  const { data: profile, error: profileError } = await getProfile(userId)

  if (profileError || !profile) {
    return jsonError('Profile not found', 404)
  }

  const { data: code, error: codeError } = await getLatestValidActivationCode(userId)

  if (codeError) {
    return jsonError(codeError.message, 500)
  }

  return Response.json({
    is_active: Boolean(profile.is_active),
    expires_at: code?.expires_at || null,
    has_valid_code: Boolean(code),
  })
}
