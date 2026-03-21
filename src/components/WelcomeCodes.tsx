import '../styles/ui.css'
import './WelcomeCodes.css'

type Props = {
  writeCode: string
  readCode: string
  shareUrl: string
  onContinue: () => void
}

export function WelcomeCodes({
  writeCode,
  readCode,
  shareUrl,
  onContinue,
}: Props) {
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore
    }
  }

  return (
    <div className="welcome-codes stack">
      <h1 className="page-title">Your calendar is ready</h1>
      <p className="page-sub">Share the link and the right code with the right people.</p>

      <div className="code-box write">
        <div className="code-box-lbl">Write code — can add events</div>
        <div className="code-box-val mono">{writeCode}</div>
      </div>
      <div className="code-box read">
        <div className="code-box-lbl">Read code — view only</div>
        <div className="code-box-val mono">{readCode}</div>
      </div>

      <div className="divx" />

      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
        Shareable link
      </div>
      <div className="field mono" style={{ fontSize: '0.78rem' }}>
        {shareUrl}
      </div>
      <div className="row" style={{ marginTop: 4 }}>
        <button type="button" className="btn" onClick={() => copy(shareUrl)}>
          Copy link
        </button>
        <button type="button" className="btn-secondary btn" onClick={() => onContinue()}>
          Go to my calendar
        </button>
      </div>
    </div>
  )
}
