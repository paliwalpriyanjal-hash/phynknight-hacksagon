import mongoose from 'mongoose'

const emergencySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Input Data
  symptoms: [{ type: String }],
  description: { type: String },
  voiceTranscript: { type: String },
  images: [{ type: String }], // file paths
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
  },
  // AI Assessment
  riskLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
  aiConfidence: { type: Number, min: 0, max: 100 },
  aiExplanation: { type: String },
  topSymptoms: [{ type: String }],
  firstAid: [{ type: String }],
  suspicionScore: { type: Number, default: 0 },
  isSuspicious: { type: Boolean, default: false },
  // Dispatch
  ambulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  // Status
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'acknowledged', 'preparing', 'en_route', 'arrived', 'completed', 'cancelled', 'false_alarm'],
    default: 'pending',
  },
  cancelledWithin60s: { type: Boolean, default: false },
  // Timing
  dispatchedAt: { type: Date },
  arrivedAt: { type: Date },
  resolvedAt: { type: Date },
  estimatedArrival: { type: Number }, // minutes
  // Doctor notes
  doctorNotes: { type: String },
}, { timestamps: true })

emergencySchema.index({ patientId: 1, createdAt: -1 })
emergencySchema.index({ status: 1 })
emergencySchema.index({ riskLevel: 1 })

export default mongoose.model('Emergency', emergencySchema)
