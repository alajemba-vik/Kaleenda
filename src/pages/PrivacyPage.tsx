import { Link } from 'react-router-dom'
import '../styles/ui.css'

export function PrivacyPage() {
  return (
    <div className="layout legal-layout">
      <div className="surface-card legal-card">
        <div className="row" style={{ marginBottom: 12 }}>
          <Link to="/" className="link-btn">
            ← Back to home
          </Link>
        </div>
        <h1 className="page-title">Privacy Policy</h1>
        <p>
          Kaleenda stores calendar content required for the service: calendar names, event details, and
          access/session tokens needed to open calendars.
        </p>
        <p>
          On your device, Kaleenda stores access tokens and optional creator names in localStorage so you
          can re-enter calendars without typing a code each time.
        </p>
        <p>
          Kaleenda does not collect personal profile data (such as name, email, or phone) by default,
          and does not use third-party analytics or tracking cookies.
        </p>
        <p>
          Data is hosted on secure EU infrastructure. Calendar owners can delete their calendar and all
          related events at any time.
        </p>
      </div>
    </div>
  )
}

