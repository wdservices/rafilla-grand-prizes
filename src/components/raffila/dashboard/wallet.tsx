import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Wallet,
  Plus,
  CreditCard,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { DashboardAppShell } from "@/components/raffila/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/raffila-data";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  PAYSTACK_MIN_AMOUNT_NAIRA,
  generatePaystackReference,
  getPaystackCallbackUrl,
  getPaystackPublicKey,
  isPaystackConfigured,
  nairaToKobo,
  parseAmountNaira,
} from "@/lib/paystack";
import { confirmWalletFunding, initializePaystackTransaction } from "@/lib/paystack-server";
import { fetchFeatureFlags } from "@/lib/platform-config";
import { db } from "@/lib/firebase";
import { collection, doc, limit, onSnapshot, orderBy, query } from "firebase/firestore";

type TxTab = "all" | "credits" | "purchases" | "referrals";
type TxType = "Wallet credit" | "Ticket purchase" | "Referral bonus";

type LedgerTx = {
  id: string;
  date: string;
  type: TxType;
  desc: string;
  amountKobo: number;
  balanceKobo: number;
  ref: string;
};

const typeStyles: Record<TxType, string> = {
  "Wallet credit": "bg-mint/30 text-ink",
  "Ticket purchase": "bg-coral/15 text-coral",
  "Referral bonus": "bg-lemon/30 text-ink",
};

const quickAmounts = [5000, 10000, 25000, 50000, 100000];
const PAGE_SIZE = 10;

function toDisplayDate(value: unknown): string {
  try {
    if (value == null) return "";
    if (typeof (value as { toDate?: unknown }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate().toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Session id → Firestore users/{uid}. Firebase sessions are prefixed. */
function sessionIdToUid(id: string | undefined): string | null {
  if (!id) return null;
  return id.startsWith("firebase_") ? id.replace("firebase_", "") : id;
}

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
    <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 transition-shadow hover:shadow-md">
      <div
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-2xl font-display text-sm font-extrabold",
          accent,
        )}
      >
        {step}
      </div>
      <h3 className="mt-4 font-display text-base font-extrabold text-ink">{title}</h3>
      <p className="mt-1.5 text-xs font-bold leading-relaxed text-ink/55">{text}</p>
    </div>
  );
}

