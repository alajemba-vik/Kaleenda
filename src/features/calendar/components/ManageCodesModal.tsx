import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import '@/styles/ui.css'
import './WelcomeCodes.css'
import './ManageCodesModal.css'

type Props = {
  open: boolean
  onClose: () => void
  anon: SupabaseClient
  sessionToken: string
  initialWrite?: string
  initialRead?: string
  initialOwner?: string
  onDeleteCalendar?: () => Promise<void>
}

export function ManageCodesModal({
  open,
  onClose,
  anon,
  sessionToken,
  initialWrite,
  initialRead,
  initialOwner,
  onDeleteCalendar,
}: Props) {
  const [writeCode, setWriteCode] = useState(initialWrite ?? '')
  const [readCode, setReadCode] = useState(initialRead ?? '')
  const [ownerCode, setOwnerCode] = useState(initialOwner ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [confirmPending, setConfirmPending] = useState(false)
  const confirmTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    setErr(null)
    if (initialWrite && initialRead && initialOwner) {
      setWriteCode(initialWrite)
      setReadCode(initialRead)
      setOwnerCode(initialOwner)
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
        const j = data as { write_code?: string; read_code?: string; owner_code?: string }
        setWriteCode(j.write_code ?? '')
        setReadCode(j.read_code ?? '')
        setOwnerCode(j.owner_code ?? '')
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Could not load codes')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, anon, sessionToken, initialWrite, initialRead, initialOwner])

  if (!open) return null

  function clearConfirmTimer() {
    if (confirmTimerRef.current !== null) {
      window.clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = null
    }
  }

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

  function handleRegenerateClick() {
    if (busy) return
    if (!confirmPending) {
      setConfirmPending(true)
      clearConfirmTimer()
      confirmTimerRef.current = window.setTimeout(() => {
        setConfirmPending(false)
        confirmTimerRef.current = null
      }, 4000)
      return
    }
    clearConfirmTimer()
    setConfirmPending(false)
    void regenerate()
  }

  useEffect(() => {
    if (!open) {
      setConfirmPending(false)
      clearConfirmTimer()
    }
    return () => clearConfirmTimer()
  }, [open])

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
          <div>
            <div className="mc-wordmark">Kaleenda</div>
            <h2 id="mc-title" className="mc-title">
              Manage codes
            </h2>
          </div>
          <button type="button" className="mc-x" onClick={() => onClose()} aria-label="Close">
            ×
          </button>
        </div>
        {err ? <p className="error-text">{err}</p> : null}
        {busy && !writeCode && !readCode ? (
          <p className="page-sub mc-loading">
            Loading…
          </p>
        ) : (
          <>
            <div className="code-box write mc-code-box">
              <div className="code-box-lbl">Write code</div>
              <div className="code-box-val mono">{writeCode || 'Unavailable'}</div>
              <button type="button" className="link-btn" onClick={() => copy(writeCode)}>
                Copy
              </button>
            </div>
            <div className="code-box read mc-code-box">
              <div className="code-box-lbl">Read code</div>
              <div className="code-box-val mono">{readCode || 'Unavailable'}</div>
              <button type="button" className="link-btn" onClick={() => copy(readCode)}>
                Copy
              </button>
            </div>
            <div className="code-box owner mc-code-box">
              <div className="code-box-lbl">Owner code</div>
              <div className="code-box-val mono">{ownerCode || 'Unavailable'}</div>
              <button type="button" className="link-btn" onClick={() => copy(ownerCode)}>
                Copy
              </button>
            </div>
            <p className="page-sub mc-hint">
              Regenerating creates new codes and immediately locks out anyone using the old ones.
            </p>
            <div className="row">
              {onDeleteCalendar ? (
                <button
                  type="button"
                  className="btn mc-danger"
                  onClick={() => void onDeleteCalendar()}
                  disabled={busy}
                >
                  Delete calendar
                </button>
              ) : null}
              <button type="button" className="btn-secondary btn" onClick={() => onClose()}>
                Close
              </button>
              <button
                id="regen-btn"
                type="button"
                className={`btn mc-regen-btn ${confirmPending ? 'confirming' : ''}`}
                onClick={handleRegenerateClick}
                disabled={busy}
              >
                {busy ? 'Working…' : confirmPending ? 'Tap again to confirm' : 'Regenerate codes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
