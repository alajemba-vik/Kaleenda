const rows = [
  { feature: 'Requires an account', others: '✕ Everyone needs one', kaleenda: '✓ Nobody does', isOtherBad: true },
  { feature: 'Share with a link', others: 'Sometimes', kaleenda: '✓ Always', isOtherBad: false },
  { feature: 'Two access levels', others: '✕', kaleenda: '✓ Write and read', isOtherBad: true },
  { feature: 'Temporary groups', others: '✕ Designed for teams', kaleenda: '✓ Built for this', isOtherBad: true },
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

        <div className="comparison-table-wrap">
          <table className="comparison-table" aria-label="Kaleenda comparison table">
            <thead>
              <tr>
                <th className="comparison-feature-head">Feature</th>
                <th className="comparison-other-head">Other calendars</th>
                <th className="comparison-kaleenda-head">Kaleenda</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td className="comparison-feature-cell">{row.feature}</td>
                  <td
                    className={`comparison-other-cell ${row.isOtherBad ? 'comparison-other-bad' : ''}`}
                  >
                    {row.others}
                  </td>
                  <td className="comparison-kaleenda-cell">
                    <span className="comparison-kaleenda-value">{row.kaleenda}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

