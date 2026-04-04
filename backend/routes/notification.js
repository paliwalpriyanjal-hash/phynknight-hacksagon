import express from 'express'
import Notification from '../models/Notification.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
