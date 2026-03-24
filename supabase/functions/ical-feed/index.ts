import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── iCal helpers ─────────────────────────────────────────────────

function icalText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function foldLine(line: string): string {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(line)
  if (bytes.length <= 75) return line
  const chunks: string[] = []
  let pos = 0
  const decoder = new TextDecoder()
  while (pos < bytes.length) {
    const chunkLen = pos === 0 ? 75 : 74
    chunks.push(decoder.decode(bytes.subarray(pos, pos + chunkLen)))
    pos += chunkLen
  }
  return chunks.join('\r\n ')
}

function icalDate(date: string, time?: string | null): string {
  const d = date.replace(/-/g, '')
  if (!time) return `VALUE=DATE:${d}`
  const t = time.substring(0, 5).replace(':', '') + '00'
  return `${d}T${t}00`
}

type EventRow = {
  id: string
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  note: string | null
  creator_name: string | null
}

function buildIcal(calendarName: string, events: EventRow[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace('.', '').slice(0, 15) + 'Z'
  const calName = icalText(calendarName)

  const eventBlocks = events.map((ev) => {
    const uid = `${ev.id}@kaleenda.app`
    const dtstart = ev.start_time
      ? icalDate(ev.event_date, ev.start_time)
      : `VALUE=DATE:${ev.event_date.replace(/-/g, '')}`
    const dtend = ev.end_time ? icalDate(ev.event_date, ev.end_time) : null

    const lines = [
      'BEGIN:VEVENT',
      foldLine(`UID:${uid}`),
      foldLine(`DTSTAMP:${now}`),
      foldLine(`SUMMARY:${icalText(ev.title)}`),
      foldLine(ev.start_time ? `DTSTART:${dtstart}` : `DTSTART;${dtstart}`),
    ]
    if (dtend) lines.push(foldLine(ev.start_time ? `DTEND:${dtend}` : `DTEND;${dtend}`))
    if (ev.note?.trim()) lines.push(foldLine(`DESCRIPTION:${icalText(ev.note)}`))
    lines.push('END:VEVENT')
    return lines.join('\r\n')
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Kaleenda//Kaleenda Calendar//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    `X-WR-CALDESC:${calName} via Kaleenda`,
    ...eventBlocks,
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n'
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })

  const url = new URL(req.url)
  // Expect ?id=PUBLIC_CALENDAR_ID
  const calendarId = url.searchParams.get('id')?.replace(/\.ics$/i, '') ?? ''
  if (!calendarId) return new Response('Missing id param', { status: 400 })

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!supabaseUrl || !serviceKey) return new Response('Server misconfigured', { status: 500 })

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: cal, error: calErr } = await admin
    .from('calendars')
    .select('id, name')
    .eq('public_id', calendarId)
    .maybeSingle()

  if (calErr || !cal) return new Response('Calendar not found', { status: 404 })

  const { data: events, error: evErr } = await admin
    .from('events')
    .select('id, title, event_date, start_time, end_time, note, creator_name')
    .eq('calendar_id', cal.id)
    .order('event_date', { ascending: true })

  if (evErr) return new Response('Failed to load events', { status: 500 })

  const ics = buildIcal(cal.name as string, (events ?? []) as EventRow[])

  return new Response(ics, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${calendarId}.ics"`,
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600',
    },
  })
})
