import { api } from "./api";

export interface Medicine {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string;
  notes?: string;
  issued_at: string;
  medicines: Medicine[];
  doctor_name: string;
  specialty: string;
  doctor_avatar_url?: string;
  patient_name: string;
  patient_age?: number;
}

export const prescriptionsService = {
  async create(payload: {
    patient_id: string;
    appointment_id?: string;
    diagnosis?: string;
    notes?: string;
    medicines: Omit<Medicine, "id">[];
  }): Promise<Prescription> {
    return api.post("/prescriptions", payload);
  },

  async getMine(): Promise<Prescription[]> {
    return api.get("/prescriptions/mine");
  },

  async getById(id: string): Promise<Prescription> {
    return api.get(`/prescriptions/${id}`);
  },
};