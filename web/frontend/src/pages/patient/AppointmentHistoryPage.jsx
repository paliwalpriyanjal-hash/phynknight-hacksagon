import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/patient/dashboard',      icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report',         icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/appointments',   icon: '📅', label: 'Book Appointment' },
  { path: '/patient/appt-history',   icon: '🗂️', label: 'My Appointments' },
  { path: '/patient/blood-request',  icon: '🩸', label: 'Blood Request' },
  { path: '/patient/history',        icon: '📋', label: 'My History' },
]

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#ffa726', bg: 'rgba(245,124,0,0.12)',   icon: '⏳' },
  confirmed: { label: 'Confirmed', color: '#42a5f5', bg: 'rgba(66,165,245,0.12)',  icon: '✅' },
  cancelled: { label: 'Cancelled', color: '#ef5350', bg: 'rgba(211,47,47,0.12)',   icon: '❌' },
  completed: { label: 'Completed', color: '#66bb6a', bg: 'rgba(46,125,50,0.12)',   icon: '🎉' },
}

const RISK_CONFIG = {
  LOW:      { color: '#66bb6a', label: 'LOW' },
  MODERATE: { color: '#ffa726', label: 'MODERATE' },
  MEDIUM:   { color: '#ffa726', label: 'MODERATE' },
  HIGH:     { color: '#ef5350', label: 'HIGH' },
}

function ApptCard({ appt, onCancel }) {
  const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending
  const rc = RISK_CONFIG[appt.riskLevel] || RISK_CONFIG.LOW

  return (
    <div className="card p-5 transition-all hover:shadow-lg" style={{ borderLeft: `3px solid ${sc.color}` }}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {appt.doctorId?.name || 'Doctor'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {appt.doctorId?.specialization || 'General Medicine'}
            {appt.hospitalId?.name && ` · ${appt.hospitalId.name}`}
          </p>
        </div>
        <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: sc.bg, color: sc.color }}>
          {sc.icon} {sc.label}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Date</p>
          <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
            📅 {new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Time</p>
          <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
            🕐 {appt.appointmentTime}
          </p>
        </div>
      </div>

      {/* Symptoms */}
      {appt.symptomsSummary && (
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          📝 {appt.symptomsSummary}
        </p>
      )}

      {/* Doctor's note */}
      {appt.doctorNotes && (
        <div className="rounded-xl p-3 mb-3"
          style={{ background: 'rgba(66,165,245,0.08)', border: '1px solid rgba(66,165,245,0.2)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#42a5f5' }}>Doctor's Note</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{appt.doctorNotes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 mt-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Risk: <span style={{ color: rc.color, fontWeight: 600 }}>{rc.label}</span>
          {' · '}Booked {new Date(appt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        {appt.status === 'pending' && (
          <button
            onClick={() => onCancel(appt._id)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:bg-red-500/10"
            style={{ color: '#ef5350', border: '1px solid rgba(211,47,47,0.3)' }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default function AppointmentHistoryPage() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/appointments/my')
      setAppointments(res.data)
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleCancel = async (apptId) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await axios.patch(`/api/appointments/${apptId}/cancel`)
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(0,102,204,0.1)', border: '1px solid rgba(0,102,204,0.2)' }}>🗂️</div>
              <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                My Appointments
              </h1>
            </div>
            <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
              View and manage your booked consultations
            </p>
          </div>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="btn btn-primary text-sm px-4 py-2"
          >
            + Book New
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={filter === s
                ? { background: '#0066cc', color: '#fff' }
                : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#0066cc', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Appointments Found</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              {filter === 'all' ? "You haven't booked any appointments yet." : `No ${filter} appointments.`}
            </p>
            <button onClick={() => navigate('/patient/appointments')} className="btn btn-primary text-sm px-5 py-2">
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
            </p>
            {filtered.map(a => (
              <ApptCard key={a._id} appt={a} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
