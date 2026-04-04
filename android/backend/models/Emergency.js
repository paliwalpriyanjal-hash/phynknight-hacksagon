const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    symptoms: [{ type: String }],
    location: { type: String, required: true },
    note: { type: String },
    riskLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
    status: { type: String, enum: ['Pending', 'Acknowledged', 'Preparing', 'Completed'], default: 'Pending' },
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    aiConfidence: { type: Number, default: 95 }
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
