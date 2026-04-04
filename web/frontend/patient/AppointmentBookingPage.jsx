import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../api'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report', icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/appointments', icon: '📅', label: 'Book Appointment' },
  { path: '/patient/appt-history', icon: '🗂️', label: 'My Appointments' },
  { path: '/patient/blood-request', icon: '🩸', label: 'Blood Request' },
  { path: '/patient/history', icon: '📋', label: 'My History' },
]

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM',
]

const RISK_COLORS = {
  HIGH: { bg: 'rgba(211,47,47,0.12)', border: '#d32f2f40', text: '#ef5350', label: 'HIGH' },
  MEDIUM: { bg: 'rgba(245,124,0,0.12)', border: '#f57c0040', text: '#ffa726', label: 'MODERATE' },
  MODERATE: { bg: 'rgba(245,124,0,0.12)', border: '#f57c0040', text: '#ffa726', label: 'MODERATE' },
  LOW: { bg: 'rgba(46,125,50,0.12)', border: '#2e7d3240', text: '#66bb6a', label: 'LOW' },
}

export default function AppointmentBookingPage() {
  const navigate = useNavigate()
  const locState = useLocation().state || {}

  const preRiskLevel = locState.riskLevel || 'LOW'
  const preEmergency = locState.emergencyId || ''
  const preSymptoms = locState.symptoms || ''

  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    doctorId: '',
    hospitalId: '',
    appointmentDate: '',
    appointmentTime: '',
    symptomsSummary: preSymptoms,
    notes: '',
    riskLevel: preRiskLevel,
    linkedEmergency: preEmergency,
  })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [dRes, hRes] = await Promise.all([
          api.get('/api/auth/doctors'),
          api.get('/api/hospitals'),
        ])
        setDoctors(dRes.data)
        setHospitals(hRes.data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load doctors/hospitals')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.doctorId) return toast.error('Please select a doctor')
    if (!form.appointmentDate) return toast.error('Please select a date')
    if (!form.appointmentTime) return toast.error('Please select a time slot')

    setSubmitting(true)

    try {
      const payload = {
        ...form,
        hospitalId: form.hospitalId || undefined,
        linkedEmergency: form.linkedEmergency || undefined,
      }

      await api.post('/api/appointments', payload)

      toast.success('Appointment booked successfully! 🎉')
      navigate('/patient/appt-history')
    } catch (err) {
      console.error('BOOKING ERROR:', err)
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const rc = RISK_COLORS[preRiskLevel] || RISK_COLORS.LOW

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(0,102,204,0.1)', border: '1px solid rgba(0,102,204,0.2)' }}
            >
              📅
            </div>
            <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Book Appointment
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
            Schedule a consultation with a doctor
          </p>
        </div>

        {preRiskLevel && preRiskLevel !== 'HIGH' && (
          <div
            className="glass rounded-xl p-4 mb-5 flex items-center gap-3"
            style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
          >
            <span className="text-2xl">{preRiskLevel === 'LOW' ? '✅' : '⚠️'}</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: rc.text }}>
                AI Risk Level: {rc.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {preRiskLevel === 'LOW'
                  ? 'Your condition is stable. A doctor consultation is recommended.'
                  : 'Moderate severity detected. Please see a doctor soon.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Select Doctor <span className="text-red-400">*</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-4" style={{ color: 'var(--text-muted)' }}>
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#0066cc', borderTopColor: 'transparent' }}
                />
                <span className="text-sm">Loading doctors…</span>
              </div>
            ) : (
              <div className="grid gap-2">
                {doctors.map((doc) => (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => {
                      set('doctorId', doc._id)
                      if (doc.hospitalId?._id) set('hospitalId', doc.hospitalId._id)
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      form.doctorId === doc._id
                        ? 'border-blue-500/60 bg-blue-500/10'
                        : 'hover:border-blue-500/30 hover:bg-blue-500/5'
                    }`}
                    style={{ borderColor: form.doctorId === doc._id ? undefined : 'var(--border)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0066cc, #3385d6)' }}
                    >
                      {doc.name?.[0] || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {doc.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {doc.specialization || 'General Medicine'}
                        {doc.hospitalId?.name && ` · ${doc.hospitalId.name}`}
                      </p>
                    </div>
                    {form.doctorId === doc._id && (
                      <span className="text-blue-400 text-lg flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}

                {doctors.length === 0 && !loading && (
                  <p className="text-sm py-2 text-center" style={{ color: 'var(--text-muted)' }}>
                    No doctors available.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-600" />
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Hospital</h2>
            </div>

            <select
              value={form.hospitalId}
              onChange={(e) => set('hospitalId', e.target.value)}
              className="input-field"
            >
              <option value="">-- Select hospital (optional) --</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} — {h.address}
                </option>
              ))}
            </select>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-violet-600" />
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Date & Time <span className="text-red-400">*</span>
              </h2>
            </div>

            <div className="mb-4">
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Appointment Date
              </label>
              <input
                type="date"
                min={today}
                value={form.appointmentDate}
                onChange={(e) => set('appointmentDate', e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Time Slot
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => set('appointmentTime', slot)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                      form.appointmentTime === slot
                        ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white border-transparent'
                        : 'hover:border-purple-500/40'
                    }`}
                    style={
                      form.appointmentTime !== slot
                        ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                        : {}
                    }
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-500 to-orange-600" />
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Consultation Details
              </h2>
            </div>

            <div className="mb-4">
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Symptoms Summary
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Briefly describe your symptoms or concern…"
                value={form.symptomsSummary}
                onChange={(e) => set('symptomsSummary', e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Additional Notes (optional)
              </label>
              <textarea
                className="input-field resize-none"
                rows={2}
                placeholder="Any other information for the doctor…"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              ← Go Back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Booking…
                </>
              ) : (
                '📅 Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}