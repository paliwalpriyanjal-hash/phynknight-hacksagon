import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const MOCK_ALERTS = [
  { id: 'E001', patient: 'Arjun Sharma',  risk: 'HIGH',   status: 'active',   time: '2 min ago',  ambulance: 'AMB-042' },
  { id: 'E002', patient: 'Priya Singh',   risk: 'MEDIUM', status: 'resolved', time: '18 min ago', ambulance: 'AMB-017' },
  { id: 'E003', patient: 'Mohan Verma',   risk: 'LOW',    status: 'resolved', time: '35 min ago', ambulance: null },
  { id: 'E004', patient: 'Kavya Rao',     risk: 'HIGH',   status: 'active',   time: '5 min ago',  ambulance: 'AMB-031' },
]

const AMBULANCES = [
  { id: 'AMB-042', driver: 'Ramesh Kumar', status: 'busy',        location: 'Sector 4' },
  { id: 'AMB-017', driver: 'Suresh Yadav', status: 'available',   location: 'Central Hospital' },
  { id: 'AMB-031', driver: 'Dinesh Patel', status: 'busy',        location: 'Ring Road' },
  { id: 'AMB-008', driver: 'Prakash Nair', status: 'maintenance', location: 'Garage' },
]

const AI_SUMMARY = [
  { label: 'High Risk',   count: 4, pct: 28, color: '#d32f2f' },
  { label: 'Medium Risk', count: 6, pct: 42, color: '#f57c00' },
  { label: 'Low Risk',    count: 4, pct: 30, color: '#2e7d32' },
]

const FAKE_ALERTS = [
  { user: 'user_xyz_99', alerts: 7, suspicion: 92, flag: 'Repeated HIGH reports without dispatch completion' },
  { user: 'anon_4521',   alerts: 3, suspicion: 65, flag: 'Contradictory symptoms detected by AI' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <DashboardLayout navItems={NAV} role="admin">
      {/* Header */}
      <div className="mb-5">
        <h1 className="page-title">Admin Monitor</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>System-wide emergency oversight · Real-time</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '🚨', label: 'Active Emergencies', value: '4',     chip: 'chip-critical', delta: '+2',  accent: '#d32f2f' },
          { icon: '🚑', label: 'Available Ambulances',value: '1',    chip: 'chip-info',     delta: '',    accent: '#0066cc' },
          { icon: '👥', label: 'Total Patients',      value: '1,247',chip: 'chip-neutral',  delta: '',    accent: '#6a1b9a' },
          { icon: '⏱',  label: 'Avg Response Time',  value: '8.4m', chip: 'chip-stable',   delta: '-1.2',accent: '#2e7d32' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                style={{ background: `${s.accent}15`, border: `1px solid ${s.accent}25` }}>{s.icon}</div>
              {s.delta && <span className={`chip ${s.chip}`}>{s.delta}</span>}
            </div>
            <p className="font-black text-2xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live Alerts + Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="section-header mb-4">
            <h2 className="section-title">Live Alerts</h2>
            <div className="vital-dot critical ml-auto" />
          </div>
          <div className="space-y-2">
            {MOCK_ALERTS.map(a => (
              <div key={a.id} className="med-card p-3 flex items-center justify-between"
                style={{ borderLeftColor: a.risk === 'HIGH' ? '#d32f2f' : a.risk === 'MEDIUM' ? '#f57c00' : '#2e7d32' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`chip ${a.risk === 'HIGH' ? 'chip-critical' : a.risk === 'MEDIUM' ? 'chip-warning' : 'chip-stable'}`}>{a.risk}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.patient}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.time}{a.ambulance && ` · ${a.ambulance}`}</p>
                </div>
                <span className={`chip ${a.status === 'active' ? 'chip-warning' : 'chip-stable'} capitalize`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="section-header mb-4">
            <h2 className="section-title">Fleet Status</h2>
            <button onClick={() => navigate('/admin/ambulances')}
              className="ml-auto text-xs font-semibold" style={{ color: '#0066cc' }}>Manage →</button>
          </div>
          <div className="space-y-2">
            {AMBULANCES.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div className={`vital-dot ${a.status === 'available' ? 'stable' : a.status === 'busy' ? 'critical' : 'offline'}`} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.id}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.driver} · {a.location}</p>
                  </div>
                </div>
                <span className={`chip ${a.status === 'available' ? 'chip-stable' : a.status === 'busy' ? 'chip-critical' : 'chip-neutral'} capitalize`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="card p-5 mb-4">
        <div className="section-header mb-4">
          <h2 className="section-title">AI Prediction Summary — Today</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {AI_SUMMARY.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-black text-3xl" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs mt-1 mb-2" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fake Alert Detection */}
      <div className="card p-5" style={{ borderLeft: '3px solid #f57c00' }}>
        <div className="section-header mb-4">
          <h2 className="section-title">Fake Alert Detection</h2>
          <span className="chip chip-warning ml-auto">AI Monitored</span>
        </div>
        <div className="space-y-3">
          {FAKE_ALERTS.map(f => (
            <div key={f.user} className="flex items-center justify-between p-3 rounded-lg flex-wrap gap-3"
              style={{ background: 'rgba(245,124,0,0.06)', border: '1px solid rgba(245,124,0,0.2)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.user}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.flag}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip chip-warning">{f.alerts} alerts</span>
                <span className={`chip ${f.suspicion > 80 ? 'chip-critical' : 'chip-warning'}`}>{f.suspicion}% suspicious</span>
                <button className="btn btn-danger text-xs px-3 py-1.5">Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
