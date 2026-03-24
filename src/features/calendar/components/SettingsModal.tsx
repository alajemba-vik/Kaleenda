import { useState, FormEvent, useEffect } from 'react'
import { AccessLevel } from '@/types'
import { createClient } from '@supabase/supabase-js'

type Props = {
  open: boolean
  onClose: () => void
  calendarId: string
  calendarUuid: string
  accessLevel: AccessLevel
  currentName: string
  onNameUpdate: (newName: string) => void
  onDeleteCalendar: () => Promise<void>
}

// NOTE: Uses the same Supabase URL/key logic found in createAnonClient, but we'll 
// need an authenticated client to update the calendar table via RLS.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export function SettingsModal({
  open,
  onClose,
  calendarId,
  calendarUuid,
  accessLevel,
  currentName,
  onNameUpdate,
  onDeleteCalendar,
}: Props) {
  const isOwner = accessLevel === 'owner'
  
  const [name, setName] = useState(currentName)
  const [savingName, setSavingName] = useState(false)
  const [codesBusy, setCodesBusy] = useState(false)
  
  const [codes, setCodes] = useState<{ write_code: string; read_code: string; owner_code?: string } | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(currentName)
      const token = localStorage.getItem(`kl_session_${calendarId}`)
      if (token) setSessionToken(token)
    }
  }, [open, currentName, calendarId])

  useEffect(() => {
    if (open && sessionToken && isOwner && !codes && !codesBusy) {
      void fetchCodes()
    }
  }, [open, sessionToken, isOwner])

  async function fetchCodes() {
    setCodesBusy(true)
    try {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${sessionToken}` } },
      })
      const { data, error } = await authClient.rpc('get_calendar_codes', { p_session_token: sessionToken })
      if (!error && data) {
        setCodes(data as any)
      }
    } finally {
      setCodesBusy(false)
    }
  }

  async function handleRename(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || name === currentName || !sessionToken || !calendarUuid) return
    setSavingName(true)
    
    try {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${sessionToken}` } },
      })
      
      const { error } = await authClient
        .from('calendars')
        .update({ name: name.trim() })
        .eq('id', calendarUuid)
        
      if (error) throw new Error(error.message)
      onNameUpdate(name.trim())
    } catch (err) {
      console.error('Failed to rename', err)
    } finally {
      setSavingName(false)
    }
  }

  async function handleRegenerateCodes() {
    if (!sessionToken || !isOwner) return
    const ok = window.confirm('Generate new codes? Old read/write codes will stop working immediately.')
    if (!ok) return
    
    setCodesBusy(true)
    try {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${sessionToken}` } },
      })
      const { data, error } = await authClient.rpc('regenerate_codes', { p_session_token: sessionToken })
      if (!error && data) {
        setCodes((prev) => ({ ...prev, ...(data as any) }))
      }
    } finally {
      setCodesBusy(false)
    }
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <header className="modal-header">
          <h2 className="modal-title">Calendar Settings</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* General Section */}
          <section>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>General</h3>
            <form onSubmit={handleRename} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Calendar Name"
                disabled={savingName || !isOwner}
              />
              {isOwner && (
                <button type="submit" className="btn btn-secondary" disabled={savingName || name === currentName}>
                  {savingName ? '...' : 'Save'}
                </button>
              )}
            </form>
          </section>

          {/* Email Subscriptions */}
          <section>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Email Reminders</h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const email = fd.get('email') as string
                const notifyOnNew = fd.get('notify_on_new') === 'on'
                const remindMins = parseInt(fd.get('remind_minutes') as string, 10)
                
                if (!email || !sessionToken || !calendarUuid) return
                try {
                  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
                    global: { headers: { Authorization: `Bearer ${sessionToken}` } },
                  })
                  const { error } = await authClient
                    .from('subscriptions')
                    .upsert({
                      calendar_id: calendarUuid,
                      email,
                      notify_on_new: notifyOnNew,
                      remind_minutes_before: isNaN(remindMins) || remindMins <= 0 ? null : remindMins,
                    }, { onConflict: 'calendar_id, email' })
                  
                  if (error) throw new Error(error.message)
                  alert('Subscribed successfully!')
                } catch (err: any) {
                  alert(`Failed to subscribe: ${err.message}`)
                }
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <input type="email" name="email" className="field" placeholder="your@email.com" required disabled={!sessionToken} />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" name="notify_on_new" defaultChecked disabled={!sessionToken} />
                Email me when new events are added
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                Remind me
                <select name="remind_minutes" className="field" style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }} disabled={!sessionToken} defaultValue="-1">
                  <option value="-1">Don't remind me</option>
                  <option value="5">5 mins before</option>
                  <option value="30">30 mins before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>

              <button type="submit" className="btn btn-secondary" disabled={!sessionToken}>
                Subscribe
              </button>
            </form>
          </section>

          {/* Access Codes Section */}
          {isOwner && (
            <section>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Codes</h3>
              
              {codesBusy && !codes ? (
                <p>Loading codes...</p>
              ) : codes ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '12px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Write Access</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '15px' }}>{codes.write_code}</div>
                    </div>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px', height: 'auto' }} onClick={() => copy(codes.write_code)}>Copy</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '12px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Read Access</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '15px' }}>{codes.read_code}</div>
                    </div>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px', height: 'auto' }} onClick={() => copy(codes.read_code)}>Copy</button>
                  </div>

                  <button type="button" className="btn btn-secondary" onClick={handleRegenerateCodes} disabled={codesBusy} style={{ marginTop: '8px' }}>
                    Regenerate Share Codes
                  </button>
                </div>
              ) : null}
            </section>
          )}

          {/* Import Events (CSV / ICS) */}
          {isOwner && (
            <section>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Import Events (CSV / ICS)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', lineHeight: 1.4 }}>
                Upload a <code>.csv</code> or <code>.ics</code> file to add multiple events at once.<br />
                <a href={`data:text/csv;charset=utf-8,Title,Date,Start Time,End Time,Notes,Mood%0ATeam Practice,2026-04-01,18:00,19:30,Bring boots,panic%0ACup Final,2026-04-15,15:00,17:00,,celebration`} download="kaleenda_template.csv" style={{ color: 'var(--accent, #3d6fff)', textDecoration: 'underline' }}>
                  Download CSV template
                </a>
              </p>
              
              <input 
                type="file" 
                accept=".csv,.ics"
                disabled={codesBusy}
                style={{ fontSize: '13px' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file || !sessionToken || !calendarUuid) return
                  
                  setCodesBusy(true) // Reusing this busy flag for imports temporarily
                  try {
                    const text = await file.text()
                    let eventsToInsert: any[] = []

                    if (file.name.endsWith('.csv')) {
                      // Dynamically import papaparse to keep bundle small if unused
                      const Papa = (await import('papaparse')).default
                      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
                      
                      eventsToInsert = parsed.data.map((row: any) => ({
                        calendar_id: calendarUuid,
                        title: row['Title'] || 'Untitled Event',
                        event_date: row['Date'] || new Date().toISOString().split('T')[0],
                        start_time: row['Start Time'] ? row['Start Time'].slice(0, 5) : null,
                        end_time: row['End Time'] ? row['End Time'].slice(0, 5) : null,
                        note: row['Notes'] || null,
                        mood: row['Mood'] || 'chill',
                        creator_name: 'Import' // Track that these were imported
                      }))
                    } else if (file.name.endsWith('.ics')) {
                      // Dynamically import ical.js
                      const ICAL = (await import('ical.js')).default
                      const jcalData = ICAL.parse(text)
                      const comp = new ICAL.Component(jcalData)
                      const vevents = comp.getAllSubcomponents('vevent')
                      
                      eventsToInsert = vevents.map(e => {
                        const summary = e.getFirstPropertyValue('summary')
                        const dtstart = e.getFirstPropertyValue('dtstart')
                        let eventDate = new Date().toISOString().split('T')[0]
                        let startTime = null
                        
                        if (dtstart) {
                          const dtStr = dtstart.toString()
                          eventDate = dtStr.split('T')[0]
                          if (dtStr.includes('T')) {
                            startTime = dtStr.split('T')[1].slice(0, 5)
                          }
                        }

                        return {
                          calendar_id: calendarUuid,
                          title: summary || 'Imported Event',
                          event_date: eventDate,
                          start_time: startTime,
                          creator_name: 'Import'
                        }
                      })
                    }

                    if (eventsToInsert.length === 0) {
                      throw new Error('No valid events found in file')
                    }

                    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
                      global: { headers: { Authorization: `Bearer ${sessionToken}` } },
                    })

                    const { error } = await authClient.from('events').insert(eventsToInsert)
                    if (error) throw new Error(error.message)

                    alert(`Successfully imported ${eventsToInsert.length} events!`)
                  } catch (err: any) {
                    alert(`Import failed: ${err.message}`)
                  } finally {
                    e.target.value = ''
                    setCodesBusy(false)
                  }
                }}
              />
            </section>
          )}

          {/* Danger Zone */}
          {isOwner && (
            <section style={{ marginTop: '12px', paddingTop: '24px', borderTop: '0.5px solid var(--border)' }}>
              <button 
                type="button" 
                className="btn" 
                style={{ width: '100%', background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffdcdc' }} 
                onClick={onDeleteCalendar}
              >
                Delete Calendar
              </button>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
