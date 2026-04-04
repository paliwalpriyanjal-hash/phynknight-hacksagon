import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const NAV = [
  { path: '/doctor/dashboard',      icon: '🏠', label: 'Dashboard' },
  { path: '/doctor/appointments',   icon: '📅', label: 'Appointments' },
  { path: '/doctor/emergencies',    icon: '🚨', label: 'Emergencies' },
]

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#ffa726', bg: 'rgba(245,124,0,0.12)'  },
  confirmed: { label: 'Confirmed', color: '#42a5f5', bg: 'rgba(66,165,245,0.12)' },
  cancelled: { label: 'Cancelled', color: '#ef5350', bg: 'rgba(211,47,47,0.12)'  },
  completed: { label: 'Completed', color: '#66bb6a', bg: 'rgba(46,125,50,0.12)'  },
}

const RISK_CONFIG = {
  LOW:      { color: '#66bb6a' },
  MODERATE: { color: '#ffa726' },
  MEDIUM:   { color: '#ffa726' },
  HIGH:     { color: '#ef5350' },
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl p-6 z-10"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} className="text-xl" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ApptRow({ appt, onAction }) {
  const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending
  const rc = RISK_CONFIG[appt.riskLevel] || RISK_CONFIG.LOW

  return (
    <div className="card p-4 transition-all" style={{ borderLeft: `3px solid ${sc.color}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        {/* Patient info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0066cc, #3385d6)' }}>
            {appt.patientId?.name?.[0] || 'P'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {appt.patientId?.name || 'Patient'}
            </p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                📅 {new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🕐 {appt.appointmentTime}</span>
              {appt.patientId?.phone && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📞 {appt.patientId.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: `${rc.color}18`, color: rc.color }}>
            {appt.riskLevel || 'LOW'} Risk
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: sc.bg, color: sc.color }}>
            {sc.label}
          </span>
        </div>
      </div>

      {/* Symptoms */}
      {appt.symptomsSummary && (
        <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          📝 {appt.symptomsSummary}
        </p>
      )}

      {/* Doctor's notes */}
      {appt.doctorNotes && (
        <div className="mt-3 p-3 rounded-xl"
          style={{ background: 'rgba(66,165,245,0.08)', border: '1px solid rgba(66,165,245,0.2)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#42a5f5' }}>Your Note</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{appt.doctorNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {appt.status === 'pending' && (
          <>
            <button
              onClick={() => onAction(appt._id, 'confirm')}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1565c0, #1976d2)' }}
            >
              ✅ Confirm
            </button>
            <button
              onClick={() => onAction(appt._id, 'cancel')}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/10"
              style={{ color: '#ef5350', border: '1px solid rgba(211,47,47,0.3)' }}
            >
              ✕ Cancel
            </button>
          </>
        )}
        {appt.status === 'confirmed' && (
          <button
            onClick={() => onAction(appt._id, 'complete')}
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2e7d32, #388e3c)' }}
          >
            🎉 Mark Completed
          </button>
        )}
        <button
          onClick={() => onAction(appt._id, 'note')}
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-blue-500/10"
          style={{ color: '#42a5f5', border: '1px solid rgba(66,165,245,0.3)' }}
        >
          📝 {appt.doctorNotes ? 'Edit Note' : 'Add Note'}
        </button>
      </div>
    </div>
  )
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setFilter]   = useState('all')
  const [filterDate, setDate]        = useState('')
  const [noteModal, setNoteModal]    = useState(null) // appt object
  const [noteText, setNoteText]      = useState('')
  const [submitting, setSubmitting]  = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterDate) params.date = filterDate
      const res = await axios.get('/api/appointments/doctor', { params })
      setAppointments(res.data)
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterStatus, filterDate])

  const handleAction = async (apptId, action) => {
    if (action === 'note') {
      const appt = appointments.find(a => a._id === apptId)
      setNoteText(appt?.doctorNotes || '')
      setNoteModal(appt)
      return
    }
    const statusMap = { confirm: 'confirmed', cancel: 'cancelled', complete: 'completed' }
    try {
      await axios.patch(`/api/appointments/${apptId}/status`, { status: statusMap[action] })
      toast.success(`Appointment ${statusMap[action]}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  const submitNote = async () => {
    if (!noteModal) return
    setSubmitting(true)
    try {
      await axios.patch(`/api/appointments/${noteModal._id}/doctor-note`, { doctorNotes: noteText })
      toast.success('Note saved')
      setNoteModal(null)
      load()
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSubmitting(false)
    }
  }

  const counts = { all: appointments.length }
  appointments.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1 })

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      {/* Doctor Note Modal */}
      <Modal open={!!noteModal} onClose={() => setNoteModal(null)} title="Add Consultation Note">
        <textarea
          className="input-field resize-none w-full mb-4"
          rows={5}
          placeholder="Write your consultation notes, recommendations, prescriptions…"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={() => setNoteModal(null)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button onClick={submitNote} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0066cc, #1976d2)' }}>
            {submitting ? 'Saving…' : 'Save Note'}
          </button>
        </div>
      </Modal>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(0,102,204,0.1)', border: '1px solid rgba(0,102,204,0.2)' }}>📅</div>
            <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              My Appointments
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
            View and manage patient consultations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', value: counts.all || 0, color: '#0066cc' },
            { label: 'Pending', value: counts.pending || 0, color: '#ffa726' },
            { label: 'Confirmed', value: counts.confirmed || 0, color: '#42a5f5' },
            { label: 'Done', value: counts.completed || 0, color: '#66bb6a' },
          ].map(s => (
            <div key={s.label} className="stat-card text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={filterStatus === s
                  ? { background: '#0066cc', color: '#fff' }
                  : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {STATUS_CONFIG[s]?.label || 'All'}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => setDate(e.target.value)}
            className="input-field text-xs py-1.5 w-auto"
            title="Filter by date"
          />
          {filterDate && (
            <button onClick={() => setDate('')}
              className="text-xs px-2 py-1.5 rounded-lg"
              style={{ color: '#ef5350', border: '1px solid rgba(211,47,47,0.3)' }}>
              Clear Date
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#0066cc', borderTopColor: 'transparent' }} />
          </div>
        ) : appointments.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Appointments</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No appointments match your current filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </p>
            {appointments.map(a => (
              <ApptRow key={a._id} appt={a} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
