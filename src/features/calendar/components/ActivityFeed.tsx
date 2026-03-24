import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export type ActivityRow = {
  id: string
  action: 'added' | 'updated' | 'deleted'
  event_title: string
  actor_name: string
  created_at: string
}

type Props = {
  calendarId: string
  calendarUuid: string
  sessionToken: string | null
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function ActivityFeed({ calendarId, calendarUuid, sessionToken }: Props) {
  const [open, setOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [hasUnread, setHasUnread] = useState(false)
  const [loading, setLoading] = useState(false)

  const localStorageKey = `kl_last_read_activity_${calendarId}`

  useEffect(() => {
    if (!calendarUuid || !sessionToken) return

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${sessionToken}` } },
    })

    // 1. Fetch initial activity
    let isMounted = true
    setLoading(true)
    authClient
      .from('calendar_activity')
      .select('*')
      .eq('calendar_id', calendarUuid)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!isMounted) return
        setLoading(false)
        if (!error && data) {
          setActivities(data as ActivityRow[])
          
          // Check for unread
          const lastReadText = localStorage.getItem(localStorageKey)
          if (data.length > 0) {
            if (!lastReadText) {
              setHasUnread(true)
            } else {
              const lastRead = new Date(lastReadText).getTime()
              const latest = new Date(data[0].created_at).getTime()
              if (latest > lastRead) setHasUnread(true)
            }
          }
        }
      })

    // 2. Subscribe to realtime changes
    const channel = authClient.channel(`activity_${calendarUuid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calendar_activity', filter: `calendar_id=eq.${calendarUuid}` },
        (payload) => {
          if (!isMounted) return
          const newRow = payload.new as ActivityRow
          setActivities((prev) => [newRow, ...prev].slice(0, 50))
          if (!open) setHasUnread(true)
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      void authClient.removeChannel(channel)
    }
  }, [calendarUuid, sessionToken, open, calendarId, localStorageKey])

  function handleOpen() {
    setOpen((v) => !v)
    if (!open) {
      setHasUnread(false)
      localStorage.setItem(localStorageKey, new Date().toISOString())
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="kp-header-btn kp-header-icon-btn"
        onClick={handleOpen}
        aria-label="Activity Feed"
        style={{ position: 'relative' }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
        </svg>
        {hasUnread && (
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--danger, #d32f2f)',
            border: '2px solid white'
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '320px',
          background: 'var(--surface, #ffffff)',
          border: '0.5px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px'
        }}>
          <div style={{ padding: '16px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Activity</h3>
            <button type="button" onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}>✕</button>
          </div>
          
          <div style={{ padding: '8px', overflowY: 'auto', flex: 1 }}>
            {loading && activities.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px', margin: '20px 0' }}>Loading...</p>
            ) : activities.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px', margin: '20px 0' }}>No recent activity.</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activities.map((act) => (
                  <li key={act.id} style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-2, transparent)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: 'var(--text-primary)' }}>
                      <strong>{act.actor_name}</strong> {act.action} <strong>{act.event_title}</strong>
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '11px', fontStyle: 'italic' }}>
                      {formatRelativeTime(act.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
