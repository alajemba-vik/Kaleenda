import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import html2canvas from 'html2canvas'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddEventPanel } from '../components/AddEventPanel'
import { CodeEntry } from '../components/CodeEntry'
import { EventDetailModal } from '../components/EventDetailModal'
import { ManageCodesModal } from '../components/ManageCodesModal'
import { filterEventsForMonth, MonthCalendar } from '../components/MonthCalendar'
import { WelcomeCodes } from '../components/WelcomeCodes'
import { addMonths } from '../lib/calendarGrid'
import { randomAnonymousName } from '../lib/anonymousName'
import { createAnonClient, createAuthClient } from '../lib/supabase'
import { exchangeSessionJwt } from '../lib/session'
import {
  clearStoredSession,
  readCreatorName,
  readStoredSession,
  writeCreatorName,
  writeStoredSession,
} from '../lib/storage'
import type { AccessLevel, CalendarEvent, CalendarTheme } from '../lib/types'
import '../styles/ui.css'

const themeOptions: Array<{ key: CalendarTheme; label: string; swatch: string }> = [
  { key: 'default', label: 'Default', swatch: '#3d6fff' },
  { key: 'dark', label: 'Dark', swatch: '#2c2c2a' },
  { key: 'pastel', label: 'Pastel', swatch: '#d4537e' },
  { key: 'forest', label: 'Forest', swatch: '#1d9e75' },
  { key: 'midnight', label: 'Midnight', swatch: '#1a2e42' },
  { key: 'sunset', label: 'Sunset', swatch: '#d85a30' },
]

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

type Phase = 'boot' | 'notfound' | 'welcome' | 'code' | 'calendar'

