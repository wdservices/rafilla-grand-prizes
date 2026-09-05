import { useState } from "react";
import { Ticket, Clock, Flame } from "lucide-react";
import { DashboardAppShell } from "@/components/rafilla/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { competitions, formatNaira, getProgress } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";
import { TicketPurchaseModal } from "@/components/rafilla/purchase";

export function DashboardCompetitionsPage() {
  const [modalSlug, setModalSlug] = useState<string | null>(null);

  const accentMap = {
    coral: { ring: "ring-coral/15", badge: "bg-coral/15 text-coral", progress: "bg-coral" },
    sky: { ring: "ring-sky/15", badge: "bg-sky/15 text-sky", progress: "bg-sky" },
    lemon: { ring: "ring-lemon/15", badge: "bg-lemon/15 text-ink", progress: "bg-lemon" },
    mint: { ring: "ring-mint/15", badge: "bg-mint/15 text-mint", progress: "bg-mint" },
    lilac: { ring: "ring-lilac/15", badge: "bg-lilac/15 text-lilac", progress: "bg-lilac" },
  } as const;

  return (
    <DashboardAppShell
      title="Active competitions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Competitions" }]}
    >
      <div className="mb-6">
        <p className="text-sm font-semibold text-ink/60">
          Browse live draws, pick a prize, and grab your tickets before they close.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {competitions.map((c) => {
          const accent = accentMap[c.accent];
          return (
            <div
              key={c.slug}
              className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ink/5"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={c.image}
                  alt={`${c.title} prize`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <Badge
                  className={cn(
                    "absolute left-4 top-4 border-0 font-extrabold tracking-wide",
                    accent.badge,
                  )}
                  variant="secondary"
                >
                  {c.category}
                </Badge>
                {c.status === "CLOSING SOON" && (
                  <Badge className="absolute right-4 top-4 border-0 bg-coral font-extrabold tracking-wide text-white">
                    <Flame className="mr-1 h-3 w-3" />
                    Closing soon
                  </Badge>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-extrabold text-ink">{c.title}</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-ink/45">
                  Prize value · <span className="text-ink/70">{formatNaira(c.prizeValueKobo)}</span>
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-ink/60">{c.description}</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-ink/45">
                    <span>Entries sold</span>
                    <span className="text-ink/70">
                      {c.entriesSold.toLocaleString()} / {c.totalEntries.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                    <div
                      className={cn("h-full rounded-full", accent.progress)}
                      style={{ width: `${getProgress(c)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-bold text-ink/50">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Closes {c.closes}
                  </span>
                  <span className="font-display text-sm font-extrabold text-ink">
                    {formatNaira(c.entryPrice)} / ticket
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="mt-5 w-full"
                  onClick={() => setModalSlug(c.slug)}
                >
                  <Ticket className="h-4 w-4" />
                  Enter draw
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <TicketPurchaseModal
        open={!!modalSlug}
        onClose={() => setModalSlug(null)}
        competitionSlug={modalSlug ?? ""}
      />
    </DashboardAppShell>
  );
}
