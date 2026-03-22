import { useMemo, useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { celebrateCalendarCreation } from '../lib/confetti'
import { createAnonClient } from '../lib/supabase'
import '../styles/ui.css'
import './WelcomeCodes.css'

type Props = {
  calendarId: string
  calendarName?: string
  createdAt?: string
  writeCode: string
  readCode: string
  ownerCode: string
  shareUrl: string
  onContinue: () => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function formatCreatedDate(value?: string): string {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'calendar'
}

export function WelcomeCodes({
  calendarId,
  calendarName,
  createdAt,
  writeCode,
  readCode,
  ownerCode,
  shareUrl,
  onContinue,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null)
  const keyCardRef = useRef<HTMLDivElement | null>(null)
  const anon = useMemo(() => createAnonClient(), [])

  // Fire confetti on mount (calendar creation)
  useEffect(() => {
    celebrateCalendarCreation()
  }, [])

  const safeCalendarName = calendarName?.trim() || 'Your calendar'
  const safeShareUrl = shareUrl.trim() || window.location.href
  const safeOwnerCode = ownerCode.trim()
  const createdDate = formatCreatedDate(createdAt)
  const isLocalShare = /localhost|127\.0\.0\.1/.test(safeShareUrl)
  const emailEnabled = import.meta.env.VITE_EMAIL_ENABLED === 'true'

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore clipboard errors in unsupported browsers
    }
  }

  async function copyWithFeedback(key: string, text: string) {
    await copy(text)
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey((v) => (v === key ? null : v)), 2000)
  }

  async function onSaveCard() {
    if (!keyCardRef.current) return
    setSaveError(null)
    setSaveBusy(true)
    try {
      const canvas = await html2canvas(keyCardRef.current, {
        backgroundColor: '#ffffff',
        scale: Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `kaleenda-${slugify(safeCalendarName)}-codes.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      setSaveError('Could not generate image. Please try again.')
    } finally {
      setSaveBusy(false)
    }
  }

  async function onSendEmail() {
    const trimmed = email.trim()
    setEmailError(null)
    if (!isValidEmail(trimmed)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setEmailBusy(true)
    try {
      const { data, error } = await anon.functions.invoke('send_codes_email', {
        body: {
          calendar_id: calendarId,
          email: trimmed,
          calendarName: safeCalendarName,
          codes: {
            write: writeCode,
            read: readCode,
            owner: safeOwnerCode,
          },
          shareUrl: safeShareUrl,
          createdAt,
        },
      })

      if (error) {
        const baseMessage = error instanceof Error ? error.message : ''
        if (baseMessage.includes('Edge Function returned a non-2xx status code')) {
          const context = (error as { context?: Response }).context
          if (context) {
            const responseBody = await context.text()
            throw new Error(responseBody || baseMessage)
          }
        }
        throw error
      }

      const payload = (data ?? {}) as { skipped?: boolean }
      if (payload.skipped) {
        setEmailError('Email sending is disabled right now. Please ask an admin to enable EMAIL_ENABLED in Supabase secrets.')
        return
      }

      setEmailSentTo(trimmed)
      setEmail('')
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : 'Could not send email right now.'
      if (
        msg.includes('NOT_FOUND') ||
        msg.includes('Requested function was not found')
      ) {
        setEmailError('Email service is not deployed yet (send_codes_email). Please deploy the function and try again.')
      } else if (msg.includes('Failed to send a request to the Edge Function')) {
        setEmailError('Email service is unavailable right now. Please try again in a minute.')
      } else {
        setEmailError(msg)
      }
    } finally {
      setEmailBusy(false)
    }
  }

  return (
    <div className="welcome-codes">
      <div className="created-indicator">
        <span className="created-dot" aria-hidden="true" />
        <span className="kicker" style={{ marginBottom: 0 }}>Calendar created</span>
      </div>
      <h1 className="page-title welcome-name">{safeCalendarName}</h1>
      <p className="page-sub">Share the right code with the right people.</p>

      <div className="codes-grid">
        <div className="code-box write">
          <div className="code-box-lbl">Write code</div>
          <div className="code-box-line">
            <div className="code-box-val mono" data-code="write">{writeCode}</div>
            <button type="button" className="copy-chip" onClick={() => void copyWithFeedback('write', writeCode)}>
              <span className={`copy-icon ${copiedKey === 'write' ? 'is-hidden' : 'is-visible'}`} aria-hidden="true">
                ⧉
              </span>
              <span className={`copy-icon check ${copiedKey === 'write' ? 'is-visible' : 'is-hidden'}`} aria-hidden="true">
                ✓
              </span>
            </button>
          </div>
        </div>

        <div className="code-box read">
          <div className="code-box-lbl">Read code</div>
          <div className="code-box-line">
            <div className="code-box-val mono" data-code="read">{readCode}</div>
            <button type="button" className="copy-chip" onClick={() => void copyWithFeedback('read', readCode)}>
              <span className={`copy-icon ${copiedKey === 'read' ? 'is-hidden' : 'is-visible'}`} aria-hidden="true">
                ⧉
              </span>
              <span className={`copy-icon check ${copiedKey === 'read' ? 'is-visible' : 'is-hidden'}`} aria-hidden="true">
                ✓
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="owner-code-wrap">
        <div className="code-box owner">
          <div className="code-box-lbl owner-pill-label">OWNER CODE</div>
          <div className="code-box-line">
            <div className={`code-box-val owner-code mono ${safeOwnerCode ? '' : 'owner-code-missing'}`} data-code="owner">
              {safeOwnerCode || 'Unavailable - apply owner code migration'}
            </div>
            {safeOwnerCode ? (
              <button type="button" className="copy-chip" onClick={() => void copyWithFeedback('owner', safeOwnerCode)}>
                <span className={`copy-icon ${copiedKey === 'owner' ? 'is-hidden' : 'is-visible'}`} aria-hidden="true">
                  ⧉
                </span>
                <span className={`copy-icon check ${copiedKey === 'owner' ? 'is-visible' : 'is-hidden'}`} aria-hidden="true">
                  ✓
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="welcome-label">Shareable URL</div>
      <div className="share-line">
        <input className="field mono welcome-link" readOnly value={safeShareUrl} />
        <button
          type="button"
          className="copy-chip share-copy"
          onClick={() => void copyWithFeedback('url', safeShareUrl)}
          aria-label="Copy shareable URL"
        >
          <span className={`copy-icon ${copiedKey === 'url' ? 'is-hidden' : 'is-visible'}`} aria-hidden="true">
            ⧉
          </span>
          <span className={`copy-icon check ${copiedKey === 'url' ? 'is-visible' : 'is-hidden'}`} aria-hidden="true">
            ✓
          </span>
        </button>
      </div>

      <button type="button" className="welcome-download-btn" onClick={() => void onSaveCard()} disabled={saveBusy}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2v8M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="#1A1916" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {saveBusy ? 'Generating key card...' : 'Download key card'}
      </button>
      {saveError ? <p className="error-text welcome-inline-feedback">{saveError}</p> : null}

      {emailEnabled && emailSentTo ? (
        <p className="welcome-email-success">Codes sent to {emailSentTo}</p>
      ) : null}

      {emailEnabled && !emailSentTo ? (
        <>
          <div className="welcome-email-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field welcome-email-input"
              placeholder="your@email.com"
              autoComplete="email"
              disabled={emailBusy}
            />
            <button
              type="button"
              className="btn btn-secondary welcome-email-btn"
              onClick={() => void onSendEmail()}
              disabled={emailBusy}
            >
              {emailBusy ? 'Sending...' : 'Send to email'}
            </button>
          </div>
          {emailError ? <p className="error-text welcome-inline-feedback">{emailError}</p> : null}
        </>
      ) : null}

      {isLocalShare ? (
        <p className="meta-note" style={{ marginTop: 6, marginBottom: 0 }}>
          This is a local preview link. On live deploy it will use your public domain.
        </p>
      ) : null}

      <button type="button" className="btn btn-secondary welcome-cta" onClick={() => onContinue()}>
        Open my calendar →
      </button>

      <div className="welcome-star-wrap" aria-hidden="true">
        <div className="welcome-star-bounce">
          <svg viewBox="0 0 64 64" width="56" height="56">
            <polygon points="32,6 38,22 56,22 42,32 48,50 32,40 16,50 22,32 8,22 26,22" fill="#EF9F27" />
            <circle cx="26" cy="28" r="3" fill="#412402" />
            <circle cx="38" cy="28" r="3" fill="#412402" />
            <path d="M27 34 Q32 39 37 34" stroke="#412402" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="12" cy="10" r="3" fill="#F4C0D1" opacity="0.8" />
            <circle cx="52" cy="8" r="2" fill="#9FE1CB" opacity="0.8" />
            <circle cx="56" cy="20" r="2.5" fill="#AFA9EC" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="keycard-capture-host" aria-hidden="true">
        <div ref={keyCardRef} className="keycard">
          <div className="keycard-top">
            <div className="keycard-wordmark">Kaleenda</div>
            <div className="keycard-chip">Key Card</div>
          </div>

          <div className="keycard-center">
            <div className="keycard-calendar">{safeCalendarName}</div>
            <div className="keycard-codes">
              <div className="keycard-code-block">
                <div className="keycard-code-label">Write</div>
                <div className="keycard-code-value mono">{writeCode}</div>
              </div>
              <div className="keycard-code-block">
                <div className="keycard-code-label">Read</div>
                <div className="keycard-code-value mono">{readCode}</div>
              </div>
              <div className="keycard-code-block">
                <div className="keycard-code-label">Owner</div>
                <div className="keycard-code-value mono">{safeOwnerCode || 'Unavailable'}</div>
              </div>
            </div>
            <div className="keycard-url mono">{safeShareUrl}</div>
          </div>

          <div className="keycard-bottom">
            <div className="keycard-note">Keep this safe - it&apos;s the only way to recover access</div>
            <div className="keycard-date">Created {createdDate}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
