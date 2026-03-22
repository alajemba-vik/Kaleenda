import { Link } from 'react-router-dom'
import '../styles/marketingPages.css'

export function LegalPage() {
  return (
    <div className="mp-page">
      <header className="mp-nav">
        <div className="mp-nav-inner">
          <Link to="/" className="mp-wordmark">Kaleenda</Link>
          <nav className="mp-nav-links" aria-label="Marketing pages">
            <Link to="/about">Why Kaleenda</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/legal" className="active">Legal</Link>
          </nav>
          <Link to="/create" className="mp-nav-cta">Create a calendar →</Link>
        </div>
      </header>

      <main className="mp-main mp-content-editorial">
        <section className="mp-hero">
          <h1 className="mp-hero-title">Terms of Service</h1>
          <p className="mp-hero-sub">Plain English. No surprises.</p>
        </section>

        <section className="mp-editorial-section">
          <h2>What Kaleenda is</h2>
          <div className="mp-editorial-copy">
            <p>A shared calendar tool. You create calendars, share codes, and add events.</p>
            <p>We provide the infrastructure. We are not responsible for what groups use it for, but we reserve the right to remove calendars used for illegal activity.</p>
          </div>
        </section>

        <section className="mp-editorial-section">
          <h2>What you own</h2>
          <div className="mp-editorial-copy">
            <p>Your calendar content belongs to you. We do not claim ownership of event names, descriptions, or any data you create.</p>
            <p>If you delete a calendar, it is removed from our servers within 30 days.</p>
          </div>
        </section>

        <section className="mp-editorial-section">
          <h2>What we provide</h2>
          <div className="mp-editorial-copy">
            <p>Kaleenda is provided free of charge, as-is. We make no uptime guarantees on the free tier.</p>
            <p>We do our best to protect your data, but for important calendars we recommend exporting regularly.</p>
          </div>
        </section>

        <section className="mp-editorial-section">
          <h2>What&apos;s not allowed</h2>
          <div className="mp-editorial-copy">
            <p>Do not use Kaleenda to coordinate illegal activity. Do not reverse-engineer or scrape the service.</p>
            <p>Do not attempt to access other users&apos; calendars without their codes.</p>
          </div>
        </section>

        <section className="mp-editorial-section" style={{ paddingBottom: 40 }}>
          <h2>Changes</h2>
          <div className="mp-editorial-copy">
            <p>We will update these terms if needed. Continued use after changes means you accept them.</p>
            <p>We will keep this document human-readable.</p>
          </div>
        </section>

        <p className="mp-contact-row">Last updated: March 2026 · Questions? hello@kaleenda.app</p>
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

