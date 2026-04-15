import type { VercelRequest, VercelResponse } from '@vercel/node'

function parseBody(req: VercelRequest): { name?: string; email?: string; message?: string } {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as { name?: string; email?: string; message?: string }
    } catch {
      return {}
    }
  }
  return (req.body ?? {}) as { name?: string; email?: string; message?: string }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const contactEmail =
    process.env.VITE_CONTACT_EMAIL ?? process.env.CONTACT_EMAIL
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? 'Kaleenda <onboarding@resend.dev>'

  if (!contactEmail) {
    res.status(500).json({ error: 'Contact email not configured. Set VITE_CONTACT_EMAIL in environment variables.' })
    return
  }

  const { name = 'Anonymous', email = 'no-reply@kaleenda.app', message } = parseBody(req)

  if (!message?.trim()) {
    res.status(400).json({ error: 'Message is required' })
    return
  }

  if (!resendKey) {
    // Fallback: log and succeed (useful for staging without email configured)
    console.info('[contact] Email would send to:', contactEmail)
    console.info('[contact] From:', name, email)
    console.info('[contact] Message:', message)
    res.status(200).json({ ok: true, note: 'Logged (no RESEND_API_KEY set)' })
    return
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [contactEmail],
      reply_to: email,
      subject: `New message from ${name} via Kaleenda`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.json().catch(() => ({}))
    res.status(502).json({ error: 'Email send failed', detail: errBody })
    return
  }

  res.status(200).json({ ok: true })
}
