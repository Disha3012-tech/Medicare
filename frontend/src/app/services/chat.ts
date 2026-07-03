import { api } from "./api";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  partner_id: string;
  partner_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

const API_URL = import.meta.env.VITE_API_URL || "";
const WS_BASE_URL = API_URL.replace(/^http/, "ws");

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    return api.get("/messages/conversations");
  },

  async getThread(otherUserId: string): Promise<Message[]> {
    return api.get(`/messages/thread/${otherUserId}`);
  },

  async sendMessage(payload: { receiver_id: string; content: string }): Promise<Message> {
    return api.post("/messages", payload);
  },

  connectChat(onMessage: (msg: any) => void): WebSocket | null {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/chat?token=${token}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("Chat WebSocket disconnected.");
    };

    return ws;
  },

  connectNotifications(onNotification: (note: any) => void): WebSocket | null {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/notifications?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onNotification(data);
      } catch (err) {
        console.error("Error parsing notification WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("Notification WebSocket disconnected.");
    };

    return ws;
  },

  connectVideo(roomId: string, onMessage: (msg: any) => void): WebSocket | null {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/video/${roomId}?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("Error parsing video signaling WebSocket message:", err);
      }
    };

    return ws;
  }
};
