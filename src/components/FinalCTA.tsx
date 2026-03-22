import { Link } from 'react-router-dom'

export function FinalCTA() {
  return (
    <section style={{ background: '#1A1916', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 500, color: 'white', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          Your group needs a calendar.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 32px', lineHeight: 1.6 }}>
          No accounts. No apps. Ready in 10 seconds.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'opacity 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Create a calendar
          </Link>
          <Link
            to="/join"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              border: '0.5px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
          >
            Join with a code
          </Link>
        </div>
      </div>
    </section>
  )
}

