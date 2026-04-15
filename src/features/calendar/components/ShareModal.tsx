import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

type Props = {
  open: boolean
  onClose: () => void
  shareUrl: string
  onDownload: () => void
  isDownloading: boolean
  sessionToken: string | null
  isOwner: boolean
}

export function ShareModal({ open, onClose, shareUrl, onDownload, isDownloading, sessionToken, isOwner }: Props) {
  const [copied, setCopied] = useState(false)
  const [accessLevel, setAccessLevel] = useState<'read' | 'write' | 'owner'>('read')
  const [codes, setCodes] = useState<{ write_code: string; read_code: string; owner_code?: string } | null>(null)

  useEffect(() => {
    if (open && sessionToken && isOwner && !codes) {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${sessionToken}` } },
      })
      authClient.rpc('get_calendar_codes', { p_session_token: sessionToken })
        .then(({ data }) => setCodes(data as any))
    }
  }, [open, sessionToken, isOwner, codes])

  if (!open) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {}
  }

  let codeToSend = ''
  let accessText = ''
  if (codes) {
    if (accessLevel === 'read') { codeToSend = codes.read_code; accessText = 'you can only view' }
    if (accessLevel === 'write') { codeToSend = codes.write_code; accessText = 'you can edit but not delete the calendar' }
    if (accessLevel === 'owner') { codeToSend = codes.owner_code || ''; accessText = 'you have full access to the calendar' }
  }

  const messageBody = codes 
    ? `Join my Kaleenda calendar!\n\nHere is the link: ${shareUrl}\nYour code is: ${codeToSend}\nInfo: ${accessText}`
    : `Join my Kaleenda calendar!\n\nHere is the link: ${shareUrl}`

  const encodedBody = encodeURIComponent(messageBody)
  const emailHref = `mailto:?subject=Join%20my%20Kaleenda%20calendar&body=${encodedBody}`
  const waHref = `https://wa.me/?text=${encodedBody}`

  return (
    <>
      <div className="share-popover-glass" style={{
        position: 'absolute',
        top: '60px',
        right: '16px',
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
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Share Calendar</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}>✕</button>
        </div>

        {isOwner && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Select access to share</label>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-2)', padding: '4px', borderRadius: '8px' }}>
              {(['read', 'write', 'owner'] as const).map(lvl => (
                <button 
                  key={lvl}
                  type="button"
                  onClick={() => setAccessLevel(lvl)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: accessLevel === lvl ? '#fff' : 'transparent',
                    boxShadow: accessLevel === lvl ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    fontWeight: accessLevel === lvl ? 600 : 400,
                    textTransform: 'capitalize'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '13px' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a href={emailHref} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '13px' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
            Email
          </a>
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--surface-2)', borderRadius: '8px' }}>
          <input type="text" value={shareUrl} readOnly className="field" style={{ flex: 1, margin: 0, fontSize: '12px', border: 'none', background: 'transparent', outline: 'none' }} onClick={(e) => e.currentTarget.select()} />
          <button type="button" className="btn btn-secondary" onClick={handleCopy} style={{ flexShrink: 0, padding: '4px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset' }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        
        <button type="button" className="btn btn-secondary" onClick={onDownload} disabled={isDownloading} style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
          📸 {isDownloading ? 'Generating Image...' : 'Export as Image'}
        </button>
      </div>

      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
        onClick={onClose}
      />
    </>
  )
}
