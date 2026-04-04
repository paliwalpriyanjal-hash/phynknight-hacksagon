import express from 'express'
import Emergency from '../models/Emergency.js'
import Ambulance from '../models/Ambulance.js'
import Notification from '../models/Notification.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { assessRisk } from '../utils/aiEngine.js'
import { findNearestAmbulance } from '../utils/dispatch.js'

const router = express.Router()

// ─────────────────────────────────────────────
// POST /api/emergency/create  (patient)
// ─────────────────────────────────────────────
router.post('/create', authenticate, authorize('patient'), upload.array('images', 5), async (req, res) => {
  try {
    const { symptoms, description, voiceTranscript, location } = req.body
    const parsedSymptoms = typeof symptoms === 'string' ? JSON.parse(symptoms) : symptoms || []
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location
    const imagePaths = req.files ? req.files.map(f => f.filename) : []

    if (!parsedLocation?.lat || !parsedLocation?.lng) {
      return res.status(400).json({ message: 'Patient location (lat, lng) is required' })
    }

    // Run AI risk assessment (calls Flask, falls back to local engine)
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

    // Auto-dispatch for HIGH risk — find nearest available ambulance
    let ambulanceInfo = null
    if (aiResult.riskLevel === 'HIGH') {
      const nearest = await findNearestAmbulance(parsedLocation)
      if (nearest) {
        await Ambulance.findByIdAndUpdate(nearest._id, {
          status: 'busy',
          currentEmergencyId: emergency._id,
        })
        await Emergency.findByIdAndUpdate(emergency._id, {
          ambulanceId: nearest._id,
          status: 'dispatched',
          dispatchedAt: new Date(),
          estimatedArrival: nearest.eta,
        })
        ambulanceInfo = {
          vehicleId: nearest.vehicleId,
          driverName: nearest.driverName,
          driverPhone: nearest.driverPhone,
          eta: nearest.eta,
          distanceKm: nearest.distanceKm,
        }
      }
    }

    // Save in-app notification (polling-based — no push/socket needed)
    await Notification.create({
      userId: req.user._id,
      emergencyId: emergency._id,
      title: `Emergency Reported — ${aiResult.riskLevel} Risk`,
      message: aiResult.riskLevel === 'HIGH'
        ? 'Ambulance dispatched to your location!'
        : 'Your emergency has been logged. Follow first-aid guidance.',
      type: aiResult.riskLevel === 'HIGH' ? 'dispatch' : 'info',
    })

    res.status(201).json({
      emergencyId: emergency._id,
      riskLevel: aiResult.riskLevel,
      confidence: aiResult.confidence,
      explanation: aiResult.explanation,
      topSymptoms: aiResult.topSymptoms,
      firstAid: aiResult.firstAid,
      accidentSeverity: aiResult.accidentSeverity,
      ambulance: ambulanceInfo,
      ambulanceEta: ambulanceInfo?.eta || null,
      // For appointment booking: show option if not HIGH
      showAppointmentOption: aiResult.riskLevel !== 'HIGH',
    })
  } catch (err) {
    console.error('[emergency/create]', err)
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/emergency/my-history  (patient)
// ─────────────────────────────────────────────
router.get('/my-history', authenticate, authorize('patient'), async (req, res) => {
  try {
    const records = await Emergency.find({ patientId: req.user._id })
      .populate('ambulanceId', 'vehicleId driverName driverPhone currentLocation')
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/emergency/all  (admin / doctor)
// ─────────────────────────────────────────────
router.get('/all', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, riskLevel, limit = 50, page = 1 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (riskLevel) filter.riskLevel = riskLevel

    const emergencies = await Emergency.find(filter)
      .populate('patientId', 'name phone bloodGroup')
      .populate('ambulanceId', 'vehicleId driverName currentLocation')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
    const total = await Emergency.countDocuments(filter)
    res.json({ emergencies, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/emergency/:id  (any authenticated)
// ─────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('patientId', 'name phone bloodGroup age')
      .populate('ambulanceId', 'vehicleId driverName driverPhone currentLocation status')
      .populate('hospitalId', 'name address phone location')
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' })
    res.json(emergency)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/emergency/:id/tracking  (polling endpoint — called every 5-10s)
// Returns live ambulance location + emergency status
// ─────────────────────────────────────────────
router.get('/:id/tracking', authenticate, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('ambulanceId', 'vehicleId driverName driverPhone currentLocation status')
      .populate('hospitalId', 'name address location')
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' })

    // Simulate ambulance movement toward patient if dispatched
    let ambulanceLocation = emergency.ambulanceId?.currentLocation || null
    if (
      emergency.status === 'dispatched' &&
      emergency.ambulanceId &&
      ambulanceLocation &&
      emergency.location
    ) {
      const elapsed = (Date.now() - new Date(emergency.dispatchedAt).getTime()) / 1000 / 60 // minutes
      const eta = emergency.estimatedArrival || 10
      const progress = Math.min(1, elapsed / eta)

      // Interpolate ambulance position toward patient
      const pLat = emergency.location.lat
      const pLng = emergency.location.lng
      const aLat = ambulanceLocation.lat
      const aLng = ambulanceLocation.lng

      ambulanceLocation = {
        lat: aLat + (pLat - aLat) * progress,
        lng: aLng + (pLng - aLng) * progress,
      }

      // Auto-complete if arrived
      if (progress >= 1 && emergency.status !== 'arrived') {
        await Emergency.findByIdAndUpdate(req.params.id, { status: 'arrived', arrivedAt: new Date() })
        await Ambulance.findByIdAndUpdate(emergency.ambulanceId._id, { status: 'available', currentEmergencyId: null })
      }
    }

    res.json({
      emergencyId: emergency._id,
      status: emergency.status,
      riskLevel: emergency.riskLevel,
      patientLocation: emergency.location,
      ambulance: emergency.ambulanceId
        ? {
            vehicleId: emergency.ambulanceId.vehicleId,
            driverName: emergency.ambulanceId.driverName,
            driverPhone: emergency.ambulanceId.driverPhone,
            status: emergency.ambulanceId.status,
            currentLocation: ambulanceLocation,
          }
        : null,
      hospital: emergency.hospitalId
        ? {
            name: emergency.hospitalId.name,
            address: emergency.hospitalId.address,
            location: emergency.hospitalId.location,
          }
        : null,
      estimatedArrival: emergency.estimatedArrival,
      dispatchedAt: emergency.dispatchedAt,
      arrivedAt: emergency.arrivedAt,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────────
// PATCH /api/emergency/:id/acknowledge  (doctor)
// ─────────────────────────────────────────────
router.patch('/:id/acknowledge', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged', assignedDoctorId: req.user._id },
      { new: true }
    )
    if (!emergency) return res.status(404).json({ message: 'Not found' })
    res.json(emergency)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────────
// PATCH /api/emergency/:id/status  (doctor / admin)
// ─────────────────────────────────────────────
router.patch('/:id/status', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, doctorNotes } = req.body
    const update = { status }
    if (doctorNotes) update.doctorNotes = doctorNotes
    if (status === 'arrived') update.arrivedAt = new Date()
    if (status === 'completed') update.resolvedAt = new Date()
    const emergency = await Emergency.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!emergency) return res.status(404).json({ message: 'Not found' })
    res.json(emergency)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────────
// PATCH /api/emergency/:id/cancel  (patient — 60s window)
// ─────────────────────────────────────────────
router.patch('/:id/cancel', authenticate, authorize('patient'), async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
    if (!emergency) return res.status(404).json({ message: 'Not found' })
    if (emergency.patientId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' })

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

export default router
