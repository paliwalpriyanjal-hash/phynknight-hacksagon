import { useState, useEffect } from 'react'
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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const LOW_STOCK_THRESHOLD = 3

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl p-6 z-10 overflow-y-auto max-h-[90vh]"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} className="text-xl" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  name: '', address: '', phone: '', emergencyContact: '',
  lat: '', lng: '',
}

export default function HospitalManagementPage() {
  const [hospitals, setHospitals]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editModal, setEditModal]   = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/hospitals')
      setHospitals(res.data)
    } catch {
      toast.error('Failed to load hospitals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditModal(null)
    setShowModal(true)
  }

  const openEdit = (h) => {
    setForm({
      name: h.name,
      address: h.address,
      phone: h.phone || '',
      emergencyContact: h.emergencyContact || '',
      lat: h.location?.lat || '',
      lng: h.location?.lng || '',
    })
    setEditModal(h)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Hospital name required')
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        emergencyContact: form.emergencyContact,
        location: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
      }
      if (editModal) {
        await axios.patch(`/api/hospitals/${editModal._id}`, payload)
        toast.success('Hospital updated')
      } else {
        await axios.post('/api/hospitals', payload)
        toast.success('Hospital added')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await axios.delete(`/api/hospitals/${id}`)
      toast.success('Hospital removed')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editModal ? 'Edit Hospital' : 'Add New Hospital'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Hospital Name *
            </label>
            <input className="input-field" placeholder="e.g. City General Hospital"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Address</label>
            <input className="input-field" placeholder="Full address"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Phone</label>
              <input className="input-field" placeholder="0731-XXXXXXX"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Emergency Contact</label>
              <input className="input-field" placeholder="Emergency no."
                value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Latitude</label>
              <input type="number" step="any" className="input-field" placeholder="e.g. 22.7196"
                value={form.lat} onChange={e => set('lat', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Longitude</label>
              <input type="number" step="any" className="input-field" placeholder="e.g. 75.8577"
                value={form.lng} onChange={e => set('lng', e.target.value)} />
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            💡 Tip: Search your city on <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="underline" style={{ color: '#42a5f5' }}>OpenStreetMap</a> to find coordinates.
          </p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d32f2f, #c62828)' }}>
              {saving ? 'Saving…' : editModal ? 'Update Hospital' : 'Add Hospital'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(211,47,47,0.1)', border: '1px solid rgba(211,47,47,0.2)' }}>🏥</div>
              <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                Hospitals
              </h1>
            </div>
            <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
              Manage hospital records and locations
            </p>
          </div>
          <button onClick={openAdd}
            className="btn py-2 px-5 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #d32f2f, #c62828)' }}>
            + Add Hospital
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="stat-card text-center">
            <p className="font-black text-2xl" style={{ color: '#d32f2f' }}>{hospitals.length}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Hospitals</p>
          </div>
          <div className="stat-card text-center">
            <p className="font-black text-2xl" style={{ color: '#0066cc' }}>
              {hospitals.filter(h => h.location?.lat).length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>With GPS Data</p>
          </div>
          <div className="stat-card text-center">
            <p className="font-black text-2xl" style={{ color: '#66bb6a' }}>
              {hospitals.filter(h => h.emergencyContact).length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Emergency Ready</p>
          </div>
        </div>

        {/* Hospital List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#d32f2f', borderTopColor: 'transparent' }} />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🏥</div>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Hospitals Yet</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Add hospitals to enable ambulance dispatch and blood bank features.
            </p>
            <button onClick={openAdd}
              className="btn py-2 px-5 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #d32f2f, #c62828)' }}>
              + Add First Hospital
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {hospitals.map(h => (
              <div key={h._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(211,47,47,0.1)', border: '1px solid rgba(211,47,47,0.2)' }}>🏥</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{h.name}</p>
                      {h.address && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>📍 {h.address}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {h.phone && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            📞 {h.phone}
                          </span>
                        )}
                        {h.emergencyContact && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#ef5350' }}>
                            🚨 {h.emergencyContact}
                          </span>
                        )}
                        {h.location?.lat && (
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            📡 {h.location.lat.toFixed(4)}, {h.location.lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                      {h.services?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {h.services.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded-full text-xs"
                              style={{ background: 'rgba(0,102,204,0.1)', color: '#42a5f5', border: '1px solid rgba(0,102,204,0.2)' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(h)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-blue-500/10"
                      style={{ color: '#42a5f5', border: '1px solid rgba(66,165,245,0.3)' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(h._id, h.name)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-red-500/10"
                      style={{ color: '#ef5350', border: '1px solid rgba(211,47,47,0.3)' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
