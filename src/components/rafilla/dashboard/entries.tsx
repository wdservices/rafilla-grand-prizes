import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Filter,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";
import { competitions, formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

type EntryStatus = "ACTIVE" | "DRAWN" | "WON" | "LOST";

type MockEntry = {
  id: string;
  competitionTitle: string;
  competitionSlug: string;
  competitionImage: string;
  competitionImageAlt: string;
  entryPrice: number;
  purchaseDate: string;
  status: EntryStatus;
};

const mockEntries: MockEntry[] = [
  {
    id: "RF-2026-8B4A2C91",
    competitionTitle: competitions[0].title,
    competitionSlug: competitions[0].slug,
    competitionImage: competitions[0].image,
    competitionImageAlt: competitions[0].imageAlt,
    entryPrice: competitions[0].entryPrice,
    purchaseDate: "03 Mar 2026",
    status: "ACTIVE",
  },
  {
    id: "RF-2026-7F3D1E8A",
    competitionTitle: competitions[1].title,
    competitionSlug: competitions[1].slug,
    competitionImage: competitions[1].image,
    competitionImageAlt: competitions[1].imageAlt,
    entryPrice: competitions[1].entryPrice,
    purchaseDate: "03 Mar 2026",
    status: "ACTIVE",
  },
  {
    id: "RF-2026-9C5E3B72",
    competitionTitle: competitions[2].title,
    competitionSlug: competitions[2].slug,
    competitionImage: competitions[2].image,
    competitionImageAlt: competitions[2].imageAlt,
    entryPrice: competitions[2].entryPrice,
    purchaseDate: "02 Mar 2026",
    status: "ACTIVE",
  },
  {
    id: "RF-2026-4A8B6D2F",
    competitionTitle: competitions[0].title,
    competitionSlug: competitions[0].slug,
    competitionImage: competitions[0].image,
    competitionImageAlt: competitions[0].imageAlt,
    entryPrice: competitions[0].entryPrice,
    purchaseDate: "28 Feb 2026",
    status: "DRAWN",
  },
  {
    id: "RF-2026-2E7A9C14",
    competitionTitle: competitions[1].title,
    competitionSlug: competitions[1].slug,
    competitionImage: competitions[1].image,
    competitionImageAlt: competitions[1].imageAlt,
    entryPrice: competitions[1].entryPrice,
    purchaseDate: "25 Feb 2026",
    status: "ACTIVE",
  },
  {
    id: "RF-2026-6D1B5F39",
    competitionTitle: competitions[2].title,
    competitionSlug: competitions[2].slug,
    competitionImage: competitions[2].image,
    competitionImageAlt: competitions[2].imageAlt,
    entryPrice: competitions[2].entryPrice,
    purchaseDate: "20 Feb 2026",
    status: "DRAWN",
  },
];

const statusBadge: Record<EntryStatus, string> = {
  ACTIVE: "bg-mint/30 text-ink",
  DRAWN: "bg-sky/20 text-ink",
  WON: "bg-lemon/40 text-ink",
  LOST: "bg-ink/10 text-ink/70",
};

const sortOptions = ["Newest first", "Oldest first", "Highest value"] as const;

export function DashboardEntriesPage() {
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("All competitions");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Newest first");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const hasEntries = true;

  return (
    <DashboardShell activeNav="Entries">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Your ticket trail
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            My entries
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            All the entries you've purchased with Rafilla.
          </p>
        </div>

        <div className="rounded-[28px] bg-paper p-4 ring-1 ring-ink/5 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50 ring-1 ring-ink/5">
              <Search className="size-4 shrink-0 text-ink/45" />
              <span className="sr-only">Search entries</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entry ID, competition..."
                className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
              />
            </label>

            <select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              className="min-h-12 rounded-full bg-lilac/20 px-4 text-sm font-extrabold text-ink outline-none ring-1 ring-ink/5"
            >
              <option>All competitions</option>
              {competitions.map((c) => (
                <option key={c.slug}>{c.title}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-12 rounded-full bg-lilac/20 px-4 text-sm font-extrabold text-ink outline-none ring-1 ring-ink/5"
            >
              <option>All</option>
              <option>Active</option>
              <option>Drawn</option>
              <option>Won</option>
              <option>Lost</option>
            </select>

            <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 ring-1 ring-ink/5">
              <Filter className="size-4 text-ink/45" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-xs font-bold text-ink/60 outline-none"
              />
              <span className="text-xs font-extrabold text-ink/30">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-xs font-bold text-ink/60 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 inline-flex flex-wrap gap-1 rounded-2xl bg-cream p-1 ring-1 ring-ink/5">
            {sortOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-extrabold transition-colors",
                  sortBy === opt
                    ? "bg-paper text-ink shadow-sm ring-1 ring-ink/5"
                    : "text-ink/55 hover:text-ink",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {!hasEntries ? (
          <div className="rounded-[28px] bg-paper p-10 text-center ring-1 ring-ink/5 sm:p-14">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-lilac/30">
              <Ticket className="size-10 text-coral" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-extrabold text-ink">
              No entries yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-relaxed text-ink/55">
              Once you enter a competition, your tickets and their status will appear here for easy tracking.
            </p>
            <Button asChild variant="primary" size="lg" className="mt-6">
              <Link to="/competitions">
                Browse competitions <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="group rounded-[22px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden rounded-[18px]">
                    <img
                      src={entry.competitionImage}
                      alt={entry.competitionImageAlt}
                      width={600}
                      height={400}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="absolute left-2 top-2 rounded-full bg-lilac/90 px-2.5 py-1 font-mono text-[10px] font-extrabold text-ink backdrop-blur">
                      {entry.id}
                    </div>
                    <div className="absolute right-2 top-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          statusBadge[entry.status],
                        )}
                      >
                        {entry.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 p-3 pt-4">
                    <h3 className="font-display text-base font-extrabold leading-tight text-ink line-clamp-1">
                      {entry.competitionTitle}
                    </h3>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-ink/45">Entry price</span>
                      <span className="font-display text-sm font-extrabold text-ink">
                        {formatNaira(entry.entryPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-ink/45">Purchased</span>
                      <span className="text-ink/70">{entry.purchaseDate}</span>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="md"
                      className="mt-2 w-full"
                    >
                      <Link to="/competitions/$slug" params={{ slug: entry.competitionSlug }}>
                        View competition <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="ghost" size="icon" aria-label="Previous page">
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex items-center gap-1">
                <button className="grid size-9 place-items-center rounded-full bg-coral text-xs font-extrabold text-cream">
                  1
                </button>
                <button className="grid size-9 place-items-center rounded-full text-xs font-extrabold text-ink/50 hover:bg-cream">
                  2
                </button>
                <button className="grid size-9 place-items-center rounded-full text-xs font-extrabold text-ink/50 hover:bg-cream">
                  3
                </button>
              </div>
              <Button variant="ghost" size="icon" aria-label="Next page">
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
