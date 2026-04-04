import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  patientId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  linkedEmergency: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
  riskLevel:       { type: String, enum: ['LOW', 'MEDIUM', 'MODERATE'], default: 'LOW' },
  appointmentDate: { type: String, required: true },   // "YYYY-MM-DD"
  appointmentTime: { type: String, required: true },   // "10:00 AM"
  symptomsSummary: { type: String },
  notes:           { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  doctorNotes: { type: String },
}, { timestamps: true })

appointmentSchema.index({ patientId: 1, createdAt: -1 })
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 })
appointmentSchema.index({ status: 1 })

export default mongoose.model('Appointment', appointmentSchema)
