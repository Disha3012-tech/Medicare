import { api } from "./api";

export interface Review {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  patient_name?: string; // added manually on front-end if needed
}
export interface AnonymizedReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const reviewsService = {
  async submit(payload: { appointment_id: string; rating: number; comment?: string }): Promise<Review> {
    return api.post("/reviews", payload);
  },

  async getByDoctorId(doctorId: string): Promise<Review[]> {
    return api.get(`/reviews/doctor/${doctorId}`);
  },

  async getMine(): Promise<Review[]> {
  return api.get("/reviews/mine");
},

  async getMineAnonymized(): Promise<AnonymizedReview[]> {
  return api.get("/reviews/mine/anonymized");
}
};
