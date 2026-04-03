import express from 'express'
import Emergency from '../models/Emergency.js'
import Ambulance from '../models/Ambulance.js'
import Notification from '../models/Notification.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { assessRisk } from '../utils/aiEngine.js'
import { findNearestAmbulance } from '../utils/dispatch.js'

const router = express.Router()

// POST /api/emergency/create
router.post('/create', authenticate, authorize('patient'), upload.array('images', 5), async (req, res) => {
  try {
    const { symptoms, description, voiceTranscript, location } = req.body
    const parsedSymptoms = typeof symptoms === 'string' ? JSON.parse(symptoms) : symptoms || []
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location
    const imagePaths = req.files ? req.files.map(f => f.filename) : []

    // Run AI risk assessment
    const aiResult = await assessRisk({ symptoms: parsedSymptoms, description, voiceTranscript, images: imagePaths })

    // Create emergency record
    const emergency = await Emergency.create({
      patientId: req.user._id,
      symptoms: parsedSymptoms,
      description,
      voiceTranscript,
      images: imagePaths,
      location: parsedLocation,
      riskLevel: aiResult.riskLevel,
      aiConfidence: aiResult.confidence,
      aiExplanation: aiResult.explanation,
      topSymptoms: aiResult.topSymptoms,
      firstAid: aiResult.firstAid,
      suspicionScore: aiResult.suspicionScore,
      isSuspicious: aiResult.suspicionScore > 70,
      status: 'pending',
    })

    // Auto-dispatch for HIGH risk
    let ambulanceInfo = null
    if (aiResult.riskLevel === 'HIGH') {
      const nearest = await findNearestAmbulance(parsedLocation)
      if (nearest) {
        await Ambulance.findByIdAndUpdate(nearest._id, { status: 'busy', currentEmergencyId: emergency._id })
        await Emergency.findByIdAndUpdate(emergency._id, {
          ambulanceId: nearest._id,
          status: 'dispatched',
          dispatchedAt: new Date(),
          estimatedArrival: nearest.eta,
        })
        ambulanceInfo = { vehicleId: nearest.vehicleId, eta: nearest.eta }

        // Notify via socket
        const io = req.app.get('io')
        io.to('doctor_room').emit('new_emergency', { emergency, patient: req.user, aiResult })
        io.to('admin_room').emit('new_emergency', { emergency, patient: req.user, aiResult })
      }
    }

    // Save notification
    await Notification.create({
      userId: req.user._id,
      emergencyId: emergency._id,
      title: `Emergency Reported — ${aiResult.riskLevel} Risk`,
      message: aiResult.riskLevel === 'HIGH' ? 'Ambulance dispatched to your location!' : 'Your emergency has been logged.',
      type: aiResult.riskLevel === 'HIGH' ? 'dispatch' : 'info',
    })

    res.status(201).json({
      emergencyId: emergency._id,
      riskLevel: aiResult.riskLevel,
      confidence: aiResult.confidence,
      explanation: aiResult.explanation,
      topSymptoms: aiResult.topSymptoms,
      firstAid: aiResult.firstAid,
      ambulance: ambulanceInfo,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/emergency/my-history
router.get('/my-history', authenticate, authorize('patient'), async (req, res) => {
  try {
    const records = await Emergency.find({ patientId: req.user._id }).sort({ createdAt: -1 }).limit(20)
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/emergency/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('patientId', 'name phone bloodGroup')
      .populate('ambulanceId', 'vehicleId driverName driverPhone')
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' })
    res.json(emergency)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/emergency/:id/acknowledge  (doctor)
router.patch('/:id/acknowledge', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged', assignedDoctorId: req.user._id },
      { new: true }
    )
    const io = req.app.get('io')
    io.to(`emergency_${req.params.id}`).emit('status_update', { status: 'acknowledged' })
    res.json(emergency)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/emergency/:id/status
router.patch('/:id/status', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, doctorNotes } = req.body
    const update = { status }
    if (doctorNotes) update.doctorNotes = doctorNotes
    if (status === 'arrived') update.arrivedAt = new Date()
    if (status === 'completed') update.resolvedAt = new Date()
    const emergency = await Emergency.findByIdAndUpdate(req.params.id, update, { new: true })
    const io = req.app.get('io')
    io.to(`emergency_${req.params.id}`).emit('status_update', { status })
    res.json(emergency)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/emergency/:id/cancel  (patient — 60s window)
router.patch('/:id/cancel', authenticate, authorize('patient'), async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
    if (!emergency) return res.status(404).json({ message: 'Not found' })
    if (emergency.patientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' })
    const elapsed = (Date.now() - new Date(emergency.createdAt).getTime()) / 1000
    if (elapsed > 60) return res.status(400).json({ message: 'Cancel window of 60 seconds has passed' })
    await Emergency.findByIdAndUpdate(req.params.id, { status: 'cancelled', cancelledWithin60s: true })
    if (emergency.ambulanceId) {
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, { status: 'available', currentEmergencyId: null })
    }
    res.json({ message: 'Emergency cancelled successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/emergency/all  (admin/doctor)
router.get('/', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, riskLevel, limit = 50, page = 1 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (riskLevel) filter.riskLevel = riskLevel
    const emergencies = await Emergency.find(filter)
      .populate('patientId', 'name phone bloodGroup')
      .populate('ambulanceId', 'vehicleId driverName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
    const total = await Emergency.countDocuments(filter)
    res.json({ emergencies, total, page: Number(page) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
