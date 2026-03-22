import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
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
      const { error } = await anon.functions.invoke('send_codes_email', {
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
      if (error) throw error
      setEmailSentTo(trimmed)
      setEmail('')
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : 'Could not send email right now.'
      setEmailError(msg)
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
            <div className="code-box-val mono">{writeCode}</div>
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
            <div className="code-box-val mono">{readCode}</div>
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
        <div className="code-box-lbl owner-title">Owner code - lets you manage this calendar from any device.</div>
        <div className="code-box owner">
          <div className="code-box-line">
            <div className={`code-box-val owner-code mono ${safeOwnerCode ? '' : 'owner-code-missing'}`}>
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

      <button type="button" className="btn btn-secondary welcome-save-btn" onClick={() => void onSaveCard()} disabled={saveBusy}>
        {saveBusy ? 'Generating key card...' : 'Save your codes'}
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
              {emailBusy ? 'Sending...' : 'Send to my email'}
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

      <button type="button" className="btn welcome-cta" onClick={() => onContinue()}>
        Open my calendar →
      </button>

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
