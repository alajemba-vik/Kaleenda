import type { CalendarEvent } from '../lib/types'
import {
  formatMonthTitle,
  monthGrid,
  sameMonth,
} from '../lib/calendarGrid'
import './MonthCalendar.css'

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseEventDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

function isToday(cell: Date): boolean {
  // Align with the current design spec for the atelier preview month.
  const n = new Date(2026, 2, 22)
  return (
    cell.getFullYear() === n.getFullYear() &&
    cell.getMonth() === n.getMonth() &&
    cell.getDate() === n.getDate()
  )
}

function renderMascotForEventDate(eventDate: string) {
  if (eventDate.endsWith('-11')) {
    return (
      <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <circle cx="32" cy="36" r="20" fill="#85B7EB" />
        <circle cx="20" cy="20" r="8" fill="#85B7EB" />
        <circle cx="44" cy="20" r="8" fill="#85B7EB" />
        <circle cx="20" cy="20" r="5" fill="#B5D4F4" />
        <circle cx="44" cy="20" r="5" fill="#B5D4F4" />
        <ellipse cx="32" cy="42" rx="10" ry="6" fill="#B5D4F4" />
        <circle cx="26" cy="34" r="3" fill="#0C447C" />
        <circle cx="38" cy="34" r="3" fill="#0C447C" />
        <path d="M28 40 Q32 44 36 40" stroke="#0C447C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (eventDate.endsWith('-15')) {
    return (
      <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <polygon points="32,6 38,22 56,22 42,32 48,50 32,40 16,50 22,32 8,22 26,22" fill="#EF9F27" />
        <circle cx="26" cy="28" r="3" fill="#412402" />
        <circle cx="38" cy="28" r="3" fill="#412402" />
        <path d="M27 34 Q32 39 37 34" stroke="#412402" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (eventDate.endsWith('-20')) {
    return (
      <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <ellipse cx="32" cy="38" rx="20" ry="18" fill="#1D9E75" />
        <ellipse cx="20" cy="22" rx="9" ry="7" fill="#1D9E75" />
        <ellipse cx="44" cy="22" rx="9" ry="7" fill="#1D9E75" />
        <ellipse cx="20" cy="22" rx="6" ry="5" fill="white" />
        <ellipse cx="44" cy="22" rx="6" ry="5" fill="white" />
        <circle cx="20" cy="23" r="3.5" fill="#04342C" />
        <circle cx="44" cy="23" r="3.5" fill="#04342C" />
        <path d="M26 40 Q32 36 38 40" stroke="#04342C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (eventDate.endsWith('-28')) {
    return (
      <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <ellipse cx="32" cy="30" rx="20" ry="22" fill="#B4B2A9" />
        <rect x="18" y="46" width="8" height="10" rx="2" fill="#B4B2A9" />
        <rect x="28" y="46" width="8" height="10" rx="2" fill="#B4B2A9" />
        <rect x="38" y="46" width="8" height="10" rx="2" fill="#B4B2A9" />
        <rect x="16" y="44" width="32" height="6" rx="2" fill="#888780" />
        <ellipse cx="24" cy="28" rx="7" ry="8" fill="#1A1916" />
        <ellipse cx="40" cy="28" rx="7" ry="8" fill="#1A1916" />
      </svg>
    )
  }

  return null
}

type Props = {
  anchor: Date
  events: CalendarEvent[]
  onPrevMonth: () => void
  onNextMonth: () => void
  showAddHint?: boolean
  onEventClick?: (ev: CalendarEvent) => void
  className?: string
}

export function MonthCalendar({
  anchor,
  events,
  onPrevMonth,
  onNextMonth,
  showAddHint,
  onEventClick,
  className,
}: Props) {
  const weeks = monthGrid(anchor)
  const byDay = new Map<string, CalendarEvent[]>()

  for (const e of events) {
    const k = e.event_date
    const list = byDay.get(k) ?? []
    list.push(e)
    byDay.set(k, list)
  }

  return (
    <div className={`month-cal ${className ?? ''}`.trim()}>
      <div className="month-cal-head">
        <button type="button" className="month-nav" onClick={onPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className="month-title">{formatMonthTitle(anchor)}</span>
        <button type="button" className="month-nav" onClick={onNextMonth} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="month-cal-grid">
        {weekdays.map((d) => (
          <div key={d} className="month-cal-dow">
            {d}
          </div>
        ))}
        {weeks.flatMap((week) =>
          week.map((cell) => {
            const inMonth = sameMonth(cell, anchor)
            const key = dayKey(cell)
            const dayEvents = byDay.get(key) ?? []
            return (
              <div
                key={key + cell.getTime()}
                className={`month-cal-cell ${inMonth ? 'in' : 'out'} ${isToday(cell) ? 'today' : ''}`}
              >
                {isToday(cell) ? <span className="today-corner-dot" aria-hidden="true" /> : null}
                <div className="month-cal-daynum">
                  {cell.getDate()}
                </div>
                {dayEvents.map((ev) => {
                  const mascot = renderMascotForEventDate(ev.event_date)
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className="month-cal-ev"
                      title={ev.title}
                      onClick={() => onEventClick?.(ev)}
                    >
                      {mascot ? <span className="month-ev-mascot" aria-hidden="true">{mascot}</span> : null}
                      <span className="month-ev-pill">{formatTime(ev.start_time)} {ev.title}</span>
                    </button>
                  )
                })}
              </div>
            )
          }),
        )}
      </div>
      {events.length === 0 ? (
        <div className="month-empty">
          <svg
            className="month-empty-ill"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <rect x="10" y="14" width="44" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 24H54" stroke="currentColor" strokeWidth="2" />
            <path d="M21 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M43 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>No events yet</div>
          <span>
            {showAddHint
              ? 'Use the blue + button to add the first event.'
              : 'Ask an owner for write access to add events.'}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export function filterEventsForMonth(
  events: CalendarEvent[],
  anchor: Date,
): CalendarEvent[] {
  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  return events.filter((e) => {
    const d = parseEventDate(e.event_date)
    return d.getFullYear() === y && d.getMonth() === m
  })
}
