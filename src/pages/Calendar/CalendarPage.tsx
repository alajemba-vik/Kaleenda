import { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCalendarSession } from '@/features/calendar'
import { useCalendarSync } from '@/features/calendar'
import { AddEventPanel } from '@/features/calendar'
import { CalendarSidebar } from '@/features/calendar'
import { CodeEntry } from '@/features/calendar'
import { EventDetailModal } from '@/features/calendar'
import { SettingsSidebar } from '@/features/calendar/components/SettingsSidebar'
import { ShareModal } from '@/features/calendar/components/ShareModal'
import { ActivityFeed } from '@/features/calendar/components/ActivityFeed'
import { PwaInstallBanner } from '@/components/PwaInstallBanner'
import { filterEventsForMonth, MonthCalendar } from '@/features/calendar'
import { WelcomeCodes } from '@/features/calendar'
import { addMonths } from '@/features/calendar'
import { randomAnonymousName } from '@/lib/anonymousName'
import { initials } from '@/lib/utils'
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
    setMetaName,
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

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Hide global SiteFooter on the calendar page
  useEffect(() => {
    document.body.classList.add('on-calendar-page')
    return () => document.body.classList.remove('on-calendar-page')
  }, [])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [anchor, setAnchor] = useState(() => new Date())
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeBusy, setCodeBusy] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
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

  /* ── Early-exit phases ───────────────────────────────────────── */
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
          <Link className="btn" to="/">Go home</Link>
        </div>
      </div>
    )
  }

  if (phase === 'code') {
    return (
      <div className="layout">
        <div className="row top-nav">
          <Link to="/" className="link-btn">← Home</Link>
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

  /* ── Main calendar view ──────────────────────────────────────── */
  return (
    <div className={`kaleenda-page calendar-theme-root${sidebarOpen ? ' kp-sidebar-open' : ''}${settingsOpen ? ' kp-settings-open' : ''}`} data-theme={calendarTheme}>

      {/* ── NAV ── */}
      <nav className="kp-nav">
        <Link to="/" className="kp-nav-logo">Kaleenda</Link>

        <div className="kp-nav-center">
          <span className="kp-nav-link">{metaName ?? 'Calendar'}</span>
        </div>

        <div className="kp-nav-right">
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Close panel' : 'Open panel'}
            title={sidebarOpen ? 'Close panel' : 'Open panel'}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <Link to="/create" className="kp-nav-create-btn">
            + New calendar
          </Link>
        </div>
      </nav>

      {/* ── SIDEBAR ── */}
      <div className="kp-sidebar">
        <CalendarSidebar
          calendarTheme={calendarTheme}
          canPickTheme={canPickTheme}
          isOwner={isOwner}
          canWrite={canWrite}
          upcomingEvents={upcomingEvents}
          updateTheme={updateTheme}
        />
      </div>

      {/* ── MAIN ── */}
      <main className="kp-main">

        {/* Page header */}
        <header className="kp-header">
          <div>
            <h1 className="kp-cal-name">{metaName ?? 'Calendar'}</h1>
            <p className="kp-cal-month">{monthLabel}</p>
          </div>

          <div className="kp-header-right">
            {/* Presence pill */}
            <div className="kp-presence-pill" aria-label="Live presence">
              <span className="kp-presence-label">Live</span>
              <div className="presence-list" aria-label="Presence">
                {viewers.slice(0, 5).map((v, idx) => (
                  <span
                    key={v.key}
                    className="presence-avatar"
                    title={`${v.name} (${v.access})`}
                  >
                    {initials(v.name)}
                    <span className={`presence-dot ${idx < 3 ? 'online' : 'away'}`} aria-hidden="true" />
                  </span>
                ))}
                {viewers.length > 5 ? <span className="presence-more">+{viewers.length - 5}</span> : null}
              </div>
            </div>

            {/* Actions */}
            <div className="kp-header-actions">
              <ActivityFeed
                calendarId={calendarId}
                calendarUuid={calendarUuid || ''}
                sessionToken={sessionToken}
              />
              {isOwner && (
                <button
                  type="button"
                  className="kp-header-btn"
                  onClick={() => setSettingsOpen((v) => !v)}
                  aria-label="Settings"
                  style={{ width: '38px', padding: 0 }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                  </svg>
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  className="kp-header-btn"
                  onClick={() => setSettingsOpen((v) => !v)}
                  aria-label="Settings"
                  style={{ width: '38px', padding: 0 }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                  </svg>
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  className="kp-header-btn"
                  onClick={() => setSettingsOpen((v) => !v)}
                  aria-label="Settings"
                  style={{ width: '38px', padding: 0 }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                  </svg>
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  className="kp-header-btn"
                  onClick={() => setShareOpen(true)}
                >
                  ↗ Share
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Calendar in a white card */}
        <div className="kp-grid-card">
          <MonthCalendar
            anchor={anchor}
            events={monthEvents}
            onPrevMonth={() => setAnchor((d) => addMonths(d, -1))}
            onNextMonth={() => setAnchor((d) => addMonths(d, 1))}
            showAddHint={canWrite}
            onEventClick={(ev) => setSelectedEvent(ev)}
          />
        </div>

        {!canWrite && (
          <p className="meta-note" style={{ marginTop: 16 }}>
            View only — adding events is disabled.
          </p>
        )}
      </main>

      {/* ── FAB ── */}
      {canWrite && (
        <button
          type="button"
          className="kp-fab"
          onClick={() => setAddOpen(true)}
          aria-label="Add event"
        >
          +
        </button>
      )}

      {/* No footer here — global SiteFooter is hidden on this page via body class */}

      {/* ── MODALS (all unchanged) ── */}
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

      <SettingsSidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        calendarId={calendarId}
        calendarUuid={calendarUuid || ''}
        accessLevel={accessLevel ?? 'read'}
        currentName={metaName || 'Calendar'}
        onNameUpdate={async (_newName) => {
          // Force refetch metadata
          try {
            const { data } = await anon.rpc('get_calendar_meta', { p_public_id: calendarId })
            if (data && typeof data === 'object' && 'name' in data) {
              setMetaName(data.name as string)
            }
          } catch (e) { console.error(e) }
        }}
        onDeleteCalendar={deleteCalendar}
      />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={window.location.href}
        onDownload={downloadMonthShareCard}
        isDownloading={shareBusy}
      />

      {/* Share card (hidden, used for image export) */}
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
