import { Link, NavLink } from 'react-router-dom'

export function SiteHeader() {
  const navClass = ({ isActive }: { isActive: boolean }) => `lp-nav-link ${isActive ? 'active' : ''}`

  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <Link to="/" className="lp-wordmark" aria-label="Kaleenda home">
          Kaleenda
        </Link>
        <div className="lp-nav-links">
          <NavLink to="/about" className={navClass}>Why Kaleenda</NavLink>
          <NavLink to="/how-it-works" className={navClass}>How it works</NavLink>
          <NavLink to="/contact" className={navClass}>Contact</NavLink>
          <Link to="/create" className="mp-nav-cta">Create a calendar →</Link>
        </div>
      </div>
    </nav>
  )
}
