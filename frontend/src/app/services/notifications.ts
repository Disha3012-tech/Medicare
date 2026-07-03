import { api } from "./api";

export interface Notification {
  id: string;
  user_id: string;
  type: "APPOINTMENT" | "MESSAGE" | "PRESCRIPTION" | "SYSTEM" | "REMINDER";
  title: string;
  body: string;
  is_read: boolean;
  meta?: any;
  created_at: string;
}

export const notificationsService = {
  async getMine(): Promise<Notification[]> {
    return api.get("/notifications");
  },

  async markRead(id: string): Promise<Notification> {
    return api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<any> {
    return api.patch("/notifications/read-all");
  }
};
