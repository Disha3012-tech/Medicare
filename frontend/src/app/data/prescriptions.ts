export interface Medicine {
  name: string;
  generic: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  avatar: string;
  date: string;
  diagnosis: string;
  notes: string;
  medicines: Medicine[];
  patientName?: string;
  patientAge?: number;
}

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "px1",
    doctorId: "d1",
    doctorName: "Dr. Amara Osei",
    specialty: "Cardiology",
    avatar: "photo-1612349317150-e413f6a5b16d",
    date: "Jun 12, 2026",
    diagnosis: "Hypertension — Stage 1",
    notes: "Monitor blood pressure daily. Return in 3 weeks. Avoid high-sodium foods and alcohol. Moderate exercise encouraged.",
    medicines: [
      { name: "Metoprolol Succinate", generic: "Metoprolol", dosage: "25mg", frequency: "Once daily", duration: "90 days", instructions: "Take in the morning with food. Do not stop abruptly." },
      { name: "Amlodipine", generic: "Amlodipine Besylate", dosage: "5mg", frequency: "Once daily", duration: "90 days", instructions: "Take at the same time each day. May cause ankle swelling." },
    ],
  },
  {
    id: "px2",
    doctorId: "d2",
    doctorName: "Dr. Lena Kovač",
    specialty: "Neurology",
    avatar: "photo-1559839734-2b71ea197ec2",
    date: "Apr 15, 2026",
    diagnosis: "Chronic Migraine with Aura",
    notes: "Keep a headache diary. Avoid known triggers — bright lights, irregular sleep, dehydration. If 3+ episodes per month, return immediately.",
    medicines: [
      { name: "Topiramate", generic: "Topiramate", dosage: "25mg", frequency: "Once nightly", duration: "30 days, then 50mg", instructions: "Titrate up slowly. Ensure adequate hydration. Avoid driving if drowsy." },
      { name: "Sumatriptan", generic: "Sumatriptan Succinate", dosage: "50mg", frequency: "At onset of migraine (max 2 doses/24h)", duration: "PRN (as needed)", instructions: "Take at first sign of migraine. Do not exceed 200mg per day." },
      { name: "Ondansetron", generic: "Ondansetron HCl", dosage: "4mg", frequency: "PRN for nausea", duration: "PRN", instructions: "Dissolve ODT on tongue. Use during migraine episode if nausea present." },
    ],
  },
  {
    id: "px3",
    doctorId: "d4",
    doctorName: "Dr. Priya Nair",
    specialty: "General Practice",
    avatar: "photo-1594824476967-48c8b964273f",
    date: "Dec 5, 2025",
    diagnosis: "Influenza A",
    notes: "Rest at home for 5 days. Increase fluid intake. Return if symptoms worsen or fever persists beyond 72 hours.",
    medicines: [
      { name: "Oseltamivir", generic: "Oseltamivir Phosphate", dosage: "75mg", frequency: "Twice daily with food", duration: "5 days", instructions: "Complete full course even if feeling better. Take with meals to reduce nausea." },
      { name: "Ibuprofen", generic: "Ibuprofen", dosage: "400mg", frequency: "Every 6–8 hours PRN", duration: "5 days PRN", instructions: "Take with food. Use for fever and body pain. Do not exceed 1200mg/day without medical advice." },
    ],
  },
  {
    id: "px4",
    doctorId: "d4",
    doctorName: "Dr. Priya Nair",
    specialty: "General Practice",
    avatar: "photo-1594824476967-48c8b964273f",
    date: "May 28, 2026",
    diagnosis: "Vitamin D Insufficiency",
    notes: "Recheck Vitamin D levels in 3 months. Consider getting 15–20 minutes of sun exposure daily when possible.",
    medicines: [
      { name: "Vitamin D3", generic: "Cholecalciferol", dosage: "2000 IU", frequency: "Once daily with fatty meal", duration: "90 days", instructions: "Take with the largest meal of the day for best absorption." },
      { name: "Calcium Carbonate", generic: "Calcium Carbonate", dosage: "500mg", frequency: "Twice daily with meals", duration: "90 days", instructions: "Take with food. Space doses at least 4 hours apart from iron supplements." },
    ],
  },
];

