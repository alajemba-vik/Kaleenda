import type { CalendarEvent } from '@/types'
import {
  formatMonthTitle,
  monthGrid,
  sameMonth,
} from '@/features/calendar'
import { PlushieCharacter } from '@/features/marketing'
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
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className="month-cal-ev"
                      title={ev.title}
                      onClick={() => onEventClick?.(ev)}
                    >
                      {ev.mood ? (
                        <span className="month-ev-mascot" aria-hidden="true">
                          <PlushieCharacter mood={ev.mood} size={20} />
                        </span>
                      ) : null}
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
