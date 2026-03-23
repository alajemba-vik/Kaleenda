import { useEffect, useState } from 'react'
import { FREE_MOODS, PREMIUM_MOODS } from '@/features/marketing/components/PlushieCharacter'
import type { Mood } from '@/types'
import '@/styles/ui.css'
import './AddEventPanel.css'

function moodSvg(mood: Mood, locked = false) {
  const commonProps = {
    viewBox: '0 0 64 64',
    width: 32,
    height: 32,
    'aria-hidden': true,
    style: locked ? { opacity: 0.42 } : undefined,
  } as const

  if (mood === 'chill') {
    return (
      <svg {...commonProps}>
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

  if (mood === 'panic') {
    return (
      <svg {...commonProps}>
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

  if (mood === 'celebration') {
    return (
      <svg {...commonProps}>
        <polygon points="32,6 38,22 56,22 42,32 48,50 32,40 16,50 22,32 8,22 26,22" fill="#EF9F27" />
        <circle cx="26" cy="28" r="3" fill="#412402" />
        <circle cx="38" cy="28" r="3" fill="#412402" />
        <path d="M27 34 Q32 39 37 34" stroke="#412402" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (mood === 'onfire') {
    return (
      <svg {...commonProps}>
        <ellipse cx="32" cy="40" rx="18" ry="16" fill="#D85A30" />
        <path d="M32 8 Q36 18 44 14 Q40 24 48 22 Q42 32 46 36 Q38 30 32 56 Q26 30 18 36 Q22 32 16 22 Q24 24 20 14 Q28 18 32 8Z" fill="#EF9F27" opacity="0.9" />
        <circle cx="26" cy="40" r="3" fill="#4A1B0C" />
        <circle cx="38" cy="40" r="3" fill="#4A1B0C" />
        <path d="M27 46 Q32 50 37 46" stroke="#4A1B0C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (mood === 'deadline') {
    return (
      <svg {...commonProps}>
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

  if (mood === 'easy') {
    return (
      <svg {...commonProps}>
        <circle cx="32" cy="36" r="18" fill="#888780" />
        <ellipse cx="16" cy="26" rx="10" ry="9" fill="#888780" />
        <ellipse cx="48" cy="26" rx="10" ry="9" fill="#888780" />
        <ellipse cx="16" cy="26" rx="7" ry="6" fill="#B4B2A9" />
        <ellipse cx="48" cy="26" rx="7" ry="6" fill="#B4B2A9" />
        <ellipse cx="32" cy="40" rx="9" ry="6" fill="#B4B2A9" />
        <path d="M22 34 Q25 32 28 34" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M36 34 Q39 32 42 34" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (mood === 'urgent') {
    return (
      <svg {...commonProps}>
        <polygon points="14,28 20,10 26,28" fill="#D4537E" />
        <polygon points="38,28 44,10 50,28" fill="#D4537E" />
        <circle cx="32" cy="36" r="20" fill="#D4537E" />
        <circle cx="26" cy="34" r="4" fill="#4B1528" />
        <circle cx="38" cy="34" r="4" fill="#4B1528" />
        <path d="M28 40 Q32 43 36 40" stroke="#4B1528" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <ellipse cx="32" cy="40" rx="16" ry="14" fill="#EF9F27" />
      <circle cx="32" cy="22" r="12" fill="#EF9F27" />
      <ellipse cx="40" cy="24" rx="7" ry="4" fill="#D85A30" />
      <circle cx="26" cy="20" r="3.5" fill="#412402" />
      <path d="M20 44 Q32 52 44 44" stroke="#1D9E75" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const LOCKED_MOOD_VARIANTS: Mood[] = ['chill', 'panic', 'celebration', 'onfire', 'deadline', 'easy', 'urgent', 'vibes']

type Props = {
  open: boolean
  onClose: () => void
  initialCreatorName?: string
  onCreatorNameChange?: (name: string) => void
  onSave: (payload: {
    title: string
    mood: Mood
    event_date: string
    start_time: string
    end_time: string | null
    note: string | null
    creator_name: string
  }) => Promise<void>
}

export function AddEventPanel({ open, onClose, initialCreatorName, onCreatorNameChange, onSave }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)
  const [mood, setMood] = useState<Mood>('chill')

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
      return
    }
    if (!rendered) return
    setClosing(true)
    const t = window.setTimeout(() => {
      setRendered(false)
      setClosing(false)
    }, 280)
    return () => window.clearTimeout(t)
  }, [open, rendered])

  useEffect(() => {
    if (!rendered) return
    document.body.classList.add('add-event-modal-open')
    return () => {
      document.body.classList.remove('add-event-modal-open')
    }
  }, [rendered])

  function requestClose() {
    setClosing(true)
    window.setTimeout(() => {
      onClose()
    }, 280)
  }

  if (!rendered) return null

  return (
    <div className={`add-panel-backdrop ${closing ? 'closing' : 'open'}`} aria-hidden={false} onClick={requestClose}>
      <div
        className="add-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-event-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-panel-handle" aria-hidden="true" />
        <div className="add-panel-head">
          <div id="add-event-title" className="add-panel-title">
            Add event
          </div>
          <button
            type="button"
            className="add-close-btn"
            onClick={requestClose}
            disabled={busy}
            aria-label="Close add event dialog"
          >
            ×
          </button>
        </div>
        {err ? <p className="error-text">{err}</p> : null}
        <form
          className="add-panel-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setErr(null)
            const formEl = e.currentTarget
            const fd = new FormData(formEl)
            const title = String(fd.get('title') ?? '').trim()
            const event_date = String(fd.get('event_date') ?? '')
            const start_time = String(fd.get('start_time') ?? '')
            const end_raw = String(fd.get('end_time') ?? '').trim()
            const note_raw = String(fd.get('note') ?? '').trim()
            const creator_raw = String(fd.get('creator_name') ?? '').trim()

            if (!title) {
              setErr('Title is required')
              return
            }
            setBusy(true)
            try {
              await onSave({
                title,
                mood,
                event_date,
                start_time: start_time.length === 5 ? `${start_time}:00` : start_time,
                end_time: end_raw ? (end_raw.length === 5 ? `${end_raw}:00` : end_raw) : null,
                note: note_raw || null,
                creator_name: creator_raw,
              })
              formEl.reset()
              setMood('chill')
              onClose()
            } catch (er) {
              setErr(er instanceof Error ? er.message : 'Could not save')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="add-label" htmlFor="ev-title">
            Event title
          </label>
          <input
            id="ev-title"
            name="title"
            className="field"
            placeholder="Event title (required)"
            required
            disabled={busy}
          />
          <div className="add-vibe-wrap">
            <div className="add-label">Vibe</div>
            <div className="add-mood-scroll" role="listbox" aria-label="Select event vibe">
              <div className="add-mood-row">
                {FREE_MOODS.map((m) => {
                  const selected = mood === m.key
                  return (
                    <button
                      key={m.key}
                      type="button"
                      className={`add-mood-card ${selected ? 'selected' : ''}`}
                      onClick={() => setMood(m.key)}
                      aria-selected={selected}
                    >
                      <div className="add-mood-icon">{moodSvg(m.key)}</div>
                      <div className="add-mood-name">{m.label}</div>
                    </button>
                  )
                })}
              </div>
              <div className="add-mood-row">
                {PREMIUM_MOODS.map((m, idx) => {
                  const lockedVariant = LOCKED_MOOD_VARIANTS[idx % LOCKED_MOOD_VARIANTS.length]
                  return (
                    <button
                      key={m.key}
                      type="button"
                      className="add-mood-card locked"
                      disabled
                      aria-disabled="true"
                    >
                      <span className="add-premium-lock" aria-hidden="true">🔒</span>
                      <div className="add-mood-icon">{moodSvg(lockedVariant, true)}</div>
                      <div className="add-mood-name">{m.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <label className="add-label" htmlFor="ev-creator">
            Your name (optional)
          </label>
          <input
            id="ev-creator"
            name="creator_name"
            className="field add-creator-input"
            placeholder="Anonymous — or type your name"
            defaultValue={initialCreatorName ?? ''}
            onChange={(e) => onCreatorNameChange?.(e.currentTarget.value)}
            disabled={busy}
          />
          <p className="add-help-text">If left blank, you&apos;ll be given a fun anonymous name.</p>
          <div className="add-panel-row">
            <div>
              <label className="add-label" htmlFor="ev-date">
                Date
              </label>
              <input
                id="ev-date"
                name="event_date"
                className="field"
                type="date"
                required
                disabled={busy}
              />
            </div>
            <div>
              <label className="add-label" htmlFor="ev-start">
                Start time
              </label>
              <input
                id="ev-start"
                name="start_time"
                className="field"
                type="time"
                required
                disabled={busy}
              />
            </div>
          </div>
          <label className="add-label" htmlFor="ev-end">
            End time
          </label>
          <input
            id="ev-end"
            name="end_time"
            className="field"
            type="time"
            placeholder="End time (optional)"
            disabled={busy}
          />
          <label className="add-label" htmlFor="ev-note">
            Note
          </label>
          <textarea
            id="ev-note"
            name="note"
            className="field"
            rows={3}
            placeholder="Note (optional)"
            disabled={busy}
          />
          <div className="row add-panel-actions">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save event'}
            </button>
            <button
              type="button"
              className="btn-secondary btn"
              onClick={requestClose}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
