import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function OversellBanner({ remaining, progress }: { remaining: number; progress?: number }) {
  const pct = typeof progress === "number" ? progress : undefined;
  return (
    <div className="rounded-2xl bg-coral/15 px-4 py-3 ring-1 ring-coral/30">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-coral/25 text-coral">
          <AlertTriangle className="size-4" />
        </span>
        <div className="text-sm">
          <p className="font-extrabold text-ink">
            {pct !== undefined ? `${pct}% sold — almost sold out` : `Almost sold out — high demand`}
          </p>
          <p className="mt-0.5 font-bold text-ink/60">
            This competition is nearly sold out. Secure your entries now.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ReservationTimeoutBar({
  secondsRemaining,
  totalSeconds = 300,
}: {
  secondsRemaining: number;
  totalSeconds?: number;
}) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progress = Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100));
  const isUrgent = secondsRemaining <= 60;
  return (
    <div
      className={cn(
        "sticky top-0 z-10 -mx-6 px-6 py-3 ring-1 ring-ink/5",
        isUrgent ? "bg-coral/20" : "bg-lemon/40",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-xl rounded-full",
            isUrgent ? "bg-coral/30 text-ink" : "bg-coral/15 text-coral",
          )}
        >
          <Clock className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/50">
            Reservation held
          </p>
          <p
            className={cn(
              "font-display text-lg font-extrabold tabular-nums",
              isUrgent ? "text-coral" : "text-ink",
            )}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} remaining
          </p>
        </div>
        <div className="w-28">
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isUrgent ? "bg-coral" : "bg-coral/80",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
