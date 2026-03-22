import type { CalendarEvent } from '../lib/types'
import '../styles/ui.css'
import './EventDetailModal.css'

type Props = {
  open: boolean
  event: CalendarEvent | null
  canDelete: boolean
  busy?: boolean
  onClose: () => void
  onDelete?: (ev: CalendarEvent) => Promise<void>
}

function formatDateLabel(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeLabel(t: string | null): string {
  if (!t) return 'N/A'
  return t.slice(0, 5)
}

export function EventDetailModal({ open, event, canDelete, busy, onClose, onDelete }: Props) {
  if (!open || !event) return null

  return (
    <div className="event-detail-backdrop" role="presentation" onClick={onClose}>
      <div
        className="event-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="event-detail-head">
          <h2 id="event-detail-title" className="page-title event-detail-title">
            {event.title}
          </h2>
          <button type="button" className="mc-x" onClick={onClose} aria-label="Close event details">
            ×
          </button>
        </div>

        <div className="event-detail-grid">
          <div>
            <div className="kicker">Date</div>
            <p>{formatDateLabel(event.event_date)}</p>
          </div>
          <div>
            <div className="kicker">Time</div>
            <p>
              {formatTimeLabel(event.start_time)}
              {event.end_time ? ` - ${formatTimeLabel(event.end_time)}` : ''}
            </p>
          </div>
          <div>
            <div className="kicker">Added by</div>
            <p>{event.creator_name || 'Anonymous'}</p>
          </div>
        </div>

        {event.note ? (
          <div>
            <div className="kicker">Note</div>
            <p className="event-detail-note">{event.note}</p>
          </div>
        ) : null}

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          {canDelete && onDelete ? (
            <button
              type="button"
              className="btn event-delete-btn"
              disabled={busy}
              onClick={() => void onDelete(event)}
            >
              {busy ? 'Deleting…' : 'Delete event'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

