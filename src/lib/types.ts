export type AccessLevel = 'owner' | 'write' | 'read'

export type CalendarEvent = {
  id: string
  calendar_id: string
  title: string
  event_date: string
  start_time: string
  end_time: string | null
  note: string | null
  creator_name: string | null
  created_at: string
}
