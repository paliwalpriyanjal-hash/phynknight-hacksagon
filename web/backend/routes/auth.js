import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, bloodGroup } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, phone, role: role || 'patient', bloodGroup })
    const token = signToken(user._id)
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' })

    const token = signToken(user._id)
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

// PATCH /api/auth/update-fcm-token
router.patch('/update-fcm-token', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.token })
    res.json({ message: 'FCM token updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/doctors — returns list of doctors (for appointment booking)
router.get('/doctors', authenticate, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name email specialization hospitalId phone')
      .populate('hospitalId', 'name address')
      .sort({ name: 1 })
    res.json(doctors)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
