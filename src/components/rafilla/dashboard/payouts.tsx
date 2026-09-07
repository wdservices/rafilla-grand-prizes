import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  ShieldCheck,
  Banknote,
  Building2,
  AlertCircle,
} from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

const banks = [
  "Access Bank",
  "Guaranty Trust Bank (GTB)",
  "Zenith Bank",
  "United Bank for Africa (UBA)",
  "First Bank of Nigeria",
  "Fidelity Bank",
  "Other bank",
];

type PayoutStatus =
  | "PENDING"
  | "UNDER REVIEW"
  | "APPROVED"
  | "PAID"
  | "REJECTED";

const payoutHistory: Array<{
  ref: string;
  amount: number;
  bank: string;
  status: PayoutStatus;
  submitted: string;
  paid?: string;
}> = [];

const statusColor: Record<PayoutStatus, string> = {
  PENDING: "bg-lemon/40 text-ink",
  "UNDER REVIEW": "bg-sky/20 text-ink",
  APPROVED: "bg-mint/30 text-ink",
  PAID: "bg-coral/15 text-coral",
  REJECTED: "bg-rose/20 text-ink",
};

const AVAILABLE_BALANCE = 0;

export function DashboardReferralsPayoutPage() {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("Access Bank");
  const [accountName, setAccountName] = useState("Tunmise Oluwaseyi Adeyemi");
  const [accountNumber, setAccountNumber] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const numAmount = Number(amount) || 0;
  const overMax = numAmount > AVAILABLE_BALANCE;
  const disabled =
    !numAmount ||
    overMax ||
    !accountName ||
    accountNumber.length < 10;

  const submit = () => {
    if (disabled) return;
    setSubmitted(true);
  };

  return (
    <DashboardShell activeNav="Referrals">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          to="/dashboard/referrals"
          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink/55 hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Back to referrals
        </Link>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Referral earnings
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Request Payout
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            Turn your available referral earnings into a bank transfer. Payouts are reviewed within 24–48 hours.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
            {submitted ? (
              <div className="py-4 text-center">
                <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/30">
                  <Check className="size-10 text-coral" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                  Payout request submitted!
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-relaxed text-ink/55">
                  Expect review within 24–48 hours. You'll get an email once it's approved and paid.
                </p>
                <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-cream p-4 text-left ring-1 ring-ink/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                      Amount requested
                    </span>
                    <span className="font-display text-lg font-extrabold text-ink">
                      {formatNaira(numAmount)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold">
                    <span className="text-ink/45">Bank</span>
                    <span className="text-ink/70">{bank}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs font-bold">
                    <span className="text-ink/45">Account</span>
                    <span className="text-ink/70">{accountNumber}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-lemon/30 p-3 text-[11px] font-bold leading-relaxed text-ink/70">
                    <Clock3 className="size-4 shrink-0 text-coral" />
                    Reference will be confirmed by email shortly.
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    asChild
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setSubmitted(false);
                      setAmount("");
                      setAccountNumber("");
                      setNote("");
                    }}
                  >
                    <Link to="/dashboard/referrals/payout">Request another</Link>
                  </Button>
                  <Button asChild variant="primary" size="md">
                    <Link to="/dashboard/referrals">Back to referrals</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl bg-mint/20 p-4 ring-1 ring-ink/5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    Available balance
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
                      {formatNaira(AVAILABLE_BALANCE)}
                    </p>
                    <button
                      onClick={() => setAmount(String(AVAILABLE_BALANCE))}
                      className="text-xs font-extrabold text-coral underline decoration-coral/40 underline-offset-4 hover:decoration-coral"
                    >
                      Use max
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    <span>Amount (₦)</span>
                    <span className="normal-case tracking-normal font-bold text-ink/40">
                      Max {formatNaira(AVAILABLE_BALANCE)}
                    </span>
                  </label>
                  <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-cream px-4 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral">
                    <span className="font-display text-xl font-extrabold text-ink">₦</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent font-display text-2xl font-extrabold text-ink outline-none placeholder:text-ink/30"
                    />
                  </div>
                  {overMax && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose/15 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                      <AlertCircle className="size-3" /> Available balance is {formatNaira(AVAILABLE_BALANCE)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    Bank name
                  </label>
                  <div className="relative">
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="min-h-12 w-full appearance-none rounded-2xl bg-cream px-4 pr-10 text-sm font-extrabold text-ink outline-none ring-1 ring-ink/5 focus:ring-2 focus:ring-coral"
                    >
                      {banks.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                      Account name
                    </label>
                    <input
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="As written on your bank app"
                      className="min-h-12 w-full rounded-2xl bg-cream px-4 text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                      Account number
                    </label>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit NUBAN"
                      inputMode="numeric"
                      className="min-h-12 w-full rounded-2xl bg-cream px-4 font-mono text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    Note <span className="font-bold text-ink/35 normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Anything the team should know about this payout."
                    className="w-full resize-none rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
                  <ShieldCheck className="mt-0.5 shrink-0 size-5 text-coral" />
                  <div className="text-[11px] font-bold leading-relaxed text-ink/55">
                    Payouts are reviewed for compliance. Bank names must exactly match your verified profile to avoid rejection.
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={disabled}
                  onClick={submit}
                >
                  <Banknote className="size-4" /> Confirm payout request
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-coral p-6 text-cream shadow-[0_8px_20px_-8px_var(--coral)] ring-1 ring-coral/30 sm:p-7">
              <div className="flex items-center gap-2">
                <Building2 className="size-5" />
                <h3 className="font-display text-xl font-extrabold">Payouts overview</h3>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-cream/60">
                    Available
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold">
                    {formatNaira(AVAILABLE_BALANCE)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-cream/60">
                    Pending
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold">
                    {formatNaira(0)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-cream/60">
                    Paid
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold">
                    {formatNaira(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
              <h3 className="font-display text-lg font-extrabold text-ink">Payout history</h3>
              <p className="mt-1 text-xs font-bold text-ink/45">
                Latest 5 requests and their final status.
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-ink/5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    <tr>
                      <th className="px-3 py-2.5">Reference</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {payoutHistory.map((p) => (
                      <tr key={p.ref} className="hover:bg-cream/40">
                        <td className="px-3 py-2.5">
                          <p className="font-mono text-[10px] font-bold text-ink/70">
                            {p.ref}
                          </p>
                          <p className="text-[10px] font-bold text-ink/45">
                            {p.bank} · Submitted {p.submitted}
                            {p.paid && <> · Paid {p.paid}</>}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-display text-sm font-extrabold text-ink">
                          {formatNaira(Math.floor(p.amount / 100))}
                          <span className="text-[10px]">
                            .{String(p.amount % 100).padStart(2, "0")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                              statusColor[p.status],
                            )}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
