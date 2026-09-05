import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Wallet,
  CreditCard,
  Building,
  Smartphone,
  X,
  Check,
  ArrowUpRight,
} from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

type TxStatus = "SUCCESS" | "FAILED" | "PENDING";
type TxType = "WALLET FUNDING" | "ENTRY PURCHASE" | "ADMIN ADJUSTMENT";

const walletTransactions: Array<{
  date: string;
  type: TxType;
  reference: string;
  amount: number;
  status: TxStatus;
  runningBalance: number;
}> = [
  {
    date: "05 Mar · 14:32",
    type: "ENTRY PURCHASE",
    reference: "WEB-VTBX82K",
    amount: -25000,
    status: "SUCCESS",
    runningBalance: 14250000,
  },
  {
    date: "05 Mar · 10:15",
    type: "WALLET FUNDING",
    reference: "WEB-9MQP47S",
    amount: 5000000,
    status: "SUCCESS",
    runningBalance: 14500000,
  },
  {
    date: "04 Mar · 21:08",
    type: "ENTRY PURCHASE",
    reference: "WEB-XJ7T29A",
    amount: -1000000,
    status: "SUCCESS",
    runningBalance: 9500000,
  },
  {
    date: "04 Mar · 15:44",
    type: "ENTRY PURCHASE",
    reference: "WEB-2L4H81B",
    amount: -500000,
    status: "SUCCESS",
    runningBalance: 10500000,
  },
  {
    date: "03 Mar · 18:22",
    type: "ADMIN ADJUSTMENT",
    reference: "ADJ-F204K9Z",
    amount: 50000,
    status: "SUCCESS",
    runningBalance: 11000000,
  },
  {
    date: "03 Mar · 09:12",
    type: "WALLET FUNDING",
    reference: "WEB-3KN5P8T",
    amount: 2500000,
    status: "SUCCESS",
    runningBalance: 10950000,
  },
  {
    date: "02 Mar · 20:05",
    type: "ENTRY PURCHASE",
    reference: "WEB-RT61M4V",
    amount: -250000,
    status: "PENDING",
    runningBalance: 8450000,
  },
  {
    date: "02 Mar · 11:37",
    type: "WALLET FUNDING",
    reference: "WEB-BWZ8D7X",
    amount: 1000000,
    status: "FAILED",
    runningBalance: 8700000,
  },
];

const quickAmounts = [5000, 10000, 25000, 50000, 100000];

const typeStyles: Record<TxType, string> = {
  "WALLET FUNDING": "bg-mint/30 text-ink",
  "ENTRY PURCHASE": "bg-coral/15 text-coral",
  "ADMIN ADJUSTMENT": "bg-sky/20 text-ink",
};

const statusStyles: Record<TxStatus, string> = {
  SUCCESS: "bg-mint/30 text-ink",
  FAILED: "bg-rose/20 text-ink",
  PENDING: "bg-lemon/40 text-ink",
};

function StatMiniCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "mint" | "sky" | "coral";
}) {
  const bg =
    tone === "mint" ? "bg-mint/30" : tone === "sky" ? "bg-sky/20" : "bg-coral/15";
  return (
    <div className="rounded-[22px] bg-paper p-5 ring-1 ring-ink/5">
      <div className={`inline-block rounded-xl px-2.5 py-1 text-[10px] font-extrabold ${bg} text-ink`}>
        {label}
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

export function DashboardWalletPage() {
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundSuccess, setFundSuccess] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<"card" | "bank" | "ussd">("card");
  const [processing, setProcessing] = useState(false);

  const openFund = () => {
    setFundModalOpen(true);
    setFundSuccess(false);
    setAmount("");
    setProcessing(false);
  };

  const handleContinue = () => {
    setProcessing(true);
    setTimeout(() => {
      setFundSuccess(true);
      setProcessing(false);
    }, 1800);
  };

  return (
    <DashboardShell activeNav="Wallet">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Spend-only wallet
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Rafilla Wallet
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            Fund to enter competitions — no withdrawals available on this balance.
          </p>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Rafilla Wallet (Spend-only)
              </p>
              <p className="mt-3 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-none tracking-tight text-ink">
                {formatNaira(142500)}
              </p>
              <p className="mt-3 max-w-md text-xs font-bold leading-relaxed text-ink/50">
                Fund your wallet to enter competitions — this balance cannot be withdrawn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" onClick={openFund}>
                <Wallet className="size-4" /> FUND WALLET
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/competitions">
                  EXPLORE COMPETITIONS <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatMiniCard label="Funded total" value={formatNaira(485000)} tone="mint" />
          <StatMiniCard label="Spent on entries" value={formatNaira(342500)} tone="sky" />
          <StatMiniCard label="Available" value={formatNaira(142500)} tone="coral" />
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Wallet Ledger
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Recent Transactions
              </h2>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {walletTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-cream/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          typeStyles[tx.type],
                        )}
                      >
                        {tx.type}
                      </span>
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
                      {formatNaira(Math.abs(tx.amount) / 100)}
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
                      {formatNaira(Math.floor(tx.runningBalance / 100))}
                      <span className="text-[10px]">
                        .{String(tx.runningBalance % 100).padStart(2, "0")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {fundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div
            className="w-full max-w-md rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Top up
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                  Fund Wallet
                </h2>
              </div>
              <button
                onClick={() => setFundModalOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {fundSuccess ? (
              <div className="mt-8 text-center">
                <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/30">
                  <Check className="size-10 text-coral" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">
                  Wallet funded successfully
                </h3>
                <p className="mt-2 text-sm font-bold text-ink/55">
                  +{formatNaira(Number(amount || 25000))}.00 added to your wallet
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => setFundModalOpen(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-6 inline-flex rounded-2xl bg-cream p-1 ring-1 ring-ink/5">
                  {(["card", "bank", "ussd"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold capitalize transition-colors",
                        payMethod === m
                          ? "bg-paper text-ink shadow-sm ring-1 ring-ink/5"
                          : "text-ink/55 hover:text-ink",
                      )}
                    >
                      {m === "card" && <CreditCard className="size-4" />}
                      {m === "bank" && <Building className="size-4" />}
                      {m === "ussd" && <Smartphone className="size-4" />}
                      {m === "card" ? "Card" : m === "bank" ? "Bank transfer" : "USSD"}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    Amount (₦)
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral">
                    <span className="font-display text-xl font-extrabold text-ink">₦</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent font-display text-2xl font-extrabold text-ink outline-none placeholder:text-ink/30"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickAmounts.map((n) => (
                      <button
                        key={n}
                        onClick={() => setAmount(String(n))}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-xs font-extrabold ring-1 ring-ink/10 transition-colors",
                          Number(amount) === n
                            ? "bg-coral text-cream"
                            : "bg-paper text-ink/70 hover:bg-cream",
                        )}
                      >
                        ₦{n.toLocaleString("en-NG")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
                  {payMethod === "card" && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="size-5 text-coral" />
                      <p className="text-xs font-bold leading-relaxed text-ink/65">
                        Secure card payment via Paystack. You'll be redirected to complete checkout.
                      </p>
                    </div>
                  )}
                  {payMethod === "bank" && (
                    <div className="flex items-center gap-3">
                      <Building className="size-5 text-coral" />
                      <p className="text-xs font-bold leading-relaxed text-ink/65">
                        Transfer to the virtual account number shown at checkout. Instant confirmation.
                      </p>
                    </div>
                  )}
                  {payMethod === "ussd" && (
                    <div className="flex items-center gap-3">
                      <Smartphone className="size-5 text-coral" />
                      <p className="text-xs font-bold leading-relaxed text-ink/65">
                        Dial the USSD code on your phone to confirm the payment directly from your bank app.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={handleContinue}
                  disabled={processing || !amount}
                >
                  {processing ? (
                    <>Processing…</>
                  ) : (
                    <>
                      Continue to checkout <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
