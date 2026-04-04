import express from 'express'
import BloodRequest from '../models/BloodRequest.js'
import BloodInventory from '../models/BloodInventory.js'
import Hospital from '../models/Hospital.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// POST /api/blood-requests — patient submits request
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { bloodGroupNeeded, unitsNeeded, urgencyLevel, hospitalPreference, contactPhone, notes, emergencyId } = req.body
    if (!bloodGroupNeeded || !unitsNeeded || !contactPhone)
      return res.status(400).json({ message: 'bloodGroupNeeded, unitsNeeded, contactPhone required' })

    // Auto-search available hospitals
    const inventories = await BloodInventory.find().populate('hospitalId')
    let autoStatus = 'not_available'
    let assignedHospital = null

    const matching = inventories.filter(inv =>
      inv.bloodStock.some(s => s.bloodGroup === bloodGroupNeeded && s.units >= unitsNeeded)
    )
    const partial = inventories.filter(inv =>
      inv.bloodStock.some(s => s.bloodGroup === bloodGroupNeeded && s.units > 0 && s.units < unitsNeeded)
    )

    if (matching.length > 0) {
      autoStatus = 'available'
      // prefer hospitalPreference if it matches
      const preferred = matching.find(inv => inv.hospitalId?._id?.toString() === hospitalPreference)
      assignedHospital = preferred ? preferred.hospitalId._id : matching[0].hospitalId._id
    } else if (partial.length > 0) {
      autoStatus = 'partially_available'
    }

    const request = await BloodRequest.create({
      patientId: req.user._id,
      emergencyId,
      bloodGroupNeeded,
      unitsNeeded,
      urgencyLevel: urgencyLevel || 'high',
      hospitalPreference,
      assignedHospital,
      status: autoStatus,
      contactPhone,
      notes,
    })

    res.status(201).json({ request, autoStatus, message: `Blood ${autoStatus.replace('_', ' ')} — admin will confirm shortly` })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/blood-requests/my — patient's own requests
router.get('/my', authenticate, authorize('patient'), async (req, res) => {
  try {
    const requests = await BloodRequest.find({ patientId: req.user._id })
      .populate('assignedHospital', 'name address phone')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/blood-requests — admin/doctor sees all
router.get('/', authenticate, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const requests = await BloodRequest.find(filter)
      .populate('patientId', 'name phone bloodGroup')
      .populate('assignedHospital', 'name address phone')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/blood-requests/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const r = await BloodRequest.findById(req.params.id)
      .populate('patientId', 'name phone bloodGroup')
      .populate('assignedHospital', 'name address phone emergencyContact')
    if (!r) return res.status(404).json({ message: 'Not found' })
    res.json(r)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/blood-requests/:id/respond — admin responds
router.patch('/:id/respond', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, adminResponseMessage, assignedHospital } = req.body
    const r = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminResponseMessage, assignedHospital },
      { new: true }
    ).populate('assignedHospital', 'name')
    if (!r) return res.status(404).json({ message: 'Not found' })

    // If arranged/completed, deduct stock
    if ((status === 'arranged' || status === 'completed') && assignedHospital) {
      const inv = await BloodInventory.findOne({ hospitalId: assignedHospital })
      if (inv) {
        const deducted = inv.deductUnits(r.bloodGroupNeeded, r.unitsNeeded)
        if (deducted) await inv.save()
      }
    }
    res.json(r)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/blood-requests/:id/status — update status
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const r = await BloodRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    res.json(r)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router
