import { useEffect, useState } from 'react'
import '@/styles/ui.css'

const COOKIE_NAME = 'kaleenda_storage_notice'

function hasConsentCookie(): boolean {
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${COOKIE_NAME}=1`))
}

function setConsentCookie(): void {
  document.cookie = `${COOKIE_NAME}=1; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`
}

export function LocalStorageNotice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!hasConsentCookie()) setOpen(true)
  }, [])

  if (!open) return null

  return (
    <div className="storage-notice" role="status" aria-live="polite">
      <p>
        Kaleenda uses localStorage to remember your calendar access on this device. No tracking cookies
        are used.
      </p>
      <button
        type="button"
        className="storage-notice-close"
        aria-label="Dismiss storage notice"
        onClick={() => {
          setConsentCookie()
          setOpen(false)
        }}
      >
        ×
      </button>
    </div>
  )
}
