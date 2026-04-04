/**
 * MediSync — Complete Seed Script
 * Run: node seed.js
 * Creates: 2 hospitals, 1 admin, 1 patient, 3 doctors, 4 ambulances,
 *          blood inventory, 2 sample blood requests, 3 sample appointments
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import User          from './models/User.js'
import Ambulance     from './models/Ambulance.js'
import Hospital      from './models/Hospital.js'
import BloodInventory from './models/BloodInventory.js'
import BloodRequest  from './models/BloodRequest.js'
import Appointment   from './models/Appointment.js'
import Emergency     from './models/Emergency.js'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medisync'

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('✅ Connected to MongoDB:', MONGO_URI)

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Ambulance.deleteMany({}),
    Hospital.deleteMany({}),
    BloodInventory.deleteMany({}),
    BloodRequest.deleteMany({}),
    Appointment.deleteMany({}),
    Emergency.deleteMany({}),
  ])
  console.log('🧹 Cleared existing data')

  // ── HOSPITALS ──────────────────────────────────────────────
  const [h1, h2, h3] = await Hospital.create([
    {
      name: 'City General Hospital',
      address: 'MG Road, Indore, MP 452001',
      location: { lat: 22.7196, lng: 75.8577 },
      phone: '0731-1234567',
      emergencyContact: '0731-9999999',
      beds: { total: 200, available: 45 },
      specializations: ['Cardiology', 'Neurology', 'Trauma', 'Emergency'],
      services: ['ICU', 'Blood Bank', 'Trauma Center', 'X-Ray', 'MRI'],
      isActive: true,
    },
    {
      name: 'Apollo Indore',
      address: 'Vijay Nagar, Indore, MP 452010',
      location: { lat: 22.7450, lng: 75.8900 },
      phone: '0731-7654321',
      emergencyContact: '0731-8888888',
      beds: { total: 150, available: 30 },
      specializations: ['Orthopedics', 'Cardiology', 'General Medicine', 'Emergency'],
      services: ['Blood Bank', 'ICU', 'Physiotherapy'],
      isActive: true,
    },
    {
      name: 'Bombay Hospital Indore',
      address: 'South Tukoganj, Indore, MP 452001',
      location: { lat: 22.7150, lng: 75.8630 },
      phone: '0731-5556677',
      emergencyContact: '0731-7777777',
      beds: { total: 120, available: 20 },
      specializations: ['Oncology', 'Neurology', 'Pediatrics'],
      services: ['Blood Bank', 'Dialysis', 'ICU'],
      isActive: true,
    },
  ])
  console.log('🏥 Hospitals created:', h1.name, '|', h2.name, '|', h3.name)

  // ── USERS ──────────────────────────────────────────────────
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    phone: '9876543212',
    isActive: true,
  })

  const patient = await User.create({
    name: 'Rahul Sharma',
    email: 'patient@demo.com',
    password: 'demo1234',
    role: 'patient',
    phone: '9876543210',
    bloodGroup: 'B+',
    isActive: true,
  })

  const patient2 = await User.create({
    name: 'Priya Gupta',
    email: 'patient2@demo.com',
    password: 'demo1234',
    role: 'patient',
    phone: '9988776655',
    bloodGroup: 'O+',
    isActive: true,
  })

  const [doc1, doc2, doc3] = await User.create([
    {
      name: 'Dr. Kavita Mehra',
      email: 'doctor@demo.com',
      password: 'demo1234',
      role: 'doctor',
      phone: '9876543211',
      hospitalId: h1._id,
      specialization: 'Emergency Medicine',
      isActive: true,
    },
    {
      name: 'Dr. Rahul Sharma',
      email: 'doctor2@demo.com',
      password: 'demo1234',
      role: 'doctor',
      phone: '9876543213',
      hospitalId: h2._id,
      specialization: 'General Medicine',
      isActive: true,
    },
    {
      name: 'Dr. Anil Patel',
      email: 'doctor3@demo.com',
      password: 'demo1234',
      role: 'doctor',
      phone: '9912345678',
      hospitalId: h3._id,
      specialization: 'Cardiology',
      isActive: true,
    },
  ])
  console.log('👥 Users created — admin, 2 patients, 3 doctors')

  // ── AMBULANCES ─────────────────────────────────────────────
  await Ambulance.create([
    {
      vehicleId: 'AMB-042',
      driverName: 'Ramesh Kumar',
      driverPhone: '9811223344',
      status: 'available',
      isActive: true,
      hospitalId: h1._id,
      currentLocation: { lat: 22.7150, lng: 75.8520 },
    },
    {
      vehicleId: 'AMB-017',
      driverName: 'Suresh Yadav',
      driverPhone: '9811223345',
      status: 'available',
      isActive: true,
      hospitalId: h1._id,
      currentLocation: { lat: 22.7230, lng: 75.8610 },
    },
    {
      vehicleId: 'AMB-031',
      driverName: 'Dinesh Patel',
      driverPhone: '9811223346',
      status: 'available',
      isActive: true,
      hospitalId: h2._id,
      currentLocation: { lat: 22.7100, lng: 75.8490 },
    },
    {
      vehicleId: 'AMB-008',
      driverName: 'Prakash Nair',
      driverPhone: '9811223347',
      status: 'maintenance',
      isActive: true,
      hospitalId: h1._id,
      currentLocation: { lat: 22.7196, lng: 75.8577 },
    },
  ])
  console.log('🚑 Ambulances created: AMB-042, AMB-017, AMB-031, AMB-008')

  // ── BLOOD INVENTORY ────────────────────────────────────────
  await BloodInventory.create([
    {
      hospitalId: h1._id,
      updatedBy: admin._id,
      bloodStock: [
        { bloodGroup: 'A+',  units: 15 },
        { bloodGroup: 'A-',  units: 4  },
        { bloodGroup: 'B+',  units: 12 },
        { bloodGroup: 'B-',  units: 2  },
        { bloodGroup: 'AB+', units: 8  },
        { bloodGroup: 'AB-', units: 1  },
        { bloodGroup: 'O+',  units: 20 },
        { bloodGroup: 'O-',  units: 3  },
      ],
      lastUpdated: new Date(),
    },
    {
      hospitalId: h2._id,
      updatedBy: admin._id,
      bloodStock: [
        { bloodGroup: 'A+',  units: 6  },
        { bloodGroup: 'A-',  units: 0  },
        { bloodGroup: 'B+',  units: 9  },
        { bloodGroup: 'B-',  units: 1  },
        { bloodGroup: 'AB+', units: 3  },
        { bloodGroup: 'AB-', units: 0  },
        { bloodGroup: 'O+',  units: 11 },
        { bloodGroup: 'O-',  units: 2  },
      ],
      lastUpdated: new Date(),
    },
    {
      hospitalId: h3._id,
      updatedBy: admin._id,
      bloodStock: [
        { bloodGroup: 'A+',  units: 10 },
        { bloodGroup: 'A-',  units: 2  },
        { bloodGroup: 'B+',  units: 7  },
        { bloodGroup: 'B-',  units: 0  },
        { bloodGroup: 'AB+', units: 4  },
        { bloodGroup: 'AB-', units: 1  },
        { bloodGroup: 'O+',  units: 14 },
        { bloodGroup: 'O-',  units: 2  },
      ],
      lastUpdated: new Date(),
    },
  ])
  console.log('🩸 Blood inventory created for all 3 hospitals')

  // ── SAMPLE BLOOD REQUESTS ──────────────────────────────────
  await BloodRequest.create([
    {
      patientId: patient._id,
      bloodGroupNeeded: 'O+',
      unitsNeeded: 2,
      urgencyLevel: 'high',
      status: 'pending',
      contactPhone: patient.phone,
      notes: 'Needed for scheduled surgery',
      hospitalPreference: h1._id,
    },
    {
      patientId: patient2._id,
      bloodGroupNeeded: 'B+',
      unitsNeeded: 1,
      urgencyLevel: 'medium',
      status: 'available',
      contactPhone: patient2.phone,
      assignedHospital: h2._id,
      adminResponseMessage: 'B+ blood is available at Apollo Indore. Please visit with your ID.',
    },
  ])
  console.log('💉 Sample blood requests created')

  // ── SAMPLE EMERGENCY ───────────────────────────────────────
  const sampleEmergency = await Emergency.create({
    patientId: patient._id,
    symptoms: ['Severe Headache', 'High Fever'],
    description: 'Patient has been experiencing severe headache since morning with high fever.',
    riskLevel: 'MEDIUM',
    aiConfidence: 78,
    aiExplanation: 'Moderate risk symptoms identified. Medical attention recommended promptly.',
    topSymptoms: ['Severe Headache', 'High Fever'],
    firstAid: ['Keep patient comfortable', 'Apply cool compress', 'Stay hydrated', 'Monitor temperature'],
    location: { lat: 22.71, lng: 75.85, address: 'Indore, MP' },
    status: 'pending',
    suspicionScore: 0,
    isSuspicious: false,
  })
  console.log('🚨 Sample emergency created (MEDIUM risk)')

  // ── SAMPLE APPOINTMENTS ────────────────────────────────────
  const today = new Date()
  const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const dayAfter  = new Date(today); dayAfter.setDate(today.getDate() + 3)
  const nextWeek  = new Date(today); nextWeek.setDate(today.getDate() + 7)

  const fmt = (d) => d.toISOString().split('T')[0]

  await Appointment.create([
    {
      patientId: patient._id,
      doctorId: doc1._id,
      hospitalId: h1._id,
      linkedEmergency: sampleEmergency._id,
      riskLevel: 'MEDIUM',
      appointmentDate: fmt(tomorrow),
      appointmentTime: '10:00 AM',
      symptomsSummary: 'Severe Headache, High Fever — follow-up after emergency report',
      notes: 'Patient requested earliest slot available',
      status: 'confirmed',
      doctorNotes: 'Patient appears stable. Prescribed paracetamol and rest. Review in 3 days if fever persists.',
    },
    {
      patientId: patient._id,
      doctorId: doc2._id,
      hospitalId: h2._id,
      riskLevel: 'LOW',
      appointmentDate: fmt(dayAfter),
      appointmentTime: '03:00 PM',
      symptomsSummary: 'General checkup and blood pressure monitoring',
      status: 'pending',
    },
    {
      patientId: patient2._id,
      doctorId: doc1._id,
      hospitalId: h1._id,
      riskLevel: 'LOW',
      appointmentDate: fmt(nextWeek),
      appointmentTime: '11:00 AM',
      symptomsSummary: 'Routine consultation — mild cough and cold for 5 days',
      status: 'pending',
    },
    {
      patientId: patient2._id,
      doctorId: doc3._id,
      hospitalId: h3._id,
      riskLevel: 'MEDIUM',
      appointmentDate: fmt(tomorrow),
      appointmentTime: '02:00 PM',
      symptomsSummary: 'Chest discomfort and occasional palpitations',
      notes: 'Cardiologist consult needed',
      status: 'confirmed',
    },
  ])
  console.log('📅 Sample appointments created (4 appointments across 2 patients, 3 doctors)')

  // ── SUMMARY ────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════════╗
║         🚑 MediSync Seed Complete! 🩸            ║
╠══════════════════════════════════════════════════╣
║  LOGIN CREDENTIALS                               ║
║                                                  ║
║  👤 Patient:                                     ║
║     patient@demo.com  / demo1234                 ║
║     patient2@demo.com / demo1234                 ║
║                                                  ║
║  👨‍⚕️ Doctors:                                     ║
║     doctor@demo.com   / demo1234  (Emergency)    ║
║     doctor2@demo.com  / demo1234  (General)      ║
║     doctor3@demo.com  / demo1234  (Cardiology)   ║
║                                                  ║
║  🔐 Admin:                                       ║
║     admin@demo.com    / demo1234                 ║
╚══════════════════════════════════════════════════╝
`)
  process.exit(0)
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1) })
