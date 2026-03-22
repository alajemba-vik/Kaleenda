import { Link } from 'react-router-dom'
import { PlushieCharacter } from '../components/PlushieCharacter'
import '../styles/marketingPages.css'

export function AboutPage() {
  return (
	<div className="mp-page">
	  <header className="mp-nav">
		<div className="mp-nav-inner">
		  <Link to="/" className="mp-wordmark">Kaleenda</Link>
		  <nav className="mp-nav-links" aria-label="Marketing pages">
			<Link to="/about" className="active">Why Kaleenda</Link>
			<Link to="/how-it-works">How it works</Link>
			<Link to="/privacy">Privacy</Link>
			<Link to="/legal">Legal</Link>
		  </nav>
		  <Link to="/create" className="mp-nav-cta">Create a calendar →</Link>
		</div>
	  </header>

	  <main className="mp-main mp-content-feature">
		<section className="mp-hero">
		  <h1 className="mp-hero-title">We got tired of the group chat saying &quot;what time again?&quot;</h1>
		  <p className="mp-hero-sub">
			Kaleenda started as a weekend project to solve one thing: sharing a schedule without making everyone create an account.
		  </p>
		</section>

		<section className="mp-story-grid">
		  <div>
			<h2 className="mp-hero-title" style={{ fontSize: 32, textAlign: 'left' }}>The problem was always the same.</h2>
			<div className="mp-editorial-copy" style={{ marginTop: 14 }}>
			  <p>Every tool looked simple until you invited people.</p>
			  <p>Then someone had to sign up, someone had to download an app, and someone got blocked because they only had a personal email.</p>
			  <p>Group coordination became account administration. We wanted the opposite.</p>
			</div>
		  </div>
		  <div className="mp-story-visual">
			<div className="mp-warning-stack">
			  <div className="mp-warning-item">Sign up required to continue.</div>
			  <div className="mp-warning-item">Download app to view this calendar.</div>
			  <div className="mp-warning-item">Work email required for access.</div>
			</div>
		  </div>
		</section>

		<section className="mp-story-grid">
		  <div className="mp-story-visual">
			<div className="mp-code-flow">
			  <div className="mp-warning-item">Create calendar</div>
			  <span className="mp-code-pill write">WR-XXXX</span>
			  <span className="mp-code-pill read">RD-XXXX</span>
			  <div className="mp-warning-item">Share link in group chat</div>
			</div>
		  </div>
		  <div>
			<h2 className="mp-hero-title" style={{ fontSize: 32, textAlign: 'left' }}>So we built the simplest version possible.</h2>
			<div className="mp-editorial-copy" style={{ marginTop: 14 }}>
			  <p>Create once, share codes, and let people join instantly.</p>
			  <p>Write access for organizers. Read access for everyone else.</p>
			  <p>No login page standing in the way of real life plans.</p>
			</div>
		  </div>
		</section>

		<section className="mp-hero" style={{ paddingTop: 40, paddingBottom: 40 }}>
		  <h2 className="mp-hero-title" style={{ fontSize: 48 }}>One link. Everyone&apos;s in.</h2>
		  <p className="mp-hero-sub" style={{ maxWidth: 480 }}>
			No accounts. No downloads. No IT department required. Just a link and a code — and your whole group is synchronized.
		  </p>
		</section>

		<section className="mp-values">
		  <article className="mp-card">
			<h3 className="mp-value-title">Zero friction</h3>
			<p className="mp-value-copy">We removed every step that wasn&apos;t necessary.</p>
		  </article>
		  <article className="mp-card">
			<h3 className="mp-value-title">Yours, not ours</h3>
			<p className="mp-value-copy">No accounts means no data. We can&apos;t sell what we don&apos;t have.</p>
		  </article>
		  <article className="mp-card">
			<h3 className="mp-value-title">Personality matters</h3>
			<p className="mp-value-copy">A calendar should feel like it belongs to your group — not like a spreadsheet someone&apos;s tolerating.</p>
		  </article>
		</section>

		<section className="mp-dark-cta">
		  <h3>Built for the group chat. Not the board room.</h3>
		  <div className="mp-plushies" aria-hidden="true">
			<PlushieCharacter mood="chill" size={48} />
			<PlushieCharacter mood="celebration" size={48} />
			<PlushieCharacter mood="panic" size={48} />
		  </div>
		</section>
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

