const rows = [
  { feature: 'Requires an account', others: '✕ Everyone needs one', kaleenda: '✓ Nobody does', isOtherBad: true },
  { feature: 'Share with a link', others: 'Sometimes', kaleenda: '✓ Always', isOtherBad: false },
  { feature: 'Two access levels', others: '✕', kaleenda: '✓ Write and read', isOtherBad: true },
  { feature: 'Works for temporary groups', others: '✕ Designed for teams', kaleenda: '✓ Built for this', isOtherBad: true },
  { feature: 'Fun to use', others: '✕', kaleenda: '✓ Plushies', isOtherBad: true },
]

export function ComparisonSection() {
  return (
    <section style={{ background: 'var(--surface)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center', color: 'var(--text-primary)', margin: '0 0 16px' }}>
          Built for groups, not corporations.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.6 }}>
          Other shared calendars require everyone to have an account. Kaleenda doesn't.
        </p>

        <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ padding: '16px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Feature</div>
            <div style={{ padding: '16px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', borderLeft: '0.5px solid var(--border)' }}>Other calendars</div>
            <div style={{ padding: '16px', fontSize: 13, fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-light)', borderLeft: '0.5px solid var(--border)' }}>Kaleenda</div>
          </div>

          {/* Rows */}
          {rows.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-primary)' }}>{row.feature}</div>
              <div style={{ padding: '16px', fontSize: 13, color: row.isOtherBad ? 'var(--danger)' : 'var(--text-secondary)', borderLeft: '0.5px solid var(--border)', textAlign: 'center', fontWeight: row.isOtherBad ? 500 : 400 }}>
                {row.others}
              </div>
              <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)', borderLeft: '0.5px solid var(--border)', textAlign: 'center', background: 'var(--accent-light)' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{row.kaleenda}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

