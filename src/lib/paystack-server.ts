import { createServerFn } from "@tanstack/react-start";

const PAYSTACK_API_BASE = "https://api.paystack.co";

function getSecretKey(): string {
  const key = (typeof process !== "undefined" && process.env?.["PAYSTACK_SECRET_KEY"]) || "";
  return (key || "").trim();
}

type PaystackApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const secret = getSecretKey();
  if (!secret) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to .env (server only, no VITE_ prefix).",
    );
  }
  const res = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => null)) as PaystackApiResponse<T> | null;
  if (!res.ok || !body?.status) {
    throw new Error(body?.message || `Paystack request failed (${res.status})`);
  }
  return body.data;
}

export type InitializeInput = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
};

export type InitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

/**
 * Initialize a Paystack transaction and return the checkout URL.
 * Runs server-side so the secret key never reaches the browser.
 */
export const initializePaystackTransaction = createServerFn({ method: "POST" })
  .validator((input: InitializeInput) => input)
  .handler(async ({ data }): Promise<InitializeResult> => {
    const email = data.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) throw new Error("A valid email is required");
    if (!Number.isInteger(data.amountKobo) || data.amountKobo < 10000) {
      // Paystack minimum practical floor: ₦100 (10,000 kobo)
      throw new Error("Minimum funding amount is ₦100");
    }
    if (!data.reference || data.reference.length < 4) {
      throw new Error("A valid payment reference is required");
    }

    const payload = await paystackRequest<{
      authorization_url: string;
      access_code: string;
      reference: string;
    }>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email,
        amount: data.amountKobo,
        reference: data.reference,
        callback_url: data.callbackUrl,
        metadata: {
          purpose: "wallet_funding",
          ...(data.metadata ?? {}),
        },
      }),
    });

    return {
      authorizationUrl: payload.authorization_url,
      accessCode: payload.access_code,
      reference: payload.reference,
    };
  });

export type VerifyResult = {
  ok: boolean;
  status: string;
  reference: string;
  amountKobo: number;
  paidAt: string | null;
  email: string | null;
  gatewayResponse: string | null;
};

export type ConfirmInput = {
  reference: string;
  uid: string;
};

export type ConfirmResult =
  | {
      ok: true;
      amountKobo: number;
      balanceAfterKobo: number | null;
      alreadyCredited: boolean;
      paidAt: string | null;
    }
  | {
      ok: false;
      status: string;
      gatewayResponse: string | null;
    };

/**
 * Verify a Paystack transaction and credit the user's wallet in one atomic,
 * idempotent step. Runs entirely server-side with the Admin SDK (clients are
 * blocked from writing balances by Firestore rules).
 *
 * Idempotency: `processedPayments/{reference}` is created inside the same
 * Firestore transaction as the credit, so refreshes/retries and Paystack
 * replays can never double-credit.
 */
export const confirmWalletFunding = createServerFn({ method: "POST" })
  .validator((input: ConfirmInput) => input)
  .handler(async ({ data }): Promise<ConfirmResult> => {
    const reference = (data.reference || "").trim();
    const uid = (data.uid || "").trim();
    if (!reference) throw new Error("Transaction reference is required");
    if (!uid) throw new Error("You must be signed in to complete wallet funding");

    const txn = await paystackRequest<{
      status: string;
      reference: string;
      amount: number;
      paid_at: string | null;
      gateway_response: string | null;
      customer?: { email?: string } | null;
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);

    if (txn.status !== "success") {
      return { ok: false, status: txn.status, gatewayResponse: txn.gateway_response ?? null };
    }

    const amountKobo = Math.round(txn.amount);
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      throw new Error("Paystack returned an invalid amount");
    }

    // Server-only: dynamic import keeps firebase-admin out of the client bundle.
    const { getAdminDb, FieldValue } = await import("./firebase-admin");
    const adminDb = getAdminDb();

    const processedRef = adminDb.collection("processedPayments").doc(reference);
    const userRef = adminDb.collection("users").doc(uid);
    const ledgerRef = userRef.collection("walletTransactions").doc(reference);

    const outcome = await adminDb.runTransaction(async (tx) => {
      const processedSnap = await tx.get(processedRef);
      if (processedSnap.exists) {
        const prev = processedSnap.data();
        return {
          alreadyCredited: true,
          amountKobo: Number(prev?.["amountKobo"] ?? amountKobo) || amountKobo,
        };
      }

      const userSnap = await tx.get(userRef);
      const prevBalance = Number(userSnap.get("walletBalanceKobo") ?? 0) || 0;
      const nextBalance = prevBalance + amountKobo;
      const now = FieldValue.serverTimestamp();

      tx.set(userRef, { walletBalanceKobo: nextBalance, updatedAt: now }, { merge: true });
      tx.set(ledgerRef, {
        type: "Wallet credit",
        amountKobo,
        balanceAfterKobo: nextBalance,
        reference: txn.reference,
        provider: "paystack",
        email: txn.customer?.email ?? null,
        paidAt: txn.paid_at ?? null,
        createdAt: now,
      });
      tx.set(processedRef, {
        uid,
        amountKobo,
        email: txn.customer?.email ?? null,
        paidAt: txn.paid_at ?? null,
        createdAt: now,
      });

      return { alreadyCredited: false, amountKobo, balanceAfterKobo: nextBalance };
    });

    if (outcome.alreadyCredited) {
      // Re-read the balance so the client can display it.
      const userSnap = await userRef.get().catch(() => null);
      const balance = userSnap ? Number(userSnap.get("walletBalanceKobo") ?? 0) || 0 : 0;
      return {
        ok: true,
        amountKobo: outcome.amountKobo,
        balanceAfterKobo: balance,
        alreadyCredited: true,
        paidAt: txn.paid_at ?? null,
      };
    }

    return {
      ok: true,
      amountKobo: outcome.amountKobo,
      balanceAfterKobo: outcome.balanceAfterKobo ?? null,
      alreadyCredited: false,
      paidAt: txn.paid_at ?? null,
    };
  });

/**
 * Verify a transaction by reference. Only `success` counts as paid —
 * always gate wallet credit on `ok === true`.
 */
export const verifyPaystackTransaction = createServerFn({ method: "GET" })
  .validator((reference: string) => reference)
  .handler(async ({ data: reference }): Promise<VerifyResult> => {
    const ref = (reference || "").trim();
    if (!ref) throw new Error("Transaction reference is required");

    const txn = await paystackRequest<{
      status: string;
      reference: string;
      amount: number;
      paid_at: string | null;
      gateway_response: string | null;
      customer?: { email?: string } | null;
    }>(`/transaction/verify/${encodeURIComponent(ref)}`);

    const ok = txn.status === "success";
    return {
      ok,
      status: txn.status,
      reference: txn.reference,
      amountKobo: txn.amount,
      paidAt: txn.paid_at,
      email: txn.customer?.email ?? null,
      gatewayResponse: txn.gateway_response,
    };
  });
