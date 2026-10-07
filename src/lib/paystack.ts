/**
 * Client-safe Paystack helpers.
 *
 * IMPORTANT: This module must never touch the secret key. The secret key
 * (PAYSTACK_SECRET_KEY) lives server-side only and is used by
 * `src/lib/paystack-server.ts` server functions.
 */

export const PAYSTACK_MIN_AMOUNT_NAIRA = 100;

/** Public key is safe to expose — it only identifies the merchant. */
export function getPaystackPublicKey(): string {
  const fromVite =
    typeof import.meta !== "undefined" ? import.meta.env?.["VITE_PAYSTACK_PUBLIC_KEY"] : "";
  const fromNode =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)?.["VITE_PAYSTACK_PUBLIC_KEY"]
      : "";
  return String(fromVite || fromNode || "").trim();
}

export function isPaystackConfigured(): boolean {
  const key = getPaystackPublicKey();
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
}

/** Naira (user-facing) → kobo (Paystack's smallest unit). */
export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira) || naira <= 0) return 0;
  return Math.round(naira * 100);
}

/** Kobo → naira display string. */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/** Unique wallet-funding reference, e.g. RF-7X2K9QAB. */
export function generatePaystackReference(prefix = "RF"): string {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, "0").slice(0, 8);
  return `${prefix}-${rand}`;
}

/**
 * URL Paystack redirects to after checkout. Defaults to the wallet page,
 * which handles `?reference=` verification on mount.
 */
export function getPaystackCallbackUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/dashboard/wallet`;
  }
  return "https://raffila.com/dashboard/wallet";
}

/**
 * URL Paystack redirects to after a DIRECT ticket purchase. The callback
 * page verifies the payment server-side and issues draw tickets —
 * no wallet involved.
 */
export function getTicketCallbackUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/payment/callback`;
  }
  return "https://raffila.com/payment/callback";
}

export function parseAmountNaira(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
}
