import { api } from "./api";

export interface Qualification {
  id?: string;
  degree: string;
  institution: string;
  year: number;
}

export interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_minutes?: number;
  is_active?: boolean;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  license_number: string;
  years_experience: number;
  bio?: string;
  consultation_fee: number;
  clinic_name?: string;
  clinic_address?: string;
  clinic_city?: string;
  clinic_state?: string;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
}

export const doctorsService = {
  async list(filters?: {
    specialty?: string;
    city?: string;
    min_rating?: number;
    search?: string;
  }): Promise<Doctor[]> {
    const params: Record<string, string> = {};
    if (filters) {
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.city) params.city = filters.city;
      if (filters.min_rating !== undefined) params.min_rating = String(filters.min_rating);
      if (filters.search) params.search = filters.search;
    }
    return api.get("/doctors", { params });
  },

  async getById(id: string): Promise<Doctor> {
    return api.get(`/doctors/${id}`);
  },

  async updateMe(payload: Partial<Doctor>): Promise<Doctor> {
    return api.patch("/doctors/me", payload);
  },

  async addQualification(payload: Qualification): Promise<any> {
    return api.post("/doctors/me/qualifications", payload);
  },

  async getAvailability(doctorId: string): Promise<AvailabilitySlot[]> {
    return api.get(`/doctors/${doctorId}/availability`);
  },

  async setMyAvailability(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
    return api.put("/doctors/me/availability", slots);
  }
};
