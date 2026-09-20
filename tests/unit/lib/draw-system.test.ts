import { describe, expect, it } from "vitest";

import {
  deriveDrawState,
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
