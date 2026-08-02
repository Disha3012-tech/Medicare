import { api } from "./api";

export interface AdminDoctor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string;
  license_number: string;
  years_experience: number;
  clinic_name?: string;
  is_verified: boolean;
}

export const adminService = {
  async getPendingDoctors(): Promise<AdminDoctor[]> {
    return api.get("/admin/doctors/pending");
  },

  async verifyDoctor(doctorId: string): Promise<AdminDoctor> {
    return api.patch(`/admin/doctors/${doctorId}/verify`);
  },
};