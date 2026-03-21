import { Navigate, Route, Routes } from 'react-router-dom'
import { CreatePage } from './pages/CreatePage'
import { HomePage } from './pages/HomePage'
import { JoinPage } from './pages/JoinPage'
import { CalendarPage } from './pages/CalendarPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/cal/:calendarId" element={<CalendarPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
