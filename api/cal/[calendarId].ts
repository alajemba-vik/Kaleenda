import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// ── iCal helpers ─────────────────────────────────────────────────

function icalText(value: string): string {
  // RFC 5545 §3.3.11: fold lines >75 octets, escape special chars
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function icalDate(date: string, time?: string | null): string {
  // date is YYYY-MM-DD, time is HH:MM:SS or HH:MM (optional)
  const d = date.replace(/-/g, '')
  if (!time) return `VALUE=DATE:${d}`
  const t = time.substring(0, 5).replace(':', '') + '00'
  return `${d}T${t}00`
}

function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const chunks: string[] = []
  let pos = 0
  while (pos < bytes.length) {
    const chunkLen = pos === 0 ? 75 : 74
    chunks.push(bytes.subarray(pos, pos + chunkLen).toString('utf8'))
    pos += chunkLen
  }
  return chunks.join('\r\n ')
}

function buildIcal(calendarName: string, publicId: string, events: EventRow[]): string {
  const prodId = `-//Kaleenda//Kaleenda Calendar//EN`
  const calName = icalText(calendarName)
  const now = new Date().toISOString().replace(/[-:]/g, '').replace('.', '').slice(0, 15) + 'Z'

  const eventBlocks = events.map((ev) => {
    const uid = `${ev.id}@kaleenda.app`
    const dtstart = ev.start_time
      ? icalDate(ev.event_date, ev.start_time)
      : `VALUE=DATE:${ev.event_date.replace(/-/g, '')}`
    const dtend = ev.end_time
      ? icalDate(ev.event_date, ev.end_time)
      : (ev.start_time ? icalDate(ev.event_date, ev.start_time) : null)

    const lines = [
      'BEGIN:VEVENT',
      foldLine(`UID:${uid}`),
      foldLine(`DTSTAMP:${now}`),
      foldLine(`SUMMARY:${icalText(ev.title)}`),
      foldLine(ev.start_time ? `DTSTART:${dtstart}` : `DTSTART;${dtstart}`),
    ]
    if (dtend) lines.push(foldLine(ev.start_time ? `DTEND:${dtend}` : `DTEND;${dtend}`))
    if (ev.note?.trim()) lines.push(foldLine(`DESCRIPTION:${icalText(ev.note)}`))
    if (ev.creator_name?.trim()) lines.push(foldLine(`ORGANIZER;CN=${icalText(ev.creator_name)}:mailto:noreply@kaleenda.app`))
    lines.push('END:VEVENT')
    return lines.join('\r\n')
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    foldLine(`PRODID:${prodId}`),
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    `X-WR-CALDESC:${calName} via Kaleenda`,
    'X-WR-TIMEZONE:UTC',
    ...eventBlocks,
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n'
}

// ── Types ─────────────────────────────────────────────────────────

type EventRow = {
  id: string
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  note: string | null
  creator_name: string | null
}

// ── Handler ───────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).end('Method Not Allowed')
    return
  }

  // Extract calendarId from path (strips .ics extension)
  const raw = Array.isArray(req.query.calendarId)
    ? req.query.calendarId[0]
    : req.query.calendarId ?? ''
  const calendarId = raw.replace(/\.ics$/i, '')

  if (!calendarId) {
    res.status(400).end('Missing calendar ID')
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    res.status(500).end('Server misconfigured')
    return
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Look up calendar by public_id
  const { data: cal, error: calErr } = await admin
    .from('calendars')
    .select('id, name')
    .eq('public_id', calendarId)
    .maybeSingle()

  if (calErr || !cal) {
    res.status(404).end('Calendar not found')
    return
  }

  // Fetch all events for this calendar, ordered by date
  const { data: events, error: evErr } = await admin
    .from('events')
    .select('id, title, event_date, start_time, end_time, note, creator_name')
    .eq('calendar_id', cal.id)
    .order('event_date', { ascending: true })

  if (evErr) {
    res.status(500).end('Failed to load events')
    return
  }

  const ics = buildIcal(cal.name as string, calendarId, (events ?? []) as EventRow[])

  // Cache for 15 minutes, allow stale-while-revalidate
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${calendarId}.ics"`)
  res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=3600')
  res.status(200).send(ics)
}
