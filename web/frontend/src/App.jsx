import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Pages — Auth
import HomePage from './pages/HomePage'
import PatientLogin from './pages/auth/PatientLogin'
import DoctorLogin from './pages/auth/DoctorLogin'
import AdminLogin from './pages/auth/AdminLogin'
import PatientRegister from './pages/auth/PatientRegister'

// Pages — Patient
import PatientDashboard from './pages/patient/Dashboard'
import ReportEmergency from './pages/patient/ReportEmergency'
import TrackAmbulance from './pages/patient/TrackAmbulance'
import EmergencyHistory from './pages/patient/EmergencyHistory'
import BloodRequestForm from './pages/patient/BloodRequestForm'
import BloodRequestHistory from './pages/patient/BloodRequestHistory'
import AppointmentBookingPage from './pages/patient/AppointmentBookingPage'
import AppointmentHistoryPage from './pages/patient/AppointmentHistoryPage'

// Pages — Doctor
import DoctorDashboard from './pages/doctor/Dashboard'
import EmergencyDetails from './pages/doctor/EmergencyDetails'
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage'

// Pages — Admin
import AdminDashboard from './pages/admin/Dashboard'
import AmbulanceManagement from './pages/admin/AmbulanceManagement'
import UserManagement from './pages/admin/UserManagement'
import Analytics from './pages/admin/Analytics'
import BloodInventoryPage from './pages/admin/BloodInventory'
import BloodRequestsPage from './pages/admin/BloodRequests'
import AppointmentsManagement from './pages/admin/AppointmentsManagement'
import HospitalManagement from './pages/admin/HospitalManagement'
import EmergencyLogs from './pages/admin/EmergencyLogs'

// ── Protected Route ─────────────────────────────────────
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #0066cc, #00897b)' }}>+</div>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
          style={{ borderColor: '#0066cc', borderTopColor: 'transparent' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading MediSync…</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

// ── App ──────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: 'var(--bg-elevated, #0d1e37)',
              color: 'var(--text-primary, #e6f0ff)',
              border: '1px solid rgba(0,102,204,0.3)',
              fontSize: '0.875rem',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#2e7d32', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#d32f2f', secondary: '#fff' } },
          }} />
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/patient/login"    element={<PatientLogin />} />
            <Route path="/patient/register" element={<PatientRegister />} />
            <Route path="/doctor/login"     element={<DoctorLogin />} />
            <Route path="/admin/login"      element={<AdminLogin />} />

            {/* ── Patient Routes ── */}
            <Route path="/patient/*" element={
              <ProtectedRoute role="patient"><Routes>
                <Route path="dashboard"    element={<PatientDashboard />} />
                <Route path="report"       element={<ReportEmergency />} />
                <Route path="track/:emergencyId" element={<TrackAmbulance />} />
                <Route path="history"      element={<EmergencyHistory />} />
                <Route path="blood-request"  element={<BloodRequestForm />} />
                <Route path="blood-history"  element={<BloodRequestHistory />} />
                <Route path="appointments"   element={<AppointmentBookingPage />} />
                <Route path="appt-history"   element={<AppointmentHistoryPage />} />
              </Routes></ProtectedRoute>
            } />

            {/* ── Doctor Routes ── */}
            <Route path="/doctor/*" element={
              <ProtectedRoute role="doctor"><Routes>
                <Route path="dashboard"     element={<DoctorDashboard />} />
                <Route path="emergency/:id" element={<EmergencyDetails />} />
                <Route path="appointments"  element={<DoctorAppointmentsPage />} />
              </Routes></ProtectedRoute>
            } />

            {/* ── Admin Routes ── */}
            <Route path="/admin/*" element={
              <ProtectedRoute role="admin"><Routes>
                <Route path="dashboard"      element={<AdminDashboard />} />
                <Route path="ambulances"     element={<AmbulanceManagement />} />
                <Route path="users"          element={<UserManagement />} />
                <Route path="analytics"      element={<Analytics />} />
                <Route path="blood-inventory"element={<BloodInventoryPage />} />
                <Route path="blood-requests" element={<BloodRequestsPage />} />
                <Route path="appointments"   element={<AppointmentsManagement />} />
                <Route path="hospitals"      element={<HospitalManagement />} />
                <Route path="emergencies"    element={<EmergencyLogs />} />
              </Routes></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
