import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
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

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function BloodInventoryPage() {
  const [inventories, setInventories] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // inventoryId being edited
  const [editStock, setEditStock] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newHospital, setNewHospital] = useState('')
  const [newStock, setNewStock] = useState(BLOOD_GROUPS.map(bg => ({ bloodGroup: bg, units: 0 })))

  const load = async () => {
    setLoading(true)
    try {
      const [invRes, hospRes, alertRes] = await Promise.all([
        axios.get('/api/blood-inventory'),
        axios.get('/api/hospitals'),
        axios.get('/api/blood-inventory/low-stock/alerts'),
      ])
      setInventories(invRes.data)
      setHospitals(hospRes.data)
      setAlerts(alertRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const startEdit = (inv) => {
    setEditing(inv._id)
    setEditStock(BLOOD_GROUPS.map(bg => {
      const existing = inv.bloodStock?.find(s => s.bloodGroup === bg)
      return { bloodGroup: bg, units: existing?.units ?? 0 }
    }))
  }

  const saveEdit = async (invId) => {
    try {
      await axios.patch(`/api/blood-inventory/${invId}`, { bloodStock: editStock })
      toast.success('Stock updated')
      setEditing(null)
      load()
    } catch { toast.error('Update failed') }
  }

  const addInventory = async () => {
    if (!newHospital) return toast.error('Select a hospital')
    try {
      await axios.post('/api/blood-inventory', { hospitalId: newHospital, bloodStock: newStock })
      toast.success('Inventory created')
      setShowAdd(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const getUnits = (inv, bg) => inv.bloodStock?.find(s => s.bloodGroup === bg)?.units ?? 0

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">🩸 Blood Bank Management</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Manage hospital blood inventory</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-danger text-sm px-5 py-2">+ Add Inventory</button>
      </div>

      {/* Low stock alerts */}
      {alerts.length > 0 && (
        <div className="card p-4 mb-4" style={{ borderLeft: '3px solid #f57c00' }}>
          <p className="label-xs mb-2" style={{ color: '#f57c00' }}>⚠️ Low Stock Alerts ({alerts.length})</p>
          <div className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <span key={i} className="chip chip-warning">{a.hospital} — {a.bloodGroup}: {a.units} units</span>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card p-5 mb-4 animate-fade-in">
          <h2 className="section-title mb-4">Add New Hospital Inventory</h2>
          <div className="mb-4">
            <label className="label-xs mb-2 block">Hospital</label>
            <select className="input-field" value={newHospital} onChange={e => setNewHospital(e.target.value)}>
              <option value="">Select hospital…</option>
              {hospitals.filter(h => !inventories.find(i => i.hospitalId?._id === h._id)).map(h => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {newStock.map((s, i) => (
              <div key={s.bloodGroup}>
                <label className="label-xs mb-1 block">{s.bloodGroup}</label>
                <input type="number" min={0} className="input-field text-center" value={s.units}
                  onChange={e => setNewStock(prev => prev.map((x, j) => j === i ? { ...x, units: parseInt(e.target.value) || 0 } : x))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={addInventory} className="btn btn-success text-sm px-5 py-2">Save</button>
            <button onClick={() => setShowAdd(false)} className="btn btn-outline text-sm px-5 py-2">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="card h-32 animate-pulse" style={{ background: 'var(--bg-surface)' }} />)}</div>
      ) : (
        <div className="space-y-4">
          {inventories.map(inv => (
            <div key={inv._id} className="card p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{inv.hospitalId?.name || 'Unknown Hospital'}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Updated: {new Date(inv.lastUpdated).toLocaleDateString('en-IN')}
                  </p>
                </div>
                {editing === inv._id ? (
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(inv._id)} className="btn btn-success text-xs px-4 py-1.5">Save</button>
                    <button onClick={() => setEditing(null)} className="btn btn-outline text-xs px-4 py-1.5">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(inv)} className="btn btn-primary text-xs px-4 py-1.5">Edit Stock</button>
                )}
              </div>

              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {BLOOD_GROUPS.map((bg, i) => {
                  const units = editing === inv._id
                    ? editStock.find(s => s.bloodGroup === bg)?.units ?? 0
                    : getUnits(inv, bg)
                  const isLow = units <= 3
                  return (
                    <div key={bg} className="text-center p-2 rounded-xl"
                      style={{ background: isLow ? 'rgba(211,47,47,0.08)' : 'var(--bg-surface)', border: `1px solid ${isLow ? 'rgba(211,47,47,0.25)' : 'var(--border-subtle)'}` }}>
                      <p className="font-bold text-xs mb-1" style={{ color: isLow ? '#d32f2f' : 'var(--text-primary)' }}>{bg}</p>
                      {editing === inv._id ? (
                        <input type="number" min={0} className="w-full text-center text-xs rounded-lg p-1"
                          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                          value={editStock[i]?.units ?? 0}
                          onChange={e => setEditStock(prev => prev.map((s, j) => j === i ? { ...s, units: parseInt(e.target.value) || 0 } : s))} />
                      ) : (
                        <p className="font-black text-lg" style={{ color: isLow ? '#d32f2f' : '#2e7d32' }}>{units}</p>
                      )}
                      <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>units</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
