import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddEventPanel } from '../components/AddEventPanel'
import { CodeEntry } from '../components/CodeEntry'
import { ManageCodesModal } from '../components/ManageCodesModal'
import { filterEventsForMonth, MonthCalendar } from '../components/MonthCalendar'
import { WelcomeCodes } from '../components/WelcomeCodes'
import { addMonths } from '../lib/calendarGrid'
import { createAnonClient, createAuthClient } from '../lib/supabase'
import { exchangeSessionJwt } from '../lib/session'
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from '../lib/storage'
import type { AccessLevel, CalendarEvent } from '../lib/types'
import '../styles/ui.css'

type CreateNavState = {
  fromCreate?: boolean
  writeCode?: string
  readCode?: string
  ownerSessionToken?: string
  remember?: boolean
}

type Phase = 'boot' | 'notfound' | 'welcome' | 'code' | 'calendar'

function mergeById(prev: CalendarEvent[], row: CalendarEvent): CalendarEvent[] {
  const i = prev.findIndex((e) => e.id === row.id)
  if (i === -1) return [...prev, row].sort((a, b) => a.event_date.localeCompare(b.event_date))
  const next = [...prev]
  next[i] = row
  return next.sort((a, b) => a.event_date.localeCompare(b.event_date))
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

  const [anchor, setAnchor] = useState(() => new Date())
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeBusy, setCodeBusy] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)

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

  const establishSession = useCallback(
    async (token: string, access: AccessLevel) => {
      const accessToken = await exchangeSessionJwt(token)
      setSessionToken(token)
      setAccessLevel(access)
      setJwt(accessToken)
      const auth = createAuthClient(accessToken)
      const { data: cal, error: cErr } = await auth
        .from('calendars')
        .select('id')
        .eq('public_id', calendarId)
        .single()
      if (cErr || !cal) {
        throw new Error('Could not open calendar')
      }
      setCalendarUuid(cal.id)
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

    const channel = authClient
      .channel(`events:${calendarUuid}`)
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
      .subscribe()

    return () => {
      void authClient.removeChannel(channel)
    }
  }, [authClient, calendarUuid, jwt])

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

  if (phase === 'boot' || phase === 'welcome') {
    return (
      <div className="layout">
        {phase === 'boot' ? (
          <div>
            <h1 className="page-title">Checking access…</h1>
            <p className="page-sub">Hang on while we verify this link.</p>
          </div>
        ) : null}
        {phase === 'welcome' && createState?.writeCode && createState.readCode ? (
          <WelcomeCodes
            writeCode={createState.writeCode}
            readCode={createState.readCode}
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
        <h1 className="page-title">Calendar not found</h1>
        <p className="page-sub">This link may be wrong or the calendar was removed.</p>
        <Link className="btn" to="/">
          Go home
        </Link>
      </div>
    )
  }

  if (phase === 'code') {
    return (
      <div className="layout">
        <div className="row" style={{ marginBottom: 18 }}>
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
    <div className="layout">
      <div className="row" style={{ marginBottom: 14 }}>
        <Link to="/" className="link-btn">
          ← Home
        </Link>
        {isOwner ? (
          <button type="button" className="btn-ghost" onClick={() => setManageOpen(true)}>
            Manage codes
          </button>
        ) : null}
      </div>

      <div className="row" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 6 }}>
            {metaName}
          </h1>
          <div>
            {isOwner ? <span className="badge badge-owner">Owner</span> : null}
            {!isOwner && accessLevel === 'write' ? (
              <span className="badge badge-write">Write access</span>
            ) : null}
            {!isOwner && accessLevel === 'read' ? (
              <span className="badge badge-read">View only</span>
            ) : null}
          </div>
        </div>
      </div>

      <MonthCalendar
        anchor={anchor}
        events={monthEvents}
        onPrevMonth={() => setAnchor((d) => addMonths(d, -1))}
        onNextMonth={() => setAnchor((d) => addMonths(d, 1))}
        showAddHint={canWrite}
        onAddEvent={() => setAddOpen(true)}
      />

      {canWrite ? (
        <button type="button" className="btn" style={{ marginBottom: 12 }} onClick={() => setAddOpen(true)}>
          + Add event
        </button>
      ) : (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          View only — adding events is disabled. Writes are also blocked at the database level for
          read access.
        </p>
      )}

      <AddEventPanel
        open={addOpen && canWrite}
        onClose={() => setAddOpen(false)}
        onSave={async (payload) => {
          if (!authClient || !calendarUuid) throw new Error('Not ready')
          const { error } = await authClient.from('events').insert({
            calendar_id: calendarUuid,
            title: payload.title,
            event_date: payload.event_date,
            start_time: payload.start_time,
            end_time: payload.end_time,
            note: payload.note,
          })
          if (error) throw new Error(error.message)
        }}
      />

      {sessionToken ? (
        <ManageCodesModal
          open={manageOpen}
          onClose={() => setManageOpen(false)}
          anon={anon}
          sessionToken={sessionToken}
        />
      ) : null}
    </div>
  )
}
