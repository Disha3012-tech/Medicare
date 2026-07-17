import { api } from "./api";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_min: number;
  type: "IN_PERSON" | "VIDEO";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  reason_for_visit?: string;
  notes?: string;
  cancel_reason?: string;
  doctor_name?: string;
  patient_name?: string;
}

export interface CallInfo {
  room_id: string;
  appointment_id: string;
  scheduled_at: string;
  other_participant_name: string;
  other_participant_avatar?: string;
  other_participant_role: "doctor" | "patient";
  specialty?: string;
}

export const appointmentsService = {
  async book(payload: {
    doctor_id: string;
    scheduled_at: string;
    duration_min?: number;
    type: "IN_PERSON" | "VIDEO";
    reason_for_visit?: string;
  }): Promise<Appointment> {
    return api.post("/appointments", payload);
  },

  async getMine(status?: string): Promise<Appointment[]> {
    return api.get("/appointments/mine", { params: status ? { status } : undefined });
  },

  async getById(id: string): Promise<Appointment> {
    return api.get(`/appointments/${id}`);
  },

  async getCallInfo(id: string): Promise<CallInfo> {
    return api.get(`/appointments/${id}/call-info`);
  },

  async update(id: string, payload: {
    status?: string;
    scheduled_at?: string;
    notes?: string;
    cancel_reason?: string;
  }): Promise<Appointment> {
    return api.patch(`/appointments/${id}`, payload);
  },

  async cancel(id: string, cancel_reason: string): Promise<Appointment> {
    return this.update(id, { status: "CANCELLED", cancel_reason });
  },

  async reschedule(id: string, scheduled_at: string): Promise<Appointment> {
    return this.update(id, { scheduled_at });
  },

  async startCall(id: string): Promise<{ success: boolean }> {
    return api.post(`/appointments/${id}/start-call`, {});
  },

  async emergencyCancelDay(date: string, reason: string): Promise<{ success: boolean; cancelled_count: number }> {
    return api.post("/appointments/emergency-cancel-day", { date, reason });
  },
};