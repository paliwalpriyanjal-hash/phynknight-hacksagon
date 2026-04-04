/**
 * AI Engine — calls Flask ML service first, falls back to local rule-based engine.
 */
import axios from 'axios'

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5002'

const HIGH_RISK_SYMPTOMS = ['Chest Pain','Shortness of Breath','Unconscious','Stroke Signs','Seizure','Severe Abdominal Pain']
const MEDIUM_RISK_SYMPTOMS = ['Severe Headache','High Fever','Bleeding','Fracture','Allergic Reaction','Burns']
const HIGH_RISK_KEYWORDS = ['chest pain','heart attack','unconscious','not breathing','stroke','seizure','severe bleeding','crushing','radiating','left arm','jaw pain',"can't breathe",'difficulty breathing','blue lips']

const FIRST_AID = {
  HIGH: ['Call emergency services immediately','Keep the patient calm and still','Do not give food or water','Loosen tight clothing','Monitor breathing and pulse','If trained, prepare for CPR'],
  MEDIUM: ['Keep patient comfortable','Apply first aid for visible injuries','Do not move if spinal injury suspected','Monitor vital signs'],
  LOW: ['Rest and stay calm','Stay hydrated','Monitor symptoms','Seek advice if symptoms worsen'],
}
const EXPLANATIONS = {
  HIGH: 'Critical symptoms detected indicating possible life-threatening emergency. Immediate medical intervention required.',
  MEDIUM: 'Moderate risk symptoms identified. Medical attention recommended promptly.',
  LOW: 'Low-severity symptoms detected. Monitor closely.',
}

function localAssess({ symptoms = [], description = '', voiceTranscript = '', images = [] }) {
  let score = 0
  const matched = []
  for (const s of symptoms) {
    if (HIGH_RISK_SYMPTOMS.includes(s)) { score += 35; matched.push(s) }
    else if (MEDIUM_RISK_SYMPTOMS.includes(s)) { score += 20; matched.push(s) }
    else score += 8
  }
  const text = `${description} ${voiceTranscript}`.toLowerCase()
  for (const kw of HIGH_RISK_KEYWORDS) { if (text.includes(kw)) score += 12 }
  if (symptoms.length >= 3) score += 10
  if (images.length > 0) score += 8
  score = Math.min(score, 100)
  const riskLevel = score >= 65 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW'
  const confidence = Math.round(Math.min(95, 55 + score * 0.4))
  let suspicionScore = 0
  if (symptoms.length > 8) suspicionScore += 30
  if (voiceTranscript && voiceTranscript.length < 10 && symptoms.length > 5) suspicionScore += 20
  return { riskLevel, confidence, score, explanation: EXPLANATIONS[riskLevel], topSymptoms: matched.slice(0, 4), firstAid: FIRST_AID[riskLevel], suspicionScore: Math.min(100, suspicionScore), flaskUsed: false }
}

export async function assessRisk({ symptoms = [], description = '', voiceTranscript = '', images = [] }) {
  try {
    // Try Flask ML service
    const [sympRes, voiceRes] = await Promise.all([
      axios.post(`${FLASK_URL}/predict/symptoms`, { symptoms, description }, { timeout: 3000 }),
      voiceTranscript ? axios.post(`${FLASK_URL}/predict/voice`, { voiceText: voiceTranscript }, { timeout: 3000 }) : Promise.resolve({ data: {} }),
    ])

    const imageRes = images.length > 0
      ? await axios.post(`${FLASK_URL}/predict/image`, { filename: images[0] }, { timeout: 3000 })
      : { data: {} }

    const finalRes = await axios.post(`${FLASK_URL}/predict/final`, {
      symptomsPrediction: sympRes.data,
      voicePrediction: voiceRes.data,
      imagePrediction: imageRes.data,
    }, { timeout: 3000 })

    const f = finalRes.data
    return {
      riskLevel: f.risk_level || sympRes.data.risk_level || 'LOW',
      confidence: f.confidence || sympRes.data.confidence || 70,
      explanation: f.recommended_action || EXPLANATIONS[f.risk_level || 'LOW'],
      topSymptoms: f.extracted_symptoms || sympRes.data.extracted_symptoms || [],
      firstAid: f.first_aid || FIRST_AID[f.risk_level || 'LOW'],
      suspicionScore: 0,
      flaskUsed: true,
      accidentSeverity: f.accident_severity,
    }
  } catch {
    // Flask unavailable — use local engine
    return localAssess({ symptoms, description, voiceTranscript, images })
  }
}
