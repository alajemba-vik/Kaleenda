import type { Connect } from 'vite'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

type SessionApiEnv = {
  SUPABASE_JWT_SECRET?: string
  SUPABASE_URL?: string
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function sessionApiPlugin(env: SessionApiEnv = {}): import('vite').Plugin {
  return {
    name: 'session-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
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
