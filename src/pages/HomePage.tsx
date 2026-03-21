import { Link } from 'react-router-dom'
import '../styles/ui.css'

export function HomePage() {
  return (
    <div className="landing-shell">
      <div className="landing-threads" aria-hidden="true">
        <span className="thread t1" />
        <span className="thread t2" />
        <span className="thread t3" />
      </div>
      <div className="layout landing-content">
        <div style={{ maxWidth: 520 }}>
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            margin: '0 0 10px',
          }}
        >
          Kaleenda
        </p>
        <h1 className="page-title" style={{ fontSize: '1.65rem', lineHeight: 1.2 }}>
          Shared calendars,
          <br />
          zero friction.
        </h1>
        <p className="page-sub">
          Create a shared calendar. Share a code. Anyone can join instantly — no accounts.
        </p>
        <div className="stack" style={{ marginTop: 8 }}>
          <Link className="btn" to="/create" style={{ display: 'inline-block', width: 'fit-content' }}>
            Create a calendar
          </Link>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already have a code?{' '}
            <Link to="/join" style={{ color: 'var(--accent-muted)', fontWeight: 500 }}>
              Join a calendar →
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
