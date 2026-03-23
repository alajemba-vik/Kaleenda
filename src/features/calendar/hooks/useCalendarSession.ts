import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createAnonClient, createAuthClient } from '@/lib/supabase'
import { exchangeSessionJwt } from '@/lib/session'
import { clearStoredSession, readStoredSession } from '@/lib/storage'
import type { AccessLevel, CalendarEvent, CalendarTheme } from '@/types'

export type Phase = 'boot' | 'notfound' | 'welcome' | 'code' | 'calendar'

export function useCalendarSession(calendarId: string, fromCreateNav: boolean) {
  const [phase, setPhase] = useState<Phase>('boot')
  const [metaName, setMetaName] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [calendarUuid, setCalendarUuid] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [calendarTheme, setCalendarTheme] = useState<CalendarTheme>('default')

  const establishedRef = useRef<string | null>(null)
  const anon = useMemo(() => createAnonClient(), [])
  const authClient = useMemo(() => (jwt ? createAuthClient(jwt) : null), [jwt])

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

  return {
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
  }
}
