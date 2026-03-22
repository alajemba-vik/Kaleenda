import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { MiniCalendarPreview } from '../components/MiniCalendarPreview'
import { ComparisonSection } from '../components/ComparisonSection'
import { PlushieCharacter } from '../components/PlushieCharacter'
import './HomePage.css'

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#EF9F27" aria-hidden="true">
      <path d="M7 1l1.5 4h4.5l-3.5 2.5 1.5 4L7 9 3 11.5l1.5-4L1 5h4.5z" />
    </svg>
  )
}

type Step = {
  title: string
  description: string
}

const steps: Step[] = [
  { title: 'Create', description: 'Name your calendar. Takes 10 seconds.' },
  { title: 'Share', description: 'Send the code. One link, two access levels.' },
  { title: "Everyone's in", description: 'No app. No login. Just open. The calendar, live.' },
]

export function HomePage() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const animateCounter = (el: HTMLElement) => {
      if (el.dataset.counted === 'true') return

      const target = Number(el.dataset.countTo ?? '0')
      const suffix = el.dataset.countSuffix ?? ''

      if (prefersReducedMotion) {
        el.textContent = `${target}${suffix}`
        el.dataset.counted = 'true'
        return
      }

      const duration = 900
      const start = performance.now()

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const value = Math.round(target * eased)
        el.textContent = `${value}${suffix}`

        if (progress < 1) {
          requestAnimationFrame(tick)
        } else {
          el.dataset.counted = 'true'
        }
      }

      requestAnimationFrame(tick)
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>('.section-animate'))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            entry.target
              .querySelectorAll<HTMLElement>('[data-count-to]')
              .forEach((counter) => animateCounter(counter))
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1 },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-page">
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-wordmark" aria-label="Kaleenda home">
            Kaleenda
          </Link>
          <div className="lp-nav-links">
            <Link to="/about" className="lp-nav-link">Why Kaleenda</Link>
            <Link to="/how-it-works" className="lp-nav-link">How it works</Link>
            <Link to="/privacy" className="lp-nav-link">Privacy</Link>
            <Link to="/legal" className="lp-nav-link">Legal</Link>
            <Link to="/create" className="mp-nav-cta">Create a calendar →</Link>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <div className="hero-pill">✦ No account needed · Free forever</div>
          <h1 className="hero-headline">One link.<br />Everyone&apos;s in.</h1>
          <p className="hero-subtitle">Share a code. Everyone&apos;s in. No app, no account required.</p>
          <div className="hero-buttons">
            <Link className="hero-btn-primary" to="/create">Create a calendar</Link>
            <Link className="hero-btn-ghost" to="/join">Join with a code</Link>
          </div>
          <div className="hero-social">
            <div className="hero-stars" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} />
              ))}
            </div>
            <span>
              Loved by <strong className="hero-social-strong">271 groups</strong> this week
            </span>
          </div>
        </div>

        <div className="demo-calendar-wrapper">
          <MiniCalendarPreview />
        </div>
      </header>

      <section className="statement-section section-animate">
        <h2 className="statement-title stagger" style={{ '--i': 0 } as CSSProperties}>
          No account.<br />
          No app.<br />
          No friction.
        </h2>
        <div className="statement-rule stagger" style={{ '--i': 1 } as CSSProperties} />
        <p className="statement-sub stagger" style={{ '--i': 2 } as CSSProperties}>
          Just a link and a code. Everyone&apos;s in.
        </p>
      </section>

      <section className="section-shell bg section-animate">
        <div className="section-inner">
          <p className="section-label stagger" style={{ '--i': 0 } as CSSProperties}>HOW IT WORKS</p>
          <h2 className="section-title stagger" style={{ '--i': 1 } as CSSProperties}>Up and running in 30 seconds</h2>

          <div className="how-grid">
            {steps.map((step, idx) => (
              <article className="how-step stagger" style={{ '--i': idx + 2 } as CSSProperties} key={step.title}>
                <div className="how-number">{idx + 1}</div>
                <div className="how-mock" aria-hidden="true">
                  {idx === 0 ? (
                    <svg viewBox="0 0 240 180" width="100%" height="100%">
                      <rect x="26" y="24" width="188" height="132" rx="16" fill="#f7f6f2" stroke="rgba(0,0,0,0.08)" />
                      <rect x="50" y="56" width="140" height="34" rx="17" fill="#1A1916" />
                      <text x="120" y="78" textAnchor="middle" fontSize="12" fill="#fff">Create a calendar</text>
                    </svg>
                  ) : null}
                  {idx === 1 ? (
                    <svg viewBox="0 0 240 180" width="100%" height="100%">
                      <rect x="32" y="26" width="176" height="128" rx="16" fill="#fff" stroke="rgba(0,0,0,0.08)" />
                      <rect x="54" y="52" width="132" height="30" rx="8" fill="#eef2ff" />
                      <text x="120" y="72" textAnchor="middle" fontSize="12" fill="#3D6FFF">WRITE: 7KPX</text>
                      <rect x="54" y="90" width="132" height="30" rx="8" fill="#f3f1ec" />
                      <text x="120" y="110" textAnchor="middle" fontSize="12" fill="#6B6860">READ: 2BQM</text>
                    </svg>
                  ) : null}
                  {idx === 2 ? (
                    <svg viewBox="0 0 240 180" width="100%" height="100%">
                      <rect x="24" y="24" width="192" height="132" rx="16" fill="#fff" stroke="rgba(0,0,0,0.08)" />
                      <g stroke="rgba(0,0,0,0.08)">
                        <line x1="24" y1="64" x2="216" y2="64" />
                        <line x1="24" y1="96" x2="216" y2="96" />
                        <line x1="24" y1="128" x2="216" y2="128" />
                        <line x1="72" y1="24" x2="72" y2="156" />
                        <line x1="120" y1="24" x2="120" y2="156" />
                        <line x1="168" y1="24" x2="168" y2="156" />
                      </g>
                      <circle cx="94" cy="84" r="8" fill="#1D9E75" />
                      <circle cx="142" cy="116" r="8" fill="#D4537E" />
                    </svg>
                  ) : null}
                </div>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.description}</p>
                {idx < 2 ? (
                  <svg className="how-arc" viewBox="0 0 80 40" aria-hidden="true">
                    <path d="M0,20 Q40,0 80,20" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1.5" strokeDasharray="4 3" />
                  </svg>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell surface section-animate">
        <div className="section-inner">
          <div className="bento">
            <article className="bento-left stagger" style={{ '--i': 0 } as CSSProperties}>
              <h3>Your calendar, alive.</h3>
              <p>Keep your whole group in sync with playful, living events.</p>
              <MiniCalendarPreview theme="default" />
            </article>

            <article className="bento-right-top stagger" style={{ '--i': 1 } as CSSProperties}>
              <h3>Two access levels.</h3>
              <div className="access-row"><span>✎ Write access</span><span>Can add and edit</span></div>
              <div className="access-row"><span>◉ Read access</span><span>View-only for everyone else</span></div>
            </article>

            <article className="bento-right-bottom stagger" style={{ '--i': 2 } as CSSProperties}>
              <h3>Live presence.</h3>
              <p className="how-desc">See who is in the calendar right now.</p>
              <div className="presence-avatars" aria-hidden="true">
                <span>AL</span><span>JM</span><span>SK</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section-shell bg section-animate">
        <div className="section-inner">
          <p className="section-label stagger" style={{ '--i': 0 } as CSSProperties}>WHO IT&apos;S FOR</p>
          <h2 className="section-title stagger" style={{ '--i': 1 } as CSSProperties}>Built for your kind of group.</h2>

          <div className="use-grid">
            <article className="use-card stagger" style={{ '--i': 2 } as CSSProperties}>
              <div className="use-stripe" style={{ background: 'var(--pink)' }} />
              <div className="use-card-body">
                <h3 className="use-card-title">Weddings</h3>
                <p className="use-card-copy">From engagement to the big day</p>
              </div>
              <div className="use-card-plushie"><PlushieCharacter mood="celebration" size={32} /></div>
            </article>

            <article className="use-card stagger" style={{ '--i': 3 } as CSSProperties}>
              <div className="use-stripe" style={{ background: 'var(--blue)' }} />
              <div className="use-card-body">
                <h3 className="use-card-title">Students</h3>
                <p className="use-card-copy">Never miss an exam again</p>
              </div>
              <div className="use-card-plushie"><PlushieCharacter mood="panic" size={32} /></div>
            </article>

            <article className="use-card stagger" style={{ '--i': 4 } as CSSProperties}>
              <div className="use-stripe" style={{ background: 'var(--green)' }} />
              <div className="use-card-body">
                <h3 className="use-card-title">Teams</h3>
                <p className="use-card-copy">Fixtures, training, socials</p>
              </div>
              <div className="use-card-plushie"><PlushieCharacter mood="chill" size={32} /></div>
            </article>
          </div>
        </div>
      </section>

      <section className="section-shell surface section-animate">
        <div className="stagger" style={{ '--i': 0 } as CSSProperties}>
          <ComparisonSection />
        </div>
      </section>

      <section className="section-shell dark section-animate">
        <div className="section-inner stats-dark">
          <div className="stats-dark-item stagger" style={{ '--i': 0 } as CSSProperties}>
            <p className="stats-dark-metric">
              <span data-count-to="0" data-count-suffix="">0</span>
            </p>
            <h3 className="stats-dark-title">Accounts required</h3>
            <p className="stats-dark-copy">The only calendar anyone can join.</p>
          </div>
          <div className="stats-dark-item stagger" style={{ '--i': 1 } as CSSProperties}>
            <p className="stats-dark-metric">
              <span data-count-to="2" data-count-suffix="">0</span>
            </p>
            <h3 className="stats-dark-title">Access levels</h3>
            <p className="stats-dark-copy">Write or read — you decide.</p>
          </div>
          <div className="stats-dark-item stagger" style={{ '--i': 2 } as CSSProperties}>
            <p className="stats-dark-metric">
              <span data-count-to="100" data-count-suffix="%">0%</span>
            </p>
            <h3 className="stats-dark-title">Browser-ready</h3>
            <p className="stats-dark-copy">Any device. Just a link.</p>
          </div>
        </div>
      </section>

      <section className="section-shell bg section-animate">
        <div className="section-inner">
          <h2 className="section-title stagger" style={{ '--i': 0 } as CSSProperties}>What groups are saying</h2>
          <div className="testimonials-grid">
            <article className="t-card stagger" style={{ '--i': 1 } as CSSProperties}>
              <div className="t-plushie"><PlushieCharacter mood="chill" size={24} /></div>
              <q>Our football team finally stopped using WhatsApp for fixtures.</q>
              <div className="t-by">— Jamie, Team Coach</div>
            </article>
            <article className="t-card stagger" style={{ '--i': 2 } as CSSProperties}>
              <div className="t-plushie"><PlushieCharacter mood="celebration" size={24} /></div>
              <q>Zero setup, everyone can see dates instantly. Exactly what we needed.</q>
              <div className="t-by">— Alex, Event Organizer</div>
            </article>
            <article className="t-card stagger" style={{ '--i': 3 } as CSSProperties}>
              <div className="t-plushie"><PlushieCharacter mood="vibes" size={24} /></div>
              <q>The plushies make calendar updates actually fun.</q>
              <div className="t-by">— Casey, Product Designer</div>
            </article>
          </div>
        </div>
      </section>

      <section className="final-cta section-animate">
        <div className="final-inner">
          <div className="final-left">
            <div className="final-pill">Free forever · No account needed</div>
            <h2 className="final-title">Your group needs<br />a calendar.</h2>
            <p className="final-sub">No apps to download. No accounts to create.<br />Ready in 10 seconds.</p>
            <div className="final-buttons">
              <Link className="hero-btn-primary" to="/create">Create a calendar</Link>
              <Link className="hero-btn-ghost" to="/join">Join with a code</Link>
            </div>
          </div>

          <div className="final-plushie cta-plushie-1" aria-hidden="true"><PlushieCharacter mood="panic" size={80} /></div>
          <div className="final-plushie cta-plushie-2" aria-hidden="true"><PlushieCharacter mood="celebration" size={80} /></div>
          <div className="final-plushie cta-plushie-3" aria-hidden="true"><PlushieCharacter mood="love" size={80} /></div>
        </div>
      </section>

      <footer className="giant-footer">
        <div className="footer-wordmark">Kaleenda</div>
        <div className="footer-bottom">
          <div>No account needed. No tracking. Just shared calendars.</div>
          <nav className="footer-bottom-links" aria-label="Footer links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/legal">Legal</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
