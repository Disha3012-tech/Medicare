export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  phone: string;
  email: string;
  condition: string;
  lastVisit: string;
  nextVisit?: string;
  visitCount: number;
  risk: "low" | "medium" | "high";
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  avatar?: string;
}

export const DOCTOR_PATIENTS: PatientSummary[] = [
  { id: "p1", name: "Marcus Webb", age: 52, gender: "Male", bloodGroup: "A+", phone: "+1 (415) 555-0182", email: "marcus.webb@email.com", condition: "Post-op cardiac surgery", lastVisit: "Jun 28, 2026", nextVisit: "Jul 3, 2026", visitCount: 8, risk: "low", medicalHistory: ["Coronary artery bypass (2025)", "Hypertension", "Type 2 Diabetes"], currentMedications: ["Metoprolol 25mg", "Aspirin 81mg", "Atorvastatin 40mg"], allergies: ["Penicillin"] },
  { id: "p2", name: "Priya Sharma", age: 34, gender: "Female", bloodGroup: "B+", phone: "+1 (415) 555-0219", email: "priya.sharma@email.com", condition: "Chest pain evaluation", lastVisit: "May 28, 2026", nextVisit: "Jul 1, 2026", visitCount: 3, risk: "medium", medicalHistory: ["Anxiety disorder", "GERD"], currentMedications: ["Omeprazole 20mg"], allergies: ["Sulfonamides", "Shellfish"] },
  { id: "p3", name: "Noel Okafor", age: 45, gender: "Male", bloodGroup: "O+", phone: "+1 (415) 555-0347", email: "noel.okafor@email.com", condition: "Hypertension management", lastVisit: "Jun 1, 2026", nextVisit: "Jul 1, 2026", visitCount: 12, risk: "low", medicalHistory: ["Hypertension (2020)", "Mild obesity"], currentMedications: ["Lisinopril 10mg", "HCTZ 25mg"], allergies: [] },
  { id: "p4", name: "Elena Petrov", age: 61, gender: "Female", bloodGroup: "AB-", phone: "+1 (415) 555-0411", email: "elena.petrov@email.com", condition: "Atrial fibrillation", lastVisit: "Jun 15, 2026", nextVisit: "Jul 1, 2026", visitCount: 19, risk: "high", medicalHistory: ["Atrial fibrillation (2023)", "Heart failure HFpEF", "Osteoporosis", "Hypothyroidism"], currentMedications: ["Rivaroxaban 20mg", "Metoprolol 50mg", "Furosemide 40mg", "Levothyroxine 75mcg"], allergies: ["Ibuprofen", "Codeine"] },
  { id: "p5", name: "David Chen", age: 48, gender: "Male", bloodGroup: "A-", phone: "+1 (415) 555-0538", email: "david.chen@email.com", condition: "Arrhythmia follow-up", lastVisit: "Jun 20, 2026", nextVisit: "Jul 1, 2026", visitCount: 6, risk: "medium", medicalHistory: ["Paroxysmal SVT (2024)", "Hyperlipidemia"], currentMedications: ["Flecainide 100mg", "Atorvastatin 20mg"], allergies: ["Latex"] },
  { id: "p6", name: "Sandra Kim", age: 41, gender: "Female", bloodGroup: "O-", phone: "+1 (415) 555-0672", email: "sandra.kim@email.com", condition: "Cardiac stress test", lastVisit: "May 15, 2026", visitCount: 4, risk: "low", medicalHistory: ["Family history of CAD", "Mild hypertension"], currentMedications: ["Amlodipine 5mg"], allergies: [] },
  { id: "p7", name: "Tom Reyes", age: 57, gender: "Male", bloodGroup: "B-", phone: "+1 (415) 555-0784", email: "tom.reyes@email.com", condition: "Heart failure monitoring", lastVisit: "Jun 10, 2026", nextVisit: "Jul 8, 2026", visitCount: 24, risk: "high", medicalHistory: ["Heart failure EF 35% (2022)", "Hypertension", "CKD Stage 2", "Type 2 Diabetes"], currentMedications: ["Sacubitril/Valsartan 97/103mg", "Spironolactone 25mg", "Furosemide 40mg", "Metoprolol 50mg"], allergies: ["ACE inhibitors (cough)"] },
  { id: "p8", name: "Anne Hoffman", age: 38, gender: "Female", bloodGroup: "A+", phone: "+1 (415) 555-0891", email: "anne.hoffman@email.com", condition: "Palpitations workup", lastVisit: "Jun 5, 2026", visitCount: 2, risk: "low", medicalHistory: ["Anxiety disorder", "POTS suspected"], currentMedications: ["Propranolol 10mg PRN"], allergies: [] },
];