import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/health — server + payments status probe.
 *
 * Open it in a browser (https://your-domain/api/health) or call it from
 * uptime monitors. It reports readiness as booleans only — key VALUES are
 * never included in the response.
 */
async function readBuildId(): Promise<string | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    // Production layout: backend/build-info.json next to backend/server/.
    // Absent in dev and older deploys — that is fine, report null.
    const raw = await readFile(join(process.cwd(), "build-info.json"), "utf-8");
    const parsed = JSON.parse(raw) as { buildId?: unknown };
    return typeof parsed.buildId === "string" && parsed.buildId ? parsed.buildId : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const secret = (process.env["PAYSTACK_SECRET_KEY"] || "").trim();
        const paystackMode = secret.startsWith("sk_live_")
          ? "live"
          : secret.startsWith("sk_test_")
            ? "test"
            : "unset";

        let adminCredentialsSet = false;
        let adminProjectId: string | null = null;
        let firestore: "reachable" | "unreachable" | "unchecked" = "unchecked";
        try {
          // Server-only: dynamic import keeps firebase-admin out of any client code.
          const { getAdminDb, getAdminProjectId } = await import("@/lib/firebase-admin");
          const adminDb = getAdminDb();
          adminCredentialsSet = true;
          adminProjectId = getAdminProjectId();
          try {
            // One tiny read proves the credential works end-to-end.
            await adminDb.collection("platformSettings").limit(1).get();
            firestore = "reachable";
          } catch {
            firestore = "unreachable";
          }
        } catch {
          adminCredentialsSet = false;
          firestore = "unchecked";
        }

        const walletReady = paystackMode !== "unset" && firestore === "reachable";
        const problems: string[] = [];
        if (paystackMode === "unset") problems.push("PAYSTACK_SECRET_KEY is not set");
        if (!adminCredentialsSet) {
          problems.push("Firebase Admin credentials are not set");
        } else if (firestore !== "reachable") {
          problems.push("Firestore is unreachable with the Admin credential");
        }
        const body = {
          ok: walletReady,
          message:
            problems.length === 0
              ? "API running successfully"
              : `API error: ${problems.join("; ")}`,
          service: "rafilla-grand-prizes",
          buildId: await readBuildId(),
          time: new Date().toISOString(),
          node: process.version,
          paystack: { secretKeySet: paystackMode !== "unset", mode: paystackMode },
          firebaseAdmin: {
            credentialsSet: adminCredentialsSet,
            projectId: adminProjectId,
            firestore,
          },
          walletFunding: { ready: walletReady },
        };

        return new Response(JSON.stringify(body, null, 2), {
          status: walletReady ? 200 : 503,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
