import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [{ path: '/doctor/dashboard', icon: '🏥', label: 'Dashboard' }]

const MOCK = {
  _id: 'e1', patientName: 'Arjun Sharma', age: 45, bloodGroup: 'B+',
  riskLevel: 'HIGH', symptoms: ['Chest Pain', 'Shortness of Breath'],
  description: 'Patient reported sudden severe chest pain radiating to left arm.',
  voiceTranscript: 'I have extreme chest pain, it started 20 minutes ago and is going to my left arm. I feel dizzy and short of breath.',
  confidence: 94,
  explanation: 'High risk classification based on classic cardiac event indicators: chest pain radiating to arm, dyspnea, and dizziness combination suggests acute myocardial infarction.',
  topSymptoms: ['Chest Pain', 'Left Arm Radiation', 'Shortness of Breath'],
  firstAid: ['Keep patient calm and seated', 'Loosen tight clothing', 'Give aspirin if not allergic', 'Monitor consciousness'],
  ambulanceEta: 8, ambulanceNum: 'AMB-042', driverName: 'Ramesh Kumar',
  status: 'acknowledged', createdAt: new Date().toISOString(),
}

const STATUS_STEPS = [
  { key: 'acknowledged', label: 'Acknowledged', icon: '✅', color: '#0066cc' },
  { key: 'preparing',    label: 'Preparing',    icon: '⚕️', color: '#f57c00' },
  { key: 'ready',        label: 'Ready',         icon: '🟢', color: '#2e7d32' },
  { key: 'completed',    label: 'Completed',     icon: '✔️', color: '#546e7a' },
]

export default function EmergencyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [emergency, setEmergency] = useState(MOCK)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState(MOCK.status)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get(`/api/emergency/${id}`)
      .then(res => { setEmergency(res.data); setStatus(res.data.status) })
      .catch(() => {})
  }, [id])

  const updateStatus = async (newStatus) => {
    setSaving(true)
    try {
      await axios.patch(`/api/emergency/${id}/status`, { status: newStatus, doctorNotes: notes })
      setStatus(newStatus)
      toast.success(`Status → ${newStatus}`)
    } catch {
      toast.error('Update failed')
    } finally { setSaving(false) }
  }

  const riskColor = emergency.riskLevel === 'HIGH' ? '#d32f2f' : emergency.riskLevel === 'MEDIUM' ? '#f57c00' : '#2e7d32'
  const riskChip = emergency.riskLevel === 'HIGH' ? 'chip-critical' : emergency.riskLevel === 'MEDIUM' ? 'chip-warning' : 'chip-stable'

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      <div className="max-w-3xl mx-auto">

        {/* Back + header */}
        <button onClick={() => navigate('/doctor/dashboard')}
          className="flex items-center gap-2 text-xs font-medium mb-5 transition-all"
          style={{ color: 'var(--text-muted)' }}>
          ← Back to Dashboard
        </button>

        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="page-title">{emergency.patientName}</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Age: {emergency.age} · Blood: {emergency.bloodGroup} · {new Date(emergency.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`chip ${riskChip} text-sm px-3 py-1`}>
              {emergency.riskLevel === 'HIGH' ? '🚨' : emergency.riskLevel === 'MEDIUM' ? '⚠️' : '✅'} {emergency.riskLevel} RISK
            </span>
            <span className="chip chip-info">AI: {emergency.confidence}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Symptoms */}
          <div className="card p-5">
            <div className="section-header mb-3">
              <h2 className="section-title">Reported Symptoms</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {emergency.symptoms.map(s => (
                <span key={s} className="chip chip-critical">{s}</span>
              ))}
            </div>
            {emergency.description && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{emergency.description}</p>
            )}
          </div>

          {/* Voice transcript */}
          <div className="card p-5">
            <div className="section-header mb-3">
              <h2 className="section-title">Voice Transcript</h2>
            </div>
            <div className="rounded-xl p-3 text-xs italic leading-relaxed"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              "{emergency.voiceTranscript || 'No voice input recorded.'}"
            </div>
          </div>

          {/* AI XAI */}
          <div className="card p-5 md:col-span-2">
            <div className="section-header mb-3">
              <h2 className="section-title">AI Explainability (XAI)</h2>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{emergency.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {emergency.topSymptoms?.map(s => (
                <span key={s} className="chip chip-warning">{s}</span>
              ))}
            </div>
            {/* Confidence bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="label-xs">AI Confidence</span>
                <span className="text-xs font-bold" style={{ color: riskColor }}>{emergency.confidence}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${emergency.confidence}%`, background: `linear-gradient(90deg, ${riskColor}, #00897b)` }} />
              </div>
            </div>
          </div>

          {/* Ambulance */}
          <div className="card p-5">
            <div className="section-header mb-3">
              <h2 className="section-title">Ambulance Info</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Vehicle', value: emergency.ambulanceNum || 'AMB-042' },
                { label: 'Driver', value: emergency.driverName || 'Ramesh Kumar' },
                { label: 'ETA', value: `${emergency.ambulanceEta || 8} minutes` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* First Aid + Notes */}
          <div className="card p-5">
            <div className="section-header mb-3">
              <h2 className="section-title">Preparation Checklist</h2>
            </div>
            <ul className="space-y-1.5 mb-4">
              {emergency.firstAid?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#2e7d32', fontWeight: 700, flexShrink: 0 }}>✓</span>{tip}
                </li>
              ))}
            </ul>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="input-field resize-none text-xs" rows={3}
              placeholder="Add preparation notes..." />
          </div>

          {/* Status workflow */}
          <div className="card p-5 md:col-span-2">
            <div className="section-header mb-4">
              <h2 className="section-title">Update Status</h2>
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {STATUS_STEPS.map(btn => (
                <button key={btn.key} onClick={() => updateStatus(btn.key)} disabled={saving}
                  className="btn text-white text-xs px-4 py-2 disabled:opacity-50"
                  style={{
                    background: status === btn.key
                      ? `linear-gradient(135deg, ${btn.color}, ${btn.color}cc)`
                      : 'var(--bg-surface)',
                    color: status === btn.key ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${status === btn.key ? btn.color : 'var(--border-default)'}`,
                    boxShadow: status === btn.key ? `0 2px 8px ${btn.color}40` : 'none',
                  }}>
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Current status: <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{status}</span>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
