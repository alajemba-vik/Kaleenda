import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/ui.css'

export function JoinPage() {
  const nav = useNavigate()
  const [err, setErr] = useState<string | null>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const fd = new FormData(e.currentTarget)
    let raw = String(fd.get('id') ?? '').trim()
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

  return (
    <div className="layout">
      <div className="surface-card" style={{ maxWidth: 560 }}>
        <p className="kicker">Join</p>
        <h1 className="page-title">Join a calendar</h1>
        <p className="page-sub">
          Paste the share link from the owner, or enter the 6-character calendar ID.
        </p>
        {err ? <p className="error-text">{err}</p> : null}
        <form onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="cid">
            Calendar ID or link
          </label>
          <input
            id="cid"
            name="id"
            className="field"
            placeholder="e.g. MX7K2 or https://…/cal/MX7K2"
            autoComplete="off"
          />
          <div className="row">
            <button className="btn" type="submit">
              Continue
            </button>
            <Link to="/" className="btn-secondary btn">
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
