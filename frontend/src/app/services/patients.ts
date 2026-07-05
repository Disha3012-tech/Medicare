import { api } from "./api";

export interface EmergencyContactData {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceData {
  provider: string;
  policy_number: string;
  group_number?: string;
  valid_until?: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  blood_group?: string;
  height?: number;
  weight?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  allergies?: string[];
  chronic_conditions?: string[];
}

export interface PatientSummary {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  phone?: string;
  email: string;
  chronic_conditions: string[];
  allergies: string[];
  last_visit?: string;
  next_visit?: string;
  visit_count: number;
  current_medications: string[];
  avatar_url?: string;
}

export const patientsService = {
  async getMe(): Promise<Patient> {
    return api.get("/patients/me");
  },

  async updateMe(payload: Partial<Patient>): Promise<Patient> {
    return api.patch("/patients/me", payload);
  },

  async updateEmergencyContact(payload: EmergencyContactData): Promise<any> {
    return api.put("/patients/me/emergency-contact", payload);
  },

  async getEmergencyContact(): Promise<EmergencyContactData | null> {
    return api.get("/patients/me/emergency-contact");
  },

  async updateInsurance(payload: InsuranceData): Promise<any> {
    return api.put("/patients/me/insurance", payload);
  },

  async getInsurance(): Promise<InsuranceData | null> {
    return api.get("/patients/me/insurance");
  },

  async getById(id: string): Promise<Patient> {
    return api.get(`/patients/${id}`);
  },

  async getMyPatients(): Promise<PatientSummary[]> {
    return api.get("/doctors/me/patients");
  },
};