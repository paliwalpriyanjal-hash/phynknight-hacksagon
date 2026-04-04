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

const USERS = [
  { _id: '1', name: 'Arjun Sharma', email: 'arjun@demo.com', role: 'patient', status: 'active', joined: '2024-01-10', emergencies: 3 },
  { _id: '2', name: 'Dr. Kavita Mehra', email: 'kavita@hospital.com', role: 'doctor', status: 'active', joined: '2024-01-05', emergencies: 0 },
  { _id: '3', name: 'Priya Singh', email: 'priya@demo.com', role: 'patient', status: 'active', joined: '2024-02-01', emergencies: 1 },
  { _id: '4', name: 'Dr. Rahul Gupta', email: 'rahul@hospital.com', role: 'doctor', status: 'inactive', joined: '2023-12-20', emergencies: 0 },
  { _id: '5', name: 'Suspicious User', email: 'sus@mail.com', role: 'patient', status: 'flagged', joined: '2024-03-01', emergencies: 7 },
]

const roleBadge = { patient: 'bg-green-500/20 text-green-400', doctor: 'bg-blue-500/20 text-blue-400', admin: 'bg-red-500/20 text-red-400' }
const statusBadge = { active: 'bg-green-500/20 text-green-400', inactive: 'bg-gray-500/20 text-gray-400', flagged: 'bg-red-500/20 text-red-400' }

export default function UserManagement() {
  const [users, setUsers] = useState(USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
    toast.success('User status updated')
  }

  const flagUser = (id) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, status: 'flagged' } : u))
    toast.success('User flagged for review')
  }

  return (
    <DashboardLayout navItems={NAV} role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>👥 User Management</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{users.length} total users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input className="input-field max-w-xs" placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2">
          {['all', 'patient', 'doctor', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${roleFilter === r ? 'bg-orange-500 text-white' : 'glass text-white/60 hover:text-white'}`}>{r}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">Role</th>
                <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">Emergencies</th>
                <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">Joined</th>
                <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{u.name[0]}</div>
                      <div>
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        <p className="text-white/40 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${roleBadge[u.role]}`}>{u.role}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[u.status]}`}>{u.status}</span></td>
                  <td className="px-6 py-4"><span className={`text-sm font-semibold ${u.emergencies > 5 ? 'text-red-400' : 'text-white/70'}`}>{u.emergencies}</span></td>
                  <td className="px-6 py-4 text-white/40 text-sm">{u.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => toggleStatus(u._id)} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all">
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      {u.status !== 'flagged' && (
                        <button onClick={() => flagUser(u._id)} className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-all">
                          Flag
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40">No users found</div>
        )}
      </div>
    </DashboardLayout>
  )
}
