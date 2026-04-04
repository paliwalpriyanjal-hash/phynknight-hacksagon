import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'update', 'dispatch', 'info', 'warning'], default: 'info' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)
