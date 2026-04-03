import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/AuthLayout'

export default function PatientRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', bloodGroup: 'A+' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ ...form, role: 'patient' })
      toast.success('Account created! Stay safe.')
      navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join Smart Health Platform" accentColor="#22c55e" icon="📋">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input type="text" className="input-field" placeholder="John Doe"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Phone</label>
            <input type="tel" className="input-field" placeholder="+91 9876543210"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Blood Group</label>
            <select className="input-field" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" className="input-field" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
          {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : '✅ Create Account'}
        </button>
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/patient/login')} className="text-green-500 hover:text-green-400 font-semibold underline">
            Login here
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}
