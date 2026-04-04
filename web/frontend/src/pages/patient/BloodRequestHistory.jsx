import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report', icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/blood-request', icon: '🩸', label: 'Blood Request' },
  { path: '/patient/history', icon: '📋', label: 'My History' },
]

const STATUS_CONFIG = {
  pending:             { chip: 'chip-neutral',  icon: '⏳', label: 'Pending' },
  available:           { chip: 'chip-stable',   icon: '✅', label: 'Available' },
  partially_available: { chip: 'chip-warning',  icon: '⚠️', label: 'Partial' },
  not_available:       { chip: 'chip-critical', icon: '❌', label: 'Not Available' },
  arranged:            { chip: 'chip-info',     icon: '🏥', label: 'Arranged' },
  completed:           { chip: 'chip-stable',   icon: '✔️', label: 'Completed' },
  rejected:            { chip: 'chip-critical', icon: '🚫', label: 'Rejected' },
}

export default function BloodRequestHistory() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/blood-requests/my')
      .then(r => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="page-title">🩸 Blood Request History</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{requests.length} requests</p>
          </div>
          <button onClick={() => navigate('/patient/blood-request')} className="btn btn-danger text-xs px-4 py-2">+ New Request</button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="card h-20 animate-pulse" style={{ background: 'var(--bg-surface)' }} />)}</div>
        ) : requests.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🩸</div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No blood requests yet</p>
            <button onClick={() => navigate('/patient/blood-request')} className="btn btn-danger text-xs px-5 py-2 mt-4">Request Blood</button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
              return (
                <div key={r._id} className="med-card p-4"
                  style={{ borderLeftColor: r.urgencyLevel === 'critical' ? '#d32f2f' : r.urgencyLevel === 'high' ? '#f57c00' : '#2e7d32' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-black text-lg" style={{ color: '#d32f2f' }}>{r.bloodGroupNeeded}</span>
                        <span className="chip chip-neutral">{r.unitsNeeded} units</span>
                        <span className={`chip ${sc.chip}`}>{sc.icon} {sc.label}</span>
                      </div>
                      {r.assignedHospital && (
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          🏥 {r.assignedHospital.name}
                        </p>
                      )}
                      {r.adminResponseMessage && (
                        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>"{r.adminResponseMessage}"</p>
                      )}
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`chip capitalize ${r.urgencyLevel === 'critical' ? 'chip-critical' : r.urgencyLevel === 'high' ? 'chip-warning' : 'chip-stable'}`}>
                      {r.urgencyLevel}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
