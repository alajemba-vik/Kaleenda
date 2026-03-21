import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

function parseBody(req: VercelRequest): { session_token?: string } {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as { session_token?: string }
    } catch {
      return {}
    }
  }
  return (req.body ?? {}) as { session_token?: string }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const jwtSecret = process.env.SUPABASE_JWT_SECRET
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!jwtSecret || !supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Server misconfigured' })
    return
  }

  const { session_token } = parseBody(req)
  if (!session_token || typeof session_token !== 'string') {
    res.status(400).json({ error: 'session_token required' })
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
    res.status(401).json({ error: 'Invalid session' })
    return
  }

  const token = jwt.sign(
    {
      sub: session_token,
      role: 'authenticated',
      aud: 'authenticated',
      session_token,
    },
    jwtSecret,
    { expiresIn: '365d' },
  )

  res.status(200).json({ access_token: token })
}
