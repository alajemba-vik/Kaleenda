import { useEffect, useState } from 'react'
import '../styles/ui.css'
import './AddEventPanel.css'

type Props = {
  open: boolean
  onClose: () => void
  initialCreatorName?: string
  onCreatorNameChange?: (name: string) => void
  onSave: (payload: {
    title: string
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
            className="btn-ghost"
            onClick={requestClose}
            disabled={busy}
            aria-label="Close add event dialog"
          >
            Close
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
                event_date,
                start_time: start_time.length === 5 ? `${start_time}:00` : start_time,
                end_time: end_raw ? (end_raw.length === 5 ? `${end_raw}:00` : end_raw) : null,
                note: note_raw || null,
                creator_name: creator_raw,
              })
              formEl.reset()
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
          <label className="add-label" htmlFor="ev-creator">
            Your name
          </label>
          <input
            id="ev-creator"
            name="creator_name"
            className="field"
            placeholder="What's your name? (optional)"
            defaultValue={initialCreatorName ?? ''}
            onChange={(e) => onCreatorNameChange?.(e.currentTarget.value)}
            disabled={busy}
          />
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