export const DOCTOR_PRESCRIPTIONS: Prescription[] = [
  {
    id: "dpx1",
    doctorId: "d1",
    doctorName: "Dr. Amara Osei",
    specialty: "Cardiology",
    avatar: "photo-1612349317150-e413f6a5b16d",
    patientName: "Marcus Webb",
    patientAge: 52,
    date: "Jun 28, 2026",
    diagnosis: "Atrial Fibrillation — Paroxysmal",
    notes: "Avoid caffeine and alcohol. Wear Holter monitor for 48 hours. Return in 2 weeks.",
    medicines: [
      { name: "Rivaroxaban", generic: "Rivaroxaban", dosage: "20mg", frequency: "Once daily with evening meal", duration: "6 months", instructions: "Take with the largest meal of the day. Do not crush." },
      { name: "Metoprolol Succinate", generic: "Metoprolol", dosage: "50mg", frequency: "Once daily", duration: "90 days", instructions: "Take in the morning. Do not stop abruptly." },
    ],
  },
  {
    id: "dpx2",
    doctorId: "d1",
    doctorName: "Dr. Amara Osei",
    specialty: "Cardiology",
    avatar: "photo-1612349317150-e413f6a5b16d",
    patientName: "Priya Sharma",
    patientAge: 34,
    date: "Jun 15, 2026",
    diagnosis: "Hypertension — Stage 2",
    notes: "Low-sodium DASH diet. Check BP twice daily. Emergency room if BP > 180/120.",
    medicines: [
      { name: "Lisinopril", generic: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "60 days", instructions: "First dose at bedtime to avoid dizziness. Avoid potassium supplements." },
      { name: "Hydrochlorothiazide", generic: "HCTZ", dosage: "25mg", frequency: "Once daily in the morning", duration: "60 days", instructions: "Take in the morning to avoid nighttime urination." },
    ],
  },
  {
    id: "dpx3",
    doctorId: "d1",
    doctorName: "Dr. Amara Osei",
    specialty: "Cardiology",
    avatar: "photo-1612349317150-e413f6a5b16d",
    patientName: "Elena Petrov",
    patientAge: 61,
    date: "Jun 1, 2026",
    diagnosis: "Heart Failure — HFpEF",
    notes: "Fluid restriction 2L/day. Weigh daily — contact office if weight increases >2kg in 2 days. Salt restriction <2g/day.",
    medicines: [
      { name: "Furosemide", generic: "Furosemide", dosage: "40mg", frequency: "Once daily in the morning", duration: "30 days", instructions: "Take in the morning. Monitor for electrolyte imbalances." },
      { name: "Spironolactone", generic: "Spironolactone", dosage: "25mg", frequency: "Once daily", duration: "30 days", instructions: "Monitor potassium levels weekly. Avoid potassium-rich foods." },
    ],
  },
];

export const COMMON_MEDICINES = [
  { name: "Metoprolol Succinate", category: "Cardiology", defaultDosage: "25mg" },
  { name: "Amlodipine", category: "Cardiology", defaultDosage: "5mg" },
  { name: "Lisinopril", category: "Cardiology", defaultDosage: "10mg" },
  { name: "Atorvastatin", category: "Cardiology", defaultDosage: "20mg" },
  { name: "Furosemide", category: "Cardiology", defaultDosage: "40mg" },
  { name: "Aspirin", category: "General", defaultDosage: "81mg" },
  { name: "Ibuprofen", category: "Pain", defaultDosage: "400mg" },
  { name: "Paracetamol", category: "Pain", defaultDosage: "500mg" },
  { name: "Amoxicillin", category: "Antibiotic", defaultDosage: "500mg" },
  { name: "Azithromycin", category: "Antibiotic", defaultDosage: "500mg" },
  { name: "Omeprazole", category: "Gastro", defaultDosage: "20mg" },
  { name: "Metformin", category: "Diabetes", defaultDosage: "500mg" },
  { name: "Levothyroxine", category: "Endocrine", defaultDosage: "50mcg" },
  { name: "Cetirizine", category: "Allergy", defaultDosage: "10mg" },
  { name: "Sertraline", category: "Psychiatry", defaultDosage: "50mg" },
];