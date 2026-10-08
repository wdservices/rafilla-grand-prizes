import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Copy, Loader2, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/raffila-data";
import { confirmTicketPurchase, type IssuedTicketLine } from "@/lib/paystack-server";
import { clearCart } from "@/lib/cart-store";

const canonicalBase = "https://raffila.com";

type State =
  | { phase: "verifying" }
  | {
      phase: "done";
      items: IssuedTicketLine[];
      amountKobo: number;
      alreadyConfirmed: boolean;
    }
  | { phase: "error"; message: string };

export function PaymentCallbackPage() {
  const [state, setState] = useState<State | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const handledRef = useRef<string | null>(null);

  const runConfirm = async (ref: string) => {
    setState({ phase: "verifying" });
    try {
      const res = await confirmTicketPurchase({ data: { reference: ref } });
      if (res.ok) {
        // Tickets are confirmed and issued, so the cart has served its purpose.
        // The Paystack path redirects away from the drawer and never cleared it,
        // leaving already-purchased tickets sitting in the cart to be bought
        // again. Only clear on success — a failed/abandoned payment must keep
        // the cart so the buyer can retry.
        clearCart();
        setState({
          phase: "done",
          items: res.items,
          amountKobo: res.amountKobo,
          alreadyConfirmed: res.alreadyConfirmed,
        });
      } else {
        setState({
          phase: "error",
          message:
            res.gatewayResponse ||
            (res.status === "abandoned"
              ? "Payment was not completed. No charge was made."
              : `Payment ${res.status}. No tickets were issued and no charge was kept.`),
        });
      }
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Could not confirm payment.",
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get("reference") || params.get("trxref") || "").trim();
    if (!ref || handledRef.current === ref) return;
    handledRef.current = ref;
    setReference(ref);
    window.history.replaceState(null, "", window.location.pathname);
    void runConfirm(ref);
  }, []);

  const totalTickets =
    state?.phase === "done" ? state.items.reduce((n, i) => n + i.quantity, 0) : 0;

  return (
    <div className="min-h-screen bg-cream px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-10">
        <p className="text-center text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
          Raffila · Payment confirmation
        </p>

        {(!state || state.phase === "verifying") && (
          <div className="mt-8 text-center">
            <Loader2 className="mx-auto size-12 animate-spin text-coral" />
            <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm font-bold text-ink/55">
              Verifying with Paystack and issuing your draw tickets. Do not close this page.
            </p>
          </div>
        )}

        {state?.phase === "done" && (
          <div className="mt-8 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/30">
              <CheckCircle2 className="size-10 text-mint" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold text-ink">You&apos;re in!</h1>
            <p className="mt-2 text-sm font-bold text-ink/60">
              {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"} across {state.items.length}{" "}
              competition{state.items.length === 1 ? "" : "s"} · {formatNaira(state.amountKobo)}{" "}
              paid · checked in for the draw{state.items.length === 1 ? "" : "s"}
            </p>
            {state.alreadyConfirmed && (
              <p className="mt-1 text-xs font-bold text-ink/45">
                This payment was already confirmed — showing your existing tickets.
              </p>
            )}
            <div className="mt-6 space-y-3 text-left">
              {state.items.map((item) => (
                <div key={item.entryId} className="rounded-2xl bg-paper p-4 ring-1 ring-ink/5">
                  <div className="flex items-center gap-3">
                    {item.competitionImage ? (
                      <img
                        src={item.competitionImage}
                        alt=""
                        className="size-12 shrink-0 rounded-xl object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-cream">
                        <Ticket className="size-5 text-coral" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-extrabold text-ink">
                        {item.competitionTitle}
                      </p>
                      <p className="font-mono text-[11px] font-bold text-ink/45">{item.entryId}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(item.entryId).catch(() => {})}
                      className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-ink/50 ring-1 ring-ink/10 hover:text-coral"
                      aria-label={`Copy entry ID for ${item.competitionTitle}`}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
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
            <div className="mt-6 grid gap-3">
              <Button asChild variant="primary" size="lg" className="w-full">
                <Link to="/dashboard/entries">
                  View My Entries <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/competitions">Back to competitions</Link>
              </Button>
            </div>
          </div>
        )}

        {state?.phase === "error" && (
          <div className="mt-8 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-coral/10">
              <AlertTriangle className="size-10 text-coral" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">
              Payment not confirmed
            </h1>
            <p className="mt-2 text-sm font-bold text-ink/60">{state.message}</p>
            {reference && (
              <p className="mt-2 font-mono text-[11px] font-bold text-ink/40">
                Reference: {reference}
              </p>
            )}
            <div className="mt-6 grid gap-3">
              {reference && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => void runConfirm(reference)}
                >
                  Retry confirmation
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/competitions">Back to competitions</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full">
                <Link to="/contact">Contact support</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/payment/callback")({
  head: () => ({
    meta: [
      { title: "Confirming payment — Raffila" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Confirming payment — Raffila" },
      { property: "og:url", content: `${canonicalBase}/payment/callback` },
    ],
    links: [{ rel: "canonical", href: `${canonicalBase}/payment/callback` }],
  }),
  component: PaymentCallbackPage,
});
