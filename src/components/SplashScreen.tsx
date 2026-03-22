import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface)',
        animation: 'splash-fade-out 400ms ease-out forwards',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          fontSize: '64px',
          fontWeight: 700,
          color: 'var(--accent)',
          animation: 'splash-bounce 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        }}
      >
        K
      </div>
    </div>
  )
}

