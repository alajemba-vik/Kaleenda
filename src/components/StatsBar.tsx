const stats = [
  {
    label: 'No account needed',
    description: 'The only calendar you can share with literally anyone.',
  },
  {
    label: '2 access levels',
    description: 'Write or read — you decide who can add events.',
  },
  {
    label: 'Works on any device',
    description: 'No app to download. Just a link.',
  },
]

export function StatsBar() {
  return (
    <section style={{ background: 'var(--surface)', borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)', padding: '32px 24px' }}>
      <div className="stats-bar" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, textAlign: 'center' }}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="stat-divider"
            style={{
              paddingLeft: idx > 0 ? '24px' : 0,
              paddingRight: idx < stats.length - 1 ? '24px' : 0,
              borderRight: idx < stats.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {stat.description}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

