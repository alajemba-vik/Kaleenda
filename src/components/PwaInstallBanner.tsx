
type Props = {
  show: boolean
  onInstall: () => void
  onDismiss: () => void
}

export function PwaInstallBanner({ show, onInstall, onDismiss }: Props) {
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        borderRadius: 99,
        padding: '12px 20px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 13,
        zIndex: 1000,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <span style={{ color: 'var(--text-primary)', flex: 1 }}>
        Add Kaleenda to your home screen for quick access
      </span>
      <button
        type="button"
        onClick={onInstall}
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Add
      </button>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          padding: 0,
          color: 'var(--text-tertiary)',
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

