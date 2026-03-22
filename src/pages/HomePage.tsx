import { Link } from 'react-router-dom'
import { MiniCalendarPreview } from '../components/MiniCalendarPreview'
import { HowItWorks } from '../components/HowItWorks'
import { ComparisonSection } from '../components/ComparisonSection'
import { StatsBar } from '../components/StatsBar'
import { FinalCTA } from '../components/FinalCTA'
import '../styles/ui.css'

export function HomePage() {
  return (
    <>
      {/* Section 1: Hero */}
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
          </main>
        </div>
      </div>

      {/* Section 2: How It Works */}
      <HowItWorks />

      {/* Section 3: Who It's For - Using the use-case pills as reference */}
      <section style={{ background: 'var(--surface)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center', color: 'var(--text-primary)', margin: '0 0 64px' }}>
            Who it's for
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            <div style={{ padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>💍</div>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px' }}>Weddings</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>From engagement to the big day</p>
            </div>
            <div style={{ padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>📚</div>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px' }}>Students</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>Never miss an exam again</p>
            </div>
            <div style={{ padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>⚽</div>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px' }}>Teams</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>Fixtures, training, socials</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Comparison */}
      <ComparisonSection />

      {/* Section 5: Stats Bar */}
      <StatsBar />

      {/* Section 6: Testimonials */}
      <section style={{ background: 'var(--surface)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center', color: 'var(--text-primary)', margin: '0 0 64px' }}>
            Loved by groups everywhere
          </h2>
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
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <FinalCTA />

    </>
  )
}
