import type { Connect } from 'vite'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

type SessionApiEnv = {
  SUPABASE_JWT_SECRET?: string
  SUPABASE_URL?: string
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_CONTACT_EMAIL?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function handleContactApi(
  req: Connect.IncomingMessage,
  res: import('http').ServerResponse,
  env: SessionApiEnv,
) {
  res.setHeader('Content-Type', 'application/json')

  const contactEmail =
    env.VITE_CONTACT_EMAIL ?? process.env.VITE_CONTACT_EMAIL ?? process.env.CONTACT_EMAIL
  const resendKey =
    env.RESEND_API_KEY ?? process.env.RESEND_API_KEY
  const fromEmail =
    env.RESEND_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? 'Kaleenda <onboarding@resend.dev>'

  if (!contactEmail) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Contact email not configured. Set VITE_CONTACT_EMAIL in .env' }))
    return
  }

  let body: { name?: string; email?: string; message?: string }
  try {
    body = JSON.parse(await readBody(req)) as typeof body
  } catch {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Invalid JSON' }))
    return
  }

  const { name = 'Anonymous', email = 'no-reply@kaleenda.app', message } = body
  if (!message?.trim()) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Message is required' }))
    return
  }

  if (!resendKey) {
    // Dev fallback: just log
    console.info('[contact] Email would send to:', contactEmail)
    console.info('[contact] From:', name, email)
    console.info('[contact] Message:', message)
    res.statusCode = 200
    res.end(JSON.stringify({ ok: true, note: 'Logged in dev (no RESEND_API_KEY set)' }))
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
    res.statusCode = 502
    res.end(JSON.stringify({ error: 'Email send failed', detail: errBody }))
    return
  }

  res.statusCode = 200
  res.end(JSON.stringify({ ok: true }))
}

async function handleIcalApi(
  req: Connect.IncomingMessage,
  res: import('http').ServerResponse,
  env: SessionApiEnv,
) {
  const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    res.statusCode = 500
    res.end('Server misconfigured')
    return
  }

  // Extract public_id from /api/cal/<id>.ics
  const match = (req.url ?? '').match(/\/api\/cal\/([^/?#]+?)(?:\.ics)?(?:\?.*)?$/)
  const calendarId = match?.[1]
  if (!calendarId) { res.statusCode = 400; res.end('Missing calendar ID'); return }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: cal, error: calErr } = await admin
    .from('calendars').select('id, name').eq('public_id', calendarId).maybeSingle()
  if (calErr || !cal) { res.statusCode = 404; res.end('Calendar not found'); return }

  const { data: events, error: evErr } = await admin
    .from('events')
    .select('id, title, event_date, start_time, end_time, note, creator_name')
    .eq('calendar_id', (cal as { id: string; name: string }).id)
    .order('event_date', { ascending: true })
  if (evErr) { res.statusCode = 500; res.end('Failed to load events'); return }

  function icalText(v: string) {
    return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  }
  function foldLine(line: string) {
    const bytes = Buffer.from(line, 'utf8')
    if (bytes.length <= 75) return line
    const chunks: string[] = []
    let pos = 0
    while (pos < bytes.length) { chunks.push(bytes.subarray(pos, pos + (pos === 0 ? 75 : 74)).toString('utf8')); pos += pos === 0 ? 75 : 74 }
    return chunks.join('\r\n ')
  }
  function icalDate(date: string, time?: string | null) {
    const d = date.replace(/-/g, '')
    if (!time) return `VALUE=DATE:${d}`
    return `${d}T${time.substring(0, 5).replace(':', '')}00`
  }

  type Ev = { id: string; title: string; event_date: string; start_time: string | null; end_time: string | null; note: string | null }
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  const calName = (cal as { id: string; name: string }).name as string

  const eventBlocks = ((events ?? []) as Ev[]).map((ev) => {
    const lines = [
      'BEGIN:VEVENT',
      foldLine(`UID:${ev.id}@kaleenda.app`),
      foldLine(`DTSTAMP:${now}`),
      foldLine(`SUMMARY:${icalText(ev.title)}`),
      foldLine(ev.start_time ? `DTSTART:${icalDate(ev.event_date, ev.start_time)}` : `DTSTART;${icalDate(ev.event_date)}`),
    ]
    if (ev.end_time) lines.push(foldLine(`DTEND:${icalDate(ev.event_date, ev.end_time)}`))
    if (ev.note?.trim()) lines.push(foldLine(`DESCRIPTION:${icalText(ev.note)}`))
    lines.push('END:VEVENT')
    return lines.join('\r\n')
  })

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    `PRODID:-//Kaleenda//Kaleenda Calendar//EN`,
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${icalText(calName)}`,
    ...eventBlocks,
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n'

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${calendarId}.ics"`)
  res.setHeader('Cache-Control', 'no-cache')
  res.statusCode = 200
  res.end(ics)
}

export function sessionApiPlugin(env: SessionApiEnv = {}): import('vite').Plugin {
  return {
    name: 'session-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // iCal feed endpoint
        if (req.url?.startsWith('/api/cal/') && req.method === 'GET') {
          await handleIcalApi(req, res, env)
          return
        }

        // Contact email endpoint
        if (req.url === '/api/contact' && req.method === 'POST') {
          await handleContactApi(req, res, env)
          return
        }

        if (req.url !== '/api/auth/session' || req.method !== 'POST') {
          next()
          return
        }

        const jwtSecret = env.SUPABASE_JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET
        const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

        res.setHeader('Content-Type', 'application/json')

        if (!jwtSecret || !supabaseUrl || !serviceKey) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Set SUPABASE_JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env' }))
          return
        }

        let body: { session_token?: string }
        try {
          body = JSON.parse(await readBody(req)) as { session_token?: string }
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
          return
        }

        const session_token = body.session_token
        if (!session_token || typeof session_token !== 'string') {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'session_token required' }))
          return
        }

        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })

        const { data, error } = await admin
          .from('calendar_sessions')
          .select('token')
          .eq('token', session_token)
          .maybeSingle()

        if (error || !data) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Invalid session' }))
          return
        }

        const access_token = jwt.sign(
          {
            sub: session_token,
            role: 'authenticated',
            aud: 'authenticated',
            session_token,
          },
          jwtSecret,
          { expiresIn: '365d' },
        )

        res.statusCode = 200
        res.end(JSON.stringify({ access_token }))
      })
    },
  }
}
