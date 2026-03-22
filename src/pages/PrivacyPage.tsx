import { Link } from 'react-router-dom'
import { PlushieCharacter } from '../components/PlushieCharacter'
import '../styles/marketingPages.css'

export function PrivacyPage() {
  return (
    <div className="mp-page">
      <header className="mp-nav">
        <div className="mp-nav-inner">
          <Link to="/" className="mp-wordmark">Kaleenda</Link>
          <nav className="mp-nav-links" aria-label="Marketing pages">
            <Link to="/about">Why Kaleenda</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/privacy" className="active">Privacy</Link>
            <Link to="/legal">Legal</Link>
          </nav>
          <Link to="/create" className="mp-nav-cta">Create a calendar →</Link>
        </div>
      </header>

      <main className="mp-main mp-content-editorial">
        <section className="mp-hero">
          <h1 className="mp-hero-title">Privacy Policy</h1>
          <p className="mp-hero-sub">Short version: we don&apos;t have your data because we never asked for it.</p>
        </section>

        <section className="mp-editorial-section">
          <h2>What we collect</h2>
          <div className="mp-editorial-copy">
            <p>We collect nothing that identifies you. No name, no email, no phone number.</p>
            <p>When you create or join a calendar, we store the calendar name, the events you add, and a session token in your browser&apos;s localStorage. That&apos;s it.</p>
          </div>
        </section>

        <section className="mp-editorial-section">
          <h2>Where it lives</h2>
          <div className="mp-editorial-copy">
            <p>Your session token lives in your browser. The calendar data lives in Supabase, a European-hosted database.</p>
            <p>We don&apos;t sell it, share it, or look at it. If you clear your browser data, your local session is gone. The calendar itself stays accessible to anyone with the code.</p>
          </div>
        </section>

        <section className="mp-editorial-section">
          <h2>Cookies and tracking</h2>
          <div className="mp-editorial-copy">
            <p>Kaleenda uses no tracking cookies. No Google Analytics. No Facebook Pixel. No ad retargeting.</p>
            <p>We use localStorage to remember your calendar access on this device, and you can clear it at any time.</p>
          </div>
        </section>

        <section className="mp-editorial-section">
          <h2>GDPR (France and EU)</h2>
          <div className="mp-editorial-copy">
            <p>We comply with GDPR. You have the right to access any data associated with your session, request deletion of a calendar you created, and use Kaleenda without creating a personal data record.</p>
            <p>For any requests, contact us at <a href="mailto:hello@kaleenda.app">hello@kaleenda.app</a>.</p>
          </div>
        </section>

        <section className="mp-editorial-section" style={{ paddingBottom: 30 }}>
          <h2>Last updated</h2>
          <div className="mp-editorial-copy">
            <p>March 2026.</p>
          </div>
        </section>

        <div className="mp-bear-footer">
          <div className="mp-bear-wrap">
            <span className="mp-bear-tip">Nothing to worry about here.</span>
            <PlushieCharacter mood="chill" size={48} />
          </div>
          <p style={{ marginTop: 10, fontSize: 15, color: '#6b6860', fontStyle: 'italic' }}>Rest easy, your mind is your own.</p>
        </div>
      </main>

      <footer className="mp-footer">
        <div className="mp-footer-wordmark" aria-hidden="true">Kaleenda</div>
        <nav className="mp-footer-links" aria-label="Footer links">
          <Link to="/about">Why Kaleenda</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/legal">Legal</Link>
        </nav>
        <p className="mp-footer-note">No account needed. No tracking. Just shared calendars.</p>
      </footer>
    </div>
  )
}

