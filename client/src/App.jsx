import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'
import Appointments from './pages/Appointments'
import Billing from './pages/Billing'
import LoadingSpinner from './components/LoadingSpinner'
import DemoTimer from './components/DemoTimer'
import DemoExpired from './components/DemoExpired'

function App() {
  const { user, loading } = useAuth()
  
  // Check if demo has expired based on localStorage
  const checkDemoExpired = () => {
    const savedStartTime = localStorage.getItem('demoStartTime')
    if (savedStartTime) {
      const elapsed = Date.now() - parseInt(savedStartTime)
      const DEMO_DURATION = 3 * 60 * 60 * 1000 // 3 hours
      return elapsed >= DEMO_DURATION
    }
    return false
  }

  const [demoExpired, setDemoExpired] = useState(checkDemoExpired())

  // If demo has expired, show expired page
  if (demoExpired) {
    return <DemoExpired />
  }

  // TEMPORARY: Bypass authentication for client demo
  // Remove this section and uncomment the original code below when ready to restore auth
  return (
    <>
      <DemoTimer onExpire={() => setDemoExpired(true)} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )

  /* ORIGINAL CODE - UNCOMMENT TO RESTORE AUTHENTICATION
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      
      <Route 
        path="/" 
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="billing" element={<Billing />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
  */
}

export default App