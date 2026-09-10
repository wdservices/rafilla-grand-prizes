import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Copy,
  Share2,
  Check,
  Users,
  ArrowRight,
  Trophy,
  X,
  Send,
  MessageCircle,
  Twitter,
  Wallet,
  Banknote,
  ChevronDown,
} from "lucide-react";

import { DashboardAppShell } from "@/components/raffila/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/raffila-data";
import { cn } from "@/lib/utils";

type TreeNode = {
  name: string;
  initials: string;
  recruits: number;
  active: boolean;
};

const l2: TreeNode[] = [
  { name: "Femi K.", initials: "FK", recruits: 0, active: false },
  { name: "Tola A.", initials: "TA", recruits: 0, active: false },
  { name: "Amaka O.", initials: "AO", recruits: 0, active: false },
  { name: "Chidi E.", initials: "CE", recruits: 0, active: false },
];

function genL3(l2i: number): TreeNode[] {
  const names = [
    ["Wale O.", "Bisi A.", "Uche J.", "Aisha M.", "Tunde L.", "Zainab I.", "Kunle O.", "Remi S."],
    [
      "Blessing C.",
      "Emeka N.",
      "Fatima A.",
      "Segun O.",
      "Adebayo T.",
      "Nosa E.",
      "Ibrahim K.",
      "Temitope R.",
    ],
  ];
  const use = names[l2i % 2];
  return use.map((n, i) => ({
    name: n,
    initials: n
      .split(" ")
      .map((s) => s[0])
      .join(""),
    recruits: Math.floor(Math.random() * 2),
    active: i < (l2i === 0 ? 2 : l2i === 1 ? 3 : l2i === 2 ? 1 : 2),
  }));
}

type Commission = {
  date: string;
  who: string;
  initials: string;
  forWhat: string;
  level: 1 | 2 | 3 | 4 | 5;
  amount: number;
  status: "PENDING" | "AVAILABLE";
};

const commissions: Commission[] = [];

const levelBadge: Record<Commission["level"], string> = {
  1: "bg-coral/15 text-coral",
  2: "bg-sky/20 text-ink",
  3: "bg-lemon/30 text-ink",
  4: "bg-mint/30 text-ink",
  5: "bg-lilac/30 text-ink",
};

const levelPct: Record<Commission["level"], string> = {
  1: "10%",
  2: "5%",
  3: "3%",
  4: "2%",
  5: "1%",
};

const levelRing: Record<number, string> = {
  1: "ring-coral/60",
  2: "ring-coral/45",
  3: "ring-coral/30",
  4: "ring-coral/20",
  5: "ring-ink/10",
};

function NodeCard({
  node,
  level,
  empty = false,
}: {
  node?: TreeNode;
  level: number;
  empty?: boolean;
}) {
  const earning = level <= 4;
  if (empty) {
    return (
      <div className="flex flex-col items-center">
        <div className="grid size-12 place-items-center rounded-full bg-ink/5 ring-1 ring-ink/10 opacity-40">
          <ChevronDown className="size-4 text-ink/30 -rotate-90" />
        </div>
      </div>
    );
  }
  const n = node!;
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-full font-display text-xs font-extrabold ring-2",
          earning ? levelRing[level] : "ring-ink/10",
          n.active
            ? level <= 4
              ? "bg-coral/10 text-coral"
              : "bg-lilac/25 text-ink"
            : "bg-ink/5 text-ink/50 opacity-70",
        )}
      >
        {n.initials}
      </div>
      <p className="mt-2 text-[11px] font-extrabold text-ink truncate max-w-[80px] text-center">
        {n.name}
      </p>
      <p className="text-[10px] font-bold text-ink/45">{n.recruits} recruits</p>
    </div>
  );
}

