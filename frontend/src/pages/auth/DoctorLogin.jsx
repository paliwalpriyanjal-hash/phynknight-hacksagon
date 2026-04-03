import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/AuthLayout'

export default function DoctorLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password, 'doctor')
      toast.success('Welcome, Doctor!')
      navigate('/doctor/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Hospital Login" subtitle="Manage Emergency Cases" accentColor="#3b82f6" icon="🏥">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Doctor Email</label>
          <input type="email" className="input-field" placeholder="doctor@hospital.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <input type="password" className="input-field" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-700 hover:opacity-90 disabled:opacity-50 text-white font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
          {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Logging in...</> : '🏥 Doctor Login'}
        </button>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Demo Credentials</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>doctor@demo.com / demo1234</p>
        </div>
      </form>
    </AuthLayout>
  )
}
