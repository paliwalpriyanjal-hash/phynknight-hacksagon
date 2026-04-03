import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/AuthLayout'

export default function PatientLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password, 'patient')
      toast.success('Welcome back! Stay safe.')
      navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Patient Login" subtitle="Enter Symptoms & Get Help" accentColor="#22c55e" icon="👩‍⚕️">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
          <input type="email" className="input-field" placeholder="patient@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <input type="password" className="input-field" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
          {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Logging in...</> : '🚀 Patient Login'}
        </button>

        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Demo Credentials</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>patient@demo.com / demo1234</p>
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/patient/register')} className="text-green-500 hover:text-green-400 font-semibold underline">
            Register here
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}
