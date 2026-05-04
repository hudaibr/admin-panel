import { cleanString, isValidEmail, jsonError } from '@/lib/desktopAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const body = await req.json().catch(() => ({}))
  const email = cleanString(body.email).toLowerCase()
  const password = cleanString(body.password)
  const fullName = cleanString(body.full_name)
  const phone = cleanString(body.phone)

  if (!isValidEmail(email)) {
    return jsonError('A valid email is required')
  }

  if (password.length < 8) {
    return jsonError('Password must be at least 8 characters')
  }

  if (fullName.length > 120) {
    return jsonError('Full name must be 120 characters or less')
  }

  if (phone && phone.length > 40) {
    return jsonError('Phone must be 40 characters or less')
  }

  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      role: 'user',
    },
  })

  if (createError || !authData?.user) {
    return jsonError(createError?.message || 'Unable to create user', 400)
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: authData.user.id,
    email,
    full_name: fullName,
    role: 'user',
    is_active: false,
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return jsonError(profileError.message, 500)
  }

  return Response.json({
    success: true,
    user_id: authData.user.id,
  }, { status: 201 })
}
