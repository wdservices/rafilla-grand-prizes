import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Wallet,
  Plus,
  CreditCard,
  Building2,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { DashboardAppShell } from "@/components/rafilla/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

type TxTab = "all" | "credits" | "purchases" | "referrals";
type TxType = "Wallet credit" | "Ticket purchase" | "Referral bonus";

const walletTransactions: Array<{ date: string; type: TxType; desc: string; amount: number; balance: number; ref: string }> = [];

const typeStyles: Record<TxType, string> = {
  "Wallet credit": "bg-mint/30 text-ink",
  "Ticket purchase": "bg-coral/15 text-coral",
  "Referral bonus": "bg-lemon/30 text-ink",
};

const quickAmounts = [5000, 10000, 25000, 50000, 100000];

function HowStep({
  step,
  title,
  text,
  accent,
}: {
  step: string;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-ink/5">
      <div className={cn("inline-flex size-9 items-center justify-center rounded-xl font-display text-sm font-extrabold", accent)}>
        {step}
      </div>
      <h3 className="mt-4 font-display text-base font-extrabold text-ink">{title}</h3>
      <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55">{text}</p>
    </div>
  );
}

export function FundWalletModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<string>("25000");
  const [customActive, setCustomActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const payRef = "RF-PAY-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  if (!open) return null;

  const close = () => {
    setSuccess(false);
    setProcessing(false);
    onClose();
  };

  const proceed = () => {
    if (!amount || Number(amount) <= 0) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center" onClick={close}>
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8 max-h-[90vh] overflow-y-auto"
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
            onClick={close}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {success ? (
          <div className="mt-8 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/30">
              <Check className="size-10 text-coral" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">
              Wallet credited
            </h3>
            <p className="mt-2 font-display text-3xl font-extrabold text-coral">
              {formatNaira(Number(amount || 0) * 100)}
            </p>
            <p className="mt-1 text-xs font-bold text-ink/55">
              Ready to use for competition entries
            </p>
            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={close}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Amount
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral">
                <span className="font-display text-xl font-extrabold text-ink">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setCustomActive(true);
                  }}
                  placeholder="0"
                  className="w-full bg-transparent font-display text-2xl font-extrabold text-ink outline-none placeholder:text-ink/30"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickAmounts.map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setAmount(String(n));
                      setCustomActive(false);
                    }}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-extrabold ring-1 ring-ink/10 transition-colors",
                      Number(amount) === n && !customActive
                        ? "bg-coral text-white"
                        : "bg-white text-ink/70 hover:bg-cream",
                    )}
                  >
                    ₦{n.toLocaleString("en-NG")}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setCustomActive(true);
                  }}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-extrabold ring-1 ring-ink/10 transition-colors",
                    customActive
                      ? "bg-coral text-white"
                      : "bg-white text-ink/70 hover:bg-cream",
                  )}
                >
                  Custom
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Payment reference
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-ink">{payRef}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(payRef).catch(() => {});
                    }}
                    className="grid size-5 place-items-center rounded-full bg-white text-ink/45 ring-1 ring-ink/5 hover:text-coral"
                  >
                    <Copy className="size-3" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <CreditCard className="size-5 text-coral" />
                <p className="text-xs font-bold leading-relaxed text-ink/65">
                  Secure payment. You'll be redirected to complete checkout.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={proceed}
              disabled={processing || !amount || Number(amount) <= 0}
            >
              {processing ? "Processing…" : "Proceed to payment"}
              {!processing && <ArrowRight className="size-4" />}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function DashboardWalletPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<TxTab>("all");
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = walletTransactions.filter((t) => {
    if (tab === "all") return true;
    if (tab === "credits") return t.type === "Wallet credit";
    if (tab === "purchases") return t.type === "Ticket purchase";
    return t.type === "Referral bonus";
  });

  const copyDetails = () => {
    const details = "Bank: Wema Bank\nAccount no: 0123456789\nAccount name: Rafilla Grand Prizes Ltd";
    navigator.clipboard?.writeText(details).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <DashboardAppShell
      title="Wallet"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Wallet" },
      ]}
    >
      <div className="space-y-6">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/60 -mt-3">
          Fund your wallet for competition entries. This balance is spend-only.
        </p>

        <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Wallet balance
              </p>
              <p className="mt-3 break-all font-display text-[clamp(1.75rem,6vw,4.5rem)] font-extrabold leading-none tracking-tight text-ink">
                {formatNaira(0)}
              </p>
              <p className="mt-3 max-w-md text-xs font-bold leading-relaxed text-ink/50">
                For entries only · No withdrawals
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => setModalOpen(true)} className="w-full sm:w-auto shrink-0">
              <Plus className="size-4" /> Fund wallet
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45 mb-3">
            How wallet works
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <HowStep
              step="1"
              title="Add money"
              text="Top up securely with card or bank transfer."
              accent="bg-mint/30 text-ink"
            />
            <HowStep
              step="2"
              title="Use for entries"
              text="Deducts directly when you buy tickets for any live competition."
              accent="bg-sky/20 text-ink"
            />
            <HowStep
              step="3"
              title="Track spend"
              text="Every credit and purchase appears in your ledger with a reference."
              accent="bg-lilac/30 text-ink"
            />
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Bank transfer funding
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Account details
              </h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">Bank</span>
                  <span className="text-sm font-extrabold text-ink">Wema Bank</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">Account no</span>
                  <span className="font-mono text-sm font-extrabold text-ink">0123456789</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">Account name</span>
                  <span className="text-sm font-extrabold text-ink">Rafilla Grand Prizes Ltd</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="md"
                className="mt-5"
                onClick={copyDetails}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied!" : "Copy details"}
              </Button>
            </div>
            <div className="rounded-2xl bg-mint/20 p-5 ring-1 ring-mint/30 max-w-xs">
              <div className="flex items-start gap-3">
                <Building2 className="size-5 text-coral shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed text-ink/75">
                  Transfers take 2–5 minutes to reflect automatically. You'll see the credit in your ledger with the bank reference.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Wallet ledger
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Transactions
              </h2>
            </div>
          </div>

          <div className="mt-5 inline-flex flex-wrap gap-1 rounded-2xl bg-cream p-1 ring-1 ring-ink/5">
            {([
              ["all", "All transactions"],
              ["credits", "Credits"],
              ["purchases", "Purchases"],
              ["referrals", "Referral bonuses"],
            ] as Array<[TxTab, string]>).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-extrabold transition-colors",
                  tab === key
                    ? "bg-white text-ink shadow-sm ring-1 ring-ink/5"
                    : "text-ink/55 hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px] text-left text-sm sm:min-w-[760px]">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Running balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {filtered.map((tx, i) => (
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
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-ink">
                      {tx.desc}
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
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-ink/70">
                      {formatNaira(Math.floor(tx.balance / 100))}
                      <span className="text-[10px]">
                        .{String(tx.balance % 100).padStart(2, "0")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between pt-2">
            <p className="text-xs font-bold text-ink/45">
              Showing {filtered.length} of {walletTransactions.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Prev" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="size-5" />
              </Button>
              <button className="grid size-9 place-items-center rounded-full bg-coral text-xs font-extrabold text-white">
                {page}
              </button>
              <button className="grid size-9 place-items-center rounded-full text-xs font-extrabold text-ink/50 hover:bg-cream">
                2
              </button>
              <Button variant="ghost" size="icon" aria-label="Next" onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FundWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardAppShell>
  );
}
