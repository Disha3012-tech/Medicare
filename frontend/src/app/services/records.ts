import { api } from "./api";

export interface MedicalRecord {
  id: string;
  patient_id: string;
  title: string;
  type: "LAB_REPORT" | "IMAGING" | "PRESCRIPTION" | "DISCHARGE_SUMMARY" | "VACCINATION" | "OTHER";
  file_url: string;
  file_name: string;
  file_size_kb?: number;
  uploaded_at: string;
}

export const recordsService = {
  async upload(payload: { title: string; type: string; file: File }): Promise<MedicalRecord> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("type", payload.type);
    formData.append("file", payload.file);
    return api.post("/records", formData);
  },

  async getMine(): Promise<MedicalRecord[]> {
    return api.get("/records/mine");
  },

  async getByPatientId(patientId: string): Promise<MedicalRecord[]> {
    return api.get(`/records/patient/${patientId}`);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/records/${id}`);
  }
};
