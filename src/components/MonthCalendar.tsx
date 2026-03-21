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

type Props = {
  anchor: Date
  events: CalendarEvent[]
  onPrevMonth: () => void
  onNextMonth: () => void
  showAddHint?: boolean
  onAddEvent?: () => void
}

export function MonthCalendar({
  anchor,
  events,
  onPrevMonth,
  onNextMonth,
  showAddHint,
  onAddEvent,
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
    <div className="month-cal">
      <div className="month-cal-head">
        <button type="button" className="month-nav" onClick={onPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className="month-title">{formatMonthTitle(anchor)}</span>
        <button type="button" className="month-nav" onClick={onNextMonth} aria-label="Next month">
          ›
        </button>
        {showAddHint ? (
          <button
            type="button"
            className="month-add-hint month-add-btn"
            onClick={onAddEvent}
            aria-label="Add event"
          >
            + Add event
          </button>
        ) : (
          <span className="month-add-hint muted" />
        )}
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
                className={`month-cal-cell ${inMonth ? 'in' : 'out'}`}
              >
                <div className="month-cal-daynum">{cell.getDate()}</div>
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="month-cal-ev" title={ev.title}>
                    {formatTime(ev.start_time)} {ev.title}
                  </div>
                ))}
              </div>
            )
          }),
        )}
      </div>
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
