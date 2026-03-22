import { Link } from 'react-router-dom'
import '../styles/ui.css'
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="layout site-footer-inner">
        <p className="site-footer-tagline">No account needed. No tracking. Just shared calendars.</p>
        <nav className="site-footer-links" aria-label="Footer links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/legal">Legal</Link>
        </nav>
      </div>
    </footer>
  )
}
