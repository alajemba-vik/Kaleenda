import { Link } from 'react-router-dom'

export function SiteHeader() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <Link to="/" className="lp-wordmark" aria-label="Kaleenda home">
          Kaleenda
        </Link>
        <div className="lp-nav-links">
          <Link to="/about" className="lp-nav-link">Why Kaleenda</Link>
          <Link to="/how-it-works" className="lp-nav-link">How it works</Link>
          <Link to="/contact" className="lp-nav-link">Contact</Link>
          <Link to="/create" className="mp-nav-cta">Create a calendar →</Link>
        </div>
      </div>
    </nav>
  )
}
