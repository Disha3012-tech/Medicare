import { useNavigate, useRouteError } from "react-router";
import { HeartPulse, RefreshCw, ArrowLeft } from "lucide-react";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as { statusText?: string; message?: string } | null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-['Inter',sans-serif]">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <HeartPulse className="w-6 h-6 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-xl text-primary">Medicare</span>
        </div>

        <p className="font-['Fraunces',serif] text-[8rem] font-semibold leading-none text-foreground/10 select-none mb-4">
          500
        </p>

        <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-foreground mb-3">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-2">
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>
        {error && (
          <p className="text-xs font-['DM_Mono',monospace] text-muted-foreground bg-muted rounded-lg px-4 py-2 mb-6 text-left break-all">
            {error.statusText ?? error.message ?? "Unknown error"}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl hover:border-primary/40 transition-all text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm font-medium"
          >
            <HeartPulse className="w-4 h-4" />
            Return home
          </button>
        </div>
      </div>
    </div>
  );
}
