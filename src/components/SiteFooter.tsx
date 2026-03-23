import { Link } from 'react-router-dom'
import '@/styles/marketingPages.css'

export function SiteFooter() {
  return (
    <footer className="mp-footer">
      <div className="mp-footer-wordmark" aria-hidden="true">
        Kaleenda
      </div>
      <nav className="mp-footer-links" aria-label="Footer links">
        <Link to="/about">Why Kaleenda</Link>
        <Link to="/how-it-works">How it works</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/legal">Legal</Link>
      </nav>
      <p className="mp-footer-note">No account needed. No tracking. Just shared calendars.</p>
    </footer>
  )
}
