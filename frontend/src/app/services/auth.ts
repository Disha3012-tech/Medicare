import { api } from "./api";

export interface User {
  id: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const authService = {
  async login(payload: any): Promise<AuthResponse> {
    const data = await api.post("/auth/login", payload);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user_role", data.user.role);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    return data;
  },

  async register(payload: any): Promise<AuthResponse> {
    const data = await api.post("/auth/register", payload);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user_role", data.user.role);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_data");
    }
  },

  async getMe(): Promise<User> {
    const user = await api.get("/users/me");
    localStorage.setItem("user_data", JSON.stringify(user));
    return user;
  },

  async updateMe(payload: Partial<User>): Promise<User> {
    const user = await api.patch("/users/me", payload);
    localStorage.setItem("user_data", JSON.stringify(user));
    return user;
  },

  async changePassword(payload: any): Promise<any> {
    return api.post("/users/me/change-password", payload);
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem("user_data");
    return data ? JSON.parse(data) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  }
};