export function DashboardReferralsPage() {
  const [copied, setCopied] = useState<"url" | "code" | null>(null);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    bank: "Wema Bank",
    accountNo: "",
    accountName: "",
    amount: "0",
  });
  const [payoutSubmitted, setPayoutSubmitted] = useState(false);

  const refUrl = "https://raffila.com/invite/tunmise-ade";
  const refCode = "TUNMISE-ADE";

  const copy = (what: "url" | "code", v: string) => {
    navigator.clipboard?.writeText(v).catch(() => {});
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <DashboardAppShell
      title="Referrals"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Referrals" }]}
    >
      <div className="space-y-6">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/60 -mt-3">
          Invite friends and earn up to 5 levels of commissions every time someone you bring in
          enters a competition.
        </p>

        <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
            My referral link
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5 min-w-0">
              <span className="min-w-0 truncate font-mono text-xs font-bold text-ink">
                {refUrl}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="primary" size="md" onClick={() => copy("url", refUrl)}>
                {copied === "url" ? (
                  <>
                    <Check className="size-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copy
                  </>
                )}
              </Button>
              <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-ink/5">
                <button
                  className="grid size-10 place-items-center rounded-full text-ink/60 hover:bg-green-100 hover:text-green-700 transition-colors"
                  aria-label="Share on WhatsApp"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent("Join Raffila and win big prizes! " + refUrl)}`,
                      "_blank",
                    )
                  }
                >
                  <MessageCircle className="size-4" />
                </button>
                <button
                  className="grid size-10 place-items-center rounded-full text-ink/60 hover:bg-sky/20 hover:text-sky-700 transition-colors"
                  aria-label="Share on Telegram"
                  onClick={() =>
                    window.open(
                      `https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent("Join Raffila!")}`,
                      "_blank",
                    )
                  }
                >
                  <Send className="size-4" />
                </button>
                <button
                  className="grid size-10 place-items-center rounded-full text-ink/60 hover:bg-ink/5 transition-colors"
                  aria-label="Share on Twitter"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent("Join Raffila and win big prizes!")}`,
                      "_blank",
                    )
                  }
                >
                  <Twitter className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Invites sent" value="0" tone="bg-mint/30 text-ink" />
            <StatCard label="Total recruits" value="0 / 0" tone="bg-coral/15 text-coral" />
            <StatCard
              label="Total earned commissions"
              value={formatNaira(0)}
              tone="bg-sky/20 text-ink"
            />
            <div className="rounded-[22px] bg-white p-5 ring-1 ring-ink/5">
              <span className="inline-block rounded-xl bg-lemon/30 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                Available balance
              </span>
              <p className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                {formatNaira(0)}
              </p>
              <p className="mt-1 text-xs font-bold text-ink/45">{formatNaira(0)} pending</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                5-level earning tree
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Your referral network
              </h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55 max-w-lg">
                Coral ring = earning you commissions. L1 10% · L2 5% · L3 3% · L4 2% · L5 1%.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-extrabold">
              {[1, 2, 3, 4, 5].map((lv) => (
                <span
                  key={lv}
                  className={cn(
                    "rounded-full px-2.5 py-1 ring-2",
                    levelRing[lv],
                    lv <= 4 ? "bg-coral/10 text-coral" : "bg-ink/5 text-ink/50",
                  )}
                >
                  L{lv} · {levelPct[lv as Commission["level"]]}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-10">
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "grid size-14 place-items-center rounded-full bg-coral text-white font-display text-sm font-extrabold ring-4",
                    levelRing[1],
                  )}
                >
                  TA
                </div>
                <p className="mt-2 text-[11px] font-extrabold text-ink">Tunmise A. (You)</p>
                <p className="text-[10px] font-bold text-ink/45">4 recruits · L1 10%</p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="h-8 w-px bg-ink/10" />
            </div>

            <div className="flex justify-center">
              <div className="flex flex-wrap gap-6 justify-center max-w-[560px]">
                {l2.map((n) => (
                  <NodeCard key={n.name} node={n} level={2} />
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex gap-16 max-w-[560px] justify-center">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-px bg-ink/10" />
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex flex-wrap gap-5 justify-center max-w-[680px]">
                {l2
                  .flatMap((_, l2i) => genL3(l2i).slice(0, 2))
                  .map((n, i) => (
                    <NodeCard key={"l3" + i} node={n} level={3} />
                  ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex gap-12 max-w-[680px] justify-center opacity-50">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-6 w-px bg-ink/10" />
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex flex-wrap gap-4 justify-center max-w-[760px] opacity-70">
                {Array.from({ length: 8 }).map((_, i) => {
                  const names = [
                    "Kola B.",
                    "Rita M.",
                    "Ayo J.",
                    "Halima U.",
                    "Samuel F.",
                    "Chioma O.",
                    "Musa D.",
                    "Onyeka G.",
                  ];
                  const n = names[i];
                  return (
                    <NodeCard
                      key={"l4" + i}
                      node={{
                        name: n,
                        initials: n
                          .split(" ")
                          .map((s) => s[0])
                          .join(""),
                        recruits: 0,
                        active: i < 5,
                      }}
                      level={4}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex flex-wrap gap-3 justify-center max-w-[820px] opacity-50">
                {Array.from({ length: 8 }).map((_, i) => (
                  <NodeCard key={"l5" + i} level={5} empty />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Commission ledger
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Recent commissions
              </h2>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Who</th>
                  <th className="px-4 py-3 hidden sm:table-cell">For what</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {commissions.map((c, i) => (
                  <tr key={i} className="hover:bg-cream/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50">
                      {c.date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full bg-lilac/30 font-display text-[10px] font-extrabold text-ink ring-1 ring-ink/5">
                          {c.initials}
                        </span>
                        <span className="text-sm font-extrabold text-ink">{c.who}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm font-bold text-ink/70 sm:table-cell">
                      {c.forWhat}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                            levelBadge[c.level],
                          )}
                        >
                          L{c.level}
                        </span>
                        <span className="text-[10px] font-bold text-ink/45">
                          {levelPct[c.level]}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-display text-base font-extrabold text-mint">
                      +{formatNaira(Math.floor(c.amount / 100))}
                      <span className="text-[10px]">
                        .{String(c.amount % 100).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          c.status === "AVAILABLE" ? "bg-mint/30 text-ink" : "bg-lemon/40 text-ink",
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg" className="min-h-14 text-sm">
            <Link to="/dashboard/competitions">
              <Trophy className="size-4" /> USE FOR ENTRY <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="min-h-14 text-sm"
            onClick={() => setPayoutOpen(true)}
          >
            <Banknote className="size-4" /> REQUEST CASH PAYOUT <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      {payoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => {
            setPayoutOpen(false);
            setPayoutSubmitted(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Referral earnings
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                  Request payout
                </h2>
              </div>
              <button
                onClick={() => {
                  setPayoutOpen(false);
                  setPayoutSubmitted(false);
                }}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
              >
                <X className="size-5" />
              </button>
            </div>

            {payoutSubmitted ? (
              <div className="mt-8 text-center">
                <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/30">
                  <Check className="size-10 text-coral" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">
                  Payout requested
                </h3>
                <p className="mt-2 font-display text-3xl font-extrabold text-coral">
                  {formatNaira(Number(payoutForm.amount || 0) * 100)}
                </p>
                <p className="mt-1 text-xs font-bold text-ink/55">
                  Review is typically 1–3 business days
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => {
                    setPayoutOpen(false);
                    setPayoutSubmitted(false);
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-6 rounded-2xl bg-mint/20 p-4 ring-1 ring-mint/30 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    Available
                  </span>
                  <span className="font-display text-xl font-extrabold text-ink">
                    {formatNaira(0)}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <Field
                    label="Bank name"
                    value={payoutForm.bank}
                    onChange={(v) => setPayoutForm((f) => ({ ...f, bank: v }))}
                  />
                  <Field
                    label="Account number"
                    value={payoutForm.accountNo}
                    onChange={(v) =>
                      setPayoutForm((f) => ({ ...f, accountNo: v.replace(/\D/g, "").slice(0, 10) }))
                    }
                    placeholder="10 digits"
                  />
                  <Field
                    label="Account name"
                    value={payoutForm.accountName}
                    onChange={(v) => setPayoutForm((f) => ({ ...f, accountName: v }))}
                    placeholder="As it appears on your bank account"
                  />
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                        Amount
                      </label>
                      <button
                        onClick={() => setPayoutForm((f) => ({ ...f, amount: "0" }))}
                        className="text-[11px] font-extrabold text-coral hover:underline"
                      >
                        Max · {formatNaira(0)}
                      </button>
                    </div>
                    <div className="flex min-h-11 items-center gap-2 rounded-2xl bg-cream px-4 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral">
                      <Wallet className="size-4 text-coral" />
                      <span className="font-display text-lg font-extrabold text-ink">₦</span>
                      <input
                        type="number"
                        value={payoutForm.amount}
                        onChange={(e) => setPayoutForm((f) => ({ ...f, amount: e.target.value }))}
                        max={0}
                        className="w-full bg-transparent font-display text-xl font-extrabold text-ink outline-none placeholder:text-ink/30"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => {
                    if (!payoutForm.accountNo || !payoutForm.accountName || !payoutForm.amount)
                      return;
                    setPayoutSubmitted(true);
                  }}
                  disabled={!payoutForm.accountNo || !payoutForm.accountName || !payoutForm.amount}
                >
                  Submit payout request <ArrowRight className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardAppShell>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-[22px] bg-white p-5 ring-1 ring-ink/5">
      <span className={cn("inline-block rounded-xl px-2.5 py-1 text-[10px] font-extrabold", tone)}>
        {label}
      </span>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
        {label}
      </label>
      <input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-2xl bg-cream px-4 text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral"
      />
    </div>
  );
}
