import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

import { db } from "./firebase";

/**
 * One purchase line, flattened from users/{uid}/entries/{entryId}.
 * This is the authoritative record of who bought how many tickets for which
 * competition and at what value.
 */
export type EntryFact = {
  id: string;
  userId: string;
  entryId: string;
  competitionSlug: string;
  competitionTitle: string;
  competitionImage: string;
  quantity: number;
  amountKobo: number;
  ticketNumbers: string[];
  paystackReference: string | null;
  referralReference: string | null;
  status: string;
  createdAtMs: number;
};

export type EntryLoad = {
  entries: EntryFact[];
  /** Users whose entries were scanned. */
  scanned: number;
  /** True when the user cap was hit, so totals are partial. */
  truncated: boolean;
  error: string | null;
};

function toMs(v: unknown): number {
  try {
    const x = v as { toDate?: () => Date };
    if (x && typeof x.toDate === "function") return x.toDate().getTime();
  } catch {
    /* fall through */
  }
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v) {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

/**
 * Load every user's entries for admin reporting.
 *
 * Deliberately NOT a `collectionGroup` query: those require a Firestore index
 * with `collectionGroup: true`, which is not auto-created. Without that index
 * deployed the query throws FAILED_PRECONDITION, and a swallowed rejection
 * silently renders "0 tickets / ₦0" on the dashboard. Reading the per-user
 * subcollection uses the existing auto single-field indexes, needs no deploy
 * step, and matches how the users and fraud admin pages already read entries.
 */
export async function fetchAllEntries(
  opts: { maxUsers?: number; perUserLimit?: number; concurrency?: number } = {},
): Promise<EntryLoad> {
  const maxUsers = opts.maxUsers ?? 300;
  const perUserLimit = opts.perUserLimit ?? 50;
  const concurrency = opts.concurrency ?? 8;

  try {
    const usersSnap = await getDocs(query(collection(db, "users"), limit(maxUsers)));
    const userIds = usersSnap.docs.map((d) => d.id);
    const entries: EntryFact[] = [];

    // Bounded fan-out so a large user base cannot open hundreds of sockets.
    for (let i = 0; i < userIds.length; i += concurrency) {
      const batch = userIds.slice(i, i + concurrency);
      const results = await Promise.all(
        batch.map(async (uid) => {
          try {
            const snap = await getDocs(
              query(
                collection(db, "users", uid, "entries"),
                orderBy("createdAt", "desc"),
                limit(perUserLimit),
              ),
            );
            return { uid, snap };
          } catch {
            // A single unreadable user must not blank the whole report.
            return { uid, snap: null };
          }
        }),
      );
      for (const { uid, snap } of results) {
        if (!snap) continue;
        for (const d of snap.docs) {
          const v = d.data() as Record<string, unknown>;
          entries.push({
            id: d.id,
            userId: uid,
            entryId: String(v["entryId"] ?? d.id),
            competitionSlug: String(v["competitionSlug"] ?? ""),
            competitionTitle: String(v["competitionTitle"] ?? v["competitionSlug"] ?? "—"),
            competitionImage: String(v["competitionImage"] ?? ""),
            quantity: Number(v["quantity"] ?? 0) || 0,
            amountKobo: Number(v["amountKobo"] ?? 0) || 0,
            ticketNumbers: Array.isArray(v["ticketNumbers"])
              ? (v["ticketNumbers"] as unknown[]).map(String)
              : [],
            paystackReference: (v["paystackReference"] as string | null) ?? null,
            referralReference: (v["referralReference"] as string | null) ?? null,
            status: String(v["status"] ?? "CONFIRMED").toUpperCase(),
            createdAtMs: toMs(v["createdAt"]),
          });
        }
      }
    }

    return {
      entries,
      scanned: userIds.length,
      truncated: usersSnap.size >= maxUsers,
      error: null,
    };
  } catch (err) {
    return {
      entries: [],
      scanned: 0,
      truncated: false,
      error: err instanceof Error ? err.message : "Could not load entries.",
    };
  }
}
