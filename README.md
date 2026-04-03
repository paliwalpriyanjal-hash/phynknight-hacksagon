# 🚨 AI-Based Emergency Alert & Smart Ambulance System  

## 🛡️ Team PhynKnights  

An AI-driven healthcare emergency platform focused on **early detection and intelligent response** to wound-related emergencies and critical medical conditions.

The system analyzes user inputs such as **symptoms, voice, and wound images** to classify emergencies into three risk levels:

- 🔴 **High Risk** → Immediate ambulance dispatch and emergency response  
- 🟠 **Medium Risk** → Doctor consultation and timely medical attention  
- 🟢 **Low Risk** → Basic medical suggestions with optional doctor consultation  

The primary focus of the system is on **identifying and assessing different types of wounds and injuries**, enabling faster and more accurate decision-making in critical situations.

This approach bridges the gap between **emergency detection and response**, ensuring timely and appropriate medical action when it matters most.

---

## 🚀 Key Features  

- AI-based emergency risk classification  
- Voice-assisted symptom reporting  
- Image-based wound analysis (CNN-based)  
- Smart ambulance dispatch system  
- Doctor consultation for moderate cases  
- Basic guidance for low-risk cases  
- Admin monitoring and analytics system  
- Blood availability and request management  

---

## 🏗️ Tech Stack  

- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **AI/ML:** Python, Pytorch 
- **Database:** MongoDB  
- **Integrations:** Firebase Cloud Messaging, Maps API  

---

## 🔄 System Workflow  

1. User submits input (symptoms / voice / image)  
2. AI processes the input and predicts risk level  
3. Based on severity:  
   - High → Ambulance dispatched immediately  
   - Medium → Doctor consultation recommended  
   - Low → Basic medical guidance provided  
4. Hospital receives alert and prepares in advance  
5. Real-time tracking ensures faster response  

---

## ⚙️ Backend Development *(In Progress)*  

- Structured backend using **Node.js and Express**  
- Implemented core database models:  
  - User  
  - Emergency  
  - Ambulance  
  - Hospital  
  - Blood Inventory  
  - Blood Request  
  - Prediction Logs  

- Developed REST API routes for:  
  - Authentication  
  - Emergency handling  
  - Ambulance management  
  - Hospital and blood bank system  
  - Appointment system  
  - Analytics  

- Added middleware and modular routing for scalability  

---

## 🧠 ML Pipeline *(In Progress)*  

- Wound dataset preprocessing pipeline implemented  
- Multiple wound categories mapped into triage levels: **Low, Medium, High**  
- Images processed through:  
  - Cleaning  
  - Resizing  
  - Normalization  

- Dataset structured into:  
  - Training set  
  - Validation set  

- Prepared for deep learning model training  

---
