import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { MiniCalendarPreview } from '@/features/marketing'
import { ComparisonSection } from '@/features/marketing'
import { PlushieCharacter } from '@/features/marketing'
import { useSiteConfig } from '@/lib/useSiteConfig'
import './HomePage.css'

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#EF9F27" aria-hidden="true">
      <path d="M7 1l1.5 4h4.5l-3.5 2.5 1.5 4L7 9 3 11.5l1.5-4L1 5h4.5z" />
    </svg>
  )
}


export function HomePage() {
  const weeklyUsers = useSiteConfig('weekly_users', '271')
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
      <SiteHeader />

      <header className="hero">
        <div className="hero-content">
          <div className="hero-pill">✦ No account needed · Free forever</div>
          <h1 className="hero-headline">Your group needs<br /><i>a calendar.</i></h1>
          <p className="hero-subtitle">Share a code. Everyone&apos;s in. No app, no account required.</p>
          <div className="hero-buttons">
            <Link className="hero-btn-primary" to="/create">Create a calendar</Link>
            <Link className="hero-btn-ghost" to="/join">Join with a code</Link>
          </div>
        </div>

        <div className="demo-calendar-wrapper">
          <MiniCalendarPreview />
        </div>
      </header>

      <section className="social-proof-banner">
        <div className="social-proof-inner">
          <div className="social-proof-stars" aria-hidden="true">
            {[...Array(5)].map((_, i) => <Star key={i} />)}
          </div>
          <p className="social-proof-text">
            <strong className="social-proof-count">{weeklyUsers}</strong>{' '}
            used Kaleenda this week
          </p>
        </div>
      </section>

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
          <h2 className="section-title stagger" style={{ '--i': 1 } as CSSProperties}>Set up in under 30 seconds</h2>

          <div className="how-grid">

            {/* ── Step 1: Create ─────────────────────────────── */}
            <article className="how-step stagger" style={{ '--i': 2 } as CSSProperties}>
              <div className="how-number">1</div>
              <div className="how-mock how-mock-create" aria-hidden="true">
                <div className="how-mock-inner">
                  <div className="how-mock-label">Name your calendar</div>
                  <div className="how-mock-input-row">
                    <div className="how-mock-input">
                      <span>Summer trip 2026</span>
                      <span className="how-mock-cursor" />
                    </div>
                  </div>
                  <div className="how-mock-btn">
                    <span>✦</span> Create calendar
                  </div>
                  <div className="how-mock-hint">No account needed · free</div>
                </div>
              </div>
              <h3 className="how-title">Create</h3>
              <p className="how-desc">Name your calendar. That's it — ready in 10 seconds, no sign-up required.</p>
              <svg className="how-arc" viewBox="0 0 80 40" aria-hidden="true">
                <path d="M0,20 Q40,0 80,20" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1.5" strokeDasharray="4 3" />
              </svg>
            </article>

            {/* ── Step 2: Share ──────────────────────────────── */}
            <article className="how-step stagger" style={{ '--i': 3 } as CSSProperties}>
              <div className="how-number">2</div>
              <div className="how-mock how-mock-share" aria-hidden="true">
                <div className="how-mock-inner">
                  <div className="how-mock-label">Share the code</div>
                  <div className="how-share-codes">
                    <div className="how-share-pill how-share-write">
                      <span className="how-share-access">✎ Write</span>
                      <span className="how-share-code">7KPX</span>
                    </div>
                    <div className="how-share-pill how-share-read">
                      <span className="how-share-access">◉ Read</span>
                      <span className="how-share-code">2BQM</span>
                    </div>
                  </div>
                  <div className="how-share-bubble">
                    <span>🔗</span> Hey team — join our calendar: <strong>7KPX</strong>
                  </div>
                  <div className="how-mock-hint">You decide who can edit</div>
                </div>
              </div>
              <h3 className="how-title">Share</h3>
              <p className="how-desc">Send the code. Choose write or read access. One link, everyone's set.</p>
              <svg className="how-arc" viewBox="0 0 80 40" aria-hidden="true">
                <path d="M0,20 Q40,0 80,20" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1.5" strokeDasharray="4 3" />
              </svg>
            </article>

            {/* ── Step 3: Everyone's in ──────────────────────── */}
            <article className="how-step stagger" style={{ '--i': 4 } as CSSProperties}>
              <div className="how-number">3</div>
              <div className="how-mock how-mock-live" aria-hidden="true">
                <div className="how-mock-inner">
                  {/* Presence bar */}
                  <div className="how-live-presence">
                    <div className="how-live-avatars">
                      <span style={{ background: '#3d6fff' }}>AL</span>
                      <span style={{ background: '#1d9e75' }}>JM</span>
                      <span style={{ background: '#d4537e' }}>SK</span>
                      <span style={{ background: '#ef9f27' }}>+4</span>
                    </div>
                    <span className="how-live-badge">● Live now</span>
                  </div>
                  {/* Mini calendar strip */}
                  <div className="how-live-strip">
                    {[
                      { day: 11, mood: 'celebration' as const, label: 'Launch' },
                      { day: 15, mood: 'chill' as const, label: 'Day off' },
                      { day: 20, mood: 'panic' as const, label: 'Deadline' },
                      { day: 28, mood: 'onfire' as const, label: 'Final sprint' },
                    ].map((ev) => (
                      <div key={ev.day} className="how-live-event">
                        <div className="how-live-day">{ev.day}</div>
                        <PlushieCharacter mood={ev.mood} size={22} />
                        <div className="how-live-evname">{ev.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="how-mock-hint">No app · no login · just a link</div>
                </div>
              </div>
              <h3 className="how-title">Everyone's in</h3>
              <p className="how-desc">Open the link. The calendar appears — live events, mood plushies, real-time presence. Zero friction.</p>
            </article>

          </div>
        </div>
      </section>

      <section className="section-shell surface section-animate">
        <div className="section-inner">
          <div className="bento">
            <article className="bento-left stagger" style={{ '--i': 0 } as CSSProperties}>
              <h3>Your calendar, alive.</h3>
              <p>Keep your whole group in sync with playful, living events.</p>
              <MiniCalendarPreview />
            </article>

            <article className="bento-right-top stagger" style={{ '--i': 1 } as CSSProperties}>
              <h3>Three access levels.</h3>
              <div className="access-row"><span>👑 Owner access</span><span>Full control</span></div>
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
                <h3 className="use-card-title">💍 Weddings</h3>
                <p className="use-card-copy">Keep the whole crew — couple, planners, guests — on the same page from engagement to the honeymoon. Share a read code, they'll never miss a thing.</p>
                <div className="use-card-tags">
                  <span className="use-tag">Venue bookings</span>
                  <span className="use-tag">Rehearsal dinner</span>
                  <span className="use-tag">The big day</span>
                </div>
              </div>
              <div className="use-card-plushie"><PlushieCharacter mood="celebration" size={36} /></div>
            </article>

            <article className="use-card stagger" style={{ '--i': 3 } as CSSProperties}>
              <div className="use-stripe" style={{ background: 'var(--blue)' }} />
              <div className="use-card-body">
                <h3 className="use-card-title">📚 Students</h3>
                <p className="use-card-copy">Deadlines, exams, group project meetings — all in one place. No app to install, no account to make. Open the link, enter the code, you're in.</p>
                <div className="use-card-tags">
                  <span className="use-tag">Exam dates</span>
                  <span className="use-tag">Submission deadlines</span>
                  <span className="use-tag">Study sessions</span>
                </div>
              </div>
              <div className="use-card-plushie"><PlushieCharacter mood="deadline" size={36} /></div>
            </article>

            <article className="use-card stagger" style={{ '--i': 4 } as CSSProperties}>
              <div className="use-stripe" style={{ background: 'var(--green)' }} />
              <div className="use-card-body">
                <h3 className="use-card-title">⚽ Sports teams</h3>
                <p className="use-card-copy">Fixtures, training, socials — all in one calendar your whole squad can see. Coaches write. Players read. Nobody misses kick-off again.</p>
                <div className="use-card-tags">
                  <span className="use-tag">Match fixtures</span>
                  <span className="use-tag">Training sessions</span>
                  <span className="use-tag">Team socials</span>
                </div>
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
              <span data-count-to="3" data-count-suffix="">0</span>
            </p>
            <h3 className="stats-dark-title">Access levels</h3>
            <p className="stats-dark-copy">Owner, write, or read — you decide.</p>
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
              <img className="t-avatar-img" src="/testimonial-jamie.jpg" alt="Jamie, Team Coach" />
              <q>Our football team finally stopped using WhatsApp for fixtures.</q>
              <div className="t-by">— Jamie, Team Coach</div>
            </article>
            <article className="t-card stagger" style={{ '--i': 2 } as CSSProperties}>
              <img className="t-avatar-img" src="/testimonial-alex.jpg" alt="Alex, Event Organizer" />
              <q>Zero setup, everyone can see dates instantly. Exactly what we needed.</q>
              <div className="t-by">— Alex, Event Organizer</div>
            </article>
            <article className="t-card stagger" style={{ '--i': 3 } as CSSProperties}>
              <img className="t-avatar-img" src="/testimonial-casey.jpg" alt="Casey, Product Designer" />
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

    </div>
  )
}