export function FundWalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuthSession();
  const [amount, setAmount] = useState<string>("25000");
  const [customActive, setCustomActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payRef] = useState(() => generatePaystackReference());

  const configured = isPaystackConfigured();
  const testMode = getPaystackPublicKey().startsWith("pk_test_");

  if (!open) return null;

  const close = () => {
    setError(null);
    setProcessing(false);
    onClose();
  };

  const proceed = async () => {
    setError(null);
    const naira = parseAmountNaira(amount);
    if (!naira || naira < PAYSTACK_MIN_AMOUNT_NAIRA) {
      setError(`Minimum funding amount is ₦${PAYSTACK_MIN_AMOUNT_NAIRA.toLocaleString("en-NG")}.`);
      return;
    }
    const email = user?.email?.trim();
    if (!email) {
      setError("Sign in to fund your wallet.");
      return;
    }
    setProcessing(true);
    try {
      const res = await initializePaystackTransaction({
        data: {
          email,
          amountKobo: nairaToKobo(naira),
          reference: payRef,
          callbackUrl: getPaystackCallbackUrl(),
          metadata: {
            uid: sessionIdToUid(user?.id),
            purpose: "wallet_funding",
          },
        },
      });
      // Hand off to Paystack Checkout. Paystack redirects back to
      // /dashboard/wallet?reference=... which verifies and credits.
      window.location.href = res.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Top up</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">Fund Wallet</h2>
          </div>
          <button
            onClick={close}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

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
                setError(null);
              }}
              placeholder="0"
              min={PAYSTACK_MIN_AMOUNT_NAIRA}
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
                  setError(null);
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
                customActive ? "bg-coral text-white" : "bg-white text-ink/70 hover:bg-cream",
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
              Secure payment via Paystack. You&apos;ll be redirected to complete checkout.
            </p>
          </div>
          {testMode && (
            <p className="mt-2 text-[11px] font-bold leading-relaxed text-ink/50">
              Test mode — use card 4084 0840 8408 4081, any future expiry and CVV.
            </p>
          )}
          {!configured && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] font-bold leading-relaxed text-coral">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              Paystack keys are not configured yet — payments will fail until
              VITE_PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY are set.
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-coral/10 p-4 ring-1 ring-coral/20">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-coral" />
            <p className="text-xs font-bold leading-relaxed text-ink">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="mt-6 w-full"
          onClick={proceed}
          disabled={processing || !amount || Number(amount) <= 0}
        >
          {processing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Redirecting to Paystack…
            </>
          ) : (
            <>
              Proceed to payment <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

type CallbackState =
  | { phase: "verifying" }
  | { phase: "done"; amountKobo: number; alreadyCredited: boolean }
  | { phase: "error"; message: string };

export function DashboardWalletPage() {
  const { user } = useAuthSession();
  const uid = useMemo(() => sessionIdToUid(user?.id), [user?.id]);

  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<TxTab>("all");
  const [page, setPage] = useState(1);
  const [balanceKobo, setBalanceKobo] = useState(0);
  const [ledger, setLedger] = useState<LedgerTx[]>([]);
  const [callback, setCallback] = useState<CallbackState | null>(null);
  const [callbackRef, setCallbackRef] = useState<string | null>(null);
  const handledRef = useRef<string | null>(null);

  // Live wallet balance.
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        if (snap.exists()) {
          setBalanceKobo(Number(snap.data()?.["walletBalanceKobo"] ?? 0) || 0);
        }
      },
      () => {},
    );
    return () => unsub();
  }, [uid]);

  // Live wallet ledger (server-written, read-only to the client).
  useEffect(() => {
    if (!uid) {
      setLedger([]);
      return;
    }
    const q = query(
      collection(db, "users", uid, "walletTransactions"),
      orderBy("createdAt", "desc"),
      limit(25),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLedger(
          snap.docs.map((d) => {
            const data = d.data() as Record<string, unknown>;
            const amountKobo = Number(data["amountKobo"] ?? 0) || 0;
            const rawType = String(data["type"] ?? "");
            const type: TxType =
              rawType === "Ticket purchase"
                ? "Ticket purchase"
                : rawType === "Referral bonus"
                  ? "Referral bonus"
                  : "Wallet credit";
            return {
              id: d.id,
              date: toDisplayDate(data["createdAt"]) || toDisplayDate(data["paidAt"]),
              type,
              desc:
                String(data["desc"] ?? "") ||
                (type === "Wallet credit"
                  ? `Wallet top-up · ${String(data["reference"] ?? d.id)}`
                  : type),
              amountKobo,
              balanceKobo: Number(data["balanceAfterKobo"] ?? 0) || 0,
              ref: String(data["reference"] ?? d.id),
            };
          }),
        );
      },
      () => {},
    );
    return () => unsub();
  }, [uid]);

  const verifyReference = async (reference: string, ownerUid: string) => {
    setCallback({ phase: "verifying" });
    try {
      const res = await confirmWalletFunding({ data: { reference, uid: ownerUid } });
      if (res.ok) {
        setCallback({
          phase: "done",
          amountKobo: res.amountKobo,
          alreadyCredited: res.alreadyCredited,
        });
        const { logActivity } = await import("@/lib/activity-log");
        await logActivity({
          eventType: "WALLET_FUND",
          targetType: "wallet",
          targetId: reference,
          summary: `Funded wallet with ₦${(res.amountKobo / 100).toLocaleString("en-NG")}${res.alreadyCredited ? " (duplicate callback ignored)" : ""}`,
          details: { amountKobo: res.amountKobo, reference },
        }).catch(() => {});
      } else {
        setCallback({
          phase: "error",
          message:
            res.gatewayResponse ||
            (res.status === "abandoned"
              ? "Payment was not completed. No charge was made."
              : `Payment ${res.status}. No charge was made.`),
        });
      }
    } catch (err) {
      setCallback({
        phase: "error",
        message: err instanceof Error ? err.message : "Could not verify payment.",
      });
    }
  };

  // Handle return from Paystack Checkout (?reference= / ?trxref=).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reference = (params.get("reference") || params.get("trxref") || "").trim();
    if (!reference || handledRef.current === reference) return;
    if (!uid) return; // wait for session before consuming the callback
    handledRef.current = reference;
    setCallbackRef(reference);
    window.history.replaceState(null, "", window.location.pathname);
    void verifyReference(reference, uid);
  }, [uid]);

  const filtered = ledger.filter((t) => {
    if (tab === "all") return true;
    if (tab === "credits") return t.type === "Wallet credit";
    if (tab === "purchases") return t.type === "Ticket purchase";
    return t.type === "Referral bonus";
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Belt-and-braces kill-switch. The route's beforeLoad guard stops navigation,
  // but it can be bypassed (deep link already open when the flag flips, client
  // router cache, a stale tab). This guarantees the page never renders wallet UI.
  const [walletEnabled, setWalletEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchFeatureFlags()
      .then((f) => {
        if (!cancelled) setWalletEnabled(f["wallet"] !== false);
      })
      .catch(() => {
        if (!cancelled) setWalletEnabled(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (walletEnabled === false) {
    return (
      <DashboardAppShell
        title="Wallet"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Wallet" }]}
      >
        <div className="rounded-[24px] bg-white p-10 text-center ring-1 ring-ink/5">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Wallet funding is currently unavailable
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/55">
            Wallet top-ups have been turned off by the Raffila team. Competition entries are
            unaffected — you can still enter competitions and track your entries.
          </p>
        </div>
      </DashboardAppShell>
    );
  }

  return (
    <DashboardAppShell
      title="Wallet"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Wallet" }]}
    >
      <div className="space-y-6">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/60 -mt-3">
          Fund your wallet for competition entries. This balance is spend-only.
        </p>

        {callback?.phase === "verifying" && (
          <div className="flex items-center gap-3 rounded-[20px] bg-sky/15 p-4 ring-1 ring-sky/25">
            <Loader2 className="size-5 animate-spin text-ink" />
            <p className="text-sm font-extrabold text-ink">
              Confirming your payment with Paystack…
            </p>
          </div>
        )}

        {callback?.phase === "done" && (
          <div className="flex items-start gap-3 rounded-[20px] bg-mint/25 p-4 ring-1 ring-mint/40 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
                <Check className="size-5 text-coral" />
              </div>
              <div>
                <p className="font-display text-lg font-extrabold text-ink">
                  Wallet credited · {formatNaira(callback.amountKobo)}
                </p>
                <p className="text-xs font-bold text-ink/55">
                  {callback.alreadyCredited
                    ? "This payment was already added — duplicate ignored."
                    : "Ready to use for competition entries."}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCallback(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {callback?.phase === "error" && (
          <div className="flex items-start gap-3 rounded-[20px] bg-coral/10 p-4 ring-1 ring-coral/25 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 shrink-0 text-coral" />
              <div>
                <p className="font-display text-base font-extrabold text-ink">
                  Payment not completed
                </p>
                <p className="text-xs font-bold text-ink/60">{callback.message}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {callbackRef && uid && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void verifyReference(callbackRef, uid)}
                >
                  Retry
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setCallback(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Wallet balance
              </p>
              <p className="mt-3 break-all font-display text-[clamp(1.75rem,6vw,4.5rem)] font-extrabold leading-none tracking-tight text-ink">
                {formatNaira(balanceKobo)}
              </p>
              <p className="mt-3 max-w-md text-xs font-bold leading-relaxed text-ink/50">
                For entries only · No withdrawals
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto shrink-0"
            >
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
              text="Top up securely with card via Paystack."
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

        <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Wallet ledger
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">Transactions</h2>
            </div>
          </div>

          <div className="mt-5 inline-flex flex-wrap gap-1 rounded-2xl bg-cream p-1 ring-1 ring-ink/5">
            {(
              [
                ["all", "All transactions"],
                ["credits", "Credits"],
                ["purchases", "Purchases"],
                ["referrals", "Referral bonuses"],
              ] as Array<[TxTab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
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
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-2xl bg-coral/10">
                          <Wallet className="size-5 text-coral" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-ink">No transactions yet</p>
                          <p className="mt-1 text-xs font-bold text-ink/45">
                            Fund your wallet to start entering competitions
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visible.map((tx) => (
                    <tr key={tx.id} className="hover:bg-cream/40">
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50">
                        {tx.date || "—"}
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
                        <span className="mt-0.5 block font-mono text-[10px] font-bold text-ink/40">
                          {tx.ref}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-3 text-right font-display text-base font-extrabold",
                          tx.amountKobo >= 0 ? "text-mint" : "text-coral",
                        )}
                      >
                        {tx.amountKobo >= 0 ? "+" : "−"}
                        {formatNaira(Math.abs(tx.amountKobo))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-ink/70">
                        {formatNaira(tx.balanceKobo)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between pt-2">
            <p className="text-xs font-bold text-ink/45">
              Showing {visible.length} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <button className="grid size-9 place-items-center rounded-full bg-coral text-xs font-extrabold text-white">
                {safePage}
              </button>
              {safePage < totalPages && (
                <button
                  className="grid size-9 place-items-center rounded-full text-xs font-extrabold text-ink/50 hover:bg-cream"
                  onClick={() => setPage(safePage + 1)}
                >
                  {safePage + 1}
                </button>
              )}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs font-bold text-ink/40">
          Need help with a payment?{" "}
          <Link to="/contact" className="text-coral hover:underline">
            Contact support
          </Link>{" "}
          with your payment reference.
        </p>
      </div>

      <FundWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardAppShell>
  );
}
