import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

type SendCodesPayload = {
  calendar_id?: string
  email?: string
  calendarName?: string
  codes?: {
    write?: string
    read?: string
    owner?: string
  }
  shareUrl?: string
  createdAt?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function prettyDate(value?: string): string {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function isEmailEnabled(): boolean {
  return String(Deno.env.get('EMAIL_ENABLED') ?? 'false').trim().toLowerCase() === 'true'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  let payload: SendCodesPayload
  try {
    payload = (await req.json()) as SendCodesPayload
  } catch {
    return json(400, { error: 'Invalid JSON payload' })
  }

  const email = String(payload.email ?? '').trim()
  const calendarName = String(payload.calendarName ?? '').trim() || 'Your calendar'
  const writeCode = String(payload.codes?.write ?? '').trim()
  const readCode = String(payload.codes?.read ?? '').trim()
  const ownerCode = String(payload.codes?.owner ?? '').trim()
  const shareUrl = String(payload.shareUrl ?? '').trim()
  const createdAt = prettyDate(payload.createdAt)
  const emailEnabled = isEmailEnabled()

  if (!isValidEmail(email)) {
    return json(400, { error: 'Valid email is required' })
  }
  if (!writeCode || !readCode || !ownerCode || !shareUrl) {
    return json(400, { error: 'Missing required calendar code fields' })
  }

  if (!emailEnabled) {
    console.log('[email] skipped', {
      calendar_id: payload.calendar_id,
      has_email: !!payload.email,
      codes_count: payload.codes ? Object.keys(payload.codes).length : 0,
      reason: 'EMAIL_ENABLED=false',
    })
    return json(200, { ok: true, skipped: true })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    return json(500, { error: 'RESEND_API_KEY is not configured' })
  }

  const safeName = escapeHtml(calendarName)
  const safeWrite = escapeHtml(writeCode)
  const safeRead = escapeHtml(readCode)
  const safeOwner = escapeHtml(ownerCode)
  const safeUrl = escapeHtml(shareUrl)

  const subject = `Your Kaleenda codes for ${calendarName}`
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; color: #1a1916; line-height: 1.5; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h1 style="font-family: 'Instrument Serif', Georgia, serif; margin: 0 0 8px; font-size: 32px;">Kaleenda</h1>
      <p style="margin: 0 0 18px; color: #6b6860;">Backup codes for <strong>${safeName}</strong>.</p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="padding: 12px; border: 1px solid #e7e4de; border-radius: 10px; background: #f8f7f3;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b6860;">Write</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 20px;">${safeWrite}</div>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e7e4de; border-radius: 10px; background: #f8f7f3;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b6860;">Read</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 20px;">${safeRead}</div>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e7e4de; border-radius: 10px; background: #f8f7f3;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b6860;">Owner</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 20px;">${safeOwner}</div>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 8px; color: #6b6860; font-size: 13px;">Shareable URL</p>
      <p style="margin: 0 0 16px; padding: 10px 12px; border: 1px dashed #d9d6cf; background: #f8f7f3; border-radius: 10px; font-family: 'JetBrains Mono', monospace; font-size: 14px; word-break: break-word;">${safeUrl}</p>

      <p style="margin: 0; color: #a8a49e; font-size: 12px;">Keep this safe - it is the only way to recover access. Created ${createdAt}.</p>
    </div>
  `

  const resendFromRaw = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
  const resendFrom = resendFromRaw.includes('kaleenda.app') ? 'onboarding@resend.dev' : resendFromRaw

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [email],
      subject,
      html,
    }),
  })

  if (!resendResponse.ok) {
    const errText = await resendResponse.text()
    return json(502, { error: `Resend send failed: ${errText}` })
  }

  return json(200, { ok: true })
})
