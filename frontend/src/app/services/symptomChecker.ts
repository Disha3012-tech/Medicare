import { api } from "./api";

export interface Condition {
  name: string;
  probability: "High" | "Moderate" | "Low";
  description: string;
  urgency: "routine" | "soon" | "urgent";
}

export interface SymptomCheckResult {
  conditions: Condition[];
  specialists: string[];
  emergency: boolean;
}

export const symptomCheckerService = {
  async check(symptoms: string[]): Promise<SymptomCheckResult> {
    return api.post("/symptom-check", { symptoms });
  },
};