import { FormEvent, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAnonClient } from '@/lib/supabase'
import { writeStoredSession } from '@/lib/storage'
import type { AccessLevel } from '@/types'
import { CreateMascot } from '@/features/marketing'
import './CreatePage.css'

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
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [name, setName] = useState('')

  function fillInput(value: string) {
    setName(value)
    nameInputRef.current?.focus()
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const rawName = name.trim()
    if (!rawName) {
      setErr('Name your calendar')
      return
    }
    setBusy(true)
    try {
      const anon = createAnonClient()
      const { data, error } = await anon.rpc('create_calendar', { p_name: rawName })
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
          calendarName: rawName,
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
    <div className="create-page">
      <main className="create-main">
        <div className="create-shell">
          <div className="create-mascot" aria-hidden="true">
            <CreateMascot width="88" height="88" />
          </div>

          <section className="create-card" aria-label="Create calendar form">
            <h1 className="create-title">Give your calendar a name</h1>

            {err ? <p className="create-error">{err}</p> : null}

            <form className="create-form" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="name">
                Calendar name
              </label>
              <input
                id="name"
                ref={nameInputRef}
                name="name"
                className="create-input"
                placeholder="e.g., Football team, June wedding, Spring exams..."
                autoFocus
                disabled={busy}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="create-suggestions" aria-label="Suggested calendar names">
                <button type="button" className="create-pill" onClick={() => fillInput('Football team')}>⚽ Football team</button>
                <button type="button" className="create-pill" onClick={() => fillInput('June wedding')}>💍 June wedding</button>
                <button type="button" className="create-pill" onClick={() => fillInput('Spring exams')}>📚 Spring exams</button>
                <button type="button" className="create-pill" onClick={() => fillInput('Group trip')}>✈️ Group trip</button>
              </div>

              <button className="create-submit-btn" type="submit" disabled={busy}>
                {busy ? 'Creating...' : 'Create calendar →'}
              </button>

              <p className="create-trust-line">No account. No app. Just one link.</p>

              <Link to="/" className="create-cancel-link">
                Cancel
              </Link>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
