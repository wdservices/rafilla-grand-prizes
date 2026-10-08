import { beforeEach, describe, expect, it, vi } from "vitest";

const confirmTicketPurchase = vi.fn();

vi.mock("@/lib/paystack-server", () => ({
  confirmTicketPurchase: (...a: unknown[]) => confirmTicketPurchase(...a),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children?: unknown }) => children,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children?: unknown }) => children,
  createFileRoute: () => (opts: unknown) => opts,
}));

import { PaymentCallbackPage } from "@/routes/payment.callback";
import { clearCart, getCartItems } from "@/lib/cart-store";

/**
 * Regression: the Paystack checkout redirects away from the cart drawer and
 * came back to /payment/callback, where tickets are issued. Nothing cleared the
 * cart, so already-purchased tickets stayed in the cart to be bought again.
 */
describe("payment callback cart cleanup", () => {
  beforeEach(() => {
    confirmTicketPurchase.mockReset();
    getCartItems().forEach((it) => clearCart());
  });

  it("exposes the callback component for rendering", () => {
    // Guards against the test silently passing on a renamed export.
    expect(typeof PaymentCallbackPage).toBe("function");
  });

  it("clears the cart only when tickets are actually issued", async () => {
    const { render, waitFor, screen } = await import("@testing-library/react");
    // Seed a cart as if the buyer left it populated before redirecting.
    const { addToCart } = await import("@/lib/cart-store");
    addToCart("wireless-hair-clipper", 1);
    expect(getCartItems()).toHaveLength(1);

    confirmTicketPurchase.mockResolvedValue({
      ok: true,
      items: [
        {
          competitionSlug: "wireless-hair-clipper",
          competitionTitle: "Wireless hair clipper",
          competitionImage: "",
          quantity: 1,
          entryId: "RF-2026-TEST",
          ticketNumbers: ["123456"],
        },
      ],
      amountKobo: 10000,
      reference: "RF-CART-TEST",
      alreadyConfirmed: false,
    });

    const Component = PaymentCallbackPage;
    // jsdom has no location search; supply the Paystack reference.
    const original = window.location.search;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, search: "?reference=RF-CART-TEST" },
    });

    render(<Component />);
    await waitFor(() => expect(confirmTicketPurchase).toHaveBeenCalled());
    await waitFor(() => expect(getCartItems()).toHaveLength(0));

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, search: original },
    });
    void screen;
  });

  it("keeps the cart on a failed payment so the buyer can retry", async () => {
    const { render, waitFor } = await import("@testing-library/react");
    const { addToCart } = await import("@/lib/cart-store");
    addToCart("wireless-hair-clipper", 1);

    confirmTicketPurchase.mockResolvedValue({
      ok: false,
      status: "abandoned",
      gatewayResponse: "",
    });

    const Component = PaymentCallbackPage;
    const original = window.location.search;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, search: "?reference=RF-CART-FAIL" },
    });

    render(<Component />);
    await waitFor(() => expect(confirmTicketPurchase).toHaveBeenCalled());
    // Give any stray async clear a chance to land before asserting.
    await new Promise((r) => setTimeout(r, 50));
    expect(getCartItems()).toHaveLength(1);

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, search: original },
    });
  });
});
