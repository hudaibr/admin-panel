import { requireAdmin, jsonError, cleanString } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const WHATSAPP_KEY = 'whatsapp_number'

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const { data, error } = await supabaseAdmin
    .from('app_config')
    .select('id,key,value')
    .eq('key', WHATSAPP_KEY)
    .maybeSingle()

  if (error) return jsonError(error.message, 500)

  return Response.json({
    config: data || { key: WHATSAPP_KEY, value: { whatsapp_number: '' } },
  })
}

export async function POST(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => ({}))
  const whatsappNumber = cleanString(body.whatsapp_number)

  if (!/^\+[1-9]\d{7,14}$/.test(whatsappNumber)) {
    return jsonError('Use E.164 format, for example +923001234567')
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('app_config')
    .select('id')
    .eq('key', WHATSAPP_KEY)
    .maybeSingle()

  if (existingError) return jsonError(existingError.message, 500)

  const payload = {
    key: WHATSAPP_KEY,
    value: { whatsapp_number: whatsappNumber },
  }

  const request = existing?.id
    ? supabaseAdmin.from('app_config').update(payload).eq('id', existing.id)
    : supabaseAdmin.from('app_config').insert(payload)

  const { error } = await request

  if (error) return jsonError(error.message, 500)

  return Response.json({ success: true, config: payload })
}