type Viewer = {
  key: string
  name: string
  access: AccessLevel
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

  const [phase, setPhase] = useState<Phase>('boot')
  const [metaName, setMetaName] = useState<string | null>(null)

  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [calendarUuid, setCalendarUuid] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [viewers, setViewers] = useState<Viewer[]>([])

  const [anchor, setAnchor] = useState(() => new Date())
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeBusy, setCodeBusy] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)
  const [creatorName, setCreatorName] = useState<string>(() => readCreatorName(calendarId) ?? '')

  const [addOpen, setAddOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)
  const [calendarTheme, setCalendarTheme] = useState<CalendarTheme>('default')
  const [themeBusy, setThemeBusy] = useState(false)
  const shareCardRef = useRef<HTMLDivElement | null>(null)

  const createState = location.state as CreateNavState | null
  const fromCreateNav = !!(createState?.fromCreate && createState?.ownerSessionToken)
  const establishedRef = useRef<string | null>(null)

  const anon = useMemo(() => createAnonClient(), [])
  const authClient = useMemo(() => (jwt ? createAuthClient(jwt) : null), [jwt])

  const shareUrl = useMemo(
    () => `${window.location.origin}/cal/${encodeURIComponent(calendarId)}`,
    [calendarId],
  )

  const canWrite = accessLevel === 'owner' || accessLevel === 'write'
  const isOwner = accessLevel === 'owner'
  const canPickTheme = canWrite
  const accessLabel = isOwner ? 'Owner' : accessLevel === 'write' ? 'Write' : 'View only'

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  const establishSession = useCallback(
    async (token: string, access: AccessLevel) => {
      const accessToken = await exchangeSessionJwt(token)
      setSessionToken(token)
      setAccessLevel(access)
      setJwt(accessToken)
      const auth = createAuthClient(accessToken)
      const { data: cal, error: cErr } = await auth
        .from('calendars')
        .select('id, theme')
        .eq('public_id', calendarId)
        .single()
      if (cErr || !cal) {
        throw new Error('Could not open calendar')
      }
      setCalendarUuid(cal.id)
      const t = cal.theme
      setCalendarTheme(
        t === 'dark' || t === 'pastel' || t === 'forest' || t === 'midnight' || t === 'sunset'
          ? t
          : 'default',
      )
      const { data: evs, error: eErr } = await auth
        .from('events')
        .select('*')
        .eq('calendar_id', cal.id)
        .order('event_date', { ascending: true })
      if (eErr) throw eErr
      setEvents((evs as CalendarEvent[]) ?? [])
      setPhase('calendar')
      establishedRef.current = calendarId
    },
    [calendarId],
  )

  useEffect(() => {
    establishedRef.current = null
  }, [calendarId])

  useEffect(() => {
    setCreatorName(readCreatorName(calendarId) ?? '')
  }, [calendarId])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      if (!calendarId) {
        setPhase('notfound')
        return
      }

      if (establishedRef.current === calendarId) {
        return
      }

      try {
        const { data: meta, error: mErr } = await anon.rpc('get_calendar_meta', {
          p_public_id: calendarId,
        })
        if (cancelled) return
        if (mErr) throw mErr
        const m = meta as { found?: boolean; name?: string }
        if (!m.found) {
          setPhase('notfound')
          return
        }
        setMetaName(m.name ?? 'Calendar')

        if (fromCreateNav) {
          setPhase('welcome')
          return
        }

        const stored = readStoredSession(calendarId)
        if (stored) {
          try {
            await establishSession(stored.token, stored.access)
          } catch {
            clearStoredSession(calendarId)
            setJwt(null)
            setSessionToken(null)
            setAccessLevel(null)
            setCalendarUuid(null)
            setEvents([])
            establishedRef.current = null
            setPhase('code')
          }
          return
        }

        setPhase('code')
      } catch {
        if (!cancelled) setPhase('notfound')
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [anon, calendarId, establishSession, fromCreateNav])

  useEffect(() => {
    if (!authClient || !calendarUuid || !jwt) return

    const fallbackName = readCreatorName(calendarId) ?? randomAnonymousName()
    if (!readCreatorName(calendarId)) {
      writeCreatorName(calendarId, fallbackName)
      setCreatorName(fallbackName)
    }

    const channel = authClient
      .channel(`events:${calendarUuid}`, {
        config: { presence: { key: `${sessionToken ?? 'viewer'}:${calendarUuid}` } },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `calendar_id=eq.${calendarUuid}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const row = payload.new as CalendarEvent
            setEvents((prev) => mergeById(prev, row))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const row = payload.new as CalendarEvent
            setEvents((prev) => mergeById(prev, row))
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const id = (payload.old as { id?: string }).id
            if (id) setEvents((prev) => prev.filter((e) => e.id !== id))
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calendars',
          filter: `id=eq.${calendarUuid}`,
        },
        (payload) => {
          const nextTheme = (payload.new as { theme?: string }).theme
          if (
            nextTheme === 'default' ||
            nextTheme === 'dark' ||
            nextTheme === 'pastel' ||
            nextTheme === 'forest' ||
            nextTheme === 'midnight' ||
            nextTheme === 'sunset'
          ) {
            setCalendarTheme(nextTheme)
          }
        },
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, Array<{ name?: string; access?: string }>>
        const next = Object.entries(state).map(([key, list]) => {
          const first = list[0] ?? {}
          const access = first.access === 'owner' || first.access === 'write' || first.access === 'read'
            ? (first.access as AccessLevel)
            : 'read'
          return {
            key,
            name: first.name || 'Anonymous',
            access,
          }
        })
        setViewers(next)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: fallbackName, access: accessLevel ?? 'read' })
        }
      })

    return () => {
      void authClient.removeChannel(channel)
    }
  }, [accessLevel, authClient, calendarId, calendarUuid, jwt, sessionToken])

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

  async function updateTheme(theme: CalendarTheme) {
    if (!authClient || !calendarUuid || !canPickTheme || themeBusy) return
    setThemeBusy(true)
    try {
      const { error } = await authClient.from('calendars').update({ theme }).eq('id', calendarUuid)
      if (error) throw new Error(error.message)
      setCalendarTheme(theme)
      setThemeOpen(false)
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
    <div className="layout calendar-theme-root" data-theme={calendarTheme}>
      <div className="cal-topbar fade-stage">
        <Link to="/" className="cal-home-link">
          ← Home
        </Link>
        <div className="cal-top-name">{metaName}</div>
        <div className="cal-top-right">
          {canPickTheme ? (
            <div className="theme-popover-wrap">
              <button
                type="button"
                className="btn-ghost theme-trigger"
                onClick={() => setThemeOpen((v) => !v)}
                aria-label="Choose calendar theme"
              >
                🎨
              </button>
              {themeOpen ? (
                <div className="theme-popover">
                  {themeOptions.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`theme-swatch ${calendarTheme === t.key ? 'active' : ''}`}
                      title={t.label}
                      disabled={themeBusy}
                      onClick={() => void updateTheme(t.key)}
                      style={{ '--swatch': t.swatch } as CSSProperties}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <button type="button" className="btn-ghost" onClick={() => void downloadMonthShareCard()} disabled={shareBusy}>
            {shareBusy ? 'Sharing…' : 'Share card'}
          </button>
          <div className="cal-status">
            <span className={`badge ${isOwner ? 'badge-owner' : canWrite ? 'badge-write' : 'badge-read'}`}>
              {accessLabel}
            </span>
            <div className="presence-list" aria-label="Presence">
              {viewers.slice(0, 5).map((v) => (
                <span key={v.key} className="presence-avatar" title={`${v.name} (${v.access})`}>
                  {initials(v.name)}
                </span>
              ))}
              {viewers.length > 5 ? <span className="presence-more">+{viewers.length - 5}</span> : null}
            </div>
          </div>
        </div>
      </div>

      {isOwner ? (
        <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 8 }}>
          <button type="button" className="btn-ghost" onClick={() => setManageOpen(true)}>
            Manage codes
          </button>
        </div>
      ) : null}

      <div className="fade-stage delay-1">
        <MonthCalendar
        anchor={anchor}
        events={monthEvents}
        onPrevMonth={() => setAnchor((d) => addMonths(d, -1))}
        onNextMonth={() => setAnchor((d) => addMonths(d, 1))}
        showAddHint={canWrite}
        onEventClick={(ev) => setSelectedEvent(ev)}
        />
      </div>

      {canWrite ? null : (
        <p className="meta-note" style={{ marginBottom: 16 }}>
          View only — adding events is disabled. Writes are also blocked at the database level for
          read access.
        </p>
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
          const { error } = await authClient.from('events').insert({
            calendar_id: calendarUuid,
            title: payload.title,
            mood: payload.mood,
            event_date: payload.event_date,
            start_time: payload.start_time,
            end_time: payload.end_time,
            note: payload.note,
            creator_name: normalizedName,
          })
          if (error) throw new Error(error.message)
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
    </div>
  )
}
