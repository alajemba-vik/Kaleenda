import { Link } from 'react-router-dom'
import { MiniCalendarPreview } from '../components/MiniCalendarPreview'
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
            style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.03em', fontWeight: 400, marginBottom: 16, maxWidth: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            Shared calendars, no accounts.
          </h1>
          <p className="page-sub" style={{ fontSize: 18, maxWidth: 620 }}>
            Create a group calendar. Share a code. Anyone joins instantly.
          </p>

          {/* Use-case pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            <span style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 99, padding: '6px 14px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💍</span> Planning a wedding
            </span>
            <span style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 99, padding: '6px 14px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📚</span> Surviving exam season
            </span>
            <span style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 99, padding: '6px 14px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚽</span> Organising a team
            </span>
            <span style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 99, padding: '6px 14px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✈️</span> Going on a trip
            </span>
          </div>

          <div className="small-actions" style={{ gap: 12 }}>
            <Link className="btn" to="/create" style={{ minWidth: 196 }}>
              Create a calendar
            </Link>
            <Link className="btn btn-secondary" to="/join" style={{ minWidth: 196 }}>
              Join with a code
            </Link>
          </div>

          {/* Social proof */}
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 24 }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>271 calendars</span> created this week
          </p>

          {/* Mini calendar preview */}
          <MiniCalendarPreview />

          {/* Testimonials */}
          <div className="landing-testimonials">
            <div className="testimonial">
              <p className="testimonial-text">"Our football team finally stopped using WhatsApp for fixtures."</p>
              <p className="testimonial-author">— Jamie, Team Coach</p>
            </div>
            <div className="testimonial">
              <p className="testimonial-text">"Zero setup, everyone can see the dates instantly. Exactly what we needed."</p>
              <p className="testimonial-author">— Alex, Event Organizer</p>
            </div>
            <div className="testimonial">
              <p className="testimonial-text">"The plushies make calendar updates actually fun."</p>
              <p className="testimonial-author">— Casey, Product Designer</p>
            </div>
          </div>
        </main>

        <footer className="fade-stage delay-2" style={{ paddingTop: 80 }}>
        </footer>
      </div>
    </div>
  )
}
