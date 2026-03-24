import { CalendarTheme, CalendarEvent } from '@/types'
import './CalendarSidebar.css'

const themeOptions: Array<{ key: CalendarTheme; label: string; swatch: string }> = [
  { key: 'default',  label: 'Default',  swatch: '#3d6fff' },
  { key: 'dark',     label: 'Dark',     swatch: '#1a1916' },
  { key: 'pastel',   label: 'Pastel',   swatch: '#d4537e' },
  { key: 'sunset',   label: 'Sunset',   swatch: '#d85a30' },
  { key: 'forest',   label: 'Forest',   swatch: '#1d9e75' },
  { key: 'midnight', label: 'Midnight', swatch: '#1a2e42' },
]

const moodIcon: Record<string, string> = {
  chill:       '😌',
  panic:       '😰',
  celebration: '🎉',
  onfire:      '🔥',
  deadline:    '⏰',
  urgent:      '⚡',
  easy:        '✅',
  vibes:       '✨',
}

function formatEventDate(raw: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(raw + 'T00:00:00'))
  } catch {
    return raw
  }
}

type Props = {
  calendarTheme: CalendarTheme
  canPickTheme: boolean
  isOwner: boolean
  canWrite: boolean
  upcomingEvents: CalendarEvent[]
  updateTheme: (t: CalendarTheme) => Promise<void>
}

export function CalendarSidebar({
  calendarTheme,
  canPickTheme,
  isOwner,
  canWrite,
  upcomingEvents,
  updateTheme,
}: Props) {
  return (
    <div className="cs-panel atelier-sidebar-card">

      {/* ── Upcoming events (Glassy) ── */}
      <div className="cs-events-glass-section">
        <h3 className="cs-events-glass-label">Upcoming Events</h3>
        <div className="cs-events-glass-container">
          <ul className="cs-events-glass-list">
            {upcomingEvents.length === 0 ? (
              <li className="cs-events-empty">Nothing scheduled yet.</li>
            ) : (
              upcomingEvents.map((ev) => (
                <li key={ev.id} className="cs-event-glass-card group">
                  <div className="cs-event-glass-icon-box">
                    <span className="cs-event-glass-emoji" aria-hidden="true">
                      {moodIcon[ev.mood ?? ''] ?? '📅'}
                    </span>
                  </div>
                  <div className="cs-event-glass-info">
                    <span className="cs-event-glass-title">{ev.title}</span>
                    <span className="cs-event-glass-date">{formatEventDate(ev.event_date)}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>


      {/* ── Themes ── */}
      <section className="cs-section">
        <h3 className="cs-section-label">Personalization</h3>
        <div className="cs-theme-grid">
          {themeOptions.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`cs-theme-btn ${calendarTheme === t.key ? 'cs-theme-active' : ''}`}
              disabled={!canPickTheme}
              onClick={() => canPickTheme && void updateTheme(t.key)}
              title={t.label}
            >
              <span
                className="cs-theme-swatch"
                style={{ background: t.swatch }}
                aria-hidden="true"
              />
              <span className="cs-theme-label">{t.label}</span>
            </button>
          ))}
        </div>
        {!canPickTheme && (
          <p className="cs-tip">Write access needed to change themes.</p>
        )}
      </section>

      {/* ── Access + manage ── */}
      <section className="cs-section cs-section-bottom">
        <h3 className="cs-section-label">Your access</h3>
        <span className={`badge ${isOwner ? 'badge-owner' : canWrite ? 'badge-write' : 'badge-read'}`}>
          {isOwner ? '★ Owner' : canWrite ? '✏ Write' : '👁 View only'}
        </span>
      </section>

    </div>
  )
}
