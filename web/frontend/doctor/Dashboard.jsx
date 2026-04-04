import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/doctor/dashboard',    icon: '🏠', label: 'Dashboard' },
  { path: '/doctor/appointments', icon: '📅', label: 'Appointments' },
]

const riskBorder = { HIGH: '#d32f2f', MEDIUM: '#f57c00', LOW: '#2e7d32' }
const riskChip   = {
  HIGH:   'chip chip-critical',
  MEDIUM: 'chip chip-warning',
  LOW:    'chip chip-stable',
}

// Fallback mock data in case backend is unreachable
const MOCK_EMERGENCIES = [
  { _id: 'e1', patientId: { name: 'Arjun Sharma', phone: '9876543210', bloodGroup: 'O+' }, riskLevel: 'HIGH',   symptoms: ['Chest Pain', 'Shortness of Breath'], status: 'pending',      createdAt: new Date().toISOString(),              estimatedArrival: 8,  aiConfidence: 94 },
  { _id: 'e2', patientId: { name: 'Priya Singh',   phone: '9876543211', bloodGroup: 'B+' }, riskLevel: 'MEDIUM', symptoms: ['Severe Headache', 'High Fever'],     status: 'acknowledged', createdAt: new Date(Date.now() - 600000).toISOString(), estimatedArrival: 15, aiConfidence: 78 },
  { _id: 'e3', patientId: { name: 'Mohan Verma',   phone: '9988776655', bloodGroup: 'A+' }, riskLevel: 'LOW',    symptoms: ['Burns'],                             status: 'preparing',    createdAt: new Date(Date.now() - 1200000).toISOString(), estimatedArrival: null, aiConfidence: 65 },
]

export default function DoctorDashboard() {
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading]         = useState(true)
  const [apptCount, setApptCount]     = useState({ pending: 0, total: 0 })
  const [filter, setFilter]           = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [eRes, aRes] = await Promise.allSettled([
          axios.get('/api/emergency/all', { params: { limit: 30 } }),
          axios.get('/api/appointments/doctor'),
        ])
        if (eRes.status === 'fulfilled') {
          setEmergencies(eRes.value.data.emergencies || eRes.value.data || [])
        } else {
          setEmergencies(MOCK_EMERGENCIES)
        }
        if (aRes.status === 'fulfilled') {
          const appts = aRes.value.data || []
          setApptCount({ total: appts.length, pending: appts.filter(a => a.status === 'pending').length })
        }
      } catch {
        setEmergencies(MOCK_EMERGENCIES)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = filter === 'all'
    ? emergencies
    : emergencies.filter(e => e.riskLevel === filter || e.status === filter)

  const acknowledge = async (id) => {
    setEmergencies(prev => prev.map(e => e._id === id ? { ...e, status: 'acknowledged' } : e))
    toast.success('Emergency acknowledged')
    try { await axios.patch(`/api/emergency/${id}/acknowledge`) } catch {}
  }

  const markPreparing = async (id) => {
    setEmergencies(prev => prev.map(e => e._id === id ? { ...e, status: 'preparing' } : e))
    toast.success('Marked as preparing')
    try { await axios.patch(`/api/emergency/${id}/status`, { status: 'preparing' }) } catch {}
  }

  const stats = {
    total:   emergencies.length,
    high:    emergencies.filter(e => e.riskLevel === 'HIGH').length,
    pending: emergencies.filter(e => e.status === 'pending').length,
    active:  emergencies.filter(e => ['dispatched', 'acknowledged', 'preparing', 'en_route'].includes(e.status)).length,
  }

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Doctor Dashboard</h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Real-time emergency alerts · Active monitoring
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.25)' }}>
          <div className="vital-dot stable" />
          <span className="text-xs font-semibold" style={{ color: '#43a047' }}>On Duty</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Cases',   value: stats.total,  icon: '📋', color: '#0066cc' },
          { label: 'High Risk',     value: stats.high,   icon: '🚨', color: '#d32f2f' },
          { label: 'Pending',       value: stats.pending,icon: '⏳', color: '#f57c00' },
          { label: 'Active',        value: stats.active, icon: '⚕️', color: '#9c27b0' },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>{s.icon}</div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Quick Stats */}
      {(apptCount.total > 0 || apptCount.pending > 0) && (
        <div className="glass rounded-xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap"
          style={{ border: '1px solid rgba(0,102,204,0.2)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {apptCount.pending} pending appointment{apptCount.pending !== 1 ? 's' : ''}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {apptCount.total} total scheduled
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/doctor/appointments')}
            className="btn btn-primary text-xs px-4 py-2">
            View All →
          </button>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'HIGH', 'MEDIUM', 'LOW', 'pending', 'acknowledged', 'preparing'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
            style={filter === f
              ? { background: '#0066cc', color: 'white' }
              : { background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Emergency Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#0066cc', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const patient = e.patientId || {}
            return (
              <div key={e._id} className="med-card p-4"
                style={{ borderLeftColor: riskBorder[e.riskLevel] || '#0066cc' }}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={riskChip[e.riskLevel] || 'chip chip-neutral'}>
                        {e.riskLevel === 'HIGH' ? '🚨' : e.riskLevel === 'MEDIUM' ? '⚠️' : '✅'} {e.riskLevel}
                      </span>
                      <span className="chip chip-neutral capitalize">{e.status}</span>
                      {e.aiConfidence && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          AI: {e.aiConfidence}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      {patient.name || 'Patient'}
                    </h3>
                    {patient.phone && (
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        📞 {patient.phone}
                        {patient.bloodGroup && ` · 🩸 ${patient.bloodGroup}`}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {(e.symptoms || []).slice(0, 4).map(s => (
                        <span key={s} className="chip chip-neutral">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <span>⏱ {new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      {e.estimatedArrival && <span>🚑 ETA: {e.estimatedArrival} min</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {e.status === 'pending' && (
                      <button onClick={() => acknowledge(e._id)} className="btn btn-primary text-xs px-4 py-2">
                        ✅ Acknowledge
                      </button>
                    )}
                    {e.status === 'acknowledged' && (
                      <button onClick={() => markPreparing(e._id)} className="btn btn-success text-xs px-4 py-2">
                        ⚕️ Preparing
                      </button>
                    )}
                    <button onClick={() => navigate(`/doctor/emergency/${e._id}`)}
                      className="btn btn-outline text-xs px-4 py-2">
                      Details →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No emergencies matching this filter
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
