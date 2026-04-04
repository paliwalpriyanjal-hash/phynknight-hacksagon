import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { path: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report', icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/blood-request', icon: '🩸', label: 'Blood Request' },
  { path: '/patient/history', icon: '📋', label: 'My History' },
]

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const URGENCY_LEVELS = [
  { value: 'critical', label: '🔴 Critical — Within hours', color: '#d32f2f' },
  { value: 'high',     label: '🟠 High — Within 24 hours', color: '#f57c00' },
  { value: 'medium',   label: '🟡 Medium — Within 2-3 days', color: '#f9a825' },
  { value: 'low',      label: '🟢 Low — Scheduled', color: '#2e7d32' },
]

export default function BloodRequestForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    bloodGroupNeeded: user?.bloodGroup || 'O+',
    unitsNeeded: 1,
    urgencyLevel: 'high',
    contactPhone: user?.phone || '',
    notes: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/blood-requests', form)
      setResult(res.data)
      toast.success('Blood request submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  const statusConfig = {
    available:           { color: '#2e7d32', bg: 'rgba(46,125,50,0.1)',  border: 'rgba(46,125,50,0.3)',  icon: '✅', text: 'Blood Available!' },
    partially_available: { color: '#f57c00', bg: 'rgba(245,124,0,0.1)', border: 'rgba(245,124,0,0.3)', icon: '⚠️', text: 'Partially Available' },
    not_available:       { color: '#d32f2f', bg: 'rgba(211,47,47,0.1)', border: 'rgba(211,47,47,0.3)', icon: '❌', text: 'Not Available — Admin Notified' },
  }

  if (result) {
    const sc = statusConfig[result.autoStatus] || statusConfig.not_available
    return (
      <DashboardLayout navItems={NAV} role="patient">
        <div className="max-w-lg mx-auto">
          <div className="card p-8 text-center mb-4" style={{ borderTop: `3px solid ${sc.color}` }}>
            <div className="text-5xl mb-3">{sc.icon}</div>
            <h2 className="font-bold text-xl mb-2" style={{ color: sc.color }}>{sc.text}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{result.message}</p>
            <div className="rounded-xl p-4 text-left space-y-2" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Blood Group</span>
                <span className="font-bold" style={{ color: sc.color }}>{form.bloodGroupNeeded}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Units Needed</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{form.unitsNeeded}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Urgency</span>
                <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{form.urgencyLevel}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/patient/blood-history')} className="btn btn-primary flex-1 py-3 text-sm">View My Requests</button>
            <button onClick={() => { setResult(null) }} className="btn btn-outline flex-1 py-3 text-sm">New Request</button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div className="max-w-lg mx-auto">
        <div className="mb-5">
          <h1 className="page-title">🩸 Blood Request</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Request blood from nearest available hospital</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Blood Group */}
          <div className="card p-5">
            <label className="label-xs mb-3 block">Blood Group Needed</label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map(bg => (
                <button key={bg} type="button" onClick={() => set('bloodGroupNeeded', bg)}
                  className="py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={form.bloodGroupNeeded === bg
                    ? { background: 'linear-gradient(135deg, #d32f2f, #b71c1c)', color: 'white', boxShadow: '0 2px 8px rgba(211,47,47,0.35)' }
                    : { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Units + Urgency */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="label-xs mb-2 block">Units Needed</label>
              <input type="number" min={1} max={20} className="input-field" value={form.unitsNeeded}
                onChange={e => set('unitsNeeded', parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <label className="label-xs mb-2 block">Urgency Level</label>
              <div className="space-y-2">
                {URGENCY_LEVELS.map(u => (
                  <button key={u.value} type="button" onClick={() => set('urgencyLevel', u.value)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all"
                    style={form.urgencyLevel === u.value
                      ? { background: `${u.color}15`, border: `1px solid ${u.color}40`, color: u.color, fontWeight: 600 }
                      : { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact + Notes */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="label-xs mb-2 block">Contact Phone *</label>
              <input type="tel" className="input-field" placeholder="+91 9876543210"
                value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} required />
            </div>
            <div>
              <label className="label-xs mb-2 block">Additional Notes</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Patient condition, hospital preference, etc."
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn btn-danger w-full py-3.5 text-sm disabled:opacity-50">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</> : '🩸 Submit Blood Request'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
