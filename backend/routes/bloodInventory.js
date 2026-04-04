import express from 'express'
import BloodInventory from '../models/BloodInventory.js'
import Hospital from '../models/Hospital.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// GET /api/blood-inventory — all inventories (public for search)
router.get('/', async (req, res) => {
  try {
    const { bloodGroup } = req.query
    let inventories = await BloodInventory.find().populate('hospitalId', 'name address location phone')
    if (bloodGroup) {
      inventories = inventories.filter(inv =>
        inv.bloodStock.some(s => s.bloodGroup === bloodGroup && s.units > 0)
      )
    }
    res.json(inventories)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/blood-inventory/search?bloodGroup=O+
router.get('/search', async (req, res) => {
  try {
    const { bloodGroup, lat, lng } = req.query
    if (!bloodGroup) return res.status(400).json({ message: 'bloodGroup required' })
    const inventories = await BloodInventory.find().populate('hospitalId', 'name address location phone emergencyContact')
    const results = inventories
      .filter(inv => inv.bloodStock.some(s => s.bloodGroup === bloodGroup && s.units > 0))
      .map(inv => {
        const stock = inv.bloodStock.find(s => s.bloodGroup === bloodGroup)
        return { hospital: inv.hospitalId, units: stock?.units || 0, inventoryId: inv._id }
      })
    res.json(results)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/blood-inventory/:hospitalId
router.get('/:hospitalId', async (req, res) => {
  try {
    const inv = await BloodInventory.findOne({ hospitalId: req.params.hospitalId })
      .populate('hospitalId', 'name address phone')
    if (!inv) return res.status(404).json({ message: 'Inventory not found' })
    res.json(inv)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/blood-inventory — create (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { hospitalId, bloodStock } = req.body
    const exists = await BloodInventory.findOne({ hospitalId })
    if (exists) return res.status(400).json({ message: 'Inventory already exists for this hospital' })
    const inv = await BloodInventory.create({ hospitalId, bloodStock, updatedBy: req.user._id })
    res.status(201).json(inv)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/blood-inventory/:id — update stock (admin)
router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { bloodStock } = req.body
    const inv = await BloodInventory.findByIdAndUpdate(
      req.params.id,
      { bloodStock, lastUpdated: new Date(), updatedBy: req.user._id },
      { new: true }
    ).populate('hospitalId', 'name')
    if (!inv) return res.status(404).json({ message: 'Not found' })
    res.json(inv)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/blood-inventory/low-stock/alerts — admin
router.get('/low-stock/alerts', authenticate, authorize('admin'), async (req, res) => {
  try {
    const threshold = 3
    const inventories = await BloodInventory.find().populate('hospitalId', 'name')
    const alerts = []
    inventories.forEach(inv => {
      inv.bloodStock.forEach(s => {
        if (s.units <= threshold) {
          alerts.push({ hospital: inv.hospitalId?.name, bloodGroup: s.bloodGroup, units: s.units, inventoryId: inv._id })
        }
      })
    })
    res.json(alerts)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router
