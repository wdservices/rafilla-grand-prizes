import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Gift,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Ticket,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/raffila-data";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useCompetitions, isCompetitionConcluded } from "@/hooks/useCompetitions";
import {
  clearCart,
  closeCart,
  openCart,
  removeFromCart,
  resolveCartLines,
  setCartQty,
  useCartCount,
  useCartItems,
  useCartOpen,
  type CartLine,
} from "@/lib/cart-store";
import {
  confirmReferralPurchase,
  initializePaystackTransaction,
  type IssuedTicketLine,
} from "@/lib/paystack-server";
import { generatePaystackReference, getTicketCallbackUrl } from "@/lib/paystack";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type CheckoutMethod = "paystack" | "referral";

type SuccessState = {
  items: IssuedTicketLine[];
  amountKobo: number;
  reference: string;
  via: CheckoutMethod;
};

function sessionUid(id: string | undefined): string | null {
  if (!id) return null;
  return id.startsWith("firebase_") ? id.slice("firebase_".length) : id;
}

export function CartDrawer() {
  const open = useCartOpen();
  const cart = useCartItems();
  const { user } = useAuthSession();
  const { competitions } = useCompetitions();
  const uid = useMemo(() => sessionUid(user?.id), [user?.id]);

  const [method, setMethod] = useState<CheckoutMethod>("paystack");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [referralKobo, setReferralKobo] = useState<number | null>(null);

  const catalogue = useMemo(
    () =>
      competitions
        .filter((c) => !isCompetitionConcluded(c))
        .map((c) => ({
          slug: c.slug,
          title: c.title,
          entryPriceKobo: c.entryPrice,
          image: c.image,
          totalEntries: c.totalEntries,
          entriesSold: c.entriesSold,
        })),
    [competitions],
  );
  const { lines, subtotalKobo, totalQty } = useMemo(
    () => resolveCartLines(cart, catalogue),
    [cart, catalogue],
  );

  // Referral balance for the signed-in user (display only; server enforces).
  useEffect(() => {
    if (!uid) {
      setReferralKobo(null);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        if (snap.exists()) {
          setReferralKobo(Number(snap.data()?.["referralEarningsKobo"] ?? 0) || 0);
        } else {
          setReferralKobo(0);
        }
      },
      () => setReferralKobo(null),
    );
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(null);
      setProcessing(false);
    }
  }, [open]);

  if (!open) return null;

  const orderItems = lines.map((l) => ({
    competitionSlug: l.competitionSlug,
    quantity: l.quantity,
  }));
  const referralShort = referralKobo !== null && subtotalKobo > referralKobo;

  const checkoutPaystack = async () => {
    setError(null);
    const email = user?.email?.trim();
    if (!email || !uid) {
      setError("Sign in to complete your purchase.");
      return;
    }
    if (lines.length === 0) return;
    setProcessing(true);
    try {
      const res = await initializePaystackTransaction({
        data: {
          email,
          amountKobo: subtotalKobo,
          reference: generatePaystackReference("RF-CART"),
          callbackUrl: getTicketCallbackUrl(),
          metadata: {
            kind: "ticket_purchase",
            items: orderItems,
            uid,
            email,
            userName:
              [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Raffila Member",
            userHandle: user?.handle ?? "",
          },
        },
      });
      // /payment/callback verifies once and issues tickets for every line.
      window.location.href = res.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setProcessing(false);
    }
  };

  const checkoutReferral = async () => {
    setError(null);
    if (!uid) {
      setError("Sign in to complete your purchase.");
      return;
    }
    if (lines.length === 0) return;
    setProcessing(true);
    try {
      const res = await confirmReferralPurchase({
        data: { items: orderItems, uid, reference: generatePaystackReference("RF-REF") },
      });
      if (res.ok) {
        setSuccess({
          items: res.items,
          amountKobo: res.amountKobo,
          reference: res.reference,
          via: "referral",
        });
        clearCart();
        // Audit logging already happens server-side in issueOrderTickets (it
        // holds the admin credential). Logging again here produced two
        // TICKET_PURCHASE rows sharing one reference.
      } else {
        setError(res.gatewayResponse || "Referral payment failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Referral payment failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-label="Ticket cart">
      <div className="absolute inset-0 bg-ink/40" onClick={closeCart} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl ring-1 ring-ink/10">
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
              Your cart
            </p>
            <h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-extrabold text-ink">
              <ShoppingCart className="size-6 text-coral" />
              {totalQty} {totalQty === 1 ? "ticket" : "tickets"}
            </h2>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 sm:px-6">
          {success ? (
            <OrderSuccess
              success={success}
              onDone={() => {
                closeCart();
                setSuccess(null);
              }}
            />
          ) : lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-coral/10">
                <Ticket className="size-6 text-coral" />
              </div>
              <p className="font-display text-lg font-extrabold text-ink">Cart is empty</p>
              <p className="max-w-xs text-xs font-bold text-ink/50">
                Pick tickets from any competition — they gather here and you pay once.
              </p>
              <Button variant="primary" size="md" onClick={closeCart} asChild>
                <Link to="/competitions">Browse competitions</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line) => (
                <CartLineRow
                  key={line.competitionSlug}
                  line={line}
                  onQty={(q) => setCartQty(line.competitionSlug, q)}
                  onRemove={() => removeFromCart(line.competitionSlug)}
                />
              ))}

              <div className="rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
                <div className="flex items-center justify-between font-display text-xl font-extrabold text-ink">
                  <span>Total</span>
                  <span className="text-coral">{formatNaira(subtotalKobo)}</span>
                </div>
                <p className="mt-1 text-[11px] font-bold text-ink/50">
                  One payment for {lines.length} competition{lines.length === 1 ? "" : "s"} ·{" "}
                  {totalQty} {totalQty === 1 ? "ticket" : "tickets"}
                </p>
              </div>

              {!user ? (
                <div className="rounded-2xl bg-lemon/30 p-4 ring-1 ring-lemon/50">
                  <p className="text-sm font-extrabold text-ink">Sign in to check out</p>
                  <p className="mt-1 text-xs font-bold text-ink/60">
                    Your cart is saved — sign in and come back to pay.
                  </p>
                  <Button asChild variant="primary" size="md" className="mt-3 w-full">
                    <Link to="/auth">Sign in / Create account</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <MethodButton
                      active={method === "paystack"}
                      onClick={() => setMethod("paystack")}
                      icon={<CreditCard className="size-4" />}
                      title="Paystack"
                      sub="Card · Bank · USSD"
                    />
                    <MethodButton
                      active={method === "referral"}
                      onClick={() => setMethod("referral")}
                      icon={<Gift className="size-4" />}
                      title="Referrals"
                      sub={
                        referralKobo === null
                          ? "Checking balance…"
                          : `Available ${formatNaira(referralKobo)}`
                      }
                    />
                  </div>
                  {method === "referral" && referralShort && (
                    <p className="flex items-start gap-1.5 text-[11px] font-bold leading-relaxed text-coral">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      Referral balance ({formatNaira(referralKobo ?? 0)}) doesn&apos;t cover{" "}
                      {formatNaira(subtotalKobo)}. Pay with Paystack or remove tickets.
                    </p>
                  )}
                  {error && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-coral/10 p-4 ring-1 ring-coral/20">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-coral" />
                      <p className="text-xs font-bold leading-relaxed text-ink">{error}</p>
                    </div>
                  )}
                  {method === "paystack" ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={processing || lines.length === 0}
                      onClick={() => void checkoutPaystack()}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Redirecting to Paystack…
                        </>
                      ) : (
                        <>
                          Pay {formatNaira(subtotalKobo)} <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={processing || lines.length === 0 || referralShort}
                      onClick={() => void checkoutReferral()}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Confirming…
                        </>
                      ) : (
                        <>
                          Pay with referrals <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function MethodButton({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl p-3 text-left ring-2 transition-all",
        active ? "bg-mint/20 ring-mint/50" : "bg-white ring-ink/10 hover:ring-ink/20",
      )}
    >
      <span className="flex items-center gap-2 text-sm font-extrabold text-ink">
        <span className={cn(active ? "text-ink" : "text-coral")}>{icon}</span>
        {title}
        {active && <Check className="ml-auto size-4 text-coral" strokeWidth={3.5} />}
      </span>
      <span className="mt-1 block text-[11px] font-bold text-ink/55">{sub}</span>
    </button>
  );
}

function CartLineRow({
  line,
  onQty,
  onRemove,
}: {
  line: CartLine;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-paper p-3 ring-1 ring-ink/5">
      {line.image ? (
        <img
          src={line.image}
          alt=""
          className="size-16 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-cream">
          <Ticket className="size-6 text-coral" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-extrabold text-ink">{line.title}</p>
        <p className="text-[11px] font-bold text-ink/55">
          {formatNaira(line.entryPriceKobo)} / ticket
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white px-1 py-0.5 ring-1 ring-ink/10">
            <button
              aria-label="Decrease quantity"
              onClick={() => onQty(line.quantity - 1)}
              className="grid size-7 place-items-center rounded-full text-ink/70 hover:bg-cream"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-7 text-center font-display text-sm font-extrabold tabular-nums text-ink">
              {line.quantity}
            </span>
            <button
              aria-label="Increase quantity"
              onClick={() => onQty(line.quantity + 1)}
              className="grid size-7 place-items-center rounded-full text-ink/70 hover:bg-cream"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="font-display text-sm font-extrabold text-coral">
            {formatNaira(line.lineTotalKobo)}
          </p>
        </div>
        {typeof line.remaining === "number" && line.quantity >= line.remaining && (
          <p className="mt-1 text-[10px] font-bold text-coral">Only {line.remaining} left</p>
        )}
      </div>
      <button
        aria-label={`Remove ${line.title}`}
        onClick={onRemove}
        className="grid size-8 shrink-0 place-items-center self-start rounded-full text-ink/40 hover:bg-coral/10 hover:text-coral"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function OrderSuccess({ success, onDone }: { success: SuccessState; onDone: () => void }) {
  const totalTickets = success.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <div className="py-4 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint/30">
        <CheckCircle2 className="size-8 text-mint" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-extrabold text-ink">You&apos;re in!</h3>
      <p className="mt-1 text-sm font-bold text-ink/60">
        {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"} ·{" "}
        {formatNaira(success.amountKobo)} paid
        {success.via === "referral" ? " with referral earnings" : ""} · checked in for the draw
        {success.items.length === 1 ? "" : "s"}
      </p>
      <div className="mt-5 space-y-3 text-left">
        {success.items.map((item) => (
          <div key={item.entryId} className="rounded-2xl bg-paper p-4 ring-1 ring-ink/5">
            <p className="font-display text-sm font-extrabold text-ink">{item.competitionTitle}</p>
            <p className="mt-0.5 font-mono text-[11px] font-bold text-ink/45">{item.entryId}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.ticketNumbers.map((tn) => (
                <span
                  key={tn}
                  className="rounded-lg bg-white px-2 py-1 font-display text-xs font-extrabold tabular-nums text-ink ring-1 ring-ink/10"
                >
                  #{tn}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        <Button asChild variant="primary" size="lg" className="w-full" onClick={onDone}>
          <Link to="/dashboard/entries">
            View My Entries <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
