import { Link } from 'react-router-dom'
import '../styles/ui.css'

export function HomePage() {
  return (
    <div className="landing-shell">
      <div className="landing-blob" aria-hidden="true" />
      <div className="layout landing-content">
        <header className="landing-nav fade-stage">
          <div className="wordmark">Kaleenda</div>
        </header>

        <main className="fade-stage delay-1" style={{ margin: 'auto 0', maxWidth: 720 }}>
          <h1
            className="page-title"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 56px)', letterSpacing: '-0.03em', fontWeight: 400, marginBottom: 16 }}
          >
            Shared calendars, no accounts.
          </h1>
          <p className="page-sub" style={{ fontSize: 18, maxWidth: 620 }}>
            Create a group calendar. Share a code. Anyone joins instantly.
          </p>
          <div className="small-actions" style={{ gap: 12 }}>
            <Link className="btn" to="/create" style={{ minWidth: 196 }}>
              Create a calendar
            </Link>
            <Link className="btn btn-secondary" to="/join" style={{ minWidth: 196 }}>
              Join with a code
            </Link>
          </div>
        </main>

        <footer className="fade-stage delay-2" style={{ paddingTop: 80 }}>
          <div className="small-actions" style={{ gap: 12 }}>
            <span className="badge badge-read">No signup</span>
            <span className="badge badge-read">Two access levels</span>
            <span className="badge badge-read">Lives on any device</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
