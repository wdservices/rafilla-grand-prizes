import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Minus,
  Plus,
  Ticket,
  Wallet,
  Gift,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  Flame,
  Copy,
  Share2,
  ShieldCheck,
  Twitter,
  MessageCircle,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FundWalletModal } from "@/components/raffila/dashboard/wallet";
import { competitions, formatNaira, getProgress } from "@/lib/raffila-data";
import { cn, formatNaira as formatNairaKobo } from "@/lib/utils";
import { OversellBanner, ReservationTimeoutBar } from "./checkout-banner";

type Step = 1 | 2 | 3 | 4;
type PaymentSource = "wallet" | "referral";

const WALLET_BALANCE_KOBO = 45_000_000;
const REFERRAL_BALANCE_KOBO = 920_000;
const MAX_QTY = 50;
const RESERVATION_SECONDS = 300;

const stepLabels: Record<Step, string> = {
  1: "Enter",
  2: "Pay",
  3: "Confirm",
  4: "Success",
};

function generateRFIDs(count: number): string[] {
  return Array.from(
    { length: count },
    () =>
      "RF-2026-" +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase(),
  );
}

function generateTicketNumbers(count: number): string[] {
  return Array.from(
    { length: count },
    () => String(Math.floor(Math.random() * 900000) + 100000),
  );
}

function copyToClipboard(value: string, label = "Copied") {
  navigator.clipboard.writeText(value).then(() => {
    toast.success(label, {
      className: "!bg-mint/30 !text-ink !border-0 !ring-1 !ring-mint/40",
      icon: <Check className="size-4 text-mint" />,
    });
  });
}

