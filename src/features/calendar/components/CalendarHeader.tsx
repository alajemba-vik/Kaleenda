import { CSSProperties, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarTheme, AccessLevel } from '@/types'
import { initials } from '@/lib/utils'

type Viewer = {
  key: string
  name: string
  access: AccessLevel
}

const themeOptions: Array<{ key: CalendarTheme; label: string; swatch: string }> = [
  { key: 'default', label: 'Default', swatch: '#3d6fff' },
  { key: 'dark', label: 'Dark', swatch: '#2c2c2a' },
  { key: 'pastel', label: 'Pastel', swatch: '#d4537e' },
  { key: 'sunset', label: 'Sunset', swatch: '#d85a30' },
  { key: 'forest', label: 'Forest', swatch: '#1d9e75' },
  { key: 'midnight', label: 'Midnight', swatch: '#1a2e42' },
]

type Props = {
  metaName: string | null
  monthLabel: string
  viewers: Viewer[]
  canPickTheme: boolean
  calendarTheme: CalendarTheme
  updateTheme: (t: CalendarTheme) => Promise<void>
  onShare: () => void
  shareBusy: boolean
}

export function CalendarHeader({
  metaName,
  monthLabel,
  viewers,
  canPickTheme,
  calendarTheme,
  updateTheme,
  onShare,
  shareBusy,
}: Props) {
  const [themeOpen, setThemeOpen] = useState(false)
  const [themeBusy, setThemeBusy] = useState(false)

  async function handleThemeSelect(t: CalendarTheme) {
    if (themeBusy) return
    setThemeBusy(true)
    try {
      await updateTheme(t)
      setThemeOpen(false)
    } finally {
      setThemeBusy(false)
    }
  }

  return (
    <header className="atelier-cal-header fade-stage">
      <div>
        <div className="cal-home-row">
          <Link to="/" className="cal-app-logo" aria-label="Kaleenda home">Kaleenda</Link>
        </div>
        <h1 className="atelier-cal-title">{metaName ?? 'Calendar'}</h1>
        <p className="atelier-cal-month">{monthLabel}</p>
      </div>

      <div className="atelier-header-right">
        <div className="atelier-presence-pill" aria-label="Live presence">
          <span className="atelier-presence-label">Live Presence</span>
          <div className="presence-list" aria-label="Presence">
            {viewers.slice(0, 5).map((v, idx) => (
              <span key={v.key} className="presence-avatar" title={`${v.name} (${v.access})`}>
                {initials(v.name)}
                <span className={`presence-dot ${idx < 3 ? 'online' : 'away'}`} aria-hidden="true" />
              </span>
            ))}
            {viewers.length > 5 ? <span className="presence-more">+{viewers.length - 5}</span> : null}
          </div>
        </div>

        <div className="atelier-header-actions">
          {canPickTheme ? (
            <div className="theme-popover-wrap">
              <button
                type="button"
                className="btn-ghost theme-trigger"
                onClick={() => setThemeOpen((v) => !v)}
                aria-label="Choose calendar theme"
              >
                Theme
              </button>
              {themeOpen ? (
                <div className="theme-popover">
                  {themeOptions.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`theme-swatch ${calendarTheme === t.key ? 'active' : ''}`}
                      title={t.label}
                      disabled={themeBusy}
                      onClick={() => void handleThemeSelect(t.key)}
                      style={{ '--swatch': t.swatch } as CSSProperties}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            className="atelier-share-btn"
            onClick={onShare}
            disabled={shareBusy}
          >
            ↗ Share
          </button>
        </div>
      </div>
    </header>
  )
}
