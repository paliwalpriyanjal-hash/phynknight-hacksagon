import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-hot-toast'
import ThemeToggle from './ThemeToggle'

const ROLE_CONFIG = {
  patient: {
    color: '#2e7d32', colorLight: '#43a047',
    bg: 'rgba(46,125,50,0.12)', bgActive: 'rgba(46,125,50,0.18)',
    label: 'Patient', badge: 'chip-stable',
    topBorder: '#2e7d32',
  },
  doctor: {
    color: '#0066cc', colorLight: '#3385d6',
    bg: 'rgba(0,102,204,0.1)', bgActive: 'rgba(0,102,204,0.18)',
    label: 'Doctor', badge: 'chip-info',
    topBorder: '#0066cc',
  },
  admin: {
    color: '#d32f2f', colorLight: '#ef5350',
    bg: 'rgba(211,47,47,0.1)', bgActive: 'rgba(211,47,47,0.18)',
    label: 'Administrator', badge: 'chip-critical',
    topBorder: '#d32f2f',
  },
}

export default function DashboardLayout({ children, navItems, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.patient

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 flex flex-col
        sidebar transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-base flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${rc.color}, ${rc.colorLight})`, boxShadow: `0 2px 8px ${rc.color}40` }}>
            +
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs leading-tight truncate" style={{ color: 'var(--text-primary)' }}>MediSync</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Emergency Response</p>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 my-3 p-3 rounded-xl" style={{ background: rc.bg, border: `1px solid ${rc.color}25` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${rc.color}, ${rc.colorLight})` }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="vital-dot stable" />
                <span className="text-xs" style={{ color: rc.colorLight, fontSize: '0.65rem', fontWeight: 600 }}>{rc.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-1">
          <p className="label-xs px-2 mb-2 mt-1">Navigation</p>
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                className="nav-item"
                style={isActive ? {
                  background: rc.bgActive,
                  color: rc.colorLight,
                  fontWeight: 600,
                  borderLeft: `2px solid ${rc.color}`,
                  paddingLeft: '0.875rem',
                } : {}}>
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
            <div className="vital-dot stable" />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>System Online</span>
          </div>
          <button onClick={handleLogout}
            className="nav-item w-full text-left"
            style={{ color: '#ef5350' }}>
            <span className="text-base w-5 text-center">↩</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Topbar */}
        <header className="topbar px-5 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.2)' }}>
              <div className="vital-dot critical" />
              <span style={{ color: '#ef5350', fontSize: '0.7rem', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs hidden md:block" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: `linear-gradient(135deg, ${rc.color}, ${rc.colorLight})` }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
