import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LocalStorageNotice } from './components/LocalStorageNotice'
import { SiteFooter } from './components/SiteFooter'

const CreatePage = lazy(async () => {
  const mod = await import('./pages/CreatePage')
  return { default: mod.CreatePage }
})
const HomePage = lazy(async () => {
  const mod = await import('./pages/HomePage')
  return { default: mod.HomePage }
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

export default function App() {
  return (
    <div className="app-shell">
      <Suspense fallback={<div className="layout">Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/cal/:calendarId" element={<CalendarPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <SiteFooter />
      <LocalStorageNotice />
    </div>
  )
}
