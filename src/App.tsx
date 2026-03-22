import { Navigate, Route, Routes } from 'react-router-dom'
import { LocalStorageNotice } from './components/LocalStorageNotice'
import { SiteFooter } from './components/SiteFooter'
import { CreatePage } from './pages/CreatePage'
import { HomePage } from './pages/HomePage'
import { JoinPage } from './pages/JoinPage'
import { CalendarPage } from './pages/CalendarPage'
import { AboutPage } from './pages/AboutPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { LegalPage } from './pages/LegalPage'

export default function App() {
  return (
    <div className="app-shell">
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
      <SiteFooter />
      <LocalStorageNotice />
    </div>
  )
}
