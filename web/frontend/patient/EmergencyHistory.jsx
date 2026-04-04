import { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report', icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/history', icon: '📋', label: 'My History' },
]

const MOCK = [
  { _id: '1', createdAt: '2024-03-10T10:30:00Z', riskLevel: 'HIGH',   symptoms: ['Chest Pain', 'Shortness of Breath'], status: 'resolved',   aiConfidence: 94 },
  { _id: '2', createdAt: '2024-02-22T14:15:00Z', riskLevel: 'MEDIUM', symptoms: ['Severe Headache', 'High Fever'],       status: 'resolved',   aiConfidence: 78 },
  { _id: '3', createdAt: '2024-01-05T08:00:00Z', riskLevel: 'LOW',    symptoms: ['Burns'],                               status: 'resolved',   aiConfidence: 65 },
]

const RISK_CONFIG = {
  HIGH:   { chip: 'chip-critical', dot: 'critical', label: 'Critical' },
  MEDIUM: { chip: 'chip-warning',  dot: 'warning',  label: 'Moderate' },
  LOW:    { chip: 'chip-stable',   dot: 'stable',   label: 'Stable'   },
}

export default function EmergencyHistory() {
  const [records, setRecords] = useState(MOCK)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    axios.get('/api/emergency/my-history')
      .then(res => { if (res.data?.length) setRecords(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="page-title">Emergency History</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{records.length} records found</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card h-20 animate-pulse" style={{ background: 'var(--bg-surface)' }} />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No history yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your emergency reports will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => {
              const rc = RISK_CONFIG[r.riskLevel] || RISK_CONFIG.LOW
              return (
                <div key={r._id} className="med-card p-4"
                  style={{ borderLeftColor: r.riskLevel === 'HIGH' ? '#d32f2f' : r.riskLevel === 'MEDIUM' ? '#f57c00' : '#2e7d32' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className={`vital-dot ${rc.dot}`} />
                        <span className={`chip ${rc.chip}`}>{rc.label} Risk</span>
                        <span className="chip chip-neutral">AI: {r.aiConfidence}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {r.symptoms.map(s => (
                          <span key={s} className="chip chip-neutral">{s}</span>
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`chip ${r.status === 'resolved' || r.status === 'completed' ? 'chip-stable' : 'chip-warning'} capitalize`}>
                      {r.status}
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
