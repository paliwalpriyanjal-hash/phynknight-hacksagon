import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

const RISK_CONFIG = {
  HIGH:   { label: 'HIGH',     color: '#ef5350', bg: 'rgba(211,47,47,0.12)',  icon: '🚨' },
  MEDIUM: { label: 'MODERATE', color: '#ffa726', bg: 'rgba(245,124,0,0.12)', icon: '⚠️' },
  LOW:    { label: 'LOW',      color: '#66bb6a', bg: 'rgba(46,125,50,0.12)', icon: '✅' },
}

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: '#9e9e9e' },
  dispatched:  { label: 'Dispatched',  color: '#ffa726' },
  acknowledged:{ label: 'Acknowledged',color: '#42a5f5' },
  arrived:     { label: 'Arrived',     color: '#66bb6a' },
  completed:   { label: 'Resolved',    color: '#26c6da' },
  cancelled:   { label: 'Cancelled',   color: '#ef5350' },
}

function RiskBadge({ level }) {
  const rc = RISK_CONFIG[level] || RISK_CONFIG.LOW
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: rc.bg, color: rc.color }}>
      {rc.icon} {rc.label}
    </span>
  )
}

export default function EmergencyLogsPage() {
  const navigate = useNavigate()
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [filterRisk, setFR]     = useState('')
  const [filterStatus, setFS]   = useState('')
  const LIMIT = 20

  const load = async () => {
    setLoading(true)
    try {
      const params = { limit: LIMIT, page }
      if (filterRisk) params.riskLevel = filterRisk
      if (filterStatus) params.status = filterStatus
      const res = await axios.get('/api/emergency/all', { params })
      setLogs(res.data.emergencies)
      setTotal(res.data.total)
    } catch {
      toast.error('Failed to load emergency logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, filterRisk, filterStatus])

  const totalPages = Math.ceil(total / LIMIT)

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/emergency/${id}/status`, { status })
      toast.success('Status updated')
      load()
    } catch {
      toast.error('Update failed')
    }
  }

  // Summary counts
  const counts = {
    high:   logs.filter(e => e.riskLevel === 'HIGH').length,
    medium: logs.filter(e => e.riskLevel === 'MEDIUM').length,
    low:    logs.filter(e => e.riskLevel === 'LOW').length,
  }

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(211,47,47,0.1)', border: '1px solid rgba(211,47,47,0.2)' }}>🚨</div>
            <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Emergency Logs
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
            All emergency cases — {total} total incidents tracked
          </p>
        </div>

        {/* Risk summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'High Risk',  value: counts.high,   color: '#ef5350', icon: '🚨' },
            { label: 'Moderate',   value: counts.medium, color: '#ffa726', icon: '⚠️' },
            { label: 'Low Risk',   value: counts.low,    color: '#66bb6a', icon: '✅' },
          ].map(s => (
            <div key={s.label} className="stat-card text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span>{s.icon}</span>
                <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
              </div>
              <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
          <select value={filterRisk} onChange={e => { setFR(e.target.value); setPage(1) }}
            className="input-field text-sm py-2 w-auto">
            <option value="">All Risk Levels</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="MEDIUM">MODERATE Risk</option>
            <option value="LOW">LOW Risk</option>
          </select>
          <select value={filterStatus} onChange={e => { setFS(e.target.value); setPage(1) }}
            className="input-field text-sm py-2 w-auto">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {(filterRisk || filterStatus) && (
            <button onClick={() => { setFR(''); setFS(''); setPage(1) }}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ color: '#ef5350', border: '1px solid rgba(211,47,47,0.3)' }}>
              Clear Filters
            </button>
          )}
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} / {totalPages || 1}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#d32f2f', borderTopColor: 'transparent' }} />
          </div>
        ) : logs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🚨</div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No Emergency Logs Found</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Patient emergencies will appear here when submitted.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    {['Patient', 'Risk', 'Symptoms', 'Status', 'Ambulance', 'Time', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((e, i) => {
                    const sc = STATUS_CONFIG[e.status] || { label: e.status, color: '#aaa' }
                    return (
                      <tr key={e._id}
                        style={{
                          borderBottom: i < logs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/admin/emergency/${e._id}`)}
                      >
                        {/* Patient */}
                        <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                          <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                            {e.patientId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {e.patientId?.phone || ''}
                          </p>
                        </td>
                        {/* Risk */}
                        <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                          <RiskBadge level={e.riskLevel} />
                        </td>
                        {/* Symptoms */}
                        <td className="px-4 py-3 max-w-[180px]" onClick={ev => ev.stopPropagation()}>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {e.symptoms?.slice(0, 3).join(', ') || e.description?.slice(0, 50) || '—'}
                          </p>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                          <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
                        </td>
                        {/* Ambulance */}
                        <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {e.ambulanceId?.vehicleId || '—'}
                          </p>
                        </td>
                        {/* Time */}
                        <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                          <select
                            value={e.status}
                            onChange={ev => updateStatus(e._id, ev.target.value)}
                            className="text-xs rounded-lg px-2 py-1.5"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-xs rounded-lg font-medium disabled:opacity-40"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  ← Prev
                </button>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Page {page} of {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-xs rounded-lg font-medium disabled:opacity-40"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
