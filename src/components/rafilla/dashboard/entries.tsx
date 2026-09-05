import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Copy,
  Check,
  FileDown,
  Ticket,
  Eye,
  X,
  QrCode,
} from "lucide-react";

import { DashboardAppShell } from "@/components/rafilla/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { competitions, formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

type EntryStatus = "Entered" | "Won" | "Lost";

type MockEntry = {
  id: string;
  competitionTitle: string;
  competitionSlug: string;
  competitionImage: string;
  competitionImageAlt: string;
  ticketCount: number;
  drawDate: string;
  ticketNumbers: string[];
  status: EntryStatus;
};

const statuses: Array<"All" | EntryStatus> = ["All", "Entered", "Won", "Lost"];

const statusBadge: Record<EntryStatus, string> = {
  Entered: "bg-mint/30 text-ink",
  Won: "bg-lemon/40 text-ink",
  Lost: "bg-ink/10 text-ink/70",
};

const initials = (name: string) =>
  name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

function genTickets(): MockEntry[] {
  const titles = [
    { comp: competitions[0], tickets: [12, 5, 3, 8] },
    { comp: competitions[1], tickets: [25, 10, 15] },
    { comp: competitions[2], tickets: [50, 20, 5] },
  ];
  const all: MockEntry[] = [];
  let i = 0;
  const statusPool: EntryStatus[] = ["Entered", "Entered", "Entered", "Entered", "Won", "Lost", "Entered", "Won", "Lost", "Entered", "Entered", "Lost"];
  titles.forEach(({ comp, tickets }) => {
    tickets.forEach((tcount) => {
      const id = `RF-2026-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const nums = Array.from({ length: 5 }, () =>
        String(Math.floor(Math.random() * 999999)).padStart(6, "0")
      );
      const draws = ["18 Mar 2026", "12 Mar 2026", "25 Mar 2026", "04 Feb 2026", "17 Feb 2026", "28 Jan 2026"];
      all.push({
        id,
        competitionTitle: comp.title,
        competitionSlug: comp.slug,
        competitionImage: comp.image,
        competitionImageAlt: comp.imageAlt,
        ticketCount: tcount,
        drawDate: draws[i % draws.length],
        ticketNumbers: nums,
        status: statusPool[i % statusPool.length],
      });
      i++;
    });
  });
  return all;
}

export function DashboardEntriesPage() {
  const [filter, setFilter] = useState<(typeof statuses)[number]>("All");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastId, setToastId] = useState<string | null>(null);
  const [ticketOpen, setTicketOpen] = useState<MockEntry | null>(null);

  const entries = genTickets();

  const filtered = entries.filter((e) => {
    const matchesStatus = filter === "All" || e.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.id.toLowerCase().includes(q) ||
      e.competitionTitle.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id).catch(() => {});
    setCopiedId(id);
    setToastId(id);
    setTimeout(() => {
      setCopiedId(null);
      setToastId((t) => (t === id ? null : t));
    }, 1600);
  };

  return (
    <DashboardAppShell
      title="Entries"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Entries" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              My Entries
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
              All your competition tickets, their status, and ticket numbers.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              const csv =
                "Entry ID,Competition,Ticket count,Draw date,Status,Ticket numbers\n" +
                entries
                  .map(
                    (e) =>
                      `${e.id},"${e.competitionTitle}",${e.ticketCount},${e.drawDate},${e.status},"${e.ticketNumbers.join(", ")}"`
                  )
                  .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "rafilla-entries.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <FileDown className="size-4" /> Export CSV
          </Button>
        </div>

        <div className="rounded-[28px] bg-white p-4 ring-1 ring-ink/5 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50 ring-1 ring-ink/5">
              <Search className="size-4 shrink-0 text-ink/45" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entry ID, competition..."
                className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
              />
            </label>
          </div>

          <div className="mt-4 inline-flex flex-wrap gap-1 rounded-2xl bg-cream p-1 ring-1 ring-ink/5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-extrabold transition-colors",
                  filter === s
                    ? "bg-white text-ink shadow-sm ring-1 ring-ink/5"
                    : "text-ink/55 hover:text-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {toastId && (
          <div className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-mint/90 px-4 py-2.5 text-xs font-extrabold text-ink shadow-lg ring-1 ring-ink/5">
            <Check className="size-4" /> Entry ID copied
          </div>
        )}

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Entry ID</th>
                  <th className="px-4 py-3">Competition</th>
                  <th className="px-4 py-3 text-center">Tickets</th>
                  <th className="px-4 py-3">Draw date</th>
                  <th className="px-4 py-3">Ticket numbers</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink/70">
                          {e.id}
                        </span>
                        <button
                          onClick={() => copyId(e.id)}
                          className={cn(
                            "grid size-6 place-items-center rounded-full transition-colors",
                            copiedId === e.id
                              ? "bg-mint/30 text-ink"
                              : "bg-cream text-ink/45 hover:text-coral"
                          )}
                          aria-label="Copy"
                        >
                          {copiedId === e.id ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-ink/10">
                          <img
                            src={e.competitionImage}
                            alt={`${e.competitionTitle} prize`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-extrabold text-ink line-clamp-1 max-w-[220px]">
                          {e.competitionTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-display font-extrabold text-ink">
                      {e.ticketCount}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-ink/50">
                      {e.drawDate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {e.ticketNumbers.map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center rounded-full bg-cream px-2 py-0.5 font-mono text-[10px] font-bold text-ink/70 ring-1 ring-ink/5"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          statusBadge[e.status]
                        )}
                      >
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTicketOpen(e)}
                      >
                        <Eye className="size-3.5" /> View ticket
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {ticketOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => setTicketOpen(null)}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Entry ticket
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {ticketOpen.competitionTitle}
                </h2>
              </div>
              <button
                onClick={() => setTicketOpen(null)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
                aria-label="Close ticket details"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-cream p-6 ring-1 ring-ink/5 flex flex-col items-center">
              <div className="size-40 grid place-items-center rounded-2xl bg-white ring-1 ring-ink/10">
                <QrCode className="size-28 text-ink/80" />
              </div>
              <p className="mt-4 font-mono text-xs font-bold text-ink/60">
                {ticketOpen.id}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Tickets
                </span>
                <span className="font-display text-lg font-extrabold text-ink">
                  {ticketOpen.ticketCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Draw date
                </span>
                <span className="text-sm font-extrabold text-ink">
                  {ticketOpen.drawDate}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Status
                </span>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                    statusBadge[ticketOpen.status]
                  )}
                >
                  {ticketOpen.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45 mb-2">
                Your ticket numbers
              </p>
              <div className="grid grid-cols-5 gap-2">
                {ticketOpen.ticketNumbers.map((n) => (
                  <div
                    key={n}
                    className="rounded-xl bg-lilac/20 p-2 text-center ring-1 ring-ink/5"
                  >
                    <p className="font-mono text-[11px] font-extrabold text-ink">
                      {n}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-coral/10 p-4 ring-1 ring-coral/20">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-coral/15 font-display text-sm font-extrabold text-coral">
                  {initials("Tunmise Adebayo")}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-ink">Tunmise Adebayo</p>
                  <p className="text-[11px] font-bold text-ink/45">@tunmise_ade</p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={() => setTicketOpen(null)}
            >
              <Ticket className="size-4" /> Close ticket
            </Button>
          </div>
        </div>
      )}
    </DashboardAppShell>
  );
}
