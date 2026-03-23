import { useEffect, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { CalendarEvent, AccessLevel, CalendarTheme } from '@/types'
import { readCreatorName, writeCreatorName } from '@/lib/storage'
import { randomAnonymousName } from '@/lib/anonymousName'

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

export function useCalendarSync(
  authClient: SupabaseClient | null,
  calendarUuid: string | null,
  jwt: string | null,
  calendarId: string,
  sessionToken: string | null,
  accessLevel: AccessLevel | null,
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
  setCalendarTheme: React.Dispatch<React.SetStateAction<CalendarTheme>>
) {
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [creatorName, setCreatorName] = useState<string>(() => readCreatorName(calendarId) ?? '')

  useEffect(() => {
    setCreatorName(readCreatorName(calendarId) ?? '')
  }, [calendarId])

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
            setCalendarTheme(nextTheme as CalendarTheme)
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
  }, [accessLevel, authClient, calendarId, calendarUuid, jwt, sessionToken, setEvents, setCalendarTheme])

  return { viewers, creatorName, setCreatorName }
}
