import { getProfile, jsonError, publicUser, requireUserSession } from '@/lib/desktopAuth'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const auth = await requireUserSession(req)
  if (auth.error) return auth.error

  const { data: profile, error: profileError } = await getProfile(auth.user.id)

  if (profileError || !profile) {
    return jsonError('Profile not found', 404)
  }

  return Response.json({
    user: publicUser(auth.user),
    profile,
  })
}
