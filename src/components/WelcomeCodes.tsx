import { useState } from 'react'
import '../styles/ui.css'
import './WelcomeCodes.css'

type Props = {
  calendarName?: string
  writeCode: string
  readCode: string
  ownerCode: string
  shareUrl: string
  onContinue: () => void
}

export function WelcomeCodes({
  calendarName,
  writeCode,
  readCode,
  ownerCode,
  shareUrl,
  onContinue,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const safeShareUrl = shareUrl.trim() || window.location.href
  const safeOwnerCode = ownerCode.trim()
  const isLocalShare = /localhost|127\.0\.0\.1/.test(safeShareUrl)

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore
    }
  }

  async function copyWithFeedback(key: string, text: string) {
    await copy(text)
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey((v) => (v === key ? null : v)), 2000)
  }

  return (
    <div className="welcome-codes">
      <div className="created-indicator">
        <span className="created-dot" aria-hidden="true" />
        <span className="kicker" style={{ marginBottom: 0 }}>Calendar created</span>
      </div>
      <h1 className="page-title welcome-name">{calendarName ?? 'Your calendar'}</h1>
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
      {isLocalShare ? (
        <p className="meta-note" style={{ marginTop: -8, marginBottom: 0 }}>
          This is a local preview link. On live deploy it will use your public domain.
        </p>
      ) : null}
      <button type="button" className="btn welcome-cta" onClick={() => onContinue()}>
        Open my calendar →
      </button>
    </div>
  )
}
