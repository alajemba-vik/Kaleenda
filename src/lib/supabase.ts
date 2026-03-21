import { createClient } from '@supabase/supabase-js'

function env(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const v = import.meta.env[name]
  return typeof v === 'string' ? v.trim() : ''
}

const url = env('VITE_SUPABASE_URL')
const anon = env('VITE_SUPABASE_ANON_KEY')

function hasPlaceholder(value: string): boolean {
  return /YOUR_|<|>/.test(value)
}

function assertSupabaseEnv(): void {
  if (!url || !anon) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env in the project root (same folder as package.json), save, then restart: npm run dev',
    )
  }
  if (hasPlaceholder(url) || hasPlaceholder(anon)) {
    throw new Error(
      'Supabase env values still contain placeholders. Replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env with real values from Supabase Dashboard, then restart: npm run dev',
    )
  }
  if (!url.startsWith('https://')) {
    throw new Error('VITE_SUPABASE_URL must start with https:// (check .env for typos or http)')
  }
  try {
    // Validate URL shape early so fetch errors do not hide env issues.
    new URL(url)
  } catch {
    throw new Error('VITE_SUPABASE_URL is not a valid URL. Check .env and restart dev server.')
  }
}

export function createAnonClient() {
  assertSupabaseEnv()
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createAuthClient(accessToken: string) {
  assertSupabaseEnv()
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
