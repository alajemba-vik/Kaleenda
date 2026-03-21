import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import '../styles/ui.css'
import './WelcomeCodes.css'
import './ManageCodesModal.css'

type Props = {
  open: boolean
  onClose: () => void
  anon: SupabaseClient
  sessionToken: string
  initialWrite?: string
  initialRead?: string
}

export function ManageCodesModal({
  open,
  onClose,
  anon,
  sessionToken,
  initialWrite,
  initialRead,
}: Props) {
  const [writeCode, setWriteCode] = useState(initialWrite ?? '')
  const [readCode, setReadCode] = useState(initialRead ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErr(null)
    if (initialWrite && initialRead) {
      setWriteCode(initialWrite)
      setReadCode(initialRead)
      return
    }
    let cancelled = false
    ;(async () => {
      setBusy(true)
      try {
        const { data, error } = await anon.rpc('get_calendar_codes', {
          p_session_token: sessionToken,
        })
        if (cancelled) return
        if (error) throw error
        const j = data as { write_code?: string; read_code?: string }
        setWriteCode(j.write_code ?? '')
        setReadCode(j.read_code ?? '')
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Could not load codes')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, anon, sessionToken, initialWrite, initialRead])

  if (!open) return null

  async function copy(t: string) {
    try {
      await navigator.clipboard.writeText(t)
    } catch {
      // ignore
    }
  }

  async function regenerate() {
    setErr(null)
    setBusy(true)
    try {
      const { data, error } = await anon.rpc('regenerate_codes', {
        p_session_token: sessionToken,
      })
      if (error) throw error
      const j = data as { write_code?: string; read_code?: string }
      setWriteCode(j.write_code ?? '')
      setReadCode(j.read_code ?? '')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not regenerate')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mc-backdrop" role="presentation" onClick={() => onClose()}>
      <div
        className="mc-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mc-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mc-head">
          <h2 id="mc-title" className="mc-title">
            Manage codes
          </h2>
          <button type="button" className="mc-x" onClick={() => onClose()} aria-label="Close">
            ×
          </button>
        </div>
        {err ? <p className="error-text">{err}</p> : null}
        {busy && !writeCode && !readCode ? (
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Loading…
          </p>
        ) : (
          <>
            <div className="code-box write" style={{ marginBottom: 10 }}>
              <div className="code-box-lbl">Write code</div>
              <div className="code-box-val mono">{writeCode}</div>
              <button type="button" className="link-btn" onClick={() => copy(writeCode)}>
                Copy
              </button>
            </div>
            <div className="code-box read" style={{ marginBottom: 10 }}>
              <div className="code-box-lbl">Read code</div>
              <div className="code-box-val mono">{readCode}</div>
              <button type="button" className="link-btn" onClick={() => copy(readCode)}>
                Copy
              </button>
            </div>
            <p className="page-sub" style={{ fontSize: '0.8rem', marginBottom: 12 }}>
              Regenerating invalidates the previous write and read codes. Share the new codes with
              your group.
            </p>
            <div className="row">
              <button type="button" className="btn-secondary btn" onClick={() => onClose()}>
                Close
              </button>
              <button type="button" className="btn" onClick={() => regenerate()} disabled={busy}>
                {busy ? 'Working…' : 'Regenerate codes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
