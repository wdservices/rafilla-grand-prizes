import { describe, it, expect } from "vitest";
import { getPasswordStrength } from "@/lib/password-strength";

describe("getPasswordStrength helper", () => {
  it("returns 0 (weak) for empty string", () => {
    expect(getPasswordStrength("")).toBe(0);
  });

  it("returns 0 for short length < 6", () => {
    expect(getPasswordStrength("abc")).toBe(0);
    expect(getPasswordStrength("12345")).toBe(0);
  });

  it("returns 0 for length <8 without uppercase or digit", () => {
    expect(getPasswordStrength("weakpass")).toBe(0);
    expect(getPasswordStrength("abcdefg")).toBe(0);
  });

  it("returns 1 (medium) for >=8 chars with upper + digit", () => {
    expect(getPasswordStrength("Password1")).toBe(1);
    expect(getPasswordStrength("Abcdefg1")).toBe(1);
  });

  it("returns 2 (strong) for >=10 chars with upper+lower+digit+symbol", () => {
    expect(getPasswordStrength("Passw0rd!s")).toBe(2);
    expect(getPasswordStrength("Abcdefgh1!")).toBe(2);
  });

  it("returns 3 (very strong) for >=12 chars with all + >=2 symbols", () => {
    expect(getPasswordStrength("Password12!!")).toBe(3);
    expect(getPasswordStrength("Abcdefgh12!@")).toBe(3);
    expect(getPasswordStrength("StrongP@ss1#2")).toBe(3);
  });

  it("returns 0 for all-lowercase long password without digit", () => {
    expect(getPasswordStrength("alllowercasepassword")).toBe(0);
  });

  it("returns 0 for symbols-only (no upper, no lower, no digit)", () => {
    expect(getPasswordStrength("!@#$%^&*()")).toBe(0);
  });

  it("returns exactly 0/1/2/3 (valid range)", () => {
    const cases = ["", "a", "Password1", "StrongP@ss1", "Abcdefgh12!@"];
    for (const c of cases) {
      const r = getPasswordStrength(c);
      expect([0, 1, 2, 3]).toContain(r);
    }
  });
});
