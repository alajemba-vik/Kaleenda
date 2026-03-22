import { Component, Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LocalStorageNotice } from './components/LocalStorageNotice'
import { SiteFooter } from './components/SiteFooter'
import { SplashScreen } from './components/SplashScreen'
import { HomePage } from './pages/HomePage'

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
  const mod = await import('./pages/CreatePage')
  return { default: mod.CreatePage }
})
const JoinPage = lazy(async () => {
  const mod = await import('./pages/JoinPage')
  return { default: mod.JoinPage }
})
const CalendarPage = lazy(async () => {
  const mod = await import('./pages/CalendarPage')
  return { default: mod.CalendarPage }
})
const AboutPage = lazy(async () => {
  const mod = await import('./pages/AboutPage')
  return { default: mod.AboutPage }
})
const PrivacyPage = lazy(async () => {
  const mod = await import('./pages/PrivacyPage')
  return { default: mod.PrivacyPage }
})
const LegalPage = lazy(async () => {
  const mod = await import('./pages/LegalPage')
  return { default: mod.LegalPage }
})
const HowItWorksPage = lazy(async () => {
  const mod = await import('./pages/HowItWorksPage')
  return { default: mod.HowItWorksPage }
})

export default function App() {
  const location = useLocation()
  const standaloneMarketingRoutes = new Set(['/about', '/privacy', '/legal', '/how-it-works'])
  const showGlobalFooter = location.pathname !== '/' && !standaloneMarketingRoutes.has(location.pathname)

  return (
    <div className="app-shell">
      <SplashScreen />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
      {showGlobalFooter ? <SiteFooter /> : null}
      <LocalStorageNotice />
    </div>
  )
}
