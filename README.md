# 🚑 AI-Based Emergency Alert & Smart Ambulance System

> **Hackathon-Ready | Production-Grade | Full-Stack**  
> React + Tailwind + Node.js + MongoDB + Socket.IO

---

## 📸 Screenshots

The app features a deep-blue gradient theme with animated ECG lines, an ambulance road animation, and three login portals (Patient 🟢 / Doctor 🔵 / Admin 🔴).

---

## 🗂️ Project Structure

```
emergency-system/
├── frontend/          # React + Tailwind (Vite)
└── backend/           # Node.js + Express + MongoDB
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

---

### 1. Backend Setup

```bash
cd backend
cp .env.example .env       # Edit MONGO_URI and JWT_SECRET
npm install
node seed.js               # Creates demo users & ambulances
npm run dev                # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role    | Email                | Password   |
|---------|----------------------|------------|
| Patient | patient@demo.com     | demo1234   |
| Doctor  | doctor@demo.com      | demo1234   |
| Admin   | admin@demo.com       | demo1234   |

---

## 🌟 Features

### Patient Portal
- ✅ Manual symptom selection (12 symptoms)
- ✅ Voice-to-text symptom input (Web Speech API)
- ✅ Multi-image accident upload (up to 5 images)
- ✅ GPS location capture
- ✅ AI risk assessment (HIGH / MEDIUM / LOW)
- ✅ Explainable AI output with confidence score
- ✅ First-aid guidance per risk level
- ✅ 60-second cancel window for high-risk dispatch
- ✅ Live ambulance tracking screen
- ✅ Emergency history

### Doctor Portal
- ✅ Real-time emergency alerts
- ✅ Patient symptoms + voice transcript view
- ✅ AI explanation panel (XAI)
- ✅ Acknowledge / Preparing / Ready / Completed status flow
- ✅ Doctor preparation notes
- ✅ Ambulance ETA display

### Admin Portal
- ✅ Live emergency monitoring board
- ✅ Fleet management (add / update / deactivate ambulances)
- ✅ User management with flag/deactivate
- ✅ Fake alert detection panel with suspicion scores
- ✅ Analytics dashboard with bar chart
- ✅ AI performance metrics
- ✅ Response time analytics

---

## 🤖 AI Engine

Located in `backend/utils/aiEngine.js`

- Rule-based weighted scoring system (drop-in replaceable with ML model)
- Scores symptoms, NLP keyword detection, voice transcript analysis
- Outputs: `riskLevel`, `confidence`, `topSymptoms`, `firstAid`, `explanation`, `suspicionScore`
- To integrate Python ML model: call `AI_SERVICE_URL` from `.env`

---

## 🔌 API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Get current user |
| POST | `/api/emergency/create` | Patient | Submit emergency with AI assessment |
| GET | `/api/emergency/my-history` | Patient | Patient's emergency history |
| GET | `/api/emergency/:id` | Auth | Get single emergency |
| PATCH | `/api/emergency/:id/acknowledge` | Doctor | Acknowledge emergency |
| PATCH | `/api/emergency/:id/status` | Doctor/Admin | Update status |
| PATCH | `/api/emergency/:id/cancel` | Patient | Cancel within 60 seconds |
| GET | `/api/ambulance` | Admin/Doctor | List ambulances |
| POST | `/api/ambulance` | Admin | Add ambulance |
| PATCH | `/api/ambulance/:id/location` | Auth | Update GPS location |
| GET | `/api/user` | Admin | List users |
| PATCH | `/api/user/:id/flag` | Admin | Flag suspicious user |
| GET | `/api/analytics/summary` | Admin | System KPIs |
| GET | `/api/analytics/weekly` | Admin | Weekly chart data |
| GET | `/api/notifications` | Auth | User notifications |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast dev, component-based |
| Styling | Tailwind CSS | Rapid, consistent UI |
| Routing | React Router v6 | SPA navigation |
| HTTP | Axios | API calls with interceptors |
| Real-time | Socket.IO | Live tracking & alerts |
| Backend | Node.js + Express | Lightweight, fast API |
| Database | MongoDB + Mongoose | Flexible schema for emergencies |
| Auth | JWT + bcryptjs | Secure, stateless |
| File Upload | Multer | Multi-image handling |

---

## 🔮 Future Scope

- [ ] Python FastAPI ML service with trained CNN for image severity
- [ ] Google Maps / Leaflet live map integration
- [ ] Firebase Cloud Messaging push notifications
- [ ] WhatsApp/SMS alerts via Twilio
- [ ] Wearable device integration (heart rate, SpO2)
- [ ] Multi-language voice support
- [ ] React Native mobile app
- [ ] Predictive demand forecasting for ambulance placement

---

## 🏆 Hackathon Demo Flow

1. Open homepage → show ECG animation + ambulance road
2. Login as **Patient** → click "Report Emergency"
3. Select symptoms (Chest Pain + Shortness of Breath) → Next
4. Click "Capture Location" → Submit
5. Show **HIGH RISK** AI result + ambulance dispatched
6. Open new tab → Login as **Doctor** → show alert appeared
7. Open new tab → Login as **Admin** → show monitoring board + fleet

**Judge-winning talking points:**
- "AI assesses risk in under 1 second"
- "60-second cancel window prevents false dispatches"  
- "Explainable AI tells doctors *why* it flagged high risk"
- "Fake alert detection protects system from misuse"

---

## 📄 License

MIT — Free to use and modify for educational/hackathon purposes.
