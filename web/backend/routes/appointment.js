import express from 'express'
import Appointment from '../models/Appointment.js'
import User from '../models/User.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// ── POST /api/appointments — patient books appointment
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, hospitalId, linkedEmergency, riskLevel, appointmentDate, appointmentTime, symptomsSummary, notes } = req.body
    if (!doctorId || !appointmentDate || !appointmentTime)
      return res.status(400).json({ message: 'doctorId, appointmentDate, appointmentTime required' })

    const appt = await Appointment.create({
      patientId: req.user._id,
      doctorId, hospitalId, linkedEmergency,
      riskLevel: riskLevel || 'LOW',
      appointmentDate, appointmentTime,
      symptomsSummary, notes,
    })
    const populated = await appt.populate([
      { path: 'doctorId', select: 'name specialization' },
      { path: 'hospitalId', select: 'name address' },
    ])
    res.status(201).json(populated)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── GET /api/appointments/my — patient's own appointments
router.get('/my', authenticate, authorize('patient'), async (req, res) => {
  try {
    const appts = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 })
    res.json(appts)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── GET /api/appointments/doctor — doctor sees their appointments
router.get('/doctor', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { status, date } = req.query
    const filter = { doctorId: req.user._id }
    if (status) filter.status = status
    if (date) filter.appointmentDate = date
    const appts = await Appointment.find(filter)
      .populate('patientId', 'name phone bloodGroup age')
      .populate('hospitalId', 'name address')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
    res.json(appts)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── GET /api/appointments — admin sees all
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, doctorId, patientId, date } = req.query
    const filter = {}
    if (status) filter.status = status
    if (doctorId) filter.doctorId = doctorId
    if (patientId) filter.patientId = patientId
    if (date) filter.appointmentDate = date
    const appts = await Appointment.find(filter)
      .populate('patientId', 'name phone bloodGroup')
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name')
      .sort({ createdAt: -1 })
    res.json(appts)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── GET /api/appointments/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patientId', 'name phone bloodGroup age')
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address phone')
    if (!appt) return res.status(404).json({ message: 'Not found' })
    res.json(appt)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── PATCH /api/appointments/:id/status — doctor or admin updates status
router.patch('/:id/status', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    ).populate('patientId', 'name').populate('doctorId', 'name')
    if (!appt) return res.status(404).json({ message: 'Not found' })
    res.json(appt)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── PATCH /api/appointments/:id/doctor-note — doctor adds consultation note
router.patch('/:id/doctor-note', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { doctorNotes: req.body.doctorNotes, status: req.body.status || undefined },
      { new: true }
    )
    if (!appt) return res.status(404).json({ message: 'Not found' })
    res.json(appt)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── PATCH /api/appointments/:id/cancel — patient cancels
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
    if (!appt) return res.status(404).json({ message: 'Not found' })
    if (appt.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' })
    appt.status = 'cancelled'
    await appt.save()
    res.json(appt)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router
