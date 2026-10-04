import { describe, expect, it } from "vitest";

import {
  generatePaystackReference,
  koboToNaira,
  nairaToKobo,
  parseAmountNaira,
  PAYSTACK_MIN_AMOUNT_NAIRA,
} from "@/lib/paystack";

describe("paystack helpers", () => {
  it("converts naira to kobo without float drift", () => {
    expect(nairaToKobo(25000)).toBe(2500000);
    expect(nairaToKobo(99.99)).toBe(9999);
    expect(nairaToKobo(0)).toBe(0);
    expect(nairaToKobo(-5)).toBe(0);
    expect(nairaToKobo(Number.NaN)).toBe(0);
  });

  it("converts kobo back to naira", () => {
    expect(koboToNaira(2500000)).toBe(25000);
  });

  it("parses user-typed amounts safely", () => {
    expect(parseAmountNaira("25000")).toBe(25000);
    expect(parseAmountNaira("25000.99")).toBe(25000);
    expect(parseAmountNaira("abc")).toBe(0);
    expect(parseAmountNaira("")).toBe(0);
  });

  it("generates unique references with the RF prefix", () => {
    const a = generatePaystackReference();
    const b = generatePaystackReference();
    expect(a).toMatch(/^RF-[A-Z0-9]{8}$/);
    expect(b).toMatch(/^RF-[A-Z0-9]{8}$/);
    expect(a).not.toBe(b);
  });

  it("enforces a sane minimum amount", () => {
    expect(PAYSTACK_MIN_AMOUNT_NAIRA).toBeGreaterThanOrEqual(100);
  });
});
