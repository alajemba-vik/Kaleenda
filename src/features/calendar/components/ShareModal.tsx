import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  shareUrl: string
  onDownload: () => void
  isDownloading: boolean
}

export function ShareModal({ open, onClose, shareUrl, onDownload, isDownloading }: Props) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {}
  }

  const encodedUrl = encodeURIComponent(shareUrl)
  const emailHref = `mailto:?subject=Join%20my%20Kaleenda%20calendar&body=Here%20is%20the%20link:%20${encodedUrl}`
  const waHref = `https://wa.me/?text=Join%20my%20Kaleenda%20calendar:%20${encodedUrl}`

  return (
    <div className="modal-backdrop">
      <div className="modal-card share-modal" style={{ maxWidth: '400px' }}>
        <header className="modal-header">
          <h2 className="modal-title">Share Calendar</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </a>

            <a href={emailHref} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
              Email
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
              <input type="text" value={shareUrl} readOnly className="field" style={{ flex: 1, margin: 0, fontSize: '12px', outline: 'none' }} onClick={(e) => e.currentTarget.select()} />
              <button type="button" className="btn btn-secondary" onClick={handleCopy} style={{ flexShrink: 0, padding: '6px 16px' }}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <button type="button" className="btn btn-secondary" onClick={onDownload} disabled={isDownloading} style={{ width: '100%', marginTop: '12px' }}>
              📸 {isDownloading ? 'Generating Image...' : 'Export as Image'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
