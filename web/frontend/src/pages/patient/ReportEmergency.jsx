import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'
import VoiceAnnouncement from '../../components/VoiceAnnouncement'
import { predictImage } from '../../api/predict'

// City → coordinates using OpenStreetMap Nominatim (free, no API key)
function CitySearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setResults(data)
    } catch {
      toast.error('Location search failed')
    } finally { setSearching(false) }
  }

  const select = (item) => {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)
    console.log('Selected Location:', lat, lng, item.display_name)
    onSelect({ lat, lng, address: item.display_name })
    setResults([])
    setQuery(item.display_name.split(',')[0])
    toast.success(`Location set: ${item.display_name.split(',')[0]}`)
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Type city name e.g. Gwalior…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button onClick={search} disabled={searching}
          className="btn btn-primary text-xs px-4 py-2 flex-shrink-0">
          {searching ? '…' : '🔍'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
          {results.map((r, i) => (
            <button key={i} onClick={() => select(r)}
              className="w-full text-left px-4 py-2.5 text-xs transition-all hover:bg-blue-500/10"
              style={{ color: 'var(--text-secondary)', borderBottom: i < results.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              📍 {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const NAV = [
  { path: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patient/report', icon: '🚨', label: 'Report Emergency' },
  { path: '/patient/history', icon: '📋', label: 'My History' },
]

const SYMPTOMS = [
  { label: 'Chest Pain', icon: '💔' },
  { label: 'Shortness of Breath', icon: '🫁' },
  { label: 'Severe Headache', icon: '🧠' },
  { label: 'Unconscious', icon: '😵' },
  { label: 'Bleeding', icon: '🩸' },
  { label: 'Fracture', icon: '🦴' },
  { label: 'Burns', icon: '🔥' },
  { label: 'Stroke Signs', icon: '⚡' },
  { label: 'Allergic Reaction', icon: '🤧' },
  { label: 'High Fever', icon: '🌡️' },
  { label: 'Severe Abdominal Pain', icon: '🫃' },
  { label: 'Seizure', icon: '🌀' },
]

const riskConfig = {
  HIGH:   { bg: 'from-red-600/20 to-red-900/10',       border: 'border-red-500/40',    text: 'text-red-400',    icon: '🚨', label: 'CRITICAL' },
  MEDIUM: { bg: 'from-yellow-600/20 to-yellow-900/10', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: '⚠️', label: 'MODERATE' },
  LOW:    { bg: 'from-green-600/20 to-green-900/10',   border: 'border-green-500/40',  text: 'text-green-400',  icon: '✅', label: 'STABLE' },
}

export default function ReportEmergency() {
  const [step, setStep] = useState(1)
  const [symptoms, setSymptoms] = useState([])
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [voiceText, setVoiceText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [location, setLocation] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [mlPrediction, setMlPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cancelCountdown, setCancelCountdown] = useState(null)
  const [announcement, setAnnouncement] = useState(null)
  const fileRef = useRef()
  const recognitionRef = useRef(null)
  const navigate = useNavigate()

  const toggleSymptom = (s) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast.success('Location captured!') },
      () => toast.error('Could not get location')
    )
  }

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return toast.error('Voice not supported in this browser')
    const r = new SR()
    r.continuous = true; r.interimResults = true; r.lang = 'en-US'
    r.onresult = (e) => setVoiceText(Array.from(e.results).map(x => x[0].transcript).join(' '))
    r.onend = () => setIsRecording(false)
    r.start(); recognitionRef.current = r; setIsRecording(true)
    toast.success('Recording started')
  }

  const stopVoice = () => { recognitionRef.current?.stop(); setIsRecording(false); toast.success('Voice recorded!') }

  const handlePrediction = async (file) => {
    try {
      const result = await predictImage(file);
      setMlPrediction(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(prev => [...prev, ...files.map(f => ({ file: f, url: URL.createObjectURL(f) }))].slice(0, 5))
    if (files.length > 0 && !mlPrediction) {
      handlePrediction(files[0]);
    }
  }

  const submitEmergency = async () => {
    if (!symptoms.length && !description && !voiceText) return toast.error('Please add symptoms or description')
    if (!location) return toast.error('Please capture your location first')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('symptoms', JSON.stringify(symptoms))
      fd.append('description', description)
      fd.append('voiceTranscript', voiceText)
      fd.append('location', JSON.stringify(location))
      images.forEach(img => fd.append('images', img.file))
      const res = await axios.post('/api/emergency/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      let finalData = res.data
      if (mlPrediction) {
        // Enforce PyTorch Model overrides as per prompt instructions
        finalData.riskLevel = mlPrediction.final_decision.toUpperCase()
        finalData.explanation = mlPrediction.explanation
        finalData.confidence = mlPrediction.confidence_percent
      }
      setAiResult(finalData)
      setStep(3)
      const eta = finalData?.ambulanceEta || 10
      const risk = finalData?.riskLevel || 'HIGH'
      setAnnouncement(risk === 'HIGH'
        ? `Your emergency report has been submitted successfully. An ambulance has been dispatched and will arrive in approximately ${eta} minutes. Please stay calm and remain at your location. Help is on the way.`
        : `Your report has been submitted. Our medical team has been notified. Please follow the first aid instructions on screen and stay calm.`)
      if (risk === 'HIGH') {
        let count = 60
        setCancelCountdown(count)
        const t = setInterval(() => { count--; setCancelCountdown(count); if (count <= 0) { clearInterval(t); setCancelCountdown(null) } }, 1000)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  const StepDot = ({ n }) => {
    const done = step > n, active = step === n
    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
        done ? 'bg-green-500 text-white' : active ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30' : ''
      }`} style={!done && !active ? { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
        {done ? '✓' : n}
      </div>
    )
  }

  return (
    <DashboardLayout navItems={NAV} role="patient">
      {announcement && <VoiceAnnouncement message={announcement} onDone={() => setAnnouncement(null)} />}
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-lg">🚨</div>
            <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Report Emergency</h1>
          </div>
          <p className="text-sm ml-11" style={{ color: 'var(--text-muted)' }}>AI-powered triage · Instant ambulance dispatch</p>
        </div>

        {/* Progress */}
        <div className="glass rounded-xl p-4 mb-6 flex items-center gap-2">
          {['Symptoms', 'Details', 'Result'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <StepDot n={i + 1} />
              <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? 'text-red-400' : step > i+1 ? 'text-green-400' : ''}`}
                style={step !== i+1 && step <= i+1 ? { color: 'var(--text-muted)' } : {}}>{label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 rounded-full ml-1 ${step > i+1 ? 'bg-green-500' : ''}`}
                style={step <= i+1 ? { background: 'var(--border)' } : {}} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-red-500 to-rose-600" />
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Select Symptoms</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {SYMPTOMS.map(({ label, icon }) => {
                const sel = symptoms.includes(label)
                return (
                  <button key={label} onClick={() => toggleSymptom(label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      sel ? 'bg-gradient-to-r from-red-500/20 to-rose-500/10 border-red-500/50 text-red-400' : 'hover:border-blue-500/40 hover:bg-blue-500/5'
                    }`}
                    style={!sel ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : {}}>
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <span className="text-xs leading-tight font-medium">{label}</span>
                  </button>
                )
              })}
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Additional Description</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Describe what happened..."
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              {symptoms.length > 0
                ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">{symptoms.length} selected</span>
                : <span />}
              <button onClick={() => setStep(2)} disabled={!symptoms.length && !description}
                className="btn-accent px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            {/* Voice */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-violet-600" />
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Voice Input <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(Optional)</span></h2>
              </div>
              <button onClick={isRecording ? stopVoice : startVoice}
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 text-sm text-white transition-all ${
                  isRecording ? 'bg-gradient-to-r from-red-600 to-rose-700 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-violet-700 hover:opacity-90'
                }`}>
                {isRecording ? '🔴 Recording… Tap to Stop' : '🎙️ Start Voice Recording'}
              </button>
              {voiceText && (
                <div className="mt-3 rounded-xl p-3 text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Transcript</p>
                  {voiceText}
                </div>
              )}
            </div>

            {/* Images */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Accident Images <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(Optional)</span></h2>
              </div>
              <div onClick={() => fileRef.current.click()}
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-blue-500/60"
                style={{ borderColor: 'var(--border)' }}>
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Click to upload images</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG, PNG · max 5 · 10MB each</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              {images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img.url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      <button onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-600" />
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Your Location <span className="text-red-400">*</span></h2>
              </div>

              {/* GPS button */}
              <button onClick={getLocation}
                className={`w-full py-3 rounded-xl font-semibold text-sm text-white transition-all mb-3 ${
                  location ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90'
                }`}>
                {location ? `✅ GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 Use My GPS Location'}
              </button>

              {/* OR city name search */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or search city</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <CitySearch onSelect={setLocation} />

              {location && (
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                  📌 {location.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>← Back</button>
              <button onClick={submitEmergency} disabled={loading || !location}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing…</> : '🚨 Submit Emergency'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && aiResult && (() => {
          const rc = riskConfig[aiResult.riskLevel] || riskConfig.HIGH
          return (
            <div className="space-y-4 animate-fade-in">
              {/* Risk banner */}
              <div className={`rounded-2xl p-8 text-center bg-gradient-to-br ${rc.bg} border ${rc.border}`}>
                <div className="text-6xl mb-3 animate-success">{rc.icon}</div>
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 ${rc.text}`}
                  style={{ background: 'rgba(0,0,0,0.15)' }}>
                  {rc.label} RISK
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI Confidence: {aiResult.confidence || 94}%</p>
                {aiResult.riskLevel === 'HIGH' && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400 font-semibold text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Ambulance dispatched · ETA {aiResult.ambulanceEta || 10} min
                  </div>
                )}
              </div>

              {/* Cancel countdown */}
              {cancelCountdown && (
                <div className="glass rounded-xl p-4 border border-yellow-500/30 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-yellow-400">Cancel Dispatch?</p>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(cancelCountdown / 60) * 100}%` }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Auto-dispatching in {cancelCountdown}s</p>
                  </div>
                  <button onClick={() => { setCancelCountdown(null); toast.success('Dispatch cancelled') }}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2 rounded-xl text-sm transition-all flex-shrink-0">
                    Cancel
                  </button>
                </div>
              )}

              {/* AI Analysis */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Analysis</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {aiResult.explanation || 'Based on your reported symptoms, our AI has assessed your emergency and notified the nearest available medical team.'}
                </p>
                {aiResult.topSymptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {aiResult.topSymptoms.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* First Aid */}
              <div className="glass rounded-2xl p-5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-600" />
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>First Aid Guidance</h3>
                </div>
                <ul className="space-y-2">
                  {(aiResult.firstAid || [
                    'Stay calm and sit or lie down in a comfortable position',
                    'Do not eat or drink anything until help arrives',
                    'Keep your airways clear and breathe slowly',
                    'Keep someone with you and wait for the ambulance',
                  ]).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">✓</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>

              {aiResult.riskLevel === 'HIGH' && (
                <button onClick={() => navigate(`/patient/track/${aiResult.emergencyId}`)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all">
                  📍 Track Ambulance Live
                </button>
              )}

              {/* ← NEW: Book Appointment for LOW / MEDIUM risk */}
              {(aiResult.riskLevel === 'LOW' || aiResult.riskLevel === 'MEDIUM') && (
                <div className="rounded-2xl p-5 border" style={{ background: 'rgba(0,102,204,0.06)', borderColor: 'rgba(0,102,204,0.2)' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">📅</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Schedule a Doctor Consultation</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {aiResult.riskLevel === 'MEDIUM'
                          ? 'Moderate risk detected. We recommend seeing a doctor soon.'
                          : 'Your condition is stable. A routine consultation is advised.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/patient/appointments', {
                      state: {
                        riskLevel: aiResult.riskLevel,
                        emergencyId: aiResult.emergencyId,
                        symptoms: symptoms.join(', ') || description,
                      }
                    })}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #0066cc, #1976d2)' }}>
                    📅 Book Appointment Now
                  </button>
                </div>
              )}

              <button onClick={() => navigate('/patient/dashboard')}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Back to Dashboard
              </button>
            </div>
          )
        })()}

      </div>
    </DashboardLayout>
  )
}
