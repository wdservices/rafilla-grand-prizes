import { useState } from "react";
import { ArrowUpRight, CalendarDays, Minus, Plus, Ticket } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { formatNaira, getProgress, type Competition } from "@/lib/raffila-data";
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
  onEnterDraw,
  defaultQuantity = 1,
}: {
  competition: Competition;
  featured?: boolean;
  variant?: "grid" | "list";
  onEnterDraw?: (quantity: number) => void;
  defaultQuantity?: number;
}) {
  const accent = accentStyles[competition.accent];
  const progress = getProgress(competition);
  const ticketsLeft = Math.max(0, competition.totalEntries - competition.entriesSold);
  const maxQty = Math.max(1, Math.min(50, ticketsLeft));
  const [qty, setQty] = useState<number>(() => Math.max(1, Math.min(maxQty, defaultQuantity)));
  const entryTotalKobo = competition.entryPrice * qty;
  const baseChancePct = competition.totalEntries > 0 ? (qty / competition.totalEntries) * 100 : 0;
  const chanceDisplay =
    qty <= 1
      ? "Buy more tickets to improve your odds"
      : baseChancePct >= 10
        ? `${baseChancePct.toFixed(1)}% chance of winning`
        : `${qty.toLocaleString("en-NG")}× better chance than 1 ticket`;

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
              <Button asChild variant="outline" size="icon" aria-label="See how Raffila works">
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
      <article className="group overflow-hidden rounded-[24px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className={cn("overflow-hidden rounded-[18px] shrink-0", accent.surface)}>
            <img
              src={competition.image}
              alt={`${competition.title} prize`}
              width={768}
              height={576}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover sm:size-[180px] sm:aspect-square"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="line-clamp-2 font-display text-lg font-extrabold leading-tight text-ink sm:text-xl lg:text-2xl">
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
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">Entry</p>
                <p className="break-words font-display text-base font-extrabold text-ink sm:text-lg">
                  {formatNaira(competition.entryPrice)}
                </p>
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  Prize value
                </p>
                <p className="break-words font-bold text-ink text-xs sm:text-sm">
                  {formatNaira(competition.prizeValueKobo)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">Sold</p>
                <p className="font-bold text-coral text-xs sm:text-sm">{progress}%</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">Closes</p>
                <p className="inline-flex items-center gap-1 font-bold text-ink text-xs sm:text-sm">
                  <CalendarDays className="size-3.5 shrink-0" />{" "}
                  <span className="truncate">{competition.closes.split("·")[0]}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 md:grid-cols-5 md:items-end">
              <div className="min-w-0 sm:col-span-2 md:col-span-2">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold">
                  <span className="truncate text-ink/60">Sales progress</span>
                  <span className="shrink-0">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={cn("h-full rounded-full", accent.fill)}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 break-words rounded-2xl bg-raf-lime/25 px-3 py-1.5 text-[11px] font-extrabold text-ink ring-1 ring-raf-lime/40">
                  <Ticket className="mr-1 inline size-3.5 text-raf-green" />
                  {chanceDisplay}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 sm:col-span-2 md:col-span-3 lg:contents">
                <QuantityStepper
                  value={qty}
                  onChange={(v) => setQty(Math.max(1, Math.min(maxQty, v)))}
                  min={1}
                  max={maxQty}
                />
                <div className="text-right min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    Total
                  </p>
                  <p className="break-words font-display text-base font-extrabold text-ink tabular-nums sm:text-lg">
                    {formatNaira(entryTotalKobo)}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto md:col-span-1 shadow-[0_12px_28px_-12px_var(--coral)]"
                  onClick={() => onEnterDraw?.(qty)}
                  disabled={!onEnterDraw || ticketsLeft === 0}
                >
                  <Ticket className="size-4" /> Enter draw
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 transition-transform duration-200 hover:-translate-y-1">
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
            {formatNaira(competition.entryPrice)} / ticket · {progress}% sold
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className={cn("h-full rounded-full", accent.fill)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-ink/45">
            <span>{progress}% sold</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" /> {competition.closes.split("·")[0]}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col space-y-3 border-t border-ink/10 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            value={qty}
            onChange={(v) => setQty(Math.max(1, Math.min(maxQty, v)))}
            min={1}
            max={maxQty}
          />
          <div className="text-right min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
              {`${qty} ticket${qty === 1 ? "" : "s"} · Total`}
            </p>
            <p className="break-words font-display text-lg font-extrabold text-ink tabular-nums">
              {formatNaira(entryTotalKobo)}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-raf-lime/25 px-3 py-2 ring-1 ring-raf-lime/40">
          <p className="break-words text-[11px] font-extrabold text-ink">
            <Ticket className="mr-1 inline size-3.5 text-raf-green" />
            {chanceDisplay}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="flex-1 min-w-0">
            <Link to="/competitions/$slug" params={{ slug: competition.slug }}>
              View <ArrowUpRight className="ml-1 size-3.5" />
            </Link>
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-[1.5] min-w-0 shadow-[0_12px_28px_-12px_var(--coral)]"
            onClick={() => onEnterDraw?.(qty)}
            disabled={!onEnterDraw || ticketsLeft === 0}
          >
            <Ticket className="size-4 shrink-0" /> <span className="truncate">Enter draw</span>
          </Button>
        </div>
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
        <span className="text-ink/60">Sales progress</span>
        <span className="text-ink">{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-coral" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1.5 text-xs font-extrabold text-coral">{progress}% sold</p>
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

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const labelSize =
    size === "lg"
      ? "font-display text-2xl"
      : size === "sm"
        ? "font-display text-base"
        : "font-display text-xl";
  const safeMin = Math.max(1, min);
  const safeMax = Math.max(safeMin, max);
  const safeValue = Math.max(safeMin, Math.min(safeMax, value));
  return (
    <div
      className="inline-flex items-center rounded-full bg-white ring-1 ring-ink/10"
      role="group"
      aria-label="Ticket quantity selector"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(safeMin, safeValue - 1))}
        disabled={safeValue <= safeMin}
        aria-label="Decrease quantity"
        className={cn(
          "grid place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40",
          dims,
        )}
      >
        <Minus className="size-4.5" />
      </button>
      <span
        className={cn(
          "min-w-[2.5ch] text-center tabular-nums font-extrabold text-ink px-1",
          labelSize,
        )}
        aria-live="polite"
      >
        {safeValue}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(safeMax, safeValue + 1))}
        disabled={safeValue >= safeMax}
        aria-label="Increase quantity"
        className={cn(
          "grid place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40",
          dims,
        )}
      >
        <Plus className="size-4.5" />
      </button>
    </div>
  );
}
