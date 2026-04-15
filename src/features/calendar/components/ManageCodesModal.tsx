import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

type Props = {
  open: boolean
  onClose: () => void
  sessionToken: string | null
  isOwner: boolean
}

export function ManageCodesModal({ open, onClose, sessionToken, isOwner }: Props) {
  const [codesBusy, setCodesBusy] = useState(false)
  const [codes, setCodes] = useState<{ write_code: string; read_code: string; owner_code?: string } | null>(null)

  useEffect(() => {
    if (open && sessionToken && isOwner && !codes && !codesBusy) {
      void fetchCodes()
    }
  }, [open, sessionToken, isOwner, codes, codesBusy])

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
    <>
      <div className="share-popover-glass" style={{
        position: 'absolute',
        top: '60px',
        left: '260px', // Right next to left sidebar
        width: '320px',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        borderRadius: '16px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Manage Codes</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}>✕</button>
        </div>

        {codesBusy && !codes ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading codes...</p>
        ) : codes ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '12px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '4px' }}>Write Access</div>
                <div style={{ fontFamily: 'monospace', fontSize: '15px' }}>{codes.write_code}</div>
              </div>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset' }} onClick={() => copy(codes.write_code)}>Copy</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '12px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '4px' }}>Read Access</div>
                <div style={{ fontFamily: 'monospace', fontSize: '15px' }}>{codes.read_code}</div>
              </div>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset' }} onClick={() => copy(codes.read_code)}>Copy</button>
            </div>

            <button type="button" className="btn btn-secondary" onClick={handleRegenerateCodes} disabled={codesBusy} style={{ marginTop: '8px', padding: '10px', fontSize: '13px', width: '100%' }}>
              ⚡ Regenerate Codes
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--danger)' }}>Could not load codes.</p>
        )}
      </div>

      {/* Backdrop to close the modal when clicking outside */}
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
        onClick={onClose}
      />
    </>
  )
}
