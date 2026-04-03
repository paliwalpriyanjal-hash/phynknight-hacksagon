# 🚨 AI-Based Emergency Alert & Smart Ambulance System  

### 🛡️ Team PhynKnights

An AI-driven healthcare emergency platform proposed by Team PhynKnights, focused on early detection and intelligent response to wound-related emergencies and critical medical conditions.

The system is designed to analyze user inputs such as symptoms, voice, and wound images to classify emergencies into three risk levels:

- 🔴 **High Risk** → Immediate ambulance dispatch and emergency response  
- 🟠 **Medium Risk** → Doctor consultation and timely medical attention  
- 🟢 **Low Risk** → Basic medical suggestions with an option to consult a doctor if needed  

The primary focus of the system is on identifying and assessing different types of wounds and injury conditions, enabling faster and more accurate decision-making in critical situations.

This approach aims to bridge the gap between emergency detection and response, ensuring timely and appropriate medical action when it matters most.

---

## ⚙️ Backend Development (In Progress)

- Structured backend using Node.js and Express  
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
  - Appointment and analytics  
- Added middleware and modular routing for scalability  

---

## 🧠 ML Pipeline (In Progress)

- Wound dataset preprocessing pipeline implemented  
- Multiple wound categories mapped into triage levels: **low, medium, high**  
- Images cleaned, resized, and structured into training and validation sets  
- Dataset prepared for deep learning model training  
