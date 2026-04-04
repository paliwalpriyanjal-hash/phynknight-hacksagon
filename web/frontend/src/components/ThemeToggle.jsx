import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme()
  return (
    <button onClick={toggle} aria-label="Toggle theme"
      title={dark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${className}`}
      style={{
        background: dark ? 'rgba(0,102,204,0.12)' : 'rgba(0,102,204,0.07)',
        border: `1px solid ${dark ? 'rgba(0,102,204,0.25)' : 'rgba(0,102,204,0.15)'}`,
        color: dark ? '#42a5f5' : '#0066cc',
      }}>
      <span className="transition-all duration-300">{dark ? '🌙' : '☀️'}</span>
      <span className="hidden sm:inline">{dark ? 'Night' : 'Day'}</span>
    </button>
  )
}
