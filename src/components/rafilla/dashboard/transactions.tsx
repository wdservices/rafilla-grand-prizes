import { useState, type ReactNode } from "react";
import {
  Search,
  Wallet,
  Ticket,
  Users,
  FileDown,
  ReceiptText,
  Download,
} from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

type TxCategory =
  | "WALLET_FUNDING"
  | "ENTRY_PURCHASE"
  | "REFERENCE_L1_COMMISSION"
  | "REFERENCE_L2_COMMISSION"
  | "REFERENCE_L3_COMMISSION"
  | "ADMIN_ADJUSTMENT";

type TxStatus = "SUCCESS" | "FAILED" | "PENDING" | "AVAILABLE";

type UnifiedTx = {
  date: string;
  category: TxCategory;
  description: string;
  reference: string;
  amount: number;
  status: TxStatus;
  balance: number;
};

const toggleTabs = ["All", "Wallet", "Referrals"] as const;

const categoryMeta: Record<TxCategory, { icon: ReactNode; color: string; label: string }> = {
  WALLET_FUNDING: {
    icon: <Wallet className="size-4" />,
    color: "bg-mint/30 text-ink",
    label: "Wallet",
  },
  ENTRY_PURCHASE: {
    icon: <Ticket className="size-4" />,
    color: "bg-coral/15 text-coral",
    label: "Entry",
  },
  REFERENCE_L1_COMMISSION: {
    icon: <Users className="size-4" />,
    color: "bg-lemon/30 text-ink",
    label: "L1",
  },
  REFERENCE_L2_COMMISSION: {
    icon: <Users className="size-4" />,
    color: "bg-sky/20 text-ink",
    label: "L2",
  },
  REFERENCE_L3_COMMISSION: {
    icon: <Users className="size-4" />,
    color: "bg-lilac/30 text-ink",
    label: "L3",
  },
  ADMIN_ADJUSTMENT: {
    icon: <ReceiptText className="size-4" />,
    color: "bg-sky/20 text-ink",
    label: "Admin",
  },
};

const statusStyles: Record<TxStatus, string> = {
  SUCCESS: "bg-mint/30 text-ink",
  FAILED: "bg-rose/20 text-ink",
  PENDING: "bg-lemon/40 text-ink",
  AVAILABLE: "bg-mint/30 text-ink",
};

const unifiedTransactions: UnifiedTx[] = [
  {
    date: "05 Mar · 16:02",
    category: "REFERENCE_L1_COMMISSION",
    description: "L1 commission — Femi K. entered Mercedes-Benz C-Class",
    reference: "REF-L1-MQ72Z",
    amount: 200000,
    status: "AVAILABLE",
    balance: 17090000,
  },
  {
    date: "05 Mar · 14:32",
    category: "ENTRY_PURCHASE",
    description: "25 entries · Mercedes-Benz C-Class 2025",
    reference: "WEB-VTBX82K",
    amount: -2500000,
    status: "SUCCESS",
    balance: 14250000,
  },
  {
    date: "05 Mar · 12:44",
    category: "REFERENCE_L2_COMMISSION",
    description: "L2 commission — Amaka O. entry via your network",
    reference: "REF-L2-BH41K",
    amount: 75000,
    status: "PENDING",
    balance: 16750000,
  },
  {
    date: "05 Mar · 10:15",
    category: "WALLET_FUNDING",
    description: "Card top-up · Paystack",
    reference: "WEB-9MQP47S",
    amount: 5000000,
    status: "SUCCESS",
    balance: 16675000,
  },
  {
    date: "04 Mar · 21:08",
    category: "ENTRY_PURCHASE",
    description: "100 entries · Luxury 2-Bed Apartment",
    reference: "WEB-XJ7T29A",
    amount: -1000000,
    status: "SUCCESS",
    balance: 9500000,
  },
  {
    date: "04 Mar · 17:30",
    category: "REFERENCE_L3_COMMISSION",
    description: "L3 commission — network purchase",
    reference: "REF-L3-PL882",
    amount: 25000,
    status: "PENDING",
    balance: 10500000,
  },
  {
    date: "04 Mar · 15:44",
    category: "ENTRY_PURCHASE",
    description: "100 entries · Nova X1 Bundle",
    reference: "WEB-2L4H81B",
    amount: -500000,
    status: "SUCCESS",
    balance: 10475000,
  },
  {
    date: "03 Mar · 22:11",
    category: "REFERENCE_L1_COMMISSION",
    description: "L1 commission — Tola A. Nova X1 Bundle entry",
    reference: "REF-L1-ZX55M",
    amount: 500000,
    status: "AVAILABLE",
    balance: 10975000,
  },
  {
    date: "03 Mar · 18:22",
    category: "ADMIN_ADJUSTMENT",
    description: "Service credit — support resolution #482",
    reference: "ADJ-F204K9Z",
    amount: 50000,
    status: "SUCCESS",
    balance: 11000000,
  },
  {
    date: "03 Mar · 09:12",
    category: "WALLET_FUNDING",
    description: "Bank transfer · GTB ****8821",
    reference: "WEB-3KN5P8T",
    amount: 2500000,
    status: "SUCCESS",
    balance: 10950000,
  },
  {
    date: "02 Mar · 20:05",
    category: "ENTRY_PURCHASE",
    description: "10 entries · Luxury 2-Bed Apartment",
    reference: "WEB-RT61M4V",
    amount: -250000,
    status: "PENDING",
    balance: 8450000,
  },
  {
    date: "02 Mar · 11:37",
    category: "WALLET_FUNDING",
    description: "Card top-up · failed — funds will be reversed",
    reference: "WEB-BWZ8D7X",
    amount: 1000000,
    status: "FAILED",
    balance: 8700000,
  },
];

