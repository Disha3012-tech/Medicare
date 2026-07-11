# 🏥 Medicare Telehealth Platform

The **Medicare Telehealth Platform** is a modern, high-performance, full-stack digital health ecosystem designed to bring comprehensive, secure, and remote healthcare directly to patients. Built to mirror real-world medical management software, the application bridges the gap between clinical operations and remote patient care.

---

## 🌟 Core Features & Modules

The platform is structured into key, interlocking modules that manage the entire patient-doctor lifecycle:

- **📅 Virtual Clinic & Scheduling**: Handles discoverable medical profiles, specialty filters, and strict scheduling rules that block overlapping appointments.
- **💬 Real-Time Messaging & Chat**: Persistent text messaging for follow-up care with instantaneous, secure, real-time message delivery.
- **📹 Virtual Video Consultations**: Real-time virtual consultations powered by WebRTC signaling for face-to-face remote clinical care.
- **📄 Clinical Records & Reports**: Allows patients to upload medical history documents, lab results, imaging, and vaccinations. Includes responsive document cards and a clean modal viewer for viewing and secure cross-origin file downloads.
- **💊 Prescriptions & Pharmacy Integration**: Digitalizes medical paper trails, allowing doctors to securely track history, issue formal prescriptions, and allowing patients to view and save them.
- **⭐ Patient Feedback & QA**: Dynamic rating system that automatically updates a doctor’s public profile rating upon successful completion of an appointment.
- **🤖 Floating AI Health Assistant**: Intelligent chatbot assistant providing instant directions, answers to payment/billing questions, and quick portal navigation.

---

## 🎨 Design & Accessibility Highlights

- **🌗 Adaptive Theme Engine**: Built-in support for gorgeous Light and Dark modes. The dark mode utilizes a polished, high-contrast, brand-aligned color scheme (deep canvas backgrounds, visible card depth levels, and vivid teal accents) to reduce eye strain.
- **🔒 Password Security Badge**: Animated, real-time password validation indicator for account setup. Displays a live progress bar, character count, and dynamic red-to-green state changes.
- **📱 Fully Responsive Design**: Complete support for desktops, laptops, tablets, iPads, and smartphones. Navigation bars, dialogs, sliders, and buttons are responsive.
- **⚙️ Dynamic Slide-Out Filter Drawer**: Clean, Zomato/Airbnb-style filter chips that smoothly collapse to keep search interfaces uncluttered.

---

### 1. Backend Setup

1. Navigate to the backend directory and set up a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### 2. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

