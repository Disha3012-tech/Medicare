🏥 Medicare Telehealth Platform
The Medicare Telehealth Platform is a modern, full-stack digital health ecosystem designed to bring comprehensive, accessible healthcare directly to patients. Built to mimic real-world medical management software, the application bridges the gap between clinical operations and remote patient care.

🌟 Core Systems Overview
The platform is structured into key, interlocking modules that manage the entire patient-doctor lifecycle:

Virtual Clinic & Scheduling: Handles secure doctor validation, discoverable medical profiles, and scheduling rules that block overlapping appointments.

Real-Time Care Delivery: Integrates persistent text messaging for follow-up care and raw WebRTC signaling to spin up instantaneous virtual video consultations.

Clinical Records & Prescriptions: Digitalizes medical paper trails, allowing doctors to securely upload test results, track patient histories, and issue formal prescriptions.

Feedback & Quality Assurance: Features an automated review system that dynamically updates a doctor’s public rating upon the successful completion of an appointment.

🚀 Quick Start
1. Backend Setup
Make sure you have a local PostgreSQL database named medicare created and running.
# Set up Python virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Start the API server
uvicorn app.main:app --reload --port 5000

2. Frontend Setup
In a new terminal window, navigate to your frontend directory and run:
cd frontend
npm install
npm run dev

