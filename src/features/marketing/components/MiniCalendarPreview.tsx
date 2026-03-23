import { useEffect, useRef, useState } from 'react'
import { monthGrid, sameMonth } from '@/features/calendar'
import { PlushieCharacter } from './PlushieCharacter'
import type { Mood } from '@/types'
import './MiniCalendarPreview.css'

type DemoEvent = {
  day: number
  title: string
  mood: Mood
}

type Slide = {
  theme: string
  accentColor: string
  accentLight: string
  bgColor: string
  label: string
  icon: string
  events: DemoEvent[]
}

const SLIDES: Slide[] = [
  {
    theme: 'default',
    accentColor: '#3d6fff',
    accentLight: 'rgba(61,111,255,0.12)',
    bgColor: '#ffffff',
    label: 'Work sprints',
    icon: '🚀',
    events: [
      { day: 3, title: 'Sprint kick-off', mood: 'onfire' },
      { day: 11, title: 'Design review', mood: 'chill' },
      { day: 20, title: 'Launch day!', mood: 'celebration' },
      { day: 28, title: 'Retro', mood: 'easy' },
    ],
  },
  {
    theme: 'sunset',
    accentColor: '#d85a30',
    accentLight: 'rgba(216,90,48,0.12)',
    bgColor: '#fffbf8',
    label: 'Wedding planning',
    icon: '💍',
    events: [
      { day: 5, title: 'Venue visit', mood: 'celebration' },
      { day: 12, title: 'Cake tasting', mood: 'chill' },
      { day: 19, title: 'Rehearsal', mood: 'panic' },
      { day: 26, title: 'The big day', mood: 'celebration' },
    ],
  },
  {
    theme: 'forest',
    accentColor: '#1d9e75',
    accentLight: 'rgba(29,158,117,0.12)',
    bgColor: '#f4fdf9',
    label: 'Sports team',
    icon: '⚽',
    events: [
      { day: 6, title: 'Practice', mood: 'easy' },
      { day: 13, title: 'Cup match', mood: 'onfire' },
      { day: 20, title: 'Team dinner', mood: 'celebration' },
      { day: 27, title: 'Finals!', mood: 'panic' },
    ],
  },
  {
    theme: 'pastel',
    accentColor: '#d4537e',
    accentLight: 'rgba(212,83,126,0.12)',
    bgColor: '#fff5f8',
    label: 'Student life',
    icon: '📚',
    events: [
      { day: 4, title: 'Study group', mood: 'chill' },
      { day: 14, title: 'Exam!', mood: 'deadline' },
      { day: 21, title: 'Assignment due', mood: 'urgent' },
      { day: 28, title: 'Results day', mood: 'celebration' },
    ],
  },
]

const CYCLE_INTERVAL = 3800
const FADE_DURATION = 350

const ANCHOR = new Date(2026, 2, 1) // March 2026

function formatMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isToday(cell: Date): boolean {
  return cell.getDate() === 22 && cell.getMonth() === 2 && cell.getFullYear() === 2026
}

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function MiniCalendarPreview() {
  const weeks = monthGrid(ANCHOR)
  const [slideIndex, setSlideIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const nextIndex = useRef(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setSlideIndex(nextIndex.current)
        nextIndex.current = (nextIndex.current + 1) % SLIDES.length
        setIsFading(false)
      }, FADE_DURATION)
    }, CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  function goTo(i: number) {
    if (i === slideIndex) return
    setIsFading(true)
    setTimeout(() => {
      setSlideIndex(i)
      nextIndex.current = (i + 1) % SLIDES.length
      setIsFading(false)
    }, FADE_DURATION)
  }

  const slide = SLIDES[slideIndex]

  const eventsByDay = new Map<number, DemoEvent[]>()
  for (const evt of slide.events) {
    eventsByDay.set(evt.day, [evt])
  }

  return (
    <div className="mini-preview-root">
      {/* Calendar card */}
      <div
        className="mini-preview-card"
        style={{
          opacity: isFading ? 0 : 1,
          transform: isFading ? 'translateY(8px) scale(0.98)' : 'translateY(0) scale(1)',
          '--slide-accent': slide.accentColor,
          '--slide-accent-light': slide.accentLight,
          '--slide-bg': slide.bgColor,
        } as React.CSSProperties}
      >
        {/* Header bar */}
        <div className="mini-preview-header" style={{ borderBottomColor: slide.accentLight }}>
          <div className="mini-preview-header-left">
            <span className="mini-preview-icon">{slide.icon}</span>
            <span className="mini-preview-month">{formatMonthTitle(ANCHOR)}</span>
          </div>
          <div className="mini-preview-label-pill" style={{
            background: slide.accentLight,
            color: slide.accentColor,
          }}>
            {slide.label}
          </div>
        </div>

        {/* Grid */}
        <div className={`mini-cal-preview mini-cal-${slide.theme}`} data-theme={slide.theme}>
          <div className="mini-cal-grid">
            {weekdays.map((d) => (
              <div key={d} className="mini-cal-dow">{d}</div>
            ))}
            {weeks.flatMap((week) =>
              week.map((cell) => {
                const inMonth = sameMonth(cell, ANCHOR)
                const key = dayKey(cell)
                const ev = inMonth ? (eventsByDay.get(cell.getDate()) ?? [])[0] : undefined

                return (
                  <div
                    key={key}
                    className={`mini-cal-cell ${inMonth ? 'in' : 'out'} ${isToday(cell) ? 'today' : ''}`}
                    style={isToday(cell) ? {
                      background: slide.accentLight,
                      borderColor: slide.accentColor,
                    } : undefined}
                  >
                    <div className="mini-cal-daynum">{cell.getDate()}</div>
                    {ev && (
                      <div
                        className="mini-cal-event"
                        title={ev.title}
                        style={{ animation: `mini-bounce 2.4s ease-in-out infinite` }}
                      >
                        <PlushieCharacter mood={ev.mood} size={26} />
                      </div>
                    )}
                  </div>
                )
              }),
            )}
          </div>
        </div>

        {/* Event list legend at bottom of card */}
        <div className="mini-preview-events">
          {slide.events.map((ev) => (
            <div key={ev.day} className="mini-preview-ev-row">
              <span
                className="mini-preview-ev-dot"
                style={{ background: slide.accentColor }}
              />
              <span className="mini-preview-ev-day">
                {String(ev.day).padStart(2, '0')} Mar
              </span>
              <span className="mini-preview-ev-title">{ev.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slide indicator dots */}
      <div className="mini-preview-dots" aria-label="Calendar examples">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${s.label}`}
            className={`mini-preview-dot ${i === slideIndex ? 'active' : ''}`}
            style={{ '--dot-color': s.accentColor } as React.CSSProperties}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
