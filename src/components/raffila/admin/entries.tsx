import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Filter, RefreshCw, Search, Ticket, Users, Wallet } from "lucide-react";

type PayMethod = "paystack" | "referral";

import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchAllEntries, type EntryFact } from "@/lib/admin-entries";
import { formatNaira } from "@/lib/raffila-data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

function toMs(v: unknown): number {
  try {
    const x = v as { toDate?: () => Date };
    if (x && typeof x.toDate === "function") return x.toDate().getTime();
  } catch {
    /* fall through */
  }
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v) {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

function dateShort(ms: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initialsOf(name: string, email: string): string {
  const src = name.trim() || email.split("@")[0] || "?";
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function AdminEntriesPage() {
  const [rows, setRows] = useState<EntryFact[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [queryText, setQueryText] = useState("");
  const [compFilter, setCompFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState<"all" | PayMethod>("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<EntryFact | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    (async () => {
      // Per-user reads rather than a collectionGroup query — that requires a
      // Firestore index with collectionGroup:true, which is not auto-created.
      const res = await fetchAllEntries();
      if (cancelled) return;
      setRows(res.entries);
      setLoadError(res.error);
      if (res.truncated) {
        setLoadError(
          "Showing the most recent users only — totals are partial until the user cap is raised.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const competitions = useMemo(() => {
    const set = new Map<string, string>();
    for (const r of rows ?? []) {
      if (r.competitionSlug) set.set(r.competitionSlug, r.competitionTitle);
    }
    return [...set.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const filtered = useMemo(() => {
    const list = rows ?? [];
    const q = queryText.trim().toLowerCase();
    return list.filter((r) => {
      if (compFilter !== "all" && r.competitionSlug !== compFilter) return false;
      const method: PayMethod | null = r.referralReference
        ? "referral"
        : r.paystackReference
          ? "paystack"
          : null;
      if (methodFilter !== "all" && method !== methodFilter) return false;
      if (!q) return true;
      // entryId doubles as the user id in this view's search space.
      return (
        r.userId.toLowerCase().includes(q) ||
        r.entryId.toLowerCase().includes(q) ||
        r.competitionTitle.toLowerCase().includes(q) ||
        r.competitionSlug.toLowerCase().includes(q) ||
        String(r.paystackReference ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.referralReference ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [rows, queryText, compFilter, methodFilter]);

  const totals = useMemo(() => {
    const tickets = filtered.reduce((n, r) => n + r.quantity, 0);
    const revenue = filtered.reduce((n, r) => n + r.amountKobo, 0);
    const buyers = new Set(filtered.map((r) => r.userId).filter(Boolean)).size;
    return { tickets, revenue, buyers };
  }, [filtered]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  const exportCsv = useCallback(() => {
    const head = [
      "date",
      "user_id",
      "entry_id",
      "competition",
      "slug",
      "tickets",
      "amount_kobo",
      "payment_method",
      "reference",
      "status",
      "ticket_numbers",
    ];
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const body = filtered.map((r) =>
      [
        r.createdAtMs ? new Date(r.createdAtMs).toISOString() : "",
        r.userId,
        r.entryId,
        r.competitionTitle,
        r.competitionSlug,
        String(r.quantity),
        String(r.amountKobo),
        r.referralReference ? "referral" : r.paystackReference ? "paystack" : "",
        r.referralReference ?? r.paystackReference ?? "",
        r.status,
        r.ticketNumbers.join(" "),
      ]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raffila-entries.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const clearAll = () => {
    setQueryText("");
    setCompFilter("all");
    setMethodFilter("all");
    setPage(1);
  };

  return (
    <AdminShell activeNav="entries" title="Entries">
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/45">
              Admin · Entries
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink">
              Ticket sales
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink/60">
              Every ticket purchase across all users — who bought, how many, for which competition,
              and what they paid. Sourced from the per-user entry record, so refunds and totals stay
              authoritative.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((k) => k + 1)}
              disabled={rows === null}
              className="rounded-full"
            >
              <RefreshCw className={cn("size-3.5", rows === null && "animate-spin")} /> Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="rounded-full"
            >
              <Download className="size-3.5" /> Export CSV
            </Button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] bg-white p-5 ring-1 ring-ink/5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
              Tickets sold
            </p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-ink">
              {totals.tickets.toLocaleString("en-NG")}
            </p>
          </div>
          <div className="rounded-[22px] bg-white p-5 ring-1 ring-ink/5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
              Revenue
            </p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-ink">
              {formatNaira(totals.revenue)}
            </p>
          </div>
          <div className="rounded-[22px] bg-white p-5 ring-1 ring-ink/5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
              Buyers
            </p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-ink">
              {totals.buyers.toLocaleString("en-NG")}
            </p>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-ink/5 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-h-11 flex-1 items-center gap-2.5 rounded-full bg-cream px-4 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral/60">
              <Search className="size-4 shrink-0 text-ink/40" />
              <span className="sr-only">Search entries</span>
              <input
                value={queryText}
                onChange={(e) => {
                  setQueryText(e.target.value);
                  setPage(1);
                }}
                placeholder="Search user, entry id, competition or payment reference…"
                className="w-full bg-transparent py-2.5 text-sm font-bold text-ink outline-none placeholder:text-ink/40"
              />
            </label>
            <select
              value={compFilter}
              onChange={(e) => {
                setCompFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by competition"
              className="h-11 rounded-full border-0 bg-lilac/20 px-4 text-xs font-extrabold text-ink ring-1 ring-ink/10 focus:ring-coral/60"
            >
              <option value="all">All competitions</option>
              {competitions.map(([slug, title]) => (
                <option key={slug} value={slug}>
                  {title}
                </option>
              ))}
            </select>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value as "all" | PayMethod);
                setPage(1);
              }}
              aria-label="Filter by payment method"
              className="h-11 rounded-full border-0 bg-mint/25 px-4 text-xs font-extrabold text-ink ring-1 ring-ink/10 focus:ring-coral/60"
            >
              <option value="all">All payments</option>
              <option value="paystack">Paystack</option>
              <option value="referral">Referral balance</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="h-7 rounded-full border-coral/20 bg-coral/10 px-3 text-[11px] font-extrabold text-coral"
            >
              {filtered.length} of {rows?.length ?? 0} entries
            </Badge>
            {(queryText || compFilter !== "all" || methodFilter !== "all") && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-[11px] font-extrabold text-ink/65 ring-1 ring-ink/10 hover:bg-cream hover:text-ink"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loadError && (
          <div className="rounded-[22px] bg-coral/10 p-5 ring-1 ring-coral/30">
            <p className="text-sm font-extrabold text-ink">Could not load entries</p>
            <p className="mt-1 text-xs font-bold text-ink/60">{loadError}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/5">
          {rows === null ? (
            <p className="p-8 text-center text-sm font-bold text-ink/50">Loading entries…</p>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="mx-auto size-8 text-ink/25" />
              <p className="mt-3 text-sm font-extrabold text-ink">No entries match these filters</p>
              <p className="mt-1 text-xs font-bold text-ink/50">
                Ticket purchases appear here as soon as a payment is confirmed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-cream/60">
                  <tr className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Competition</th>
                    <th className="px-4 py-3 text-right">Tickets</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr
                      key={`${r.userId}/${r.id}`}
                      className="border-t border-ink/5 text-sm hover:bg-cream/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lilac/30 font-display text-xs font-extrabold text-ink">
                            {initialsOf("", r.userId)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-ink">{r.userId}</p>
                            <p className="truncate text-[11px] font-bold text-ink/45">
                              {r.entryId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-ink">{r.competitionTitle}</p>
                        <p className="text-[11px] font-bold text-ink/45">{r.competitionSlug}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-display font-extrabold text-ink">
                        {r.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-ink">
                        {formatNaira(r.amountKobo)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                            r.referralReference
                              ? "border-sky/30 bg-sky/15 text-ink"
                              : "border-mint/40 bg-mint/25 text-ink",
                          )}
                        >
                          {r.referralReference ? (
                            <>
                              <Wallet className="mr-1 size-3" /> Referral
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-1 size-3" /> Paystack
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-ink/60">
                        {dateShort(r.createdAtMs)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetail(r)}
                          className="rounded-full text-xs font-extrabold"
                        >
                          <Users className="size-3.5" /> Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {visible.length < filtered.length && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full"
            >
              Load {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
            </Button>
            <span className="text-xs font-bold text-ink/50">
              Showing {visible.length} of {filtered.length}
            </span>
          </div>
        )}
      </div>

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-ink/10 px-6 py-5">
            <DialogTitle className="font-display text-xl font-extrabold text-ink">
              Entry details
            </DialogTitle>
            <DialogDescription>
              The full record of this purchase, as written server-side at confirmation.
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 px-6 py-5">
              <div className="flex items-center gap-3 rounded-2xl bg-cream/60 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lilac/30 font-display text-sm font-extrabold text-ink">
                  {initialsOf("", detail.userId)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-ink">{detail.userId}</p>
                  <p className="truncate text-xs font-bold text-ink/50">{detail.entryId}</p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Competition" value={detail.competitionTitle} />
                <Field label="Slug" value={detail.competitionSlug} />
                <Field label="Tickets bought" value={String(detail.quantity)} />
                <Field label="Amount paid" value={formatNaira(detail.amountKobo)} />
                <Field label="Status" value={detail.status} />
                <Field label="Purchased" value={dateShort(detail.createdAtMs)} />
                <Field
                  label="Payment method"
                  value={detail.referralReference ? "Referral balance" : "Paystack"}
                />
                <Field
                  label="Reference"
                  value={detail.referralReference ?? detail.paystackReference ?? "—"}
                  mono
                />
              </dl>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Ticket numbers ({detail.ticketNumbers.length})
                </p>
                {detail.ticketNumbers.length === 0 ? (
                  <p className="mt-1.5 text-xs font-bold text-ink/50">None recorded.</p>
                ) : (
                  <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                    {detail.ticketNumbers.map((n) => (
                      <span
                        key={n}
                        className="rounded-lg bg-paper px-2 py-1 font-mono text-[11px] font-extrabold text-ink ring-1 ring-ink/10"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {detail.userId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(detail.userId);
                  }}
                  className="w-full rounded-full"
                >
                  <Filter className="size-3.5" /> Copy user id
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl bg-cream/50 p-3">
      <dt className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
        {label}
      </dt>
      <dd className={cn("mt-1 break-words text-sm font-extrabold text-ink", mono && "font-mono")}>
        {value}
      </dd>
    </div>
  );
}
