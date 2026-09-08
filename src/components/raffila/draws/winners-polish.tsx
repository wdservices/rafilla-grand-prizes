import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  Search,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { WinnerCard } from "@/components/raffila/winner-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { winnerCards, type WinnerCard as WinnerCardType } from "@/lib/raffila-data";
import { cn } from "@/lib/utils";

export function EnhancedWinnerCard({
  winner,
  campaignSlug,
}: {
  winner: WinnerCardType;
  campaignSlug: string;
}) {
  return (
    <article className="group relative rounded-[22px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 transition-transform duration-200 hover:-translate-y-1">
      <div className="absolute right-3 top-3 z-10">
        <Badge className="border-0 bg-mint/40 text-ink">
          <BadgeCheck className="mr-1 size-3 text-mint" /> Publicly verified
        </Badge>
      </div>
      <div className="overflow-hidden rounded-[18px] bg-lilac/20">
        <img
          src={winner.image}
          alt={`${winner.winnerName}, winner of ${winner.prize}`}
          width={600}
          height={400}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      <div className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-coral">Winner</p>
            <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
              {winner.winnerName}
            </h3>
          </div>
          {winner.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mint/30 px-2.5 py-1 text-[11px] font-extrabold text-ink">
              <BadgeCheck className="size-3.5 text-mint" /> Verified
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-2 border-t border-ink/10 pt-3">
          <div>
            <p className="text-xs font-bold text-ink/45">Prize</p>
            <p className="font-display text-base font-extrabold text-ink">{winner.prize}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink/45">Competition</p>
            <p className="text-sm font-bold text-ink/70">{winner.competition}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink/55">
              <CalendarDays className="size-3.5 text-coral" /> {winner.drawDate}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink/55">
              <MapPin className="size-3.5 text-coral" /> {winner.location}
            </div>
          </div>
          <div className="mt-2 rounded-2xl bg-lilac/25 px-3 py-2">
            <p className="text-xs font-bold text-ink/45">Prize value</p>
            <p className="font-display text-lg font-extrabold text-ink">{winner.amount}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/draw-verification/$slug" params={{ slug: campaignSlug }}>
              <Trophy className="size-3.5" />
              Draw verification
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

type WinnerStatus = "ALL" | "SELECTED" | "FULFILLED";
type YearFilter = "ALL" | "2026" | "2025";
type CategoryFilter = "ALL" | "Auto" | "Tech" | "Property";

const campaignSlugs: Record<string, string> = {
  "winner-1": "mercedes-benz-c-class",
  "winner-2": "nova-x1-bundle",
  "winner-3": "luxury-2-bed-apartment",
};

const statusForWinner: Record<string, WinnerStatus> = {
  "winner-1": "FULFILLED",
  "winner-2": "FULFILLED",
  "winner-3": "SELECTED",
};

export function WinnersFilterBar({
  query,
  setQuery,
  year,
  setYear,
  category,
  setCategory,
  status,
  setStatus,
}: {
  query: string;
  setQuery: (q: string) => void;
  year: YearFilter;
  setYear: (y: YearFilter) => void;
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  status: WinnerStatus;
  setStatus: (s: WinnerStatus) => void;
}) {
  const years: YearFilter[] = ["ALL", "2026", "2025"];
  const categories: CategoryFilter[] = ["ALL", "Auto", "Tech", "Property"];
  const statuses: WinnerStatus[] = ["ALL", "SELECTED", "FULFILLED"];

  return (
    <div className="mt-8 space-y-3 rounded-[22px] bg-paper p-3 ring-1 ring-ink/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50">
          <Search className="size-4" />
          <span className="sr-only">Search winners</span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, prize, or location..."
            className="h-auto w-full border-0 bg-transparent px-0 py-0 text-ink shadow-none outline-none placeholder:text-ink/40 focus-visible:ring-0"
          />
        </label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value as YearFilter)}
          className="min-h-12 rounded-full bg-lilac/20 px-4 text-sm font-extrabold text-ink outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y === "ALL" ? "All years" : y}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
          className="min-h-12 rounded-full bg-lilac/20 px-4 text-sm font-extrabold text-ink outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "ALL" ? "All categories" : c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/40">
          Status
        </span>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-extrabold ring-1 transition-colors",
              status === s
                ? "bg-coral text-white ring-coral/30"
                : "bg-white text-ink/60 ring-ink/10 hover:bg-cream",
            )}
          >
            {s === "ALL" ? "All" : s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WinnersPagePolished() {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<YearFilter>("ALL");
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [status, setStatus] = useState<WinnerStatus>("ALL");

  const filtered = useMemo(() => {
    return winnerCards.filter((w) => {
      const matchesQuery =
        query === "" ||
        w.winnerName.toLowerCase().includes(query.toLowerCase()) ||
        w.prize.toLowerCase().includes(query.toLowerCase()) ||
        w.location.toLowerCase().includes(query.toLowerCase());

      const matchesYear =
        year === "ALL" || w.drawDate.includes(year);

      const catMap: Record<string, CategoryFilter> = {
        "Mercedes-Benz C-Class 2025": "Auto",
        "Nova X1 Bundle": "Tech",
        "Luxury 2-Bed Apartment": "Property",
      };
      const winnerCat = catMap[w.prize] ?? "ALL";
      const matchesCategory = category === "ALL" || category === winnerCat;

      const matchesStatus =
        status === "ALL" || statusForWinner[w.id] === status;

      return matchesQuery && matchesYear && matchesCategory && matchesStatus;
    });
  }, [query, year, category, status]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
          Celebrate the journey
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
          Winners, with the details that matter.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/60 sm:text-lg">
          Approved winner announcements will appear here as competitions are completed and claims
          are verified.
        </p>
      </header>

      <WinnersFilterBar
        query={query}
        setQuery={setQuery}
        year={year}
        setYear={setYear}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
      />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-bold text-ink/50">{filtered.length} winner{filtered.length === 1 ? "" : "s"}</p>
        <Badge className="border-0 bg-mint/30 text-ink">
          <BadgeCheck className="mr-1 size-3 text-mint" /> Every draw is verified
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-[28px] bg-paper p-8 text-center ring-1 ring-ink/5 sm:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-lemon/50 text-coral">
            <Search className="size-6" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
            No winners match your filters
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/55">
            Try adjusting the search term, year, category, or status to find what you’re looking
            for.
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={() => {
              setQuery("");
              setYear("ALL");
              setCategory("ALL");
              setStatus("ALL");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((winner) => (
            <EnhancedWinnerCard
              key={winner.id}
              winner={winner}
              campaignSlug={campaignSlugs[winner.id] ?? winner.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
