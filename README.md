# 🚨 AI-Based Emergency Alert & Smart Ambulance System

## 🛡️ Team PhynKnights

An AI-driven healthcare emergency platform focused on **early detection and intelligent response** to wound-related emergencies and critical medical conditions.

The system analyzes user inputs such as **symptoms, voice, and wound images** to classify emergencies into three risk levels:

* 🔴 **High Risk** → Immediate ambulance dispatch and emergency response
* 🟠 **Medium Risk** → Doctor consultation and timely medical attention
* 🟢 **Low Risk** → Basic medical suggestions with optional doctor consultation

The primary focus of the system is on **identifying and assessing different types of wounds and injuries**, enabling faster and more accurate decision-making in critical situations.

---

## 🚀 Current Project Status

✅ **Frontend Completed (Web)**
✅ **Backend Completed (Node.js + Express)**
✅ **AI Model & Inference Script Completed**

---

## 🚀 Key Features

* AI-based emergency risk classification
* Voice-assisted symptom reporting
* Image-based wound analysis (MobileNetV2-based CNN)
* Smart ambulance dispatch system
* Doctor consultation for moderate cases
* Basic guidance for low-risk cases
* Admin monitoring and analytics system
* Blood availability and request management
* Real-time emergency handling system

---

## 🏗️ Tech Stack

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **AI/ML:** Python, PyTorch (MobileNetV2)
* **Database:** MongoDB
* **APIs & Services:** Firebase Cloud Messaging, Maps API

---

## 🔄 System Workflow

1. User submits input:

   * Symptoms (text)
   * Voice input
   * Wound image

2. Backend processes and prepares data

3. AI model (**MobileNetV2**) performs prediction

4. Based on severity:

   * 🔴 High → Ambulance dispatched
   * 🟠 Medium → Doctor consultation
   * 🟢 Low → Basic medical guidance

5. Hospital is notified and prepares in advance

6. Real-time tracking ensures faster response

---

## ⚙️ Backend (Completed ✅)

### 🔹 Architecture

* Built using **Node.js & Express**
* Modular, scalable, and clean structure

### 🔹 Implemented Modules

* Authentication System
* Emergency Management
* Ambulance Tracking
* Hospital System
* Blood Bank Management
* Appointment System
* Prediction Logging
* Admin Analytics

### 🔹 Database Models

* User
* Emergency
* Ambulance
* Hospital
* Blood Inventory
* Blood Request
* Prediction Logs

### 🔹 Features

* RESTful API design
* Middleware-based request handling
* Image upload support
* Environment configuration with `.env`

---

## 🧠 ML Pipeline (Completed ✅)

### 🔹 Model

* **MobileNetV2 (Transfer Learning)** used for wound classification
* Lightweight and efficient for real-time predictions

### 🔹 Data Processing

* Image cleaning
* Resizing
* Normalization

### 🔹 Dataset

* Structured into:

  * Training set
  * Validation set

### 🔹 Classification Output

* Low Risk
* Medium Risk
* High Risk

### 🔹 Inference

* Optimized inference script for real-time predictions
* Ready for backend integration

---

## 🧪 How to Run (Local Setup)

### 1️⃣ Backend

```bash id="9d2k3l"
cd backend
npm install
node server.js
```

### 2️⃣ Frontend

```bash id="7s4k1p"
cd web
npm install
npm start
```

### 3️⃣ ML Model

```bash id="k8d1wz"
cd model
python inference.py
```

---

## 🎯 Future Enhancements

* Real-time GPS ambulance tracking
* Mobile app (Android/iOS)
* Multi-modal AI (voice + image + text combined)
* Hospital live dashboard
* Automated emergency calling system

---

## 📌 Conclusion

This project combines **AI (MobileNetV2) + Full Stack Development** to create a **smart emergency response system** capable of saving lives through faster and more accurate decision-making.

---
