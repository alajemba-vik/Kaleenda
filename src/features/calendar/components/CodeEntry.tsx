import { useEffect, useState } from 'react'
import '@/styles/ui.css'
import './CodeEntry.css'

type Props = {
  calendarName: string
  error: string | null
  busy: boolean
  remember: boolean
  onRememberChange: (v: boolean) => void
  onSubmit: (code: string) => void
}

export function CodeEntry({
  calendarName,
  error,
  busy,
  remember,
  onRememberChange,
  onSubmit,
}: Props) {
  const [code, setCode] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (!error) return
    setShake(true)
    const t = window.setTimeout(() => setShake(false), 320)
    return () => window.clearTimeout(t)
  }, [error])

  function formatCode(v: string): string {
    const cleaned = v.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const prefix = cleaned.slice(0, 2)
    const rest = cleaned.slice(2, 8)
    if (prefix === 'WR' || prefix === 'RD' || prefix === 'OW') {
      return rest.length ? `${prefix}-${rest}` : prefix
    }
    return cleaned.slice(0, 8)
  }

  return (
    <div className={`surface-card stack code-entry-card ${shake ? 'shake' : ''}`} style={{ maxWidth: 560 }}>
      <p className="kicker">Access</p>
      <h1 className="page-title">Enter your code</h1>
      <p className="page-sub">
        Use a read or write code to access <strong>{calendarName}</strong>.
      </p>
      {error ? <p className="error-text">{error}</p> : null}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(code)
        }}
      >
        <label className="sr-only" htmlFor="code">
          Access code
        </label>
        <input
          id="code"
          name="code"
          className="field code-entry-input"
          placeholder="e.g. WR-ABC123"
          autoComplete="off"
          autoCapitalize="characters"
          value={code}
          onChange={(e) => setCode(formatCode(e.target.value))}
          disabled={busy}
          required
        />
        <div className="remember-row">
          <button
            type="button"
            role="switch"
            aria-checked={remember}
            className={`remember-switch ${remember ? 'on' : ''}`}
            onClick={() => onRememberChange(!remember)}
            disabled={busy}
            aria-label="Remember this device"
          >
            <span className="remember-thumb" />
          </button>
          <span className="remember-label">Remember this device</span>
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Join calendar'}
        </button>
      </form>
    </div>
  )
}
