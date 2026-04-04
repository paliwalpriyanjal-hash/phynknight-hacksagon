import express from 'express'
import Hospital from '../models/Hospital.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
    res.json(hospitals)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body)
    res.status(201).json(hospital)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(hospital)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Hospital.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Hospital deactivated' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router
