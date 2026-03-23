import { PlushieCharacter } from '@/features/marketing'
import { MarketingLayout } from '@/components/MarketingLayout'

const premiumMoodKeys = ['love', 'hyperspeed', 'melting', 'glitch', 'hype', 'ghost', 'zen', 'chaos'] as const

export function HowItWorksPage() {
  return (
    <MarketingLayout>

      <main className="mp-main mp-content-feature">
        <section className="mp-hero">
          <p className="mp-kicker">How it works</p>
          <h1 className="mp-hero-title">Up and running in 30 seconds.</h1>
          <p className="mp-hero-sub">No tutorial needed. No IT support required.</p>
        </section>

        <section className="mp-how-step">
          <div className="mp-step-copy">
            <div className="mp-step-watermark">01</div>
            <h3>Name your calendar.</h3>
            <p>Give it a name. Football team, June wedding, Spring exams. Takes 10 seconds.</p>
          </div>
          <div className="mp-step-visual">
            <div className="mp-warning-stack">
              <div className="mp-warning-item">Football team schedule</div>
              <div className="mp-code-pill write" style={{ width: 'fit-content' }}>Create calendar</div>
            </div>
            <div style={{ position: 'absolute', right: 8, bottom: 8 }}>
              <PlushieCharacter mood="chill" size={72} />
            </div>
          </div>
        </section>

        <section className="mp-how-step flip">
          <div className="mp-step-copy">
            <div className="mp-step-watermark">02</div>
            <h3>Share a code. Anyone's in.</h3>
            <p>One code for people who add events. Another for people who just need to see them. No accounts. No admin. No friction.</p>
          </div>
          <div className="mp-step-visual">
            <div className="mp-warning-stack">
              <span className="mp-code-pill write">WR-XXXX</span>
              <span className="mp-code-pill read">RD-XXXX</span>
            </div>
            <div style={{ position: 'absolute', left: 8, top: 8 }}>
              <PlushieCharacter mood="celebration" size={64} />
            </div>
          </div>
        </section>

        <section className="mp-how-step">
          <div className="mp-step-copy">
            <div className="mp-step-watermark">03</div>
            <h3>Open the link, enter the code.</h3>
            <p>No app to download. No account to create. Works on any device, any browser.</p>
          </div>
          <div className="mp-step-visual">
            <div className="mp-mini-cal">
              <div className="mp-mini-cell">11<PlushieCharacter mood="chill" size={24} /></div>
              <div className="mp-mini-cell">15<PlushieCharacter mood="celebration" size={24} /></div>
              <div className="mp-mini-cell">20<PlushieCharacter mood="panic" size={24} /></div>
              <div className="mp-mini-cell">28<PlushieCharacter mood="deadline" size={24} /></div>
            </div>
            <div style={{ position: 'absolute', right: 6, bottom: 6 }}>
              <PlushieCharacter mood="panic" size={72} />
            </div>
          </div>
        </section>

        <section className="mp-hero" style={{ paddingBottom: 40 }}>
          <h2 className="mp-hero-title" style={{ fontSize: 48 }}>Access levels</h2>
        </section>

        <section className="mp-access-grid" style={{ paddingBottom: 70 }}>
          <article className="mp-access-card">
            <span className="mp-access-badge write">✏ Write access</span>
            <h3 className="mp-value-title">Add, edit, delete.</h3>
            <p className="mp-value-copy">For the people actually organizing things — the coach, the maid of honor, the group trip planner.</p>
          </article>
          <article className="mp-access-card">
            <span className="mp-access-badge read">👁 View only</span>
            <h3 className="mp-value-title">Stay in the loop.</h3>
            <p className="mp-value-copy">For everyone else — they can see everything, change nothing, miss nothing.</p>
          </article>
        </section>

        <section className="mp-hero" style={{ paddingTop: 30, paddingBottom: 40 }}>
          <h2 className="mp-hero-title" style={{ fontSize: 48 }}>16 characters. Each one reacts.</h2>
        </section>

        <section className="mp-moods-grid" style={{ paddingBottom: 90 }}>
          {['chill', 'panic', 'celebration', 'onfire', 'deadline', 'easy', 'urgent', 'vibes'].map((mood) => (
            <div key={mood} className="mp-mood-card">
              <PlushieCharacter mood={mood} size={36} />
            </div>
          ))}
          {premiumMoodKeys.map((mood) => (
            <div key={mood} className="mp-mood-card dim">
              <PlushieCharacter mood={mood} size={36} />
            </div>
          ))}
        </section>
      </main>

    </MarketingLayout>
  )
}

