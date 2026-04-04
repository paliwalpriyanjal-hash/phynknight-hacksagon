import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/patient/dashboard',     icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report',        icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/appointments',  icon: '📅', label: 'Book Appointment' },
  { path: '/patient/appt-history',  icon: '🗂️', label: 'My Appointments' },
  { path: '/patient/blood-request', icon: '🩸', label: 'Blood Request' },
  { path: '/patient/history',       icon: '📋', label: 'My History' },
]

const FIRST_AID = [
  { t: 'Heart Attack', tip: 'Call ambulance immediately. Have the person sit and rest. Loosen tight clothing.', icon: '❤️' },
  { t: 'Choking',      tip: 'Perform Heimlich maneuver. Give 5 back blows and 5 abdominal thrusts.', icon: '🫁' },
  { t: 'Bleeding',     tip: 'Apply firm pressure with clean cloth. Keep elevated above heart level.', icon: '🩸' },
  { t: 'Burns',        tip: 'Cool with running water for 10 min. Do not apply ice or butter.', icon: '🔥' },
]

const STATUS_COLORS = {
  pending:   '#ffa726',
  confirmed: '#42a5f5',
  cancelled: '#ef5350',
  completed: '#66bb6a',
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [emergencyCount, setEmergencyCount] = useState({ total: 0, resolved: 0 })
  const [recentAppts,     setRecentAppts]   = useState([])
  const [loading,         setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, aRes] = await Promise.allSettled([
          axios.get('/api/emergency/my-history'),
          axios.get('/api/appointments/my'),
        ])
        if (eRes.status === 'fulfilled') {
          const em = eRes.value.data || []
          setEmergencyCount({ total: em.length, resolved: em.filter(e => e.status === 'completed').length })
        }
        if (aRes.status === 'fulfilled') {
          setRecentAppts((aRes.value.data || []).slice(0, 3))
        }
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <DashboardLayout navItems={NAV} role="patient">
      {/* Header */}
      <div className="mb-5">
        <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Your personal health monitoring dashboard
        </p>
      </div>

      {/* Emergency CTA */}
      <div className="mb-5 rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(211,47,47,0.1), rgba(183,28,28,0.06))', border: '1px solid rgba(211,47,47,0.22)' }}>
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(211,47,47,0.08)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="vital-dot critical" />
              <span className="label-xs" style={{ color: '#ef5350' }}>Emergency Service Active</span>
            </div>
            <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Need immediate help?</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI triage · Instant ambulance dispatch · Live tracking</p>
          </div>
          <button onClick={() => navigate('/patient/report')} className="btn btn-danger px-5 py-2.5 text-sm">
            🚨 Report Emergency
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '🏥', label: 'Emergencies',  value: loading ? '…' : emergencyCount.total.toString() },
          { icon: '✅', label: 'Resolved',     value: loading ? '…' : emergencyCount.resolved.toString() },
          { icon: '🩸', label: 'Blood Group',  value: user?.bloodGroup || '—' },
          { icon: '📅', label: 'Appointments', value: loading ? '…' : recentAppts.length.toString() },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.12)' }}>{s.icon}</div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { icon: '🎙️', title: 'Voice Report',    desc: 'Describe by voice', accent: '#6a1b9a', onClick: () => navigate('/patient/report') },
          { icon: '📸', title: 'Upload Images',   desc: 'AI photo analysis', accent: '#0066cc', onClick: () => navigate('/patient/report') },
          { icon: '📅', title: 'Book Appointment',desc: 'Schedule a doctor visit', accent: '#0288d1', onClick: () => navigate('/patient/appointments') },
          { icon: '🗂️', title: 'My Appointments', desc: 'View booking history', accent: '#00838f', onClick: () => navigate('/patient/appt-history') },
          { icon: '🩸', title: 'Need Blood?',     desc: 'Request blood bank', accent: '#d32f2f', onClick: () => navigate('/patient/blood-request') },
          { icon: '📋', title: 'My History',      desc: 'Past emergencies', accent: '#2e7d32', onClick: () => navigate('/patient/history') },
        ].map(a => (
          <button key={a.title} onClick={a.onClick} className="card p-4 text-left group transition-all hover:shadow-lg">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ background: `${a.accent}12`, border: `1px solid ${a.accent}25` }}>{a.icon}</div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Recent Appointments */}
      {recentAppts.length > 0 && (
        <div className="card p-5 mb-5">
          <div className="section-header mb-4">
            <h2 className="section-title">Recent Appointments</h2>
            <button onClick={() => navigate('/patient/appt-history')}
              className="ml-auto text-xs font-semibold" style={{ color: '#0066cc' }}>
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentAppts.map(a => (
              <div key={a._id} className="flex items-center justify-between gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {a.doctorId?.name || 'Doctor'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    📅 {new Date(a.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · 🕐 {a.appointmentTime}
                  </p>
                </div>
                <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                  style={{
                    color: STATUS_COLORS[a.status] || '#aaa',
                    background: `${STATUS_COLORS[a.status] || '#aaa'}18`,
                  }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* First Aid */}
      <div className="card p-5">
        <div className="section-header mb-4">
          <h2 className="section-title">Quick First Aid Reference</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIRST_AID.map(f => (
            <div key={f.t} className="med-card p-3" style={{ borderLeftColor: '#d32f2f' }}>
              <div className="flex items-center gap-2 mb-1">
                <span>{f.icon}</span>
                <p className="font-semibold text-xs" style={{ color: '#ef5350' }}>{f.t}</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
