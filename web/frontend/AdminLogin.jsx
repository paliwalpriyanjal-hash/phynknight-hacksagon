import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/AuthLayout'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password, 'admin')
      toast.success('Admin access granted!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Admin Login" subtitle="Monitor & Analyze System" accentColor="#ef4444" icon="⚙️">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Admin Email</label>
          <input type="email" className="input-field" placeholder="admin@system.gov"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <input type="password" className="input-field" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-700 hover:opacity-90 disabled:opacity-50 text-white font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
          {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</> : '🔐 Admin Login'}
        </button>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Demo Credentials</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>admin@demo.com / demo1234</p>
        </div>
      </form>
    </AuthLayout>
  )
}
