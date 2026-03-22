import { Link } from 'react-router-dom'
import '../styles/ui.css'

export function LegalPage() {
  return (
    <div className="layout legal-layout">
      <div className="surface-card legal-card">
        <div className="row" style={{ marginBottom: 12 }}>
          <Link to="/" className="link-btn">
            ← Back to home
          </Link>
        </div>
        <h1 className="page-title">Terms of Use</h1>
        <p>
          Kaleenda is provided as-is for shared scheduling. By using the service, you agree not to abuse,
          disrupt, or attempt unauthorized access to calendars you do not own.
        </p>
        <p>
          You are responsible for the content shared in your calendars and for distributing access codes
          only to trusted participants.
        </p>
        <p>
          Kaleenda may evolve over time. Continued use after updates means you accept the latest terms.
        </p>
      </div>
    </div>
  )
}

