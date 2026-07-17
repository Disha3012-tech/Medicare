import { useState, useEffect, useRef } from "react";
import { Video, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router";
import type { Appointment } from "../services/appointments";
import { appointmentsService } from "../services/appointments";
import { chatService } from "../services/chat";
import { useAuth } from "./AuthProvider";

interface Props {
  appointments: Appointment[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Video appointments that are today and not yet completed/cancelled */
function relevantVideoAppts(appointments: Appointment[]): Appointment[] {
  const now = new Date();
  const todayStr = now.toDateString();
  return appointments.filter(a =>
    a.type === "VIDEO" &&
    ["PENDING", "CONFIRMED"].includes(a.status) &&
    new Date(a.scheduled_at).toDateString() === todayStr
  );
}

export default function UpcomingVideoCallBanner({ appointments }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [starting, setStarting] = useState<string | null>(null);
  const [liveCallApptId, setLiveCallApptId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const videoAppts = relevantVideoAppts(appointments);

  // Patients: listen live for "the doctor just started this call"
  useEffect(() => {
    if (user?.role !== "PATIENT") return;
    const ws = chatService.connectNotifications((data) => {
      if (data.event === "call:started" && data.appointmentId) {
        setLiveCallApptId(data.appointmentId);
      }
    });
    wsRef.current = ws;
    return () => ws?.close();
  }, [user]);

  if (videoAppts.length === 0) return null;

  async function handleDoctorStart(apptId: string) {
    setStarting(apptId);
    try {
      await appointmentsService.startCall(apptId);
      navigate(`/consultation/${apptId}`);
    } catch {
      navigate(`/consultation/${apptId}`); // still let them join even if the "notify patient" call failed
    } finally {
      setStarting(null);
    }
  }

  return (
    <div className="space-y-2">
      {videoAppts.map(appt => {
        const isLive = liveCallApptId === appt.id;
        return (
          <div
            key={appt.id}
            className={`rounded-xl border p-4 flex items-center gap-4 ${isLive ? "bg-accent/10 border-accent animate-pulse" : "bg-primary/5 border-primary/20"}`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {isLive ? "Your doctor is ready — join now" : "Video consultation today"}
              </p>
              <p className="text-xs text-muted-foreground">{formatTime(appt.scheduled_at)} · {appt.reason_for_visit || "General visit"}</p>
            </div>
            {user?.role === "DOCTOR" ? (
              <button
                onClick={() => handleDoctorStart(appt.id)}
                disabled={starting === appt.id}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-all flex-shrink-0"
              >
                <PhoneCall className="w-4 h-4" /> {starting === appt.id ? "Starting…" : "Start call"}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/consultation/${appt.id}`)}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-all flex-shrink-0 ${isLive ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                <Video className="w-4 h-4" /> Join call
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}