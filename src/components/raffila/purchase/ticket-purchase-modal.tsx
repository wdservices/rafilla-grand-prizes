import { useEffect, useState } from "react";
import { X, Minus, Plus, Ticket, Clock, Flame, ShoppingCart, Zap, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatNaira, getProgress, trackEvent } from "@/lib/raffila-data";
import { useCompetitions, findCompetition } from "@/hooks/useCompetitions";
import { cn, formatNaira as formatNairaKobo } from "@/lib/utils";
import { addToCart, openCart, useCartItems } from "@/lib/cart-store";
import { OversellBanner } from "./checkout-banner";

const MAX_QTY = 50;

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
  const { competitions } = useCompetitions();
  const competition = findCompetition(competitions, competitionSlug);
  const maxQty = competition
    ? Math.max(1, Math.min(50, competition.totalEntries - competition.entriesSold))
    : 50;
  const safeInitial = Math.max(1, Math.min(maxQty, initialQuantity));
  const [qty, setQty] = useState<number>(safeInitial);
  const cart = useCartItems();
  const inCartQty = cart.find((it) => it.competitionSlug === competitionSlug)?.quantity ?? 0;

  useEffect(() => {
    if (open) {
      setQty(safeInitial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, competitionSlug]);

  if (!open || !competition) return null;

  const entryPriceKobo = competition.entryPrice;
  const subtotalKobo = entryPriceKobo * qty;
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

  const handleAddToCart = () => {
    addToCart(competitionSlug, qty);
    trackEvent("add_to_cart", { competition: competitionSlug, qty });
    // Close the modal and show the cart, otherwise the item is saved but the
    // visitor has no visible confirmation or route to checkout.
    onClose();
    setTimeout(() => openCart(), 50);
  };

  const handleBuyNow = () => {
    addToCart(competitionSlug, qty);
    trackEvent("checkout_start", { competition: competitionSlug, qty, express: true });
    onClose();
    setTimeout(() => openCart(), 50);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white ring-1 ring-ink/10 sm:rounded-[28px] mx-0 sm:mx-4 max-h-[92vh] sm:max-h-[90vh]"
        style={{ maxHeight: "92vh" }}
      >
        <button
          onClick={onClose}
          aria-label="Close ticket purchase"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-paper text-ink/50 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6 sm:px-6">
          <div className="space-y-5">
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
              <h3 className="font-display text-2xl font-extrabold text-ink">{competition.title}</h3>
              <p className="mt-1 text-sm font-bold text-ink/55">
                Prize value ·{" "}
                <span className="text-ink">{formatNaira(competition.prizeValueKobo)}</span> ·{" "}
                <span className="text-coral">{formatNaira(competition.entryPrice)} / ticket</span>
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
                <span className="text-coral">{formatNairaKobo(entryPriceKobo * qty)}</span>
              </div>
              {inCartQty > 0 && (
                <p className="mt-2 text-xs font-bold text-ink/50">
                  {inCartQty} ticket{inCartQty === 1 ? "" : "s"} for this competition already in
                  cart — adding more tops it up.
                </p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="size-4" /> Add to cart
              </Button>
              <Button variant="primary" size="lg" className="w-full" onClick={handleBuyNow}>
                <Zap className="size-4" /> Buy now · {formatNairaKobo(subtotalKobo)}
              </Button>
            </div>
            <p className="text-center text-[11px] font-bold leading-relaxed text-ink/50">
              One Paystack checkout covers your whole cart — tickets from every competition are
              confirmed together before the draw.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
