import express from 'express'
import User from '../models/User.js'
import Emergency from '../models/Emergency.js'
import Ambulance from '../models/Ambulance.js'
import Hospital from '../models/Hospital.js'
import BloodRequest from '../models/BloodRequest.js'
import BloodInventory from '../models/BloodInventory.js'
import Appointment from '../models/Appointment.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers, totalEmergencies, highRisk, availableAmbs,
      totalHospitals, pendingBlood, fulfilledBlood, totalBloodReqs,
      totalAppts, pendingAppts, completedAppts,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Emergency.countDocuments(),
      Emergency.countDocuments({ riskLevel: 'HIGH' }),
      Ambulance.countDocuments({ status: 'available' }),
      Hospital.countDocuments({ isActive: true }),
      BloodRequest.countDocuments({ status: 'pending' }),
      BloodRequest.countDocuments({ status: { $in: ['completed', 'arranged'] } }),
      BloodRequest.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
    ])

    // Low stock alerts
    const inventories = await BloodInventory.find()
    let lowStockCount = 0
    inventories.forEach(inv => {
      inv.bloodStock.forEach(s => { if (s.units <= 3) lowStockCount++ })
    })

    // Risk distribution
    const riskDist = await Emergency.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ])

    // Blood request status distribution
    const bloodDist = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    // Weekly emergencies (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weeklyEmergencies = await Emergency.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    res.json({
      totalUsers, totalEmergencies, highRisk, availableAmbs,
      totalHospitals, pendingBlood, fulfilledBlood, totalBloodReqs,
      lowStockCount, riskDist, bloodDist, weeklyEmergencies,
      totalAppts, pendingAppts, completedAppts,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router
