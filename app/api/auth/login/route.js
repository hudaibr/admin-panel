import { cleanString, createPasswordAuthClient, isValidEmail, jsonError, publicUser } from '@/lib/desktopAuth'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const body = await req.json().catch(() => ({}))
  const email = cleanString(body.email).toLowerCase()
  const password = cleanString(body.password)

  if (!isValidEmail(email)) {
    return jsonError('A valid email is required')
  }

  if (!password) {
    return jsonError('Password is required')
  }

  const supabaseAuth = createPasswordAuthClient()
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data?.session || !data?.user) {
    return jsonError(error?.message || 'Invalid login credentials', 401)
  }

  return Response.json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      token_type: data.session.token_type,
    },
    user: publicUser(data.user),
  })
}
