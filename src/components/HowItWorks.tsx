const steps = [
  {
    number: '1',
    title: 'Create',
    description: 'Name your calendar. Takes 10 seconds.',
    icon: 'M12 5v14M5 12h14M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  },
  {
    number: '2',
    title: 'Share',
    description: 'Send the code. One link, two access levels.',
    icon: 'M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M12 16V4M8 8l4-4 4 4',
  },
  {
    number: '3',
    title: "Everyone's in",
    description: 'No app. No login. Just open. The calendar, live.',
    icon: 'M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm0 5h18M8 3v6M16 3v6M7 15h3M12 15h3M7 19h3M12 19h3',
  },
]

export function HowItWorks() {
  return (
    <section style={{ background: 'var(--surface)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center', color: 'var(--text-primary)', margin: '0 0 64px' }}>
          Up and running in 30 seconds
        </h2>
        <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ position: 'relative', textAlign: 'center', paddingTop: 24 }}>
              {/* Step number watermark */}
              <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 48, fontWeight: 500, color: 'var(--accent)', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}>
                {step.number}
              </div>

              {/* Icon */}
              <svg
                style={{ width: 48, height: 48, color: 'var(--accent)', margin: '0 auto 16px', display: 'block', position: 'relative', zIndex: 1 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d={step.icon} />
              </svg>

              {/* Title */}
              <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px', position: 'relative', zIndex: 1 }}>
                {step.title}
              </h3>

              {/* Description */}
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                {step.description}
              </p>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className="step-connector"
                  style={{
                    position: 'absolute',
                    top: 24,
                    right: -16,
                    width: 32,
                    height: '0.5px',
                    background: 'var(--border)',
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}


