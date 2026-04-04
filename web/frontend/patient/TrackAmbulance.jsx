import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'
import LiveMap from '../../components/LiveMap'
import { useTheme } from '../../context/ThemeContext'

const NAV = [
  { path: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report', icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/history', icon: '📋', label: 'My History' },
]

const STEPS = [
  { key: 'dispatched', icon: '📡', label: 'Dispatched' },
  { key: 'en_route',   icon: '🚑', label: 'En Route' },
  { key: 'arriving',   icon: '⚡', label: 'Arriving' },
  { key: 'arrived',    icon: '✅', label: 'Arrived' },
]

const STATUS_CONFIG = {
  dispatched: { text: 'Ambulance Dispatched', color: '#f57c00', bg: 'rgba(245,124,0,0.1)', border: 'rgba(245,124,0,0.3)' },
  en_route:   { text: 'En Route to You',      color: '#0066cc', bg: 'rgba(0,102,204,0.1)', border: 'rgba(0,102,204,0.3)' },
  arriving:   { text: 'Arriving Soon',         color: '#f57c00', bg: 'rgba(245,124,0,0.1)', border: 'rgba(245,124,0,0.3)' },
  arrived:    { text: 'Ambulance Arrived!',    color: '#2e7d32', bg: 'rgba(46,125,50,0.1)', border: 'rgba(46,125,50,0.3)' },
  pending:    { text: 'Processing…',           color: '#0066cc', bg: 'rgba(0,102,204,0.1)', border: 'rgba(0,102,204,0.3)' },
}

// Simulate ambulance moving toward patient (for demo)
function simulateMovement(ambLat, ambLng, patLat, patLng, step) {
  const factor = Math.min(step * 0.15, 0.9)
  return {
    lat: ambLat + (patLat - ambLat) * factor,
    lng: ambLng + (patLng - ambLng) * factor,
  }
}

export default function TrackAmbulance() {
  const { emergencyId } = useParams()
  const navigate = useNavigate()
  const { dark } = useTheme()

  const [emergency, setEmergency] = useState(null)
  const [status, setStatus] = useState('dispatched')
  const [eta, setEta] = useState(10)
  const [elapsed, setElapsed] = useState(0)
  const [ambPos, setAmbPos] = useState(null)
  const [loading, setLoading] = useState(true)
  const pollStep = useRef(0)

  // Fetch emergency data once
  useEffect(() => {
    if (!emergencyId || emergencyId === 'undefined') { setLoading(false); return }
    axios.get(`/api/emergency/${emergencyId}`)
      .then(res => {
        const e = res.data
        setEmergency(e)
        setStatus(e.status || 'dispatched')
        setEta(e.estimatedArrival || 10)
        // Set initial ambulance position (from DB or offset from patient)
        if (e.ambulanceId?.currentLocation?.lat) {
          setAmbPos({ lat: e.ambulanceId.currentLocation.lat, lng: e.ambulanceId.currentLocation.lng })
        } else if (e.location) {
          // Offset ambulance ~2km away for demo
          setAmbPos({ lat: e.location.lat - 0.018, lng: e.location.lng - 0.015 })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [emergencyId])

  // Poll every 6 seconds for status + simulate movement
  useEffect(() => {
    if (!emergencyId || emergencyId === 'undefined') return
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`/api/emergency/${emergencyId}`)
        const e = res.data
        setStatus(e.status || 'dispatched')
        setEta(prev => Math.max(0, prev - 1))
        pollStep.current += 1

        // Simulate ambulance moving toward patient
        if (e.location && ambPos) {
          const moved = simulateMovement(
            ambPos.lat, ambPos.lng,
            e.location.lat, e.location.lng,
            pollStep.current
          )
          setAmbPos(moved)
        }
      } catch {}
    }, 6000)

    const tick = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => { clearInterval(poll); clearInterval(tick) }
  }, [emergencyId, emergency])

  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.dispatched
  const stepIdx = Math.max(0, STEPS.findIndex(s => s.key === status))
  const progress = ((stepIdx + 1) / STEPS.length) * 100

  // Real patient location from emergency record
  const patLat = emergency?.location?.lat
  const patLng = emergency?.location?.lng

  if (loading) return (
    <DashboardLayout navItems={NAV} role="patient">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0066cc', borderTopColor: 'transparent' }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div className="max-w-xl mx-auto">
        <div className="mb-5">
          <h1 className="page-title">Live Ambulance Tracking</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Emergency #{String(emergencyId || 'EMR-001').slice(-6).toUpperCase()} · {elapsed}s elapsed
          </p>
          {/* Show actual location for debug confirmation */}
          {patLat && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              📍 Your location: {patLat.toFixed(4)}, {patLng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Status banner */}
        <div className="rounded-2xl p-6 mb-4 text-center"
          style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
          {status === 'arrived' ? (
            <div className="text-5xl mb-2 animate-success">✅</div>
          ) : (
            <div className="relative w-16 h-16 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: sc.bg, animationDuration: '1.5s' }} />
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ background: sc.bg, border: `2px solid ${sc.border}` }}>
                {STEPS[stepIdx]?.icon}
              </div>
            </div>
          )}
          <h2 className="font-bold text-lg" style={{ color: sc.color }}>{sc.text}</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {emergency?.ambulanceId?.vehicleId || 'AMB-042'}
          </p>
          {status !== 'arrived' && (
            <div className="mt-4">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Estimated Arrival</p>
              <p className="font-black text-4xl" style={{ color: 'var(--text-primary)' }}>
                {eta} <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>min</span>
              </p>
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                  style={i <= stepIdx
                    ? { background: '#0066cc', color: 'white', boxShadow: '0 0 10px rgba(0,102,204,0.4)' }
                    : { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  {i < stepIdx ? '✓' : s.icon}
                </div>
                <span style={{ color: i <= stepIdx ? '#0066cc' : 'var(--text-muted)', fontSize: '0.6rem' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0066cc, #00897b)' }} />
          </div>
        </div>

        {/* Live Map — uses REAL patient coordinates */}
        <div className="card overflow-hidden mb-4" style={{ height: 280 }}>
          <LiveMap
            patientLat={patLat}
            patientLng={patLng}
            ambulanceLat={ambPos?.lat}
            ambulanceLng={ambPos?.lng}
            dark={dark}
          />
        </div>

        {/* Driver */}
        <div className="card p-4 mb-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(0,102,204,0.1)', border: '1px solid rgba(0,102,204,0.2)' }}>👨‍⚕️</div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {emergency?.ambulanceId?.driverName || 'Ramesh Kumar'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Paramedic · ⭐ 4.9 · {emergency?.ambulanceId?.vehicleId || 'AMB-042'}
            </p>
          </div>
          <a href={`tel:${emergency?.ambulanceId?.driverPhone || '+919876543210'}`}
            className="btn btn-success text-xs px-4 py-2">📞 Call</a>
        </div>

        {/* First aid */}
        <div className="card p-4 mb-4" style={{ borderLeft: '3px solid #d32f2f' }}>
          <p className="label-xs mb-2" style={{ color: '#ef5350' }}>While you wait</p>
          <ul className="space-y-1">
            {['Stay calm and do not move unnecessarily','Keep airways clear and breathe slowly','Do not eat or drink anything','Keep someone with you at all times'].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#2e7d32', fontWeight: 700 }}>✓</span>{t}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={() => navigate('/patient/dashboard')} className="btn btn-outline w-full py-2.5 text-sm">
          ← Back to Dashboard
        </button>
      </div>
    </DashboardLayout>
  )
}
