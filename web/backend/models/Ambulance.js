import mongoose from 'mongoose'

const ambulanceSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  status: { type: String, enum: ['available', 'busy', 'maintenance'], default: 'available' },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
  },
  currentEmergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  lastServiceDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Ambulance', ambulanceSchema)
