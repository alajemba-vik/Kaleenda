import { useEffect, useState } from 'react'

type DeferredPrompt = Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> }

export function usePwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as DeferredPrompt)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  function triggerPrompt() {
    const dismissed = localStorage.getItem('kaleenda_pwa_dismissed')
    if (dismissed || !deferredPrompt) return

    // Show prompt after 1.5s delay
    window.setTimeout(() => {
      setShowPrompt(true)
    }, 1500)
  }

  async function handleInstall() {
    if (!deferredPrompt || !deferredPrompt.prompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice!
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowPrompt(false)
        localStorage.setItem('kaleenda_pwa_dismissed', 'true')
      }
    } catch {
      // ignore errors
    }
  }

  function handleDismiss() {
    localStorage.setItem('kaleenda_pwa_dismissed', 'true')
    setShowPrompt(false)
  }

  return { showPrompt, deferredPrompt, triggerPrompt, handleInstall, handleDismiss }
}

