import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../context/ThemeContext'

function EcgLine({ color, delay, top }) {
  return (
    <svg className="absolute w-full left-0 pointer-events-none" style={{ top, height: 44, opacity: 0.25 }}
      viewBox="0 0 800 44" preserveAspectRatio="none">
      <path d="M0,22 L80,22 L95,6 L110,38 L125,2 L140,42 L155,22 L240,22 L255,10 L270,34 L285,22 L400,22 L415,6 L430,38 L445,2 L460,42 L475,22 L560,22 L575,10 L590,34 L605,22 L800,22"
        stroke={color} strokeWidth="1.5" fill="none"
        style={{ strokeDasharray: 1200, strokeDashoffset: 1200, animation: `ecgDraw 3.5s ease-in-out ${delay}s infinite` }} />
    </svg>
  )
}

function AmbulanceRoad({ dark }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-8"
        style={{ background: dark ? 'rgba(4,8,15,0.8)' : 'rgba(200,210,220,0.6)' }} />
      <div className="absolute bottom-2.5 left-0 right-0 h-1"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 32px,transparent 32px,transparent 64px)', animation: 'roadDash 0.8s linear infinite' }} />
      <div className="absolute bottom-1 text-3xl" style={{ animation: 'ambulanceMove 10s linear infinite' }}>🚑</div>
    </div>
  )
}

function RoleCard({ icon, title, subtitle, btnText, color, colorLight, onClick }) {
  return (
    <div className="card p-7 flex flex-col items-center text-center gap-4 cursor-pointer group" onClick={onClick}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110"
        style={{ background: `linear-gradient(135deg, ${color}, ${colorLight})` }}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      <button className="btn w-full text-white text-sm"
        style={{ background: `linear-gradient(135deg, ${color}, ${colorLight})`, boxShadow: `0 3px 12px ${color}40` }}>
        {btnText}
      </button>
    </div>
  )
}

function StatBadge({ value, label, icon }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black gradient-text-blue">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{icon} {label}</div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { dark } = useTheme()

  return (
    <div className="min-h-screen relative overflow-hidden transition-all duration-500"
      style={{ background: dark
        ? 'linear-gradient(160deg, #04080f 0%, #060e1e 40%, #08152a 70%, #04080f 100%)'
        : 'linear-gradient(160deg, #f4f7fb 0%, #eef3fa 40%, #f0f9f8 70%, #f4f7fb 100%)' }}>

      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: dark ? 'radial-gradient(circle, rgba(0,102,204,0.07) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(0,102,204,0.06) 0%, transparent 65%)' }} />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: dark ? 'radial-gradient(circle, rgba(0,137,123,0.06) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(0,137,123,0.05) 0%, transparent 65%)' }} />

      {/* ECG lines */}
      <EcgLine color={dark ? '#ef5350' : '#d32f2f'} delay={0} top={100} />
      <EcgLine color={dark ? '#42a5f5' : '#0066cc'} delay={1.8} top={128} />

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(0,102,204,0.12)' : 'rgba(0,102,204,0.08)'}`, backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          {/* Medical cross logo */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0066cc, #00897b)' }}>+</div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>MediSync</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Emergency Response System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.2)' }}>
            <div className="vital-dot critical" />
            <span style={{ color: '#ef5350', fontSize: '0.7rem', fontWeight: 600 }}>24/7 Emergency Active</span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative z-10 text-center pt-16 pb-10 px-6">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
          style={{ background: dark ? 'rgba(0,102,204,0.12)' : 'rgba(0,102,204,0.08)', color: dark ? '#42a5f5' : '#0066cc', border: `1px solid ${dark ? 'rgba(0,102,204,0.25)' : 'rgba(0,102,204,0.18)'}` }}>
          🤖 AI-Powered · Real-Time · Government Certified
        </div>

        <h1 className="font-display font-black leading-tight mb-4"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', color: 'var(--text-primary)' }}>
          Smart Emergency<br />
          <span className="gradient-text-blue">Response System</span>
        </h1>

        <p className="text-base max-w-lg mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          AI-powered symptom triage · Instant ambulance dispatch · Real-time hospital coordination
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 mb-10 flex-wrap">
          <StatBadge value="96.2%" label="AI Accuracy" icon="🤖" />
          <div className="w-px h-8" style={{ background: 'var(--border-default)' }} />
          <StatBadge value="8.4m" label="Avg Response" icon="⏱" />
          <div className="w-px h-8" style={{ background: 'var(--border-default)' }} />
          <StatBadge value="1,247" label="Lives Saved" icon="❤️" />
          <div className="w-px h-8" style={{ background: 'var(--border-default)' }} />
          <StatBadge value="24/7" label="Always On" icon="🔴" />
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-outline px-7 py-3 text-sm">
            Learn More ↓
          </button>
          <button onClick={() => navigate('/patient/login')}
            className="btn btn-danger px-7 py-3 text-sm">
            🚨 Emergency Login
          </button>
        </div>
      </div>

      {/* ── ROLE CARDS ── */}
      <div id="roles" className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <p className="label-xs text-center mb-6">Select Your Role</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <RoleCard icon="🧑‍⚕️" title="Patient Portal" subtitle="Report symptoms, get AI triage, track ambulance in real-time"
            btnText="Patient Login" color="#ffffffff" colorLight="#43a047" onClick={() => navigate('/patient/login')} />
          <RoleCard icon="🏥" title="Hospital / Doctor" subtitle="Receive live alerts, manage emergencies, coordinate treatment"
            btnText="Doctor Login" color="#ffffffff" colorLight="#3385d6" onClick={() => navigate('/doctor/login')} />
          <RoleCard icon="⚙️" title="Admin Control" subtitle="Monitor fleet, analyze data, manage system resources"
            btnText="Admin Login" color="#ffffffff" colorLight="#ef5350" onClick={() => navigate('/admin/login')} />
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🚑', title: 'Instant Dispatch', desc: 'Nearest ambulance auto-dispatched within seconds of HIGH risk detection' },
            { icon: '🗺️', title: 'Live GPS Tracking', desc: 'OpenStreetMap-powered real-time ambulance tracking, no API key needed' },
            { icon: '🤖', title: 'AI Risk Engine', desc: 'NLP + CNN model analyzes symptoms, voice & images for accurate triage' },
          ].map(f => (
            <div key={f.title} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(0,102,204,0.1)', border: '1px solid rgba(0,102,204,0.2)' }}>{f.icon}</div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div className="relative z-10 py-6 px-6" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 flex-wrap">
          {['🔒 HIPAA Compliant', '🤖 AI Certified', '✅ Govt Approved', '⚡ Real-Time', '🏥 Hospital Grade'].map(b => (
            <span key={b} className="text-xs font-semibold px-4 py-1.5 rounded-full"
              style={{ background: dark ? 'rgba(0,102,204,0.1)' : 'rgba(0,102,204,0.07)', color: dark ? '#42a5f5' : '#0066cc', border: '1px solid rgba(0,102,204,0.2)' }}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="relative z-10 text-center py-6 pb-16" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        <svg viewBox="0 0 800 20" className="w-full mb-3" style={{ opacity: 0.15 }}>
          <polyline points="0,12 100,12 115,3 130,18 145,1 160,18 175,12 400,12 415,3 430,18 445,1 460,18 475,12 700,12 715,3 730,18 745,1 760,18 775,12 800,12"
            stroke="#0066cc" strokeWidth="1.5" fill="none" />
        </svg>
        © 2026 MediSync Emergency Response Platform · All rights reserved
      </div>

      <AmbulanceRoad dark={dark} />
    </div>
  )
}
