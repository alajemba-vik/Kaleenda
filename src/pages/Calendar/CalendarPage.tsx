import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCalendarSession } from '@/features/calendar'
import { useCalendarSync } from '@/features/calendar'
import { AddEventPanel } from '@/features/calendar'
import { CalendarHeader } from '@/features/calendar'
import { CalendarSidebar } from '@/features/calendar'
import { CodeEntry } from '@/features/calendar'
import { EventDetailModal } from '@/features/calendar'
import { ManageCodesModal } from '@/features/calendar'
import { PwaInstallBanner } from '@/components/PwaInstallBanner'
import { filterEventsForMonth, MonthCalendar } from '@/features/calendar'
import { WelcomeCodes } from '@/features/calendar'
import { addMonths } from '@/features/calendar'
import { randomAnonymousName } from '@/lib/anonymousName'
import { usePwaPrompt } from '@/lib/usePwaPrompt'
import { clearStoredSession, writeCreatorName, writeStoredSession } from '@/lib/storage'
import type { AccessLevel, CalendarEvent, CalendarTheme } from '@/types'
import '@/styles/ui.css'
import './CalendarPage.css'

const themeNameByKey: Record<CalendarTheme, string> = {
  default: 'Default',
  dark: 'Dark',
  pastel: 'Pastel',
  forest: 'Forest',
  midnight: 'Midnight',
  sunset: 'Sunset',
}

type CreateNavState = {
  fromCreate?: boolean
  createdAt?: string
  calendarName?: string
  writeCode?: string
  readCode?: string
  ownerCode?: string
  ownerSessionToken?: string
}

function mergeById(prev: CalendarEvent[], row: CalendarEvent): CalendarEvent[] {
  const i = prev.findIndex((e) => e.id === row.id)
  if (i === -1) return [...prev, row].sort((a, b) => a.event_date.localeCompare(b.event_date))
  const next = [...prev]
  next[i] = row
  return next.sort((a, b) => a.event_date.localeCompare(b.event_date))
}

function sanitizeFilePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'calendar'
}