export function TicketPurchaseModal({
  open,
  onClose,
  competitionSlug,
  initialQuantity = 1,
}: {
  open: boolean;
  onClose: () => void;
  competitionSlug: string;
  initialQuantity?: number;
}) {
  const competition = competitions.find((c) => c.slug === competitionSlug);
  const maxQty = competition
    ? Math.max(1, Math.min(50, competition.totalEntries - competition.entriesSold))
    : 50;
  const safeInitial = Math.max(1, Math.min(maxQty, initialQuantity));
  const [step, setStep] = useState<Step>(1);
  const [qty, setQty] = useState<number>(safeInitial);
  const [paymentSource, setPaymentSource] = useState<PaymentSource>("wallet");
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [reservationSeconds, setReservationSeconds] = useState(RESERVATION_SECONDS);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [rfids, setRfids] = useState<string[]>([]);
  const [ticketNumbers, setTicketNumbers] = useState<string[]>([]);
  const [fundOpen, setFundOpen] = useState(false);
  const [stepAnimKey, setStepAnimKey] = useState(0);

  useEffect(() => {
    if (step !== 3) return;
    setReservationSeconds(RESERVATION_SECONDS);
    const interval = setInterval(() => {
      setReservationSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step !== 4 || purchaseComplete) return;
    const ids = generateRFIDs(3);
    const tix = generateTicketNumbers(Math.min(qty, 5));
    setRfids(ids);
    setTicketNumbers(tix);
    const t = setTimeout(() => {
      setPurchaseComplete(true);
      toast.success("Added to entries", {
        className: "!bg-mint/30 !text-ink !border-0 !ring-1 !ring-mint/40",
        icon: <Check className="size-4 text-mint" />,
      });
    }, 1600);
    return () => clearTimeout(t);
  }, [step, qty, purchaseComplete]);

  useEffect(() => {
    if (open) {
      setStep(1);
      const q = competition
        ? Math.max(1, Math.min(50, competition.totalEntries - competition.entriesSold, initialQuantity))
        : Math.max(1, Math.min(50, initialQuantity));
      setQty(q);
      setAgreeChecked(false);
      setPurchaseComplete(false);
      setRfids([]);
      setTicketNumbers([]);
      setPaymentSource("wallet");
      setStepAnimKey((k) => k + 1);
    }
  }, [open, competitionSlug, initialQuantity, competition]);

  const entryPriceKobo = competition ? competition.entryPrice : 0;
  const subtotalKobo = entryPriceKobo * qty;
  const walletInsufficient = subtotalKobo > WALLET_BALANCE_KOBO;
  const referralInsufficient = subtotalKobo > REFERRAL_BALANCE_KOBO;
  const selectedInsufficient =
    paymentSource === "wallet" ? walletInsufficient : referralInsufficient;

  if (!open || !competition) return null;

  const progress = getProgress(competition);
  const remaining = competition.totalEntries - competition.entriesSold;
  const showOversell = remaining > 0 && remaining <= 500;

  const accentMap = {
    coral: { ring: "ring-coral/15", badge: "bg-coral/15 text-coral", progress: "bg-coral" },
    sky: { ring: "ring-sky/15", badge: "bg-sky/15 text-sky", progress: "bg-sky" },
    lemon: { ring: "ring-lemon/15", badge: "bg-lemon/15 text-ink", progress: "bg-lemon" },
    mint: { ring: "ring-mint/15", badge: "bg-mint/15 text-mint", progress: "bg-mint" },
    lilac: { ring: "ring-lilac/15", badge: "bg-lilac/15 text-lilac", progress: "bg-lilac" },
  } as const;
  const accent = accentMap[competition.accent];

  const quickQuantities = [1, 5, 10, 25, 50];

  const nextStep = (to: Step) => {
    setStep(to);
    setStepAnimKey((k) => k + 1);
  };

  const handleConfirmPurchase = () => {
    if (!agreeChecked) return;
    nextStep(4);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white ring-1 ring-ink/10 sm:rounded-[28px] mx-0 sm:mx-4 max-h-[92vh] sm:max-h-[90vh]"
          style={{ maxHeight: "92vh" }}
        >
          {step === 3 && (
            <ReservationTimeoutBar
              secondsRemaining={reservationSeconds}
              totalSeconds={RESERVATION_SECONDS}
            />
          )}
          <button
            onClick={onClose}
            aria-label="Close ticket purchase"
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-paper text-ink/50 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="border-b border-ink/10 px-4 pb-4 pt-6 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1 sm:gap-1.5">
                {(Object.keys(stepLabels) as unknown as Step[]).map((s) => {
                  const stepNum = Number(s) as Step;
                  const isActive = step >= stepNum;
                  return (
                    <div key={s} className="flex items-center gap-1 sm:gap-1.5">
                      <div
                        className={cn(
                          "grid size-7 place-items-center rounded-full font-display text-[11px] font-extrabold transition-colors sm:size-8 sm:text-xs",
                          isActive
                            ? "bg-coral text-white"
                            : "bg-cream text-ink/40 ring-1 ring-ink/10",
                        )}
                      >
                        {stepNum}
                      </div>
                      {stepNum < 4 && (
                        <div
                          className={cn(
                            "h-[2px] w-3 rounded-full transition-colors sm:w-6",
                            step > stepNum ? "bg-coral" : "bg-ink/10",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Step {step} · {stepLabels[step]}
              </p>
            </div>
          </div>

          <div
            key={stepAnimKey}
            className="raf-rise flex-1 overflow-y-auto px-4 pb-6 sm:px-6"
            style={{ animationDuration: "320ms" }}
          >
            {step === 1 && (
              <div className="space-y-5 pt-2">
                <div className={cn("h-36 overflow-hidden rounded-[22px]", accent.ring)}>
                  <img
                    src={competition.image}
                    alt={`${competition.title} prize`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <Badge className={cn("mb-2 border-0", accent.badge)} variant="secondary">
                    {competition.category}
                  </Badge>
                  <h3 className="font-display text-2xl font-extrabold text-ink">
                    {competition.title}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-ink/55">
                    Prize value · <span className="text-ink">{formatNaira(competition.prizeValueKobo)}</span> ·{" "}
                    <span className="text-coral">
                      {formatNaira(competition.entryPrice)} / ticket
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-[11px] font-extrabold text-ink/70 ring-1 ring-ink/5">
                    <Clock className="size-3.5 text-coral" />
                    Closes {competition.closes}
                  </div>
                  {competition.status === "CLOSING SOON" && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-coral/15 px-3 py-1.5 text-[11px] font-extrabold text-coral ring-1 ring-coral/20">
                      <Flame className="size-3.5" /> Closing soon
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/5">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-ink/45">
                    <span>Sales progress</span>
                    <span className="text-ink/70">{progress}% sold</span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                    <Progress value={progress} className={cn("h-full", accent.progress)} />
                  </div>
                </div>

                {showOversell && <OversellBanner remaining={remaining} progress={progress} />}

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-ink/45">
                    How many tickets?
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-white p-2 ring-1 ring-ink/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQty((v) => Math.max(1, v - 1))}
                      disabled={qty <= 1}
                      className="shrink-0 text-ink/70 disabled:opacity-40"
                      aria-label="Decrease ticket quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                      <Ticket className="h-5 w-5 shrink-0 text-coral" />
                      <span className="truncate font-display text-xl font-extrabold tabular-nums text-ink sm:text-3xl">
                        {`${qty} ticket${qty === 1 ? "" : "s"}`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQty((v) => Math.min(MAX_QTY, v + 1))}
                      disabled={qty >= MAX_QTY}
                      className="shrink-0 text-ink/70 disabled:opacity-40"
                      aria-label="Increase ticket quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickQuantities.map((n) => (
                    <button
                      key={n}
                      onClick={() => setQty(n)}
                      className={cn(
                        "min-w-[56px] rounded-full px-4 py-2 text-sm font-extrabold ring-1 transition-colors",
                        qty === n
                          ? "bg-coral text-white ring-coral/30"
                          : "bg-paper text-ink/70 ring-ink/10 hover:bg-cream",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/5">
                  <div className="flex items-center justify-between text-sm font-semibold text-ink/60">
                    <span>Ticket price</span>
                    <span>{formatNaira(competition.entryPrice)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm font-semibold text-ink/60">
                    <span>Quantity</span>
                    <span>× {qty}</span>
                  </div>
                  <Separator className="my-3 bg-ink/10" />
                  <div className="flex items-center justify-between font-display text-xl font-extrabold text-ink">
                    <span>Subtotal</span>
                    <span className="text-coral">
                      {formatNairaKobo(entryPriceKobo * qty)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-sky/15 px-4 py-3 ring-1 ring-sky/20">
                  <ShieldCheck className="size-5 shrink-0 text-sky" />
                  <p className="text-xs font-bold leading-relaxed text-ink/70">
                    <span className="font-extrabold text-ink">Limit {MAX_QTY} tickets</span> per
                    user. Only Wallet and Referral commissions are accepted.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => nextStep(2)}
                >
                  Next: Choose how to pay <ArrowRight className="size-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 pt-2">
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-ink">
                    Choose your payment source
                  </h3>
                  <p className="mt-1 text-sm font-bold text-ink/55">
                    Subtotal ·{" "}
                    <span className="font-display text-xl text-coral">
                      {formatNairaKobo(subtotalKobo)}
                    </span>{" "}
                    · {`${qty} ticket${qty === 1 ? "" : "s"}`}
                  </p>
                </div>

                <button
                  onClick={() => setPaymentSource("wallet")}
                  className={cn(
                    "relative w-full rounded-2xl p-4 text-left ring-1 transition-all",
                    paymentSource === "wallet"
                      ? "bg-mint/20 ring-mint/50 ring-2"
                      : walletInsufficient
                        ? "bg-paper/50 ring-ink/5 opacity-70"
                        : "bg-white ring-ink/10 hover:ring-ink/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-2xl",
                        paymentSource === "wallet"
                          ? "bg-mint/40 text-ink"
                          : "bg-sky/20 text-sky",
                      )}
                    >
                      <Wallet className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg font-extrabold text-ink">
                          Wallet balance
                        </p>
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded-full ring-1",
                            paymentSource === "wallet"
                              ? "bg-coral text-white ring-coral/30"
                              : "ring-ink/20",
                          )}
                        >
                          {paymentSource === "wallet" && (
                            <Check className="size-3.5" strokeWidth={3.5} />
                          )}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-ink/55">
                        Available · {formatNairaKobo(WALLET_BALANCE_KOBO)}
                      </p>
                      {walletInsufficient && (
                        <p className="mt-2 text-xs font-extrabold text-coral">
                          Insufficient wallet balance
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentSource("referral")}
                  className={cn(
                    "relative w-full rounded-2xl p-4 text-left ring-1 transition-all",
                    paymentSource === "referral"
                      ? "bg-mint/20 ring-mint/50 ring-2"
                      : referralInsufficient
                        ? "bg-paper/50 ring-ink/5 opacity-70"
                        : "bg-white ring-ink/10 hover:ring-ink/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-2xl",
                        paymentSource === "referral"
                          ? "bg-mint/40 text-ink"
                          : "bg-lemon/30 text-coral",
                      )}
                    >
                      <Gift className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg font-extrabold text-ink">
                          Referral earnings
                        </p>
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded-full ring-1",
                            paymentSource === "referral"
                              ? "bg-coral text-white ring-coral/30"
                              : "ring-ink/20",
                          )}
                        >
                          {paymentSource === "referral" && (
                            <Check className="size-3.5" strokeWidth={3.5} />
                          )}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-ink/55">
                        Available · {formatNairaKobo(REFERRAL_BALANCE_KOBO)}
                      </p>
                      {referralInsufficient && (
                        <p className="mt-2 text-xs font-extrabold text-coral">
                          Insufficient referral balance
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                {selectedInsufficient && (
                  <div className="rounded-2xl bg-coral/15 p-4 ring-1 ring-coral/30">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-8 place-items-center rounded-full bg-coral/25 text-coral">
                        <AlertTriangle className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-coral">Insufficient balance</p>
                        <p className="mt-1 text-xs font-bold text-ink/60">
                          You need {formatNairaKobo(subtotalKobo)} using your selected{" "}
                          {paymentSource === "wallet" ? "wallet" : "referral earnings"} balance.
                        </p>
                        <div className="mt-2 grid gap-2 text-[11px] font-bold text-ink/55">
                          <div className="flex items-center justify-between rounded-xl bg-white/50 px-2.5 py-1.5 ring-1 ring-ink/5">
                            <span>Wallet</span>
                            <span className={cn("font-extrabold", walletInsufficient ? "text-coral" : "text-ink")}>
                              {formatNairaKobo(WALLET_BALANCE_KOBO)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-xl bg-white/50 px-2.5 py-1.5 ring-1 ring-ink/5">
                            <span>Referrals</span>
                            <span className={cn("font-extrabold", referralInsufficient ? "text-coral" : "text-ink")}>
                              {formatNairaKobo(REFERRAL_BALANCE_KOBO)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="md"
                          className="mt-3"
                          onClick={() => setFundOpen(true)}
                        >
                          Fund wallet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    Payment info
                  </p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-ink/70">
                    <span className="font-extrabold text-ink">
                      Choose Wallet or Referrals to cover the full entry amount.
                    </span>{" "}
                    No card or bank debits are processed directly during checkout.
                  </p>
                </div>

                <div className="rounded-2xl bg-coral/20 p-4 ring-1 ring-coral/30">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-coral" />
                    <p className="text-sm font-extrabold leading-relaxed text-ink">
                      Your tickets will be reserved for 5 minutes after confirmation. If payment is
                      not completed within 5 minutes your reservation expires.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="lg" onClick={() => nextStep(1)}>
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={selectedInsufficient}
                    onClick={() => nextStep(3)}
                  >
                    Next: Confirm &amp; reserve <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 pt-2">
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-ink">
                    Confirm your entries
                  </h3>
                  <p className="mt-1 text-sm font-bold text-ink/55">
                    Review and complete your purchase
                  </p>
                </div>

                <div className="rounded-2xl bg-coral/15 p-4 ring-1 ring-coral/25">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-coral/25 text-coral">
                      <Clock className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Reservation expires in
                      </p>
                      <p className="font-display text-2xl font-extrabold tabular-nums text-coral">
                        {String(Math.floor(reservationSeconds / 60)).padStart(2, "0")}:
                        {String(reservationSeconds % 60).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                    <div
                      className="h-full rounded-full bg-coral transition-all"
                      style={{
                        width: `${Math.max(0, (reservationSeconds / RESERVATION_SECONDS) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/5">
                  <div className="flex items-center gap-3 p-4">
                    <img
                      src={competition.image}
                      alt={competition.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="size-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-extrabold text-ink">
                        {competition.title}
                      </p>
                      <p className="text-xs font-bold text-ink/55">{competition.category}</p>
                    </div>
                    <Badge
                      className={cn("border-0 shrink-0", accent.badge)}
                      variant="secondary"
                    >
                      {competition.status}
                    </Badge>
                  </div>
                  <Separator className="bg-ink/10" />
                  <div className="space-y-2 p-4 text-sm">
                    <div className="flex items-center justify-between font-bold text-ink/60">
                      <span>Quantity</span>
                      <span className="font-extrabold text-ink">{`${qty} ticket${qty === 1 ? "" : "s"}`}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-ink/60">
                      <span>Ticket price (ea)</span>
                      <span className="font-extrabold text-ink">
                        {formatNaira(competition.entryPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-ink/60">
                      <span>Payment source</span>
                      <span className="inline-flex items-center gap-1.5 font-extrabold text-ink">
                        {paymentSource === "wallet" && (
                          <>
                            <Wallet className="size-3.5 text-sky" /> Wallet
                          </>
                        )}
                        {paymentSource === "referral" && (
                          <>
                            <Gift className="size-3.5 text-coral" /> Referrals
                          </>
                        )}
                      </span>
                    </div>
                    <Separator className="my-2 bg-ink/10" />
                    <div className="flex items-center justify-between font-display text-xl font-extrabold text-ink">
                      <span>Total</span>
                      <span className="text-coral">{formatNairaKobo(subtotalKobo)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-lilac/20 p-4 ring-1 ring-lilac/20">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/50">
                    Preview ticket numbers
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {generateTicketNumbers(Math.min(qty, 5)).map((tn, i) => (
                      <span
                        key={i}
                        className="rounded-xl bg-paper px-3 py-1.5 font-display text-sm font-extrabold tabular-nums text-ink ring-1 ring-ink/10"
                      >
                        #{tn}
                      </span>
                    ))}
                    {qty > 5 && (
                      <span className="rounded-xl bg-paper px-3 py-1.5 text-xs font-extrabold text-ink/50 ring-1 ring-ink/10">
                        +{qty - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
                  <Checkbox
                    checked={agreeChecked}
                    onCheckedChange={(v) => setAgreeChecked(Boolean(v))}
                    className="mt-0.5 size-5 rounded-md data-[state=checked]:bg-coral data-[state=checked]:text-white data-[state=checked]:border-coral"
                  />
                  <p className="text-xs font-bold leading-relaxed text-ink/70">
                    I agree to the{" "}
                    <Link
                      to="/competition-rules"
                      className="font-extrabold text-coral underline underline-offset-2"
                    >
                      Competition Rules
                    </Link>{" "}
                    and understand that entry fees are non-refundable once a draw is scheduled.
                  </p>
                </label>

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" size="lg" onClick={() => nextStep(1)}>
                    <ArrowLeft className="size-4" /> Edit qty
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={!agreeChecked || reservationSeconds === 0}
                    onClick={handleConfirmPurchase}
                  >
                    Confirm &amp; complete purchase <CheckCircle className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 pt-2 pb-4 text-center">
                <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/30 raf-rise">
                  <CheckCircle className="size-10 text-mint" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                    Congratulations! 🎉
                  </h3>
                  <p className="mt-2 text-base font-bold text-ink/60">
                    Your {qty} {qty === 1 ? "entry is" : "entries are"} confirmed
                  </p>
                </div>

                <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/5 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                      Entry IDs
                    </p>
                    <p className="text-[11px] font-extrabold text-mint">
                      {purchaseComplete ? "Saved" : "Saving..."}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {rfids.map((id) => (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 ring-1 ring-ink/5"
                      >
                        <span className="font-display text-sm font-extrabold tabular-nums text-ink">
                          {id}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 min-w-0 rounded-full px-2 text-xs"
                          onClick={() => copyToClipboard(id, "Entry ID copied")}
                        >
                          <Copy className="size-3.5" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-lilac/20 p-4 ring-1 ring-lilac/20 text-left">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                    Your ticket numbers
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ticketNumbers.map((tn) => (
                      <span
                        key={tn}
                        className="rounded-xl bg-paper px-3 py-1.5 font-display text-sm font-extrabold tabular-nums text-ink ring-1 ring-ink/10"
                      >
                        #{tn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      const text = `I just entered to win ${competition.title} on Raffila! ${qty} tickets secured. 🎟️`;
                      copyToClipboard(text, "Message copied");
                    }}
                  >
                    <Share2 className="size-4" /> Copy share
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      const text = `I just entered to win ${competition.title} on Raffila!`;
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                        "_blank",
                      );
                    }}
                  >
                    <Twitter className="size-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      const text = `I just entered to win ${competition.title} on Raffila! ${qty} tickets secured. 🎟️`;
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(text)}`,
                        "_blank",
                      );
                    }}
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </Button>
                </div>

                <div className="grid gap-3 pt-1">
                  <Button
                    asChild
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={onClose}
                  >
                    <Link to="/dashboard/entries">
                      View all entries <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={onClose}
                  >
                    <Link to="/competitions">Back to competitions</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FundWalletModal open={fundOpen} onClose={() => setFundOpen(false)} />
    </>
  );
}

function AlertTriangleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
