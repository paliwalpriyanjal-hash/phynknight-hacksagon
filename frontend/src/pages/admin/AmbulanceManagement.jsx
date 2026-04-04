import { useState } from 'react'
import { toast } from 'react-hot-toast'
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

const INITIAL = [
  { id: 'AMB-042', driver: 'Ramesh Kumar', phone: '9876543210', status: 'busy', lat: 22.718, lng: 75.857, lastService: '2024-02-15' },
  { id: 'AMB-017', driver: 'Suresh Yadav', phone: '9876543211', status: 'available', lat: 22.720, lng: 75.854, lastService: '2024-03-01' },
  { id: 'AMB-031', driver: 'Dinesh Patel', phone: '9876543212', status: 'busy', lat: 22.715, lng: 75.860, lastService: '2024-01-20' },
  { id: 'AMB-008', driver: 'Prakash Nair', phone: '9876543213', status: 'maintenance', lat: 22.722, lng: 75.852, lastService: '2024-03-10' },
]

const statusColor = { available: 'bg-green-500/20 text-green-400', busy: 'bg-orange-500/20 text-orange-400', maintenance: 'bg-gray-500/20 text-gray-400' }
const dotColor = { available: 'bg-green-500', busy: 'bg-orange-500 animate-pulse', maintenance: 'bg-gray-500' }

export default function AmbulanceManagement() {
  const [ambulances, setAmbulances] = useState(INITIAL)
  const [showAdd, setShowAdd] = useState(false)
  const [newAmb, setNewAmb] = useState({ id: '', driver: '', phone: '', status: 'available' })

  const updateStatus = (id, status) => {
    setAmbulances(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    toast.success(`${id} status updated to ${status}`)
  }

  const addAmbulance = () => {
    if (!newAmb.id || !newAmb.driver) return toast.error('Fill all fields')
    setAmbulances(prev => [...prev, { ...newAmb, lat: 22.718, lng: 75.857, lastService: new Date().toISOString().split('T')[0] }])
    setNewAmb({ id: '', driver: '', phone: '', status: 'available' })
    setShowAdd(false)
    toast.success('Ambulance added!')
  }

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>🚑 Fleet Management</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{ambulances.filter(a => a.status === 'available').length} of {ambulances.length} available</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105">
          + Add Ambulance
        </button>
      </div>

      {showAdd && (
        <div className="glass rounded-2xl p-6 mb-6 border border-orange-500/30 animate-fade-in">
          <h2 className="text-white font-bold text-lg mb-4">Add New Ambulance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input className="input-field" placeholder="Vehicle ID (e.g. AMB-099)" value={newAmb.id} onChange={e => setNewAmb({ ...newAmb, id: e.target.value })} />
            <input className="input-field" placeholder="Driver Name" value={newAmb.driver} onChange={e => setNewAmb({ ...newAmb, driver: e.target.value })} />
            <input className="input-field" placeholder="Phone" value={newAmb.phone} onChange={e => setNewAmb({ ...newAmb, phone: e.target.value })} />
            <select className="input-field" value={newAmb.status} onChange={e => setNewAmb({ ...newAmb, status: e.target.value })}>
              <option value="available" className="text-gray-900">Available</option>
              <option value="maintenance" className="text-gray-900">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addAmbulance} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all">Add</button>
            <button onClick={() => setShowAdd(false)} className="border border-white/20 text-white/60 px-6 py-2 rounded-xl transition-all hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['available', 'busy', 'maintenance'].map(s => (
          <div key={s} className="glass rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-white">{ambulances.filter(a => a.status === s).length}</p>
            <p className={`text-sm font-medium capitalize mt-1 ${s === 'available' ? 'text-green-400' : s === 'busy' ? 'text-orange-400' : 'text-gray-400'}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Ambulance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ambulances.map(a => (
          <div key={a.id} className="glass rounded-2xl p-6 hover:bg-white/5 transition-all border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${dotColor[a.status]}`} />
                <div>
                  <h3 className="text-white font-bold text-xl">{a.id}</h3>
                  <p className="text-white/50 text-sm">{a.driver}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[a.status]}`}>{a.status}</span>
            </div>
            <div className="space-y-2 text-sm text-white/60 mb-4">
              <div className="flex justify-between"><span>Phone</span><span className="text-white">{a.phone}</span></div>
              <div className="flex justify-between"><span>Last Service</span><span className="text-white">{a.lastService}</span></div>
              <div className="flex justify-between"><span>GPS</span><span className="text-white">{a.lat.toFixed(3)}, {a.lng.toFixed(3)}</span></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['available', 'busy', 'maintenance'].filter(s => s !== a.status).map(s => (
                <button key={s} onClick={() => updateStatus(a.id, s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${s === 'available' ? 'bg-green-600/80 hover:bg-green-600' : s === 'busy' ? 'bg-orange-600/80 hover:bg-orange-600' : 'bg-gray-600/80 hover:bg-gray-600'} text-white`}>
                  Set {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
