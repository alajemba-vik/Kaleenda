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

export function sessionApiPlugin(env: SessionApiEnv = {}): import('vite').Plugin {
  return {
    name: 'session-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
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
