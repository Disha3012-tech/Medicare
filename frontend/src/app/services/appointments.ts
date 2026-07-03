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
  // Related loaded objects (if included in DB serializer, though our schemas are flat, we will merge names on the frontend if needed)
  doctor_name?: string;
  patient_name?: string;
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
  }
};
