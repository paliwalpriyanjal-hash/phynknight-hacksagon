import express from 'express'
import User from '../models/User.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// GET /api/user  - list all (admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query
    const filter = {}
    if (role) filter.role = role
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }]
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
    const total = await User.countDocuments(filter)
    res.json({ users, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/user/:id/status
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/user/:id/flag
router.patch('/:id/flag', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason: req.body.reason, suspicionScore: req.body.suspicionScore },
      { new: true }
    )
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
