import { useState, useEffect } from 'react'
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

const WEEKLY_MOCK = [
  { day: 'Mon', high: 3, medium: 5, low: 2 },
  { day: 'Tue', high: 5, medium: 3, low: 4 },
  { day: 'Wed', high: 2, medium: 7, low: 3 },
  { day: 'Thu', high: 6, medium: 4, low: 1 },
  { day: 'Fri', high: 4, medium: 6, low: 5 },
  { day: 'Sat', high: 7, medium: 5, low: 2 },
  { day: 'Sun', high: 3, medium: 2, low: 6 },
]

export default function Analytics() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    axios.get('/api/analytics').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const maxBar = Math.max(...WEEKLY_MOCK.map(d => d.high + d.medium + d.low))

  const kpis = stats ? [
    { label: 'Total Patients',      value: stats.totalUsers,        color: '#0066cc' },
    { label: 'Total Emergencies',   value: stats.totalEmergencies,  color: '#d32f2f' },
    { label: 'High Risk Cases',     value: stats.highRisk,          color: '#d32f2f' },
    { label: 'AI Accuracy',         value: '96.2%',                 color: '#0066cc' },
    { label: 'Avail. Ambulances',   value: stats.availableAmbs,     color: '#2e7d32' },
    { label: 'Total Hospitals',     value: stats.totalHospitals,    color: '#00897b' },
    { label: 'Pending Blood Reqs',  value: stats.pendingBlood,      color: '#f57c00' },
    { label: 'Low Stock Alerts',    value: stats.lowStockCount,     color: '#f57c00' },
    { label: 'Total Appointments',  value: stats.totalAppts,        color: '#6a1b9a' },
    { label: 'Pending Appts',       value: stats.pendingAppts,      color: '#ffa726' },
    { label: 'Completed Appts',     value: stats.completedAppts,    color: '#66bb6a' },
    { label: 'Fulfilled Blood',     value: stats.fulfilledBlood,    color: '#66bb6a' },
  ] : []

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <div className="mb-5">
        <h1 className="page-title">Analytics</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>System performance overview</p>
      </div>

      {/* KPI grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {kpis.map(k => (
            <div key={k.label} className="stat-card">
              <p className="font-black text-2xl" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Weekly chart */}
      <div className="card p-5 mb-4">
        <div className="section-header mb-5">
          <h2 className="section-title">Weekly Emergency Distribution</h2>
        </div>
        <div className="flex items-end gap-2 h-44">
          {WEEKLY_MOCK.map(d => {
            const total = d.high + d.medium + d.low
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse gap-px" style={{ height: 160 }}>
                  <div className="w-full rounded-b transition-all duration-700" style={{ height: (d.low / maxBar) * 160, background: '#2e7d32' }} />
                  <div className="w-full transition-all duration-700" style={{ height: (d.medium / maxBar) * 160, background: '#f57c00' }} />
                  <div className="w-full rounded-t transition-all duration-700" style={{ height: (d.high / maxBar) * 160, background: '#d32f2f' }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.day}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</p>
              </div>
            )
          })}
        </div>
        <div className="flex gap-5 mt-3 justify-center">
          {[['#d32f2f','High Risk'],['#f57c00','Medium Risk'],['#2e7d32','Low Risk']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: c }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI + Response time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="section-header mb-4"><h2 className="section-title">AI Performance</h2></div>
          <div className="space-y-3">
            {[
              { label: 'HIGH Risk Precision', val: 97, color: '#d32f2f' },
              { label: 'MEDIUM Risk Precision', val: 94, color: '#f57c00' },
              { label: 'LOW Risk Precision', val: 98, color: '#2e7d32' },
              { label: 'Fake Alert Detection', val: 89, color: '#6a1b9a' },
            ].map(a => (
              <div key={a.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.label}</span>
                  <span className="text-xs font-bold" style={{ color: a.color }}>{a.val}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${a.val}%`, background: a.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="section-header mb-4"><h2 className="section-title">Response Time</h2></div>
          <div className="space-y-3">
            {[
              { label: 'Alert → Dispatch', time: '45s', pct: 85 },
              { label: 'Dispatch → Arrival', time: '8.4m', pct: 60 },
              { label: 'Total Response', time: '9.2m', pct: 55 },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{r.time}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: '#0066cc' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top symptoms */}
      <div className="card p-5">
        <div className="section-header mb-4"><h2 className="section-title">Most Reported Symptoms</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'Chest Pain', count: 38, pct: 85 },
            { name: 'Shortness of Breath', count: 31, pct: 69 },
            { name: 'Severe Headache', count: 27, pct: 60 },
            { name: 'High Fever', count: 22, pct: 49 },
            { name: 'Bleeding', count: 18, pct: 40 },
            { name: 'Fracture', count: 15, pct: 33 },
          ].map(s => (
            <div key={s.name} className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.count}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: '#f57c00' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