export function DashboardTransactionsPage() {
  const [tab, setTab] = useState<(typeof toggleTabs)[number]>("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  return (
    <DashboardShell activeNav="Transactions">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Full audit trail
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Transactions
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            Wallet activity and referral commissions combined — one searchable ledger.
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-paper p-1 ring-1 ring-ink/5">
          {toggleTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-extrabold transition-colors",
                tab === t
                  ? "bg-coral text-cream shadow-[0_8px_20px_-8px_var(--coral)]"
                  : "text-ink/60 hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="rounded-[28px] bg-paper p-4 ring-1 ring-ink/5 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex min-h-11 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50 ring-1 ring-ink/5">
                <Search className="size-4 shrink-0 text-ink/45" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reference, description..."
                  className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
                />
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="min-h-11 rounded-full bg-lilac/20 px-4 text-sm font-extrabold text-ink outline-none ring-1 ring-ink/5"
              >
                <option>All types</option>
                <option>Wallet funding</option>
                <option>Entry purchase</option>
                <option>Referral commission</option>
                <option>Admin adjustment</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-h-11 rounded-full bg-lilac/20 px-4 text-sm font-extrabold text-ink outline-none ring-1 ring-ink/5"
              >
                <option>All statuses</option>
                <option>Success</option>
                <option>Pending</option>
                <option>Available</option>
                <option>Failed</option>
              </select>
              <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 ring-1 ring-ink/5">
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
              <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 ring-1 ring-ink/5">
                <span className="text-xs font-extrabold text-ink/45">₦ min</span>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0"
                  className="w-20 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/30"
                />
                <span className="text-xs font-extrabold text-ink/30">–</span>
                <span className="text-xs font-extrabold text-ink/45">₦ max</span>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="999k"
                  className="w-20 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/30"
                />
              </div>
            </div>
            <Button variant="outline" size="md" className="lg:shrink-0">
              <FileDown className="size-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Running balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {unifiedTransactions.map((tx, i) => {
                  const meta = categoryMeta[tx.category];
                  const isWallet =
                    tx.category === "WALLET_FUNDING" ||
                    tx.category === "ENTRY_PURCHASE" ||
                    tx.category === "ADMIN_ADJUSTMENT";
                  const isReferral =
                    tx.category === "REFERENCE_L1_COMMISSION" ||
                    tx.category === "REFERENCE_L2_COMMISSION" ||
                    tx.category === "REFERENCE_L3_COMMISSION";
                  if (tab === "Wallet" && !isWallet) return null;
                  if (tab === "Referrals" && !isReferral) return null;

                  return (
                    <tr key={i} className="hover:bg-cream/40">
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50">
                        {tx.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                            meta.color,
                          )}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-ink">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-ink/70">
                        {tx.reference}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-3 text-right font-display text-base font-extrabold",
                          tx.amount >= 0 ? "text-mint" : "text-coral",
                        )}
                      >
                        {tx.amount >= 0 ? "+" : "-"}
                        {formatNaira(Math.floor(Math.abs(tx.amount) / 100))}
                        <span className="text-[10px]">
                          .{String(Math.abs(tx.amount) % 100).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                            statusStyles[tx.status],
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-ink/70">
                        {formatNaira(Math.floor(tx.balance / 100))}
                        <span className="text-[10px]">
                          .{String(tx.balance % 100).padStart(2, "0")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
