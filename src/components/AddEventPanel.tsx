import { useState } from 'react'
import '../styles/ui.css'
import './AddEventPanel.css'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (payload: {
    title: string
    event_date: string
    start_time: string
    end_time: string | null
    note: string | null
  }) => Promise<void>
}

export function AddEventPanel({ open, onClose, onSave }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!open) return null

  return (
    <div className="add-panel-backdrop" aria-hidden={false} onClick={onClose}>
      <div
        className="add-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-event-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row" style={{ marginBottom: 8 }}>
          <div id="add-event-title" className="add-panel-title" style={{ marginBottom: 0 }}>
            Add event
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
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
          <label className="sr-only" htmlFor="ev-title">
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
          <div className="add-panel-row">
            <div>
              <label className="sr-only" htmlFor="ev-date">
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
              <label className="sr-only" htmlFor="ev-start">
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
          <label className="sr-only" htmlFor="ev-end">
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
          <label className="sr-only" htmlFor="ev-note">
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
          <div className="row" style={{ marginTop: 4 }}>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save event'}
            </button>
            <button
              type="button"
              className="btn-secondary btn"
              onClick={() => onClose()}
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
