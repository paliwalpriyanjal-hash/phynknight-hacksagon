import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  location: { lat: { type: Number }, lng: { type: Number } },
  phone: { type: String },
  emergencyContact: { type: String },
  beds: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
  specializations: [{ type: String }],
  services: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Hospital', hospitalSchema)
