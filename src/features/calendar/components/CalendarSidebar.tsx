import { CalendarTheme, CalendarEvent } from '@/types'

const themeOptions: Array<{ key: CalendarTheme; label: string; swatch: string }> = [
  { key: 'default', label: 'Default', swatch: '#3d6fff' },
  { key: 'dark', label: 'Dark', swatch: '#2c2c2a' },
  { key: 'pastel', label: 'Pastel', swatch: '#d4537e' },
  { key: 'sunset', label: 'Sunset', swatch: '#d85a30' },
  { key: 'forest', label: 'Forest', swatch: '#1d9e75' },
  { key: 'midnight', label: 'Midnight', swatch: '#1a2e42' },
]

type Props = {
  calendarTheme: CalendarTheme
  canPickTheme: boolean
  isOwner: boolean
  canWrite: boolean
  accessLabel: string
  upcomingEvents: CalendarEvent[]
  updateTheme: (t: CalendarTheme) => Promise<void>
  onManageCodes: () => void
}

export function CalendarSidebar({
  calendarTheme,
  canPickTheme,
  isOwner,
  canWrite,
  accessLabel,
  upcomingEvents,
  updateTheme,
  onManageCodes,
}: Props) {
  return (
    <aside className="atelier-sidebar-card">
      <div>
        <h3 className="atelier-section-title">Personalization</h3>
        <div className="atelier-theme-grid">
          {themeOptions.slice(0, 4).map((t) => (
            <button
              key={t.key}
              type="button"
              className={`atelier-theme-chip ${calendarTheme === t.key ? 'active' : ''}`}
              disabled={!canPickTheme}
              onClick={() => (canPickTheme ? void updateTheme(t.key) : undefined)}
            >
              <span className="atelier-chip-swatch" style={{ background: t.swatch }} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="atelier-upcoming-block">
        <h3 className="atelier-section-title">Upcoming</h3>
        <ul className="atelier-upcoming-list">
          {upcomingEvents.length === 0 ? (
            <li className="atelier-upcoming-empty">No events this month yet.</li>
          ) : (
            upcomingEvents.map((ev) => (
              <li key={ev.id} className="atelier-upcoming-item">
                <span className="atelier-upcoming-title">{ev.title}</span>
                <span className="atelier-upcoming-date">{ev.event_date}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="atelier-side-actions">
        <span className={`badge ${isOwner ? 'badge-owner' : canWrite ? 'badge-write' : 'badge-read'}`}>
          {accessLabel}
        </span>
        {isOwner ? (
          <button type="button" className="btn-ghost" onClick={onManageCodes}>
            Manage codes
          </button>
        ) : null}
      </div>
    </aside>
  )
}
