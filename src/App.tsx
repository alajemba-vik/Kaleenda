import { Component, Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LocalStorageNotice } from './components/LocalStorageNotice'
import { SiteFooter } from './components/SiteFooter'
import { SplashScreen } from './components/SplashScreen'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from '@/pages'
import '@/pages/Contact/ContactPage.css'

type AppErrorBoundaryState = {
  hasError: boolean
}

class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('App route render error', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="layout" style={{ paddingTop: 48 }}>
        <div className="surface-card" style={{ maxWidth: 560 }}>
          <p className="kicker">Reload Needed</p>
          <h1 className="page-title">We hit a loading issue</h1>
          <p className="page-sub">Please refresh to load the latest app files.</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>
    )
  }
}

const CreatePage = lazy(async () => {
  const mod = await import('@/pages/Create/CreatePage')
  return { default: mod.CreatePage }
})
const JoinPage = lazy(async () => {
  const mod = await import('@/pages/Join/JoinPage')
  return { default: mod.JoinPage }
})
const CalendarPage = lazy(async () => {
  const mod = await import('@/pages/Calendar/CalendarPage')
  return { default: mod.CalendarPage }
})
const AboutPage = lazy(async () => {
  const mod = await import('@/pages/About/AboutPage')
  return { default: mod.AboutPage }
})
const PrivacyPage = lazy(async () => {
  const mod = await import('@/pages/Privacy/PrivacyPage')
  return { default: mod.PrivacyPage }
})
const LegalPage = lazy(async () => {
  const mod = await import('@/pages/Legal/LegalPage')
  return { default: mod.LegalPage }
})
const HowItWorksPage = lazy(async () => {
  const mod = await import('@/pages/HowItWorks/HowItWorksPage')
  return { default: mod.HowItWorksPage }
})
const ContactPage = lazy(async () => {
  const mod = await import('@/pages/Contact/ContactPage')
  return { default: mod.ContactPage }
})

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <SplashScreen />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppErrorBoundary>
          <Suspense fallback={<div className="layout">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/cal/:calendarId" element={<CalendarPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </div>
      <SiteFooter />
      <LocalStorageNotice />
    </div>
  )
}
