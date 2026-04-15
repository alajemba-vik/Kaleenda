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
  onUpgradeAccess: (code: string) => Promise<void>
}

// NOTE: Uses the same Supabase URL/key logic found in createAnonClient, but we'll 
// need an authenticated client to update the calendar table via RLS.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export function SettingsSidebar({
  open,
  onClose,
  calendarId,
  calendarUuid,
  accessLevel,
  currentName,
  onNameUpdate,
  onDeleteCalendar,
  onUpgradeAccess,
}: Props) {
  const isOwner = accessLevel === 'owner'
  
  const [name, setName] = useState(currentName)
  const [savingName, setSavingName] = useState(false)
  const [codesBusy, setCodesBusy] = useState(false)
  const [upgradeCode, setUpgradeCode] = useState('')
  const [upgradeMessage, setUpgradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [sessionToken, setSessionToken] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(currentName)
      const token = localStorage.getItem(`kl_session_${calendarId}`)
      if (token) setSessionToken(token)
    }
  }, [open, currentName, calendarId])

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

  return (
    <aside className={`kp-sidebar kp-sidebar-right ${open ? 'open' : ''}`}>
      <div className="kp-sidebar-header">
        <h2 className="kp-sidebar-title">Settings</h2>
        <button type="button" className="kp-icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="kp-sidebar-content hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* General Section */}
          <section>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>General</h3>
            <form onSubmit={handleRename} style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <input
                type="text"
                className="field"
                style={{ flex: 1, minHeight: '36px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Calendar Name"
                disabled={savingName || !isOwner}
              />
              {isOwner && (
                <button type="submit" className="btn btn-secondary" style={{ minHeight: '36px', height: '100%' }} disabled={savingName || name === currentName}>
                  {savingName ? '...' : 'Save'}
                </button>
              )}
            </form>
          </section>

          {/* Upgrade Access */}
          <section>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Change Access Level</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', lineHeight: 1.4 }}>
              Enter a read, write, or owner code to upgrade your access on this device.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!upgradeCode.trim() || codesBusy) return
              setCodesBusy(true)
              setUpgradeMessage(null)
              try {
                await onUpgradeAccess(upgradeCode.trim())
                setUpgradeMessage({ type: 'success', text: 'Access level updated!' })
                setUpgradeCode('')
                setTimeout(() => setUpgradeMessage(null), 3000)
              } catch (err) {
                console.error('Upgrade error:', err)
                setUpgradeMessage({ type: 'error', text: 'Unable to update access. Please try again.' })
              } finally {
                setCodesBusy(false)
              }
            }} style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <input
                type="text"
                className="field"
                style={{ flex: 1, minHeight: '36px', fontFamily: 'monospace' }}
                value={upgradeCode}
                onChange={(e) => setUpgradeCode(e.target.value)}
                placeholder="Enter access code"
                disabled={codesBusy}
              />
              <button type="submit" className="btn btn-secondary" style={{ minHeight: '36px', height: '100%' }} disabled={codesBusy || !upgradeCode.trim()}>
                {codesBusy ? '...' : 'Upgrade'}
              </button>
            </form>
            {upgradeMessage && (
              <p style={{ fontSize: '12px', color: upgradeMessage.type === 'success' ? 'var(--accent)' : 'var(--error, #d32f2f)', marginTop: '8px' }}>
                {upgradeMessage.text}
              </p>
            )}
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
                  setSubscribeMessage({ type: 'success', text: 'Subscribed successfully!' })
                  setTimeout(() => setSubscribeMessage(null), 3000)
                } catch (err) {
                  console.error('Subscribe error:', err)
                  setSubscribeMessage({ type: 'error', text: 'Unable to subscribe. Please try again.' })
                }
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <input type="email" name="email" className="field" placeholder="your@email.com" required />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" name="notify_on_new" defaultChecked />
                Email me when new events are added
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                Remind me
                <select name="remind_minutes" className="field" style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }} defaultValue="-1">
                  <option value="-1">Don't remind me</option>
                  <option value="5">5 mins before</option>
                  <option value="30">30 mins before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ marginTop: '8px' }}>
                Subscribe
              </button>
            </form>
            {subscribeMessage && (
              <p style={{ fontSize: '12px', color: subscribeMessage.type === 'success' ? 'var(--accent)' : 'var(--error, #d32f2f)', marginTop: '8px' }}>
                {subscribeMessage.text}
              </p>
            )}
          </section>

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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', textAlign: 'center', padding: '8px 16px', fontSize: '12px', flex: 1, border: '1px dashed var(--border)' }}>
                  {codesBusy ? 'Processing...' : 'Choose File'}
                  <input 
                    type="file" 
                    accept=".csv,.ics"
                    disabled={codesBusy}
                    style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}
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

                        const ok = window.confirm(`Found ${eventsToInsert.length} events matching. Do you want to save them to the calendar?`)
                        if (!ok) return

                        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
                          global: { headers: { Authorization: `Bearer ${sessionToken}` } },
                        })

                        const { error } = await authClient.from('events').insert(eventsToInsert)
                        if (error) throw new Error(error.message)

                        alert(`Successfully stored ${eventsToInsert.length} events! Refresh the page to see them.`)
                      } catch (err: any) {
                        alert(`Import failed: ${err.message}`)
                      } finally {
                        e.target.value = ''
                        setCodesBusy(false)
                      }
                    }}
                  />
                </label>
              </div>
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
    </aside>
  )
}
