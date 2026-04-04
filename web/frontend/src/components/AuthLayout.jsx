import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

export default function AuthLayout({ title, subtitle, accentColor, icon, children }) {
  const navigate = useNavigate()
  const { dark } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-500"
      style={{ background: dark
        ? 'linear-gradient(160deg, #04080f 0%, #060e1e 50%, #08152a 100%)'
        : 'linear-gradient(160deg, #f4f7fb 0%, #eef3fa 50%, #f0f9f8 100%)' }}>

      {/* Subtle glow blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: accentColor, opacity: dark ? 0.05 : 0.07 }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: accentColor, opacity: dark ? 0.04 : 0.06 }} />

      {/* ECG decoration */}
      <svg className="absolute top-6 left-0 w-full pointer-events-none" height="36" viewBox="0 0 800 36"
        style={{ opacity: dark ? 0.18 : 0.12 }}>
        <polyline points="0,18 100,18 115,4 130,32 145,1 160,34 175,18 400,18 415,4 430,32 445,1 460,34 475,18 700,18 715,4 730,32 745,1 760,34 775,18 800,18"
          stroke="#d32f2f" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Back */}
        <button onClick={() => navigate('/')}
          className="mb-5 flex items-center gap-2 text-xs font-medium transition-all group"
          style={{ color: 'var(--text-muted)' }}>
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: dark ? 'rgba(8,20,42,0.9)' : '#ffffff',
            border: `1px solid ${dark ? 'rgba(0,102,204,0.2)' : 'rgba(0,102,204,0.12)'}`,
            boxShadow: dark ? '0 24px 64px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,102,204,0.1)',
            backdropFilter: 'blur(20px)',
          }}>

          {/* Top accent bar */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${accentColor}, #00897b)` }} />

          <div className="p-7">
            {/* Icon + title */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg"
                style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
                {icon}
              </div>
              <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
            </div>

            {children}
          </div>
        </div>

        {/* Footer brand */}
        <div className="text-center mt-5 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #0066cc, #00897b)' }}>+</div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>MediSync · Emergency Response System</span>
        </div>
      </div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-7"
          style={{ background: dark ? 'rgba(4,8,15,0.7)' : 'rgba(200,210,220,0.5)' }} />
        <div className="absolute bottom-2 left-0 right-0 h-1"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 28px,transparent 28px,transparent 56px)', animation: 'roadDash 0.9s linear infinite' }} />
        <div className="absolute bottom-0.5 text-2xl" style={{ animation: 'ambulanceMove 9s linear infinite' }}>🚑</div>
      </div>
      <style>{`
        @keyframes roadDash { 0%{background-position:0 0} 100%{background-position:56px 0} }
        @keyframes ambulanceMove { 0%{left:-60px} 100%{left:calc(100% + 60px)} }
      `}</style>
    </div>
  )
}
