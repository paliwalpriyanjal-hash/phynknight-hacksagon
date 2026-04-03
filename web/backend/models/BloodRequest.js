import mongoose from 'mongoose'

const bloodRequestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
  bloodGroupNeeded: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  unitsNeeded: { type: Number, required: true, min: 1 },
  urgencyLevel: { type: String, enum: ['critical','high','medium','low'], default: 'high' },
  hospitalPreference: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  assignedHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  status: {
    type: String,
    enum: ['pending','available','partially_available','not_available','arranged','completed','rejected'],
    default: 'pending',
  },
  adminResponseMessage: { type: String },
  contactPhone: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true })

bloodRequestSchema.index({ patientId: 1, createdAt: -1 })
bloodRequestSchema.index({ status: 1 })

export default mongoose.model('BloodRequest', bloodRequestSchema)
