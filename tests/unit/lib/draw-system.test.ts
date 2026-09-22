import { describe, expect, it } from "vitest";

import {
  deriveDrawState,
  isPaymentConfirmed,
  isTicketDocEligible,
  isTicketEligible,
  secureRandomInt,
} from "@/lib/draw-system";

describe("isTicketEligible", () => {
  it("accepts active/confirmed tickets", () => {
    expect(isTicketEligible("ACTIVE")).toBe(true);
    expect(isTicketEligible("CONFIRMED")).toBe(true);
    expect(isTicketEligible("PAID")).toBe(true);
    expect(isTicketEligible(undefined)).toBe(true);
  });

  it("rejects refunded/cancelled/void/fraud tickets", () => {
    for (const s of [
      "REFUNDED",
      "CANCELLED",
      "VOID",
      "VOIDED",
      "DISQUALIFIED",
      "FAILED",
      "PENDING",
      "FRAUD",
    ]) {
      expect(isTicketEligible(s)).toBe(false);
    }
  });
});

describe("isPaymentConfirmed", () => {
  it("accepts confirmed/paid/missing payment states", () => {
    expect(isPaymentConfirmed("CONFIRMED")).toBe(true);
    expect(isPaymentConfirmed("PAID")).toBe(true);
    expect(isPaymentConfirmed("SUCCESSFUL")).toBe(true);
    expect(isPaymentConfirmed(undefined)).toBe(true);
    expect(isPaymentConfirmed(null)).toBe(true);
    expect(isPaymentConfirmed("")).toBe(true);
  });

  it("rejects failed/pending/refunded/disputed payments", () => {
    for (const s of [
      "FAILED",
      "PENDING",
      "UNCONFIRMED",
      "REFUNDED",
      "REVERSED",
      "CANCELLED",
      "DISPUTED",
      "CHARGEBACK",
      "FRAUD",
    ]) {
      expect(isPaymentConfirmed(s)).toBe(false);
    }
  });
});

describe("isTicketDocEligible", () => {
  it("requires both status and payment to be clean", () => {
    expect(isTicketDocEligible({ status: "ACTIVE", paymentStatus: "CONFIRMED" })).toBe(true);
    expect(isTicketDocEligible({ status: "ACTIVE" })).toBe(true); // legacy: no payment field
    expect(isTicketDocEligible({ status: "ACTIVE", paymentStatus: "FAILED" })).toBe(false);
    expect(isTicketDocEligible({ status: "ACTIVE", paymentStatus: "PENDING" })).toBe(false);
    expect(isTicketDocEligible({ status: "ACTIVE", paymentStatus: "REFUNDED" })).toBe(false);
    expect(isTicketDocEligible({ status: "REFUNDED", paymentStatus: "CONFIRMED" })).toBe(false);
    expect(isTicketDocEligible({ status: "FRAUD", paymentStatus: "CONFIRMED" })).toBe(false);
  });
});

describe("secureRandomInt", () => {
  it("stays within bounds", () => {
    for (let i = 0; i < 200; i++) {
      const v = secureRandomInt(1000);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1000);
    }
  });

  it("returns 0 for bound 1", () => {
    expect(secureRandomInt(1)).toBe(0);
  });

  it("rejects invalid bounds", () => {
    expect(() => secureRandomInt(0)).toThrow();
    expect(() => secureRandomInt(-5)).toThrow();
  });
});

describe("deriveDrawState", () => {
  it("preserves DRAFT", () => {
    expect(deriveDrawState({ status: "DRAFT" }, null)).toBe("DRAFT");
  });

  it("transitions past-close LIVE to DRAW_READY", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(deriveDrawState({ status: "LIVE", closes: past }, null)).toBe("DRAW_READY");
  });

  it("keeps future-close LIVE", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(deriveDrawState({ status: "LIVE", closes: future }, null)).toBe("LIVE");
  });

  it("completed draw wins over flags", () => {
    expect(
      deriveDrawState(
        { status: "LIVE" },
        { status: "COMPLETED", winningTicketNumber: "123456" },
      ),
    ).toBe("WINNER_SELECTED");
  });

  it("rejects LIVE draw initiation state", () => {
    // LIVE without close date must not be treated as draw-ready
    expect(deriveDrawState({ status: "LIVE" }, null)).toBe("LIVE");
  });

  it("maps explicit DRAW_READY flag", () => {
    expect(deriveDrawState({ status: "DRAW_READY" }, null)).toBe("DRAW_READY");
  });

  it("maps in-progress draws", () => {
    expect(deriveDrawState({ status: "DRAW_IN_PROGRESS" }, null)).toBe("DRAW_IN_PROGRESS");
    expect(deriveDrawState({ status: "LIVE" }, { status: "IN_PROGRESS" })).toBe(
      "DRAW_IN_PROGRESS",
    );
  });

  it("recovers failed draws back to DRAW_READY", () => {
    expect(deriveDrawState({ status: "DRAW_READY" }, { status: "FAILED" })).toBe("DRAW_READY");
  });

  it("maps completed competition + completed draw to COMPLETED", () => {
    expect(
      deriveDrawState(
        { status: "COMPLETED" },
        { status: "COMPLETED", winningTicketNumber: "576090" },
      ),
    ).toBe("COMPLETED");
  });

  it("never offers a draw on DRAFT/SUSPENDED/CANCELLED", () => {
    expect(deriveDrawState({ status: "DRAFT" }, null)).toBe("DRAFT");
    expect(deriveDrawState({ status: "SUSPENDED" }, null)).toBe("SUSPENDED");
    expect(deriveDrawState({ status: "CANCELLED" }, null)).toBe("CANCELLED");
  });
});

describe("ticket weighting", () => {
  it("weights owners by ticket count (pool-level property)", () => {
    // 5 tickets: A x3, B x1, C x1 — selection over tickets gives A 3/5.
    const pool = [
      { userId: "A" },
      { userId: "A" },
      { userId: "A" },
      { userId: "B" },
      { userId: "C" },
    ];
    const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
    for (let i = 0; i < 5000; i++) {
      counts[pool[secureRandomInt(pool.length)]!.userId]!++;
    }
    // A should win roughly 60% (tolerance bands, not exact)
    expect(counts["A"]! / 5000).toBeGreaterThan(0.5);
    expect(counts["A"]! / 5000).toBeLessThan(0.7);
  });
});
