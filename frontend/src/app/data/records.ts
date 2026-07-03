export type RecordType = "Blood Test" | "MRI" | "CT Scan" | "Prescription" | "Vaccination" | "Other";

export interface MedicalRecord {
  id: string;
  title: string;
  type: RecordType;
  doctor: string;
  hospital: string;
  date: string;
  size: string;
  description: string;
  tags: string[];
}

export const MEDICAL_RECORDS: MedicalRecord[] = [
  { id: "r1", title: "Complete Blood Panel — Q2 2026", type: "Blood Test", doctor: "Dr. Priya Nair", hospital: "SF Health Network", date: "May 28, 2026", size: "1.2 MB", description: "Comprehensive metabolic panel, CBC, lipid profile, thyroid function. All values within normal limits.", tags: ["CBC", "Lipid Panel", "Thyroid"] },
  { id: "r2", title: "12-Lead ECG Report", type: "Other", doctor: "Dr. Amara Osei", hospital: "St. Luke's Medical Center", date: "Jun 12, 2026", size: "856 KB", description: "Resting electrocardiogram showing normal sinus rhythm. No ST changes or arrhythmia detected.", tags: ["Cardiology", "ECG"] },
  { id: "r3", title: "Brain MRI — Standard Protocol", type: "MRI", doctor: "Dr. Lena Kovač", hospital: "UCSF Medical Center", date: "Apr 15, 2026", size: "24.8 MB", description: "3T MRI brain with and without contrast. No evidence of intracranial lesion, hemorrhage, or infarction.", tags: ["Neurology", "Brain", "Contrast"] },
  { id: "r4", title: "Right Knee X-Ray Series", type: "CT Scan", doctor: "Dr. James Tran", hospital: "CPMC Davies Campus", date: "Feb 10, 2026", size: "8.4 MB", description: "AP and lateral views of right knee. Mild medial compartment joint space narrowing. No fracture identified.", tags: ["Orthopedics", "Knee"] },
  { id: "r5", title: "Metoprolol 25mg — 90-day Supply", type: "Prescription", doctor: "Dr. Amara Osei", hospital: "St. Luke's Medical Center", date: "Jun 12, 2026", size: "124 KB", description: "Metoprolol succinate 25mg once daily. Refill x2. Beta-blocker for hypertension management.", tags: ["Cardiology", "Hypertension"] },
  { id: "r6", title: "Influenza A Treatment — Tamiflu", type: "Prescription", doctor: "Dr. Priya Nair", hospital: "SF Health Network", date: "Dec 5, 2025", size: "98 KB", description: "Oseltamivir (Tamiflu) 75mg twice daily for 5 days. Influenza A treatment protocol.", tags: ["Antiviral"] },
  { id: "r7", title: "COVID-19 Booster — mRNA", type: "Vaccination", doctor: "Dr. Priya Nair", hospital: "SF Health Network", date: "Oct 15, 2025", size: "64 KB", description: "Updated mRNA COVID-19 booster dose administered. Lot #XB2245. Next recommended dose in 12 months.", tags: ["COVID-19", "Immunization"] },
  { id: "r8", title: "Influenza Vaccine 2025–2026", type: "Vaccination", doctor: "Dr. Priya Nair", hospital: "SF Health Network", date: "Sep 22, 2025", size: "64 KB", description: "Quadrivalent influenza vaccine administered. Lot #FL2899. No adverse reaction.", tags: ["Flu", "Immunization"] },
  { id: "r9", title: "Thyroid Ultrasound", type: "MRI", doctor: "Dr. Ingrid Larsen", hospital: "Kaiser Permanente", date: "Nov 18, 2025", size: "5.6 MB", description: "Ultrasound of thyroid gland. Normal echogenicity. No nodules or cysts identified. No lymphadenopathy.", tags: ["Endocrinology", "Thyroid"] },
  { id: "r10", title: "Abdominal CT — Appendix Protocol", type: "CT Scan", doctor: "Dr. Priya Nair", hospital: "SF Health Network", date: "Aug 3, 2025", size: "31.2 MB", description: "CT abdomen and pelvis without contrast. Appendix normal caliber. No periappendiceal inflammation. Incidental small renal cyst — benign.", tags: ["Abdomen", "Appendix"] },
  { id: "r11", title: "Vitamin D & Iron Panel", type: "Blood Test", doctor: "Dr. Priya Nair", hospital: "SF Health Network", date: "May 28, 2026", size: "412 KB", description: "25-OH Vitamin D: 28 ng/mL (insufficient). Ferritin: 42 ng/mL (normal). Supplementation recommended.", tags: ["Vitamin D", "Iron", "Deficiency"] },
];