import { useNavigate } from "react-router";
import { HeartPulse, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-['Inter',sans-serif]">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <HeartPulse className="w-6 h-6 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-xl text-primary">Medicare</span>
        </div>

        {/* 404 */}
        <p className="font-['Fraunces',serif] text-[8rem] font-semibold leading-none text-foreground/10 select-none mb-4">
          404
        </p>

        <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-8">
          The page you're looking for doesn't exist, was moved, or you may have mistyped the URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl hover:border-primary/40 transition-all text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary"
          >
            <HeartPulse className="w-4 h-4" />
            Return home
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-sm text-muted-foreground space-y-1">
          <p>Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {[
              ["Find doctors", "/find-doctors"],
              ["My appointments", "/patient/history"],
              ["My records", "/patient/records"],
              ["Sign in", "/auth"],
            ].map(([label, path]) => (
              <button key={path} onClick={() => navigate(path)} className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent rounded">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
