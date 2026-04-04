import { useEffect, useRef, useState } from 'react'

// Plays TTS and shows a full-screen overlay
export default function VoiceAnnouncement({ message, onDone }) {
  const [visible, setVisible] = useState(true)
  const [dots, setDots] = useState(1)
  const spokenRef = useRef(false)

  useEffect(() => {
    if (spokenRef.current) return
    spokenRef.current = true

    // Animated dots
    const dotTimer = setInterval(() => setDots(d => (d % 3) + 1), 500)

    // Web Speech API
    const speak = () => {
      if (!window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(message)
      utter.lang = 'en-IN'
      utter.rate = 0.92
      utter.pitch = 1.05
      utter.volume = 1

      // Pick a clear voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v =>
        v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en'))
      if (preferred) utter.voice = preferred

      utter.onend = () => {
        clearInterval(dotTimer)
        setTimeout(() => { setVisible(false); onDone?.() }, 600)
      }
      window.speechSynthesis.speak(utter)
    }

    // Voices may not be loaded yet
    if (window.speechSynthesis.getVoices().length > 0) {
      speak()
    } else {
      window.speechSynthesis.onvoiceschanged = speak
    }

    // Fallback: close after 8s even if speech fails
    const fallback = setTimeout(() => {
      clearInterval(dotTimer)
      setVisible(false)
      onDone?.()
    }, 8000)

    return () => { clearInterval(dotTimer); clearTimeout(fallback) }
  }, [])

  if (!visible) return null

  return (
    <div className="voice-overlay" onClick={() => { window.speechSynthesis?.cancel(); setVisible(false); onDone?.() }}>
      <div className="text-center px-8 max-w-lg animate-fade-in">
        {/* Pulse rings */}
        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '1.2s' }} />
          <div className="absolute inset-2 rounded-full bg-green-500/15 animate-ping" style={{ animationDuration: '1.6s', animationDelay: '0.3s' }} />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/40">
            <span className="text-4xl">🔊</span>
          </div>
        </div>

        {/* Message */}
        <div className="rounded-2xl px-8 py-6 mb-6"
          style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)' }}>
          <p className="text-green-400 font-bold text-xl leading-relaxed">{message}</p>
        </div>

        {/* Speaking indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-1.5 rounded-full bg-green-400"
              style={{ height: `${8 + Math.sin((Date.now() / 200) + i) * 8}px`, animation: `wave ${0.6 + i * 0.1}s ease-in-out infinite alternate`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Speaking{'.' .repeat(dots)} &nbsp;·&nbsp; Tap anywhere to dismiss
        </p>
      </div>

      <style>{`
        @keyframes wave {
          0%   { height: 6px; }
          100% { height: 22px; }
        }
      `}</style>
    </div>
  )
}
