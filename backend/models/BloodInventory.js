import mongoose from 'mongoose'

const bloodStockSchema = new mongoose.Schema({
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  units: { type: Number, default: 0, min: 0 },
})

const bloodInventorySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, unique: true },
  bloodStock: [bloodStockSchema],
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Helper: get units for a specific blood group
bloodInventorySchema.methods.getUnits = function (bg) {
  const entry = this.bloodStock.find(s => s.bloodGroup === bg)
  return entry ? entry.units : 0
}

// Helper: deduct units safely
bloodInventorySchema.methods.deductUnits = function (bg, qty) {
  const entry = this.bloodStock.find(s => s.bloodGroup === bg)
  if (!entry) return false
  if (entry.units < qty) return false
  entry.units -= qty
  this.lastUpdated = new Date()
  return true
}

export default mongoose.model('BloodInventory', bloodInventorySchema)
