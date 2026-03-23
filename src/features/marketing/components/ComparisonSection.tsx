import './ComparisonSection.css'

type Row = {
  feature: string
  kaleenda: string
  others: string
}

const rows: Row[] = [
  { feature: 'Requires an account?', kaleenda: 'Never', others: 'Always' },
  { feature: 'Share with a link',    kaleenda: 'Always', others: 'Sometimes' },
  { feature: 'Setup & management',   kaleenda: 'Share one code. Done.', others: 'Complex, needs IT' },
  { feature: 'Built for groups',     kaleenda: 'Yes — this is why we exist', others: 'Not really' },
  { feature: 'Fun to use?',          kaleenda: 'Yes (plushies!)', others: 'Practical but dull' },
]

export function ComparisonSection() {
  return (
    <section className="cs-shell">
      <div className="cs-inner">
        <h2 className="cs-title">
          Built for groups, <em>not corporations.</em>
        </h2>
        <p className="cs-sub">
          Other shared calendars require everyone to have an account.<br />
          Kaleenda doesn't. Never will.
        </p>

        <div className="cs-card">
          {/* Column headers */}
          <div className="cs-row cs-head-row">
            <div className="cs-col-feature cs-col-label">FEATURE</div>
            <div className="cs-col-kaleenda cs-col-label cs-label-blue">KALEENDA</div>
            <div className="cs-col-others cs-col-label">THE OTHERS</div>
          </div>

          {/* Data rows */}
          {rows.map((row, i) => (
            <div key={i} className="cs-row cs-data-row">
              <div className="cs-col-feature cs-feature-text">{row.feature}</div>
              <div className="cs-col-kaleenda cs-kaleenda-text">{row.kaleenda}</div>
              <div className="cs-col-others cs-others-text">{row.others}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
