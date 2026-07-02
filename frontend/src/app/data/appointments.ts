export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export interface AppointmentRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  avatar: string;
  date: string;
  time: string;
  type: "in-person" | "video";
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  fee: number;
  insurance?: string;
}

export const APPOINTMENT_HISTORY: AppointmentRecord[] = [
  { id: "a1", doctorId: "d1", doctorName: "Dr. Amara Osei", specialty: "Cardiology", hospital: "St. Luke's Medical Center", avatar: "photo-1612349317150-e413f6a5b16d", date: "Jul 3, 2026", time: "10:30 AM", type: "in-person", status: "upcoming", reason: "Follow-up echocardiogram review", fee: 220, insurance: "Aetna" },
  { id: "a2", doctorId: "d2", doctorName: "Dr. Lena Kovač", specialty: "Neurology", hospital: "UCSF Medical Center", avatar: "photo-1559839734-2b71ea197ec2", date: "Jul 9, 2026", time: "2:00 PM", type: "video", status: "upcoming", reason: "Migraine management check-in", fee: 190, insurance: "Cigna" },
  { id: "a3", doctorId: "d3", doctorName: "Dr. James Tran", specialty: "Orthopedics", hospital: "CPMC Davies Campus", avatar: "photo-1537368910025-700350fe46c7", date: "Jul 17, 2026", time: "9:00 AM", type: "in-person", status: "upcoming", reason: "Knee pain follow-up", fee: 250 },
  { id: "a4", doctorId: "d1", doctorName: "Dr. Amara Osei", specialty: "Cardiology", hospital: "St. Luke's Medical Center", avatar: "photo-1612349317150-e413f6a5b16d", date: "Jun 12, 2026", time: "11:00 AM", type: "in-person", status: "completed", reason: "Chest discomfort evaluation", notes: "ECG normal. Follow-up in 3 weeks. Continue Metoprolol 25mg.", fee: 220, insurance: "Aetna" },
  { id: "a5", doctorId: "d4", doctorName: "Dr. Priya Nair", specialty: "General Practice", hospital: "SF Health Network", avatar: "photo-1594824476967-48c8b964273f", date: "May 28, 2026", time: "9:30 AM", type: "in-person", status: "completed", reason: "Annual wellness exam", notes: "All vitals normal. Recommended increased physical activity and vitamin D supplementation.", fee: 140, insurance: "Aetna" },
  { id: "a6", doctorId: "d2", doctorName: "Dr. Lena Kovač", specialty: "Neurology", hospital: "UCSF Medical Center", avatar: "photo-1559839734-2b71ea197ec2", date: "Apr 15, 2026", time: "3:00 PM", type: "video", status: "completed", reason: "Migraine episode follow-up", notes: "Updated migraine prevention plan. Starting Topiramate 25mg nightly.", fee: 190, insurance: "Cigna" },
  { id: "a7", doctorId: "d5", doctorName: "Dr. Marcus Hill", specialty: "Dermatology", hospital: "Sutter Health", avatar: "photo-1582750433449-648ed127bb54", date: "Mar 22, 2026", time: "1:00 PM", type: "in-person", status: "completed", reason: "Skin lesion evaluation", notes: "Benign seborrheic keratosis. No treatment required. Annual skin check recommended.", fee: 185 },
  { id: "a8", doctorId: "d3", doctorName: "Dr. James Tran", specialty: "Orthopedics", hospital: "CPMC Davies Campus", avatar: "photo-1537368910025-700350fe46c7", date: "Feb 10, 2026", time: "10:00 AM", type: "in-person", status: "cancelled", reason: "Shoulder pain consultation", fee: 250, notes: "Cancelled by patient — schedule conflict." },
  { id: "a9", doctorId: "d6", doctorName: "Dr. Yuki Tanaka", specialty: "Psychiatry", hospital: "SF Mental Health Clinic", avatar: "photo-1567532939604-b6b5b0db2604", date: "Jan 30, 2026", time: "2:30 PM", type: "video", status: "cancelled", reason: "Anxiety management consult", fee: 210, notes: "Cancelled by doctor — emergency rescheduling." },
  { id: "a10", doctorId: "d4", doctorName: "Dr. Priya Nair", specialty: "General Practice", hospital: "SF Health Network", avatar: "photo-1594824476967-48c8b964273f", date: "Dec 5, 2025", time: "11:30 AM", type: "in-person", status: "completed", reason: "Flu symptoms", notes: "Influenza A confirmed. Prescribed Tamiflu. Rest and fluids advised.", fee: 140, insurance: "Aetna" },
  { id: "a11", doctorId: "d8", doctorName: "Dr. Ingrid Larsen", specialty: "Endocrinology", hospital: "Kaiser Permanente", avatar: "photo-1573496359142-b8d87734a5a2", date: "Nov 18, 2025", time: "9:00 AM", type: "in-person", status: "completed", reason: "Thyroid function review", notes: "TSH within normal range. Continue current medication dose.", fee: 195, insurance: "Aetna" },
];
