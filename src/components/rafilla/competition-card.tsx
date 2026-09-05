import { ArrowUpRight, CalendarDays, Ticket } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { formatNaira, getProgress, type Competition } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

const accentStyles = {
  coral: { surface: "bg-rose/20", fill: "bg-coral", badge: "bg-coral/15 text-coral" },
  sky: { surface: "bg-sky/20", fill: "bg-sky", badge: "bg-sky/20 text-ink" },
  lemon: { surface: "bg-lemon/25", fill: "bg-lemon", badge: "bg-lemon/30 text-ink" },
  mint: { surface: "bg-mint/25", fill: "bg-mint", badge: "bg-mint/30 text-ink" },
  lilac: { surface: "bg-lilac/25", fill: "bg-lilac", badge: "bg-lilac/30 text-ink" },
};

export function CompetitionCard({
  competition,
  featured = false,
  variant = "grid",
}: {
  competition: Competition;
  featured?: boolean;
  variant?: "grid" | "list";
}) {
  const accent = accentStyles[competition.accent];
  const progress = getProgress(competition);

  if (featured) {
    return (
      <article className="rounded-[28px] bg-lilac/30 p-3 ring-1 ring-ink/5 sm:p-4">
        <div className="overflow-hidden rounded-[22px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 sm:p-4">
          <img
            src={competition.image}
            alt={`${competition.title} prize`}
            width={1200}
            height={760}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className="aspect-[16/10] w-full rounded-[18px] object-cover"
          />
          <div className="space-y-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
                  {competition.title}
                </h2>
                <p className="mt-1 text-xs font-bold text-ink/50">
                  {competition.category} · {formatNaira(competition.prizeValueKobo)} prize value
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-mint/30 px-2.5 py-1 text-[11px] font-extrabold text-ink">
                {competition.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-bold text-ink/55">Entry price</p>
                <p className="font-display text-xl font-extrabold text-ink">
                  {formatNaira(competition.entryPrice)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-ink/55">Closing</p>
                <p className="font-bold text-ink">{competition.closes}</p>
              </div>
            </div>
            <ProgressDetails competition={competition} progress={progress} />
            <div className="flex items-center gap-2">
              <Button asChild variant="primary" size="lg" className="flex-1">
                <Link to="/competitions/$slug" params={{ slug: competition.slug }}>
                  Explore competition
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" aria-label="See how Rafilla works">
                <Link to="/how-it-works">
                  <ArrowUpRight className="size-5" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-ink/50">
              <ShieldIcon /> Every draw is publicly verifiable
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className="group rounded-[24px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className={cn("overflow-hidden rounded-[18px]", accent.surface)}>
            <img
              src={competition.image}
              alt={`${competition.title} prize`}
              width={768}
              height={576}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover sm:size-[180px]"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display text-xl font-extrabold text-ink sm:text-2xl">
                    {competition.title}
                  </h3>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold",
                      accent.badge,
                    )}
                  >
                    {competition.category}
                  </span>
                  <span className="text-[11px] font-bold text-ink/45">
                    By {competition.partner}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-mint/30 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                {competition.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  Entry
                </p>
                <p className="font-display text-lg font-extrabold text-ink">
                  {formatNaira(competition.entryPrice)}
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  Prize value
                </p>
                <p className="font-bold text-ink">{formatNaira(competition.prizeValueKobo)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  Tickets left
                </p>
                <p className="font-bold text-coral">
                  {(competition.totalEntries - competition.entriesSold).toLocaleString("en-NG")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  Closes
                </p>
                <p className="inline-flex items-center gap-1 font-bold text-ink">
                  <CalendarDays className="size-3.5" />{" "}
                  {competition.closes.split("·")[0]}
                </p>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold">
                  <span className="truncate text-ink/60">
                    {competition.entriesSold.toLocaleString("en-NG")} of{" "}
                    {competition.totalEntries.toLocaleString("en-NG")} sold
                  </span>
                  <span className="shrink-0">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={cn("h-full rounded-full", accent.fill)}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <Button asChild variant="primary" size="md">
                <Link to="/competitions/$slug" params={{ slug: competition.slug }}>
                  Enter draw <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-[22px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <img
          src={competition.image}
          alt={competition.imageAlt}
          width={768}
          height={768}
          loading="lazy"
          decoding="async"
          className={cn("size-20 shrink-0 rounded-[16px] object-cover", accent.surface)}
        />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-display text-base font-extrabold text-ink">
              {competition.title}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                accent.badge,
              )}
            >
              {competition.category}
            </span>
          </div>
          <p className="text-xs font-bold text-ink/55">
            {formatNaira(competition.entryPrice)} ·{" "}
            {competition.entriesSold.toLocaleString("en-NG")} sold
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className={cn("h-full rounded-full", accent.fill)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-ink/45">
            <span>
              {(competition.totalEntries - competition.entriesSold).toLocaleString("en-NG")} left
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" /> {competition.closes.split("·")[0]}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/55">
          <Ticket className="size-3.5" /> {progress}% filled
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link to="/competitions/$slug" params={{ slug: competition.slug }}>
            View <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function ProgressDetails({
  competition,
  progress,
}: {
  competition: Competition;
  progress: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold">
        <span className="text-ink/60">
          {competition.entriesSold.toLocaleString("en-NG")} of{" "}
          {competition.totalEntries.toLocaleString("en-NG")} entries sold
        </span>
        <span className="text-ink">{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-coral"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs font-extrabold text-coral">
        {(competition.totalEntries - competition.entriesSold).toLocaleString("en-NG")} entries left
      </p>
    </div>
  );
}

function ShieldIcon() {
  return (
    <span className="grid size-4 place-items-center rounded-full bg-mint/50 text-[10px] text-ink">
      ✓
    </span>
  );
}
