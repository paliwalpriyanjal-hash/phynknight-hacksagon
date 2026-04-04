import mongoose from 'mongoose'

const predictionLogSchema = new mongoose.Schema({
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
  symptomsPrediction: { type: Object },
  voicePrediction: { type: Object },
  imagePrediction: { type: Object },
  finalPrediction: { type: Object },
  rawResponse: { type: Object },
  flaskUsed: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('PredictionLog', predictionLogSchema)
