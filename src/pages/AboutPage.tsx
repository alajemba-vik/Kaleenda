import { Link } from 'react-router-dom'
import '../styles/ui.css'

export function AboutPage() {
  return (
	<div className="layout legal-layout">
	  <div className="surface-card legal-card">
		<div className="row" style={{ marginBottom: 12 }}>
		  <Link to="/" className="link-btn">
			← Back to home
		  </Link>
		</div>
		<h1 className="page-title">About Kaleenda</h1>
		<p>
		  Kaleenda is a lightweight shared calendar app built for groups that need to coordinate quickly
		  without accounts, invites, or setup friction.
		</p>
		<p>
		  You create a calendar, share a link plus access code, and your group can view or edit events
		  instantly from any device.
		</p>
		<p>
		  Calendar data is stored on secure cloud infrastructure in the EU, and Kaleenda keeps the
		  experience intentionally simple: no ads, no tracking scripts, and no signup flow.
		</p>
	  </div>
	</div>
  )
}

