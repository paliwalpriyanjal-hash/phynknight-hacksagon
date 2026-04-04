import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/admin/dashboard',       icon: '📊', label: 'Dashboard' },
  { path: '/admin/appointments',    icon: '📅', label: 'Appointments' },
  { path: '/admin/emergencies',     icon: '🚨', label: 'Emergency Logs' },
  { path: '/admin/blood-inventory', icon: '🩸', label: 'Blood Inventory' },
  { path: '/admin/blood-requests',  icon: '💉', label: 'Blood Requests' },
  { path: '/admin/hospitals',       icon: '🏥', label: 'Hospitals' },
  { path: '/admin/ambulances',      icon: '🚑', label: 'Ambulances' },
  { path: '/admin/users',           icon: '👥', label: 'Users' },
  { path: '/admin/analytics',       icon: '📈', label: 'Analytics' },
]

const STATUS_OPTIONS = ['pending','available','partially_available','not_available','arranged','completed','rejected']
const STATUS_CHIP = {
  pending:             'chip-neutral',
  available:           'chip-stable',
  partially_available: 'chip-warning',
  not_available:       'chip-critical',
  arranged:            'chip-info',
  completed:           'chip-stable',
  rejected:            'chip-critical',
}

export default function BloodRequestsPage() {
  const [requests, setRequests] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [responding, setResponding] = useState(null)
  const [response, setResponse] = useState({ status: 'available', adminResponseMessage: '', assignedHospital: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [rRes, hRes] = await Promise.all([
        axios.get('/api/blood-requests'),
        axios.get('/api/hospitals'),
      ])
      setRequests(rRes.data)
      setHospitals(hRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submitResponse = async (id) => {
    try {
      await axios.patch(`/api/blood-requests/${id}/respond`, response)
      toast.success('Response sent')
      setResponding(null)
      load()
    } catch { toast.error('Failed') }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <div className="mb-5">
        <h1 className="page-title">📋 Blood Requests</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{requests.length} total requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
            style={filter === s
              ? { background: '#0066cc', color: 'white' }
              : { background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" style={{ background: 'var(--bg-surface)' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r._id} className="card p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-black text-lg" style={{ color: '#d32f2f' }}>{r.bloodGroupNeeded}</span>
                    <span className="chip chip-neutral">{r.unitsNeeded} units</span>
                    <span className={`chip ${STATUS_CHIP[r.status] || 'chip-neutral'} capitalize`}>{r.status?.replace('_',' ')}</span>
                    <span className={`chip ${r.urgencyLevel === 'critical' ? 'chip-critical' : r.urgencyLevel === 'high' ? 'chip-warning' : 'chip-stable'} capitalize`}>{r.urgencyLevel}</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.patientId?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>📞 {r.contactPhone} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  {r.assignedHospital && <p className="text-xs mt-1" style={{ color: '#0066cc' }}>🏥 {r.assignedHospital.name}</p>}
                  {r.adminResponseMessage && <p className="text-xs italic mt-1" style={{ color: 'var(--text-muted)' }}>"{r.adminResponseMessage}"</p>}
                </div>
                <button onClick={() => { setResponding(r._id); setResponse({ status: r.status, adminResponseMessage: r.adminResponseMessage || '', assignedHospital: r.assignedHospital?._id || '' }) }}
                  className="btn btn-primary text-xs px-4 py-2">Respond</button>
              </div>

              {/* Inline response form */}
              {responding === r._id && (
                <div className="mt-4 pt-4 space-y-3 animate-fade-in" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="label-xs mb-1 block">Status</label>
                      <select className="input-field" value={response.status} onChange={e => setResponse(p => ({ ...p, status: e.target.value }))}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-xs mb-1 block">Assign Hospital</label>
                      <select className="input-field" value={response.assignedHospital} onChange={e => setResponse(p => ({ ...p, assignedHospital: e.target.value }))}>
                        <option value="">None</option>
                        {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-xs mb-1 block">Message to Patient</label>
                      <input className="input-field" placeholder="Response message…" value={response.adminResponseMessage}
                        onChange={e => setResponse(p => ({ ...p, adminResponseMessage: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => submitResponse(r._id)} className="btn btn-success text-xs px-5 py-2">Send Response</button>
                    <button onClick={() => setResponding(null)} className="btn btn-outline text-xs px-5 py-2">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
