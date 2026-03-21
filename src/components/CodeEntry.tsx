import '../styles/ui.css'

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
  return (
    <div className="stack" style={{ maxWidth: 420 }}>
      <h1 className="page-title">Enter your code</h1>
      <p className="page-sub">
        You need a code to access <strong>{calendarName}</strong>. Ask the owner for the write or read
        code.
      </p>
      {error ? <p className="error-text">{error}</p> : null}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const code = String(fd.get('code') ?? '')
          onSubmit(code)
        }}
      >
        <label className="sr-only" htmlFor="code">
          Access code
        </label>
        <input
          id="code"
          name="code"
          className="field"
          placeholder="e.g. WR-ABC123"
          autoComplete="off"
          autoCapitalize="characters"
          disabled={busy}
          required
        />
        <label className="chk">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => onRememberChange(e.target.checked)}
            disabled={busy}
          />
          <span>Remember this device — skip code next time</span>
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Join calendar'}
        </button>
      </form>
    </div>
  )
}
