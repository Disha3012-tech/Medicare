import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Bell, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

export function Toast({ id, type, title, body, duration = 4000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => { setVisible(false); setTimeout(() => onDismiss(id), 300); }, duration);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  const icons = { success: <CheckCircle2 className="w-4 h-4 text-accent" />, error: <XCircle className="w-4 h-4 text-destructive" />, info: <Bell className="w-4 h-4 text-primary" /> };
  const borders = { success: "border-accent/20", error: "border-destructive/20", info: "border-primary/20" };

  return (
    <div className={`flex items-start gap-3 bg-card border ${borders[type]} rounded-xl shadow-lg px-4 py-3 max-w-sm w-full transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      <div className="mt-0.5 flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {body && <p className="text-xs text-muted-foreground mt-0.5">{body}</p>}
      </div>
      <button onClick={() => { setVisible(false); setTimeout(() => onDismiss(id), 300); }} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface ToastContainerProps { toasts: ToastProps[]; onDismiss: (id: string) => void; }

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

type ToastListener = (toast: Omit<ToastProps, "id" | "onDismiss">) => void;
const listeners = new Set<ToastListener>();

export function showToast(type: ToastType, title: string, body?: string) {
  listeners.forEach(l => l({ type, title, body }));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  function add(t: Omit<ToastProps, "id" | "onDismiss">) {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id, onDismiss: dismiss }]);
  }

  function dismiss(id: string) {
    setToasts(ts => ts.filter(t => t.id !== id));
  }

  useEffect(() => {
    const listener: ToastListener = (t) => add(t);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { toasts, add, dismiss };
}