export function CalendarPage() {
  const { calendarId: calendarIdParam } = useParams()
  const calendarId = calendarIdParam ?? ''
  const location = useLocation()
  const nav = useNavigate()

  const createState = location.state as CreateNavState | null
  const fromCreateNav = !!(createState?.fromCreate && createState?.ownerSessionToken)

  const {
    phase,
    setPhase,
    metaName,
    sessionToken,
    accessLevel,
    jwt,
    calendarUuid,
    events,
    setEvents,
    calendarTheme,
    setCalendarTheme,
    anon,
    authClient,
    establishSession,
  } = useCalendarSession(calendarId, fromCreateNav)

  const { viewers, creatorName, setCreatorName } = useCalendarSync(
    authClient,
    calendarUuid,
    jwt,
    calendarId,
    sessionToken,
    accessLevel,
    setEvents,
    setCalendarTheme
  )

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [anchor, setAnchor] = useState(() => new Date())
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeBusy, setCodeBusy] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)
  const [themeBusy, setThemeBusy] = useState(false)
  const shareCardRef = useRef<HTMLDivElement | null>(null)
  const [firstEventAdded, setFirstEventAdded] = useState(false)

  const { showPrompt, deferredPrompt, triggerPrompt, handleInstall, handleDismiss } = usePwaPrompt()

  const shareUrl = useMemo(
    () => `${window.location.origin}/cal/${encodeURIComponent(calendarId)}`,
    [calendarId],
  )

  const canWrite = accessLevel === 'owner' || accessLevel === 'write'
  const isOwner = accessLevel === 'owner'
  const canPickTheme = canWrite
  const accessLabel = isOwner ? 'Owner' : accessLevel === 'write' ? 'Write' : 'View only'

  async function deleteCalendar() {
    if (!authClient || !calendarUuid) return
    const ok = window.confirm('Delete this calendar permanently? This removes all events for everyone.')
    if (!ok) return
    const { error } = await authClient.from('calendars').delete().eq('id', calendarUuid)
    if (error) throw new Error(error.message)
    clearStoredSession(calendarId)
    nav('/', { replace: true })
  }

  async function deleteEvent(ev: CalendarEvent) {
    if (!authClient) return
    setDeletingEvent(true)
    try {
      const { error } = await authClient.from('events').delete().eq('id', ev.id)
      if (error) throw new Error(error.message)
      setSelectedEvent(null)
    } finally {
      setDeletingEvent(false)
    }
  }

  async function onJoinCode(code: string) {
    setCodeError(null)
    setCodeBusy(true)
    try {
      const { data, error } = await anon.rpc('join_calendar', {
        p_public_id: calendarId,
        p_code: code,
      })
      if (error) throw error
      const j = data as {
        calendar_id: string
        access_level: AccessLevel
        session_token: string
      }
      if (rememberDevice) {
        writeStoredSession(calendarId, j.session_token, j.access_level)
      }
      await establishSession(j.session_token, j.access_level)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid code'
      setCodeError(msg.includes('Invalid') || msg.includes('not found') ? 'Invalid code' : msg)
    } finally {
      setCodeBusy(false)
    }
  }

  async function onWelcomeContinue() {
    const token = createState?.ownerSessionToken
    if (!token) {
      setPhase('code')
      nav('.', { replace: true, state: {} })
      return
    }
    try {
      await establishSession(token, 'owner')
      nav('.', { replace: true, state: {} })
    } catch {
      setPhase('code')
    }
  }

  const monthEvents = useMemo(
    () => filterEventsForMonth(events, anchor),
    [events, anchor],
  )
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(anchor),
    [anchor],
  )
  const upcomingEvents = useMemo(() => monthEvents.slice(0, 2), [monthEvents])

  async function updateTheme(theme: CalendarTheme) {
    if (!authClient || !calendarUuid || !canPickTheme || themeBusy) return
    setThemeBusy(true)
    try {
      const { error } = await authClient.from('calendars').update({ theme }).eq('id', calendarUuid)
      if (error) throw new Error(error.message)
      setCalendarTheme(theme)
    } finally {
      setThemeBusy(false)
    }
  }

  async function downloadMonthShareCard() {
    if (!shareCardRef.current || shareBusy) return
    setShareBusy(true)
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#ffffff',
        scale: Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `kaleenda-${sanitizeFilePart(metaName ?? 'calendar')}-${sanitizeFilePart(String(anchor.getMonth() + 1))}-month.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setShareBusy(false)
    }
  }

  if (phase === 'boot' || phase === 'welcome') {
    return (
      <div className="layout">
        {phase === 'boot' ? (
          <div className="surface-card" style={{ maxWidth: 560 }}>
            <p className="kicker">Preparing</p>
            <h1 className="page-title">Checking access…</h1>
            <p className="page-sub">Hang on while we verify this link.</p>
          </div>
        ) : null}
        {phase === 'welcome' && createState?.writeCode && createState.readCode ? (
          <WelcomeCodes
            calendarId={calendarId}
            calendarName={metaName ?? createState.calendarName ?? 'Calendar'}
            createdAt={createState.createdAt}
            writeCode={createState.writeCode}
            readCode={createState.readCode}
            ownerCode={createState.ownerCode ?? ''}
            shareUrl={shareUrl}
            onContinue={() => void onWelcomeContinue()}
          />
        ) : null}
      </div>
    )
  }

  if (phase === 'notfound') {
    return (
      <div className="layout">
        <div className="surface-card" style={{ maxWidth: 560 }}>
          <p className="kicker">Not Found</p>
          <h1 className="page-title">Calendar not found</h1>
          <p className="page-sub">This link may be wrong, expired, or the calendar was removed.</p>
          <Link className="btn" to="/">
            Go home
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'code') {
    return (
      <div className="layout">
        <div className="row top-nav">
          <Link to="/" className="link-btn">
            ← Home
          </Link>
        </div>
        <CodeEntry
          calendarName={metaName ?? 'this calendar'}
          error={codeError}
          busy={codeBusy}
          remember={rememberDevice}
          onRememberChange={setRememberDevice}
          onSubmit={(c) => void onJoinCode(c)}
        />
      </div>
    )
  }

  return (
    <div className="layout calendar-theme-root atelier-cal" data-theme={calendarTheme}>
      <CalendarHeader
        metaName={metaName}
        monthLabel={monthLabel}
        viewers={viewers}
        canPickTheme={canPickTheme}
        calendarTheme={calendarTheme}
        updateTheme={updateTheme}
        onShare={downloadMonthShareCard}
        shareBusy={shareBusy}
      />

      <div className="atelier-workspace fade-stage delay-1">
        <CalendarSidebar
          calendarTheme={calendarTheme}
          canPickTheme={canPickTheme}
          isOwner={isOwner}
          canWrite={canWrite}
          accessLabel={accessLabel}
          upcomingEvents={upcomingEvents}
          updateTheme={updateTheme}
          onManageCodes={() => setManageOpen(true)}
        />

        <section>
          <MonthCalendar
            anchor={anchor}
            events={monthEvents}
            onPrevMonth={() => setAnchor((d) => addMonths(d, -1))}
            onNextMonth={() => setAnchor((d) => addMonths(d, 1))}
            showAddHint={canWrite}
            onEventClick={(ev) => setSelectedEvent(ev)}
          />
        </section>
      </div>

      {canWrite ? null : (
        <div style={{ padding: '0 16px' }}>
          <p className="meta-note" style={{ marginBottom: 16 }}>
            View only — adding events is disabled. Writes are blocked.
          </p>
        </div>
      )}

      {canWrite ? (
        <button type="button" className="fab-add" onClick={() => setAddOpen(true)} aria-label="Add event">
          +
        </button>
      ) : null}

      <AddEventPanel
        open={addOpen && canWrite}
        onClose={() => setAddOpen(false)}
        initialCreatorName={creatorName}
        onCreatorNameChange={setCreatorName}
        onSave={async (payload) => {
          if (!authClient || !calendarUuid) throw new Error('Not ready')
          const normalizedName = payload.creator_name.trim() || creatorName.trim() || randomAnonymousName()
          writeCreatorName(calendarId, normalizedName)
          setCreatorName(normalizedName)
          const { data, error } = await authClient.from('events').insert({
             calendar_id: calendarUuid,
             title: payload.title,
             mood: payload.mood,
             event_date: payload.event_date,
             start_time: payload.start_time,
             end_time: payload.end_time,
             note: payload.note,
             creator_name: normalizedName,
          }).select('*').single()
           if (error) throw new Error(error.message)
          if (data) {
            setEvents((prev) => mergeById(prev, data as CalendarEvent))
            // Trigger PWA prompt after first event is added
            if (!firstEventAdded) {
              setFirstEventAdded(true)
              triggerPrompt()
            }
          }
        }}
      />

      <EventDetailModal
        open={!!selectedEvent}
        event={selectedEvent}
        canDelete={canWrite}
        busy={deletingEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={(ev) => deleteEvent(ev)}
      />

      {sessionToken ? (
        <ManageCodesModal
          open={manageOpen}
          onClose={() => setManageOpen(false)}
          anon={anon}
          sessionToken={sessionToken}
          initialOwner={createState?.ownerCode}
          onDeleteCalendar={isOwner ? deleteCalendar : undefined}
        />
      ) : null}

      <div className="share-card-host" aria-hidden="true">
        <div ref={shareCardRef} className="share-month-card capture-freeze">
          <div className="share-month-title">{metaName ?? 'Calendar'}</div>
          <MonthCalendar
            className="share-month-cal"
            anchor={anchor}
            events={monthEvents}
            onPrevMonth={() => {}}
            onNextMonth={() => {}}
            showAddHint={false}
          />
          <div className="share-month-footer">
            <span className="wordmark">Kaleenda</span>
            <span className="share-theme-label">{themeNameByKey[calendarTheme]} theme</span>
          </div>
        </div>
      </div>

      <PwaInstallBanner show={showPrompt && !!deferredPrompt} onInstall={handleInstall} onDismiss={handleDismiss} />
    </div>
  )
}
