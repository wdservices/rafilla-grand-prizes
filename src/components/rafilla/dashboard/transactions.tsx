import { useState } from "react";
import {
  Search,
  FileDown,
  Wallet,
  Ticket,
  Users,
  ArrowUpRight,
  Download,
  CalendarDays,
} from "lucide-react";

import { DashboardAppShell } from "@/components/rafilla/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

type TxTab = "all" | "credits" | "purchases" | "referrals" | "payouts";

type TxType =
  | "Wallet credit"
  | "Ticket purchase"
  | "Referral bonus"
  | "Payout";

type TxSource = "Wallet" | "Paystack" | "Referral" | "Flutterwave" | "Bank transfer";

type Tx = {
  date: string;
  type: TxType;
  id: string;
  source: TxSource;
  desc: string;
  amount: number;
  balance: number;
};

const tabs: Array<[TxTab, string]> = [
  ["all", "All"],
  ["credits", "Credits"],
  ["purchases", "Purchases"],
  ["referrals", "Referral bonuses"],
  ["payouts", "Payouts"],
];

const typeBadge: Record<TxType, string> = {
  "Wallet credit": "bg-mint/30 text-ink",
  "Ticket purchase": "bg-coral/15 text-coral",
  "Referral bonus": "bg-lemon/30 text-ink",
  Payout: "bg-sky/20 text-ink",
};

const sourceIcon: Record<TxSource, { icon: React.ReactNode; bg: string }> = {
  Wallet: { icon: <Wallet className="size-4" />, bg: "bg-mint/30 text-ink" },
  Paystack: { icon: <ArrowUpRight className="size-4" />, bg: "bg-coral/15 text-coral" },
  Referral: { icon: <Users className="size-4" />, bg: "bg-lemon/30 text-ink" },
  Flutterwave: { icon: <ArrowUpRight className="size-4" />, bg: "bg-lilac/30 text-ink" },
  "Bank transfer": { icon: <ArrowUpRight className="size-4" />, bg: "bg-sky/20 text-ink" },
};

const txPool: Array<Omit<Tx, "id">> = [];

const allTransactions: Tx[] = txPool.map((t, i) => ({
  ...t,
  id: "RF-TX-2026-" + String(i + 1).padStart(5, "0"),
}));

export function DashboardTransactionsPage() {
  const [tab, setTab] = useState<TxTab>("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = allTransactions.filter((tx) => {
    if (tab === "credits" && tx.type !== "Wallet credit") return false;
    if (tab === "purchases" && tx.type !== "Ticket purchase") return false;
    if (tab === "referrals" && tx.type !== "Referral bonus") return false;
    if (tab === "payouts" && tx.type !== "Payout") return false;
    const q = search.trim().toLowerCase();
    if (q && !(tx.id.toLowerCase().includes(q) || tx.desc.toLowerCase().includes(q))) return false;
    return true;
  });

  return (
    <DashboardAppShell
      title="Transactions"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Transactions" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/60 -mt-3">
            Wallet activity, referrals, and payouts in a single searchable ledger.
          </p>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              const csv =
                "Date,Type,ID,Source,Description,Amount,Balance\n" +
                filtered
                  .map(
                    (t) =>
                      `"${t.date}","${t.type}","${t.id}","${t.source}","${t.desc}",${t.amount},${t.balance}`
                  )
                  .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "rafilla-transactions.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <FileDown className="size-4" /> Export CSV
          </Button>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-white p-1 ring-1 ring-ink/5">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-extrabold transition-colors",
                tab === key
                  ? "bg-coral text-white shadow-[0_8px_20px_-8px_var(--coral)]"
                  : "text-ink/60 hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-[28px] bg-white p-4 ring-1 ring-ink/5 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex min-h-11 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50 ring-1 ring-ink/5">
                <Search className="size-4 shrink-0 text-ink/45" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, description..."
                  className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
                />
              </label>
              <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 ring-1 ring-ink/5">
                <CalendarDays className="size-4 text-ink/45" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-transparent text-xs font-bold text-ink/60 outline-none"
                />
                <span className="text-xs font-extrabold text-ink/30">→</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-transparent text-xs font-bold text-ink/60 outline-none"
                />
              </div>
              <div className="hidden" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {filtered.map((tx) => {
                  const meta = sourceIcon[tx.source];
                  return (
                    <tr key={tx.id} className="hover:bg-cream/40">
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50">
                        {tx.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                            typeBadge[tx.type]
                          )}
                        >
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-ink/70">
                        {tx.id}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                            meta.bg
                          )}
                        >
                          {meta.icon}
                          {tx.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-ink max-w-[260px] truncate">
                        {tx.desc}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-3 text-right font-display text-base font-extrabold",
                          tx.amount >= 0 ? "text-mint" : "text-coral"
                        )}
                      >
                        {tx.amount >= 0 ? "+" : "-"}
                        {formatNaira(Math.floor(Math.abs(tx.amount) / 100))}
                        <span className="text-[10px]">
                          .{String(Math.abs(tx.amount) % 100).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-ink/70">
                        {formatNaira(Math.floor(tx.balance / 100))}
                        <span className="text-[10px]">
                          .{String(tx.balance % 100).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="grid size-8 place-items-center rounded-full bg-cream text-ink/55 ring-1 ring-ink/10 hover:text-coral hover:bg-coral/10 transition-colors"
                          aria-label="Download receipt"
                        >
                          <Download className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardAppShell>
  );
}
