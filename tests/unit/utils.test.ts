import { describe, it, expect } from "vitest";
import { formatNaira } from "@/lib/utils";

describe("formatNaira (utils.ts)", () => {
  it("formats zero kobo as ₦0", () => {
    expect(formatNaira(0)).toBe("₦0");
  });

  it("formats 15000 kobo (₦150) correctly", () => {
    expect(formatNaira(15000)).toBe("₦150");
  });

  it("formats 100000 kobo (₦1,000) with thousand separator", () => {
    expect(formatNaira(100000)).toBe("₦1,000");
  });

  it("formats 45000000 kobo (₦450,000) correctly", () => {
    expect(formatNaira(45000000)).toBe("₦450,000");
  });

  it("handles large amounts with decimals: 1243892050 kobo → ₦12,438,920.50 → rounded to integer display", () => {
    const result = formatNaira(1243892050);
    expect(result).toContain("12,438,921");
    expect(result.startsWith("₦")).toBe(true);
  });

  it("formats negative amounts correctly: -50000 kobo → includes minus and ₦", () => {
    const result = formatNaira(-50000);
    expect(result).toContain("-");
    expect(result).toContain("₦");
    expect(result).toContain("500");
  });

  it("handles undefined input gracefully as NaN → falls back to ₦0-like", () => {
    const result = formatNaira(undefined as unknown as number);
    expect(typeof result).toBe("string");
    expect(result.startsWith("₦")).toBe(true);
  });

  it("handles null input gracefully as NaN → string currency", () => {
    const result = formatNaira(null as unknown as number);
    expect(typeof result).toBe("string");
    expect(result.startsWith("₦")).toBe(true);
  });

  it("handles NaN input gracefully → string currency", () => {
    const result = formatNaira(NaN);
    expect(typeof result).toBe("string");
    expect(result.startsWith("₦")).toBe(true);
  });
});
