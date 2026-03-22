import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAnonClient } from '../lib/supabase'
import { writeStoredSession } from '../lib/storage'
import type { AccessLevel } from '../lib/types'
import '../styles/ui.css'

function formatSupabaseError(e: unknown): string {
  if (e instanceof TypeError && e.message === 'Failed to fetch') {
    return [
      'Could not reach Supabase (network error).',
      '1) Confirm VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env at the project root, then restart the dev server.',
      '2) In the Supabase dashboard, make sure the project is not paused.',
      '3) Try another browser or disable ad blockers / VPN.',
      '4) Open your Project URL in a new tab — if it does not load, fix DNS or firewall.',
    ].join(' ')
  }
  if (e && typeof e === 'object') {
    const o = e as { message?: string; details?: string; hint?: string }
    const parts = [o.message, o.details, o.hint].filter(
      (x): x is string => typeof x === 'string' && x.length > 0,
    )
    if (parts.length) return parts.join(' — ')
  }
  if (e instanceof Error && e.message) return e.message
  return 'Could not create calendar'
}

export function CreatePage() {
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim()
    if (!name) {
      setErr('Name your calendar')
      return
    }
    setBusy(true)
    try {
      const anon = createAnonClient()
      const { data, error } = await anon.rpc('create_calendar', { p_name: name })
      if (error) throw error
      const createdAt = (data as { created_at?: string } | null | undefined)?.created_at
      if (!createdAt) {
        throw new Error('create_calendar response missing created_at — check Supabase insert return shape')
      }
      const j = data as {
        public_id: string
        write_code: string
        read_code: string
        owner_code: string
        owner_session_token: string
        created_at: string
      }
      writeStoredSession(j.public_id, j.owner_session_token, 'owner' as AccessLevel)
      nav(`/cal/${encodeURIComponent(j.public_id)}`, {
        replace: false,
        state: {
          fromCreate: true,
          createdAt,
          calendarName: name,
          writeCode: j.write_code,
          readCode: j.read_code,
          ownerCode: j.owner_code,
          ownerSessionToken: j.owner_session_token,
        },
      })
    } catch (er: unknown) {
      if (er instanceof Error && er.message.includes('create_calendar response missing created_at')) {
        console.error(er)
        setErr('Something went wrong creating your calendar. Please try again.')
      } else {
        setErr(formatSupabaseError(er))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="layout">
      <div className="surface-card" style={{ maxWidth: 560 }}>
        <p className="kicker">Create</p>
        <h1 className="page-title">Name your calendar</h1>
        <p className="page-sub">Give it a clear name so everyone knows what they are joining.</p>
        {err ? <p className="error-text">{err}</p> : null}
        <form onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="name">
            Calendar name
          </label>
          <input
            id="name"
            name="name"
            className="field"
            placeholder='e.g. "Football team schedule"'
            autoFocus
            disabled={busy}
            required
          />
          <div className="row" style={{ justifyContent: 'flex-start', gap: 8 }}>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create calendar →'}
            </button>
            <Link to="/" className="btn-ghost btn">
              Cancel
            </Link>
          </div>
          <p className="meta-note">No account needed.</p>
        </form>
      </div>
    </div>
  )
}
