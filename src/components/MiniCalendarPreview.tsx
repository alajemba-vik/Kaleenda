import { useEffect, useState } from 'react'
import { monthGrid, sameMonth } from '../lib/calendarGrid'
import { PlushieCharacter } from './PlushieCharacter'
import type { CalendarTheme, Mood } from '../lib/types'
import './MiniCalendarPreview.css'

type DemoEvent = {
  day: number
  title: string
  mood: Mood
}

const DEMO_EVENTS: DemoEvent[] = [
  { day: 11, title: 'Big presentation', mood: 'panic' },
  { day: 15, title: 'Team dinner', mood: 'celebration' },
  { day: 20, title: 'Day off', mood: 'chill' },
  { day: 28, title: 'Project due', mood: 'deadline' },
]

const THEMES: CalendarTheme[] = ['default', 'forest', 'sunset', 'pastel']
const THEME_CYCLE_INTERVAL = 4000
const THEME_TRANSITION_DURATION = 300

type Props = {
  // Theme prop is now optional and managed internally
  theme?: CalendarTheme
}

export function MiniCalendarPreview({ theme: overrideTheme }: Props) {
  const anchor = new Date(2026, 2, 22) // March 22, 2026 (fixed demo date)
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentTheme = overrideTheme || THEMES[currentThemeIndex]

  useEffect(() => {
    if (overrideTheme) return // Don't auto-cycle if theme is overridden

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentThemeIndex((prev) => (prev + 1) % THEMES.length)
        setIsTransitioning(false)
      }, THEME_TRANSITION_DURATION / 2)
    }, THEME_CYCLE_INTERVAL)

    return () => clearInterval(timer)
  }, [overrideTheme])

  const weeks = monthGrid(anchor)
  const eventsByDay = new Map<number, DemoEvent[]>()

  for (const evt of DEMO_EVENTS) {
    const list = eventsByDay.get(evt.day) ?? []
    list.push(evt)
    eventsByDay.set(evt.day, list)
  }

  function formatMonthTitle(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
  }

  function dayKey(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function isToday(cell: Date): boolean {
    const today = new Date(2026, 2, 22)
    return (
      cell.getFullYear() === today.getFullYear() &&
      cell.getMonth() === today.getMonth() &&
      cell.getDate() === today.getDate()
    )
  }

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 32,
        gap: 16,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          pointerEvents: 'none',
          transform: 'scale(0.85)',
          transformOrigin: 'top center',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          opacity: isTransitioning ? 0.5 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <div className={`mini-cal-preview mini-cal-${currentTheme}`} data-theme={currentTheme}>
          <div className="mini-cal-header">
            <h3 className="mini-cal-title">{formatMonthTitle(anchor)}</h3>
            <p className="mini-cal-subtitle">See your events at a glance</p>
          </div>
          <div className="mini-cal-grid">
            {weekdays.map((d) => (
              <div key={d} className="mini-cal-dow">
                {d}
              </div>
            ))}
            {weeks.flatMap((week) =>
              week.map((cell) => {
                const inMonth = sameMonth(cell, anchor)
                const key = dayKey(cell)
                const evs = eventsByDay.get(cell.getDate()) ?? []

                return (
                  <div
                    key={key}
                    className={`mini-cal-cell ${inMonth ? 'in' : 'out'} ${isToday(cell) ? 'today' : ''}`}
                  >
                    <div className="mini-cal-daynum">{cell.getDate()}</div>
                    {evs.map((ev, i) => (
                      <div
                        key={i}
                        className="mini-cal-event"
                        style={{
                          animation: `mini-bounce 0.6s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      >
                        <PlushieCharacter mood={ev.mood} size={18} />
                      </div>
                    ))}
                  </div>
                )
              }),
            )}
          </div>
        </div>
      </div>

      {/* Theme indicator dots */}
      {!overrideTheme && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {THEMES.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor:
                  i === currentThemeIndex ? 'var(--text-primary)' : 'var(--text-tertiary)',
                opacity: i === currentThemeIndex ? 1 : 0.4,
                transition: 'all 0.3s ease-out',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  )
}
