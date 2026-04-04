import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/admin/dashboard',      icon: '🏠', label: 'Dashboard' },
  { path: '/admin/appointments',   icon: '📅', label: 'Appointments' },
  { path: '/admin/emergencies',    icon: '🚨', label: 'Emergency Logs' },
  { path: '/admin/blood-inventory',icon: '🩸', label: 'Blood Inventory' },
  { path: '/admin/blood-requests', icon: '💉', label: 'Blood Requests' },
  { path: '/admin/hospitals',      icon: '🏥', label: 'Hospitals' },
  { path: '/admin/ambulances',     icon: '🚑', label: 'Ambulances' },
  { path: '/admin/users',          icon: '👥', label: 'Users' },
  { path: '/admin/analytics',      icon: '📊', label: 'Analytics' },
]

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#ffa726', bg: 'rgba(245,124,0,0.12)'  },
  confirmed: { label: 'Confirmed', color: '#42a5f5', bg: 'rgba(66,165,245,0.12)' },
  cancelled: { label: 'Cancelled', color: '#ef5350', bg: 'rgba(211,47,47,0.12)'  },
  completed: { label: 'Completed', color: '#66bb6a', bg: 'rgba(46,125,50,0.12)'  },
}

const RISK_COLORS = {
  HIGH:     '#ef5350',
  MODERATE: '#ffa726',
  MEDIUM:   '#ffa726',
  LOW:      '#66bb6a',
}

function Badge({ label, color, bg }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: bg || `${color}18`, color }}>
      {label}
    </span>
  )
}

export default function AppointmentsManagementPage() {
  const [appointments, setAppts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterStatus, setFSt]  = useState('all')
  const [filterDate,   setFD]   = useState('')
  const [search,       setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterDate) params.date = filterDate
      const res = await axios.get('/api/appointments', { params })
      setAppts(res.data)
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterStatus, filterDate])

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/appointments/${id}/status`, { status })
      toast.success(`Status updated to ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  // Analytics counts
  const counts = {
    total:     appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  const filtered = appointments.filter(a => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const match =
        a.patientId?.name?.toLowerCase().includes(q) ||
        a.doctorId?.name?.toLowerCase().includes(q) ||
        a.riskLevel?.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(211,47,47,0.1)', border: '1px solid rgba(211,47,47,0.2)' }}>📅</div>
            <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Appointments Management
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
            Monitor all patient-doctor consultations across the system
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total',     value: counts.total,     color: '#0066cc' },
            { label: 'Pending',   value: counts.pending,   color: '#ffa726' },
            { label: 'Confirmed', value: counts.confirmed, color: '#42a5f5' },
            { label: 'Completed', value: counts.completed, color: '#66bb6a' },
            { label: 'Cancelled', value: counts.cancelled, color: '#ef5350' },
          ].map(s => (
            <div key={s.label} className="stat-card text-center">
              <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Search patient, doctor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 min-w-48 text-sm py-2"
          />
          <select
            value={filterStatus}
            onChange={e => setFSt(e.target.value)}
            className="input-field text-sm py-2 w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFD(e.target.value)}
            className="input-field text-sm py-2 w-auto"
          />
          {filterDate && (
            <button onClick={() => setFD('')}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ color: '#ef5350', border: '1px solid rgba(211,47,47,0.3)' }}>
              Clear Date
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#d32f2f', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No Appointments Found</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {['Patient', 'Doctor', 'Hospital', 'Date & Time', 'Risk', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={a._id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                      }}>
                      {/* Patient */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                            {a.patientId?.name || '—'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {a.patientId?.phone || ''}
                          </p>
                        </div>
                      </td>
                      {/* Doctor */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {a.doctorId?.name || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {a.doctorId?.specialization || ''}
                        </p>
                      </td>
                      {/* Hospital */}
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {a.hospitalId?.name || '—'}
                        </p>
                      </td>
                      {/* Date & Time */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(a.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.appointmentTime}</p>
                      </td>
                      {/* Risk */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold" style={{ color: RISK_COLORS[a.riskLevel] || '#aaa' }}>
                          {a.riskLevel || 'LOW'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          onChange={e => updateStatus(a._id, e.target.value)}
                          className="text-xs rounded-lg px-2 py-1.5 cursor-pointer"
                          style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
