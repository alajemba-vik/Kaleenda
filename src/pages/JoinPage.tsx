import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './JoinPage.css'

type AccessLevel = {
  tone: 'write' | 'read' | 'owner'
  text: string
}

function getAccessLevel(input: string): AccessLevel | null {
  const val = input.trim().toUpperCase()
  if (val.startsWith('WR')) {
    return { tone: 'write', text: '✏ Write access · You can add events' }
  }
  if (val.startsWith('RD')) {
    return { tone: 'read', text: '👁 View only · Read access' }
  }
  if (val.startsWith('OW')) {
    return { tone: 'owner', text: '★ Owner access · Full control' }
  }
  return null
}

export function JoinPage() {
  const nav = useNavigate()
  const [err, setErr] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [rememberDevice, setRememberDevice] = useState(true)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)

    let raw = code.trim()
    if (!raw) {
      setErr('Enter a calendar ID or paste a link')
      return
    }
    const m = raw.match(/\/cal\/([^/?#]+)/)
    if (m?.[1]) raw = m[1]
    raw = raw.replace(/^\/+/, '')
    if (raw.length < 4) {
      setErr('That does not look like a valid calendar ID')
      return
    }
    nav(`/cal/${encodeURIComponent(raw)}`)
  }

  const accessLevel = getAccessLevel(code)

  return (
    <div className="join-page">
      <main className="join-main">
        <div className="join-card-shell">
          <div className="join-frog" aria-hidden="true">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="96" height="96">
              <ellipse cx="32" cy="38" rx="20" ry="18" fill="#1D9E75" />
              <ellipse cx="20" cy="22" rx="9" ry="7" fill="#1D9E75" />
              <ellipse cx="44" cy="22" rx="9" ry="7" fill="#1D9E75" />
              <ellipse cx="20" cy="22" rx="6" ry="5" fill="white" />
              <ellipse cx="44" cy="22" rx="6" ry="5" fill="white" />
              <circle cx="20" cy="23" r="3.5" fill="#04342C" />
              <circle cx="44" cy="23" r="3.5" fill="#04342C" />
              <ellipse cx="19" cy="22" rx="1" ry="1.5" fill="white" opacity="0.7" />
              <ellipse cx="43" cy="22" rx="1" ry="1.5" fill="white" opacity="0.7" />
              <ellipse cx="32" cy="44" rx="10" ry="5" fill="#5DCAA5" />
              <path d="M26 40 Q32 36 38 40" stroke="#04342C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <line x1="14" y1="50" x2="8" y2="58" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="50" x2="56" y2="58" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <section className="join-card" aria-label="Join calendar form">
            <h1 className="join-title">Join a group.</h1>
            <p className="join-subtitle">
              Enter your access code or paste a shareable link to start collaborating.
            </p>

            <form className="join-form" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="cid">
                Access code or calendar link
              </label>
              <input
                id="cid"
                name="id"
                className="join-code-input"
                placeholder="Enter code or paste link"
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <div className={`join-access-indicator ${accessLevel ? 'visible' : ''}`} aria-live="polite">
                {accessLevel ? <span className={`join-access-pill ${accessLevel.tone}`}>{accessLevel.text}</span> : null}
              </div>

              {err ? <p className="join-error">{err}</p> : null}

              <button className="join-submit-btn" type="submit">
                Join calendar →
              </button>

              <button
                type="button"
                className="join-remember-row"
                onClick={() => setRememberDevice((v) => !v)}
                role="switch"
                aria-checked={rememberDevice}
              >
                <span className={`join-toggle-track ${rememberDevice ? 'on' : 'off'}`} aria-hidden="true">
                  <span className={`join-toggle-thumb ${rememberDevice ? 'on' : 'off'}`} />
                </span>
                <span className="join-remember-label">Remember this device — skip code next time</span>
              </button>

              <div className="join-divider" aria-hidden="true">
                <span />
                <small>OR</small>
                <span />
              </div>

              <Link to="/create" className="join-create-link">
                Create your own
              </Link>

              <Link to="/" className="join-back-link">
                Back to home
              </Link>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
