import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'

// Routes
import authRoutes from './routes/auth.js'
import emergencyRoutes from './routes/emergency.js'
import ambulanceRoutes from './routes/ambulance.js'
import userRoutes from './routes/user.js'
import analyticsRoutes from './routes/analytics.js'
import notificationRoutes from './routes/notification.js'
import hospitalRoutes from './routes/hospital.js'
import bloodInventoryRoutes from './routes/bloodInventory.js'
import bloodRequestRoutes from './routes/bloodRequest.js'
import appointmentRoutes from './routes/appointment.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Connect DB
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/ambulance', ambulanceRoutes)
app.use('/api/user', userRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/hospitals', hospitalRoutes)
app.use('/api/blood-inventory', bloodInventoryRoutes)
app.use('/api/blood-requests', bloodRequestRoutes)
app.use('/api/appointments', appointmentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'MediSync Emergency API', flaskUrl: process.env.FLASK_URL || 'http://localhost:5002' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
 
})
