import express from 'express'
import Ambulance from '../models/Ambulance.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// GET /api/ambulance  - list all
router.get('/', authenticate, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status) filter.status = status
    const ambulances = await Ambulance.find(filter)
    res.json(ambulances)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/ambulance  - add new
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const ambulance = await Ambulance.create(req.body)
    res.status(201).json(ambulance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/ambulance/:id/status
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    res.json(ambulance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/ambulance/:id/location  - driver updates GPS
router.patch('/:id/location', authenticate, async (req, res) => {
  try {
    const { lat, lng } = req.body
    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      { 'currentLocation.lat': lat, 'currentLocation.lng': lng, 'currentLocation.lastUpdated': new Date() },
      { new: true }
    )
    // Broadcast via socket
    const io = req.app.get('io')
    if (ambulance.currentEmergencyId) {
      io.to(`emergency_${ambulance.currentEmergencyId}`).emit('ambulance_moved', { lat, lng })
    }
    io.to('admin_room').emit('fleet_update', { ambulanceId: ambulance._id, vehicleId: ambulance.vehicleId, lat, lng })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/ambulance/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Ambulance.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Ambulance deactivated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
