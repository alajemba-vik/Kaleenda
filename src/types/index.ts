export type AccessLevel = 'owner' | 'write' | 'read'

export type Mood =
  | 'chill'
  | 'panic'
  | 'celebration'
  | 'onfire'
  | 'deadline'
  | 'easy'
  | 'urgent'
  | 'vibes'
  | 'love'
  | 'hyperspeed'
  | 'melting'
  | 'glitch'
  | 'hype'
  | 'ghost'
  | 'zen'
  | 'chaos'

export type CalendarTheme = 'default' | 'dark' | 'pastel' | 'forest' | 'midnight' | 'sunset'

export type CalendarEvent = {
  id: string
  calendar_id: string
  title: string
  event_date: string
  start_time: string
  end_time: string | null
  note: string | null
  creator_name: string | null
  mood: Mood | null
  created_at: string
}
