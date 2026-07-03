export type NotificationType = "appointment_booked" | "appointment_approved" | "appointment_cancelled" | "prescription_uploaded" | "doctor_message" | "reminder";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
  avatar?: string;
}

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "reminder", title: "Appointment tomorrow", body: "Reminder: You have an appointment with Dr. Amara Osei tomorrow at 10:30 AM at St. Luke's Medical Center.", time: "2 hours ago", read: false, link: "/patient/history" },
  { id: "n2", type: "appointment_approved", title: "Appointment confirmed", body: "Dr. Lena Kovač has confirmed your appointment for July 9, 2026 at 2:00 PM.", time: "4 hours ago", read: false, link: "/patient/history" },
  { id: "n3", type: "prescription_uploaded", title: "New prescription available", body: "Dr. Amara Osei has uploaded a new prescription for Metoprolol 25mg. View it in your prescriptions.", time: "1 day ago", read: false, link: "/patient/prescriptions" },
  { id: "n4", type: "doctor_message", title: "Message from Dr. Priya Nair", body: "Your blood test results are in. Everything looks great! Your Vitamin D levels have improved. Keep up with the supplements.", time: "1 day ago", read: false, avatar: "photo-1594824476967-48c8b964273f" },
  { id: "n5", type: "appointment_booked", title: "Appointment booked", body: "Your appointment with Dr. James Tran on July 17, 2026 at 9:00 AM has been successfully booked.", time: "2 days ago", read: true, link: "/patient/history" },
  { id: "n6", type: "reminder", title: "Health record uploaded", body: "Your Brain MRI report from UCSF has been added to your medical records.", time: "3 days ago", read: true, link: "/patient/records" },
  { id: "n7", type: "appointment_cancelled", title: "Appointment cancelled", body: "Your appointment with Dr. Yuki Tanaka on Jan 30 has been cancelled due to a scheduling conflict. Please rebook at your convenience.", time: "5 days ago", read: true, link: "/find-doctors" },
  { id: "n8", type: "reminder", title: "Annual checkup due", body: "It's been 12 months since your last annual wellness exam with Dr. Priya Nair. Consider scheduling your next visit.", time: "1 week ago", read: true, link: "/find-doctors" },
  { id: "n9", type: "prescription_uploaded", title: "Prescription expiring soon", body: "Your Topiramate prescription from Dr. Lena Kovač expires in 5 days. Contact your doctor for a renewal.", time: "1 week ago", read: true, link: "/patient/prescriptions" },
  { id: "n10", type: "appointment_approved", title: "Appointment rescheduled", body: "Your appointment with Dr. Marcus Hill has been moved to Jul 7, 2026 at 11:00 AM.", time: "2 weeks ago", read: true },
];