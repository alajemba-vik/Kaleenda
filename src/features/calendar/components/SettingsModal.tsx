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
