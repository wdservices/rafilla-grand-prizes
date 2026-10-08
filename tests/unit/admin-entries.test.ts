import { beforeEach, describe, expect, it, vi } from "vitest";

const getDocs = vi.fn();
const collection = vi.fn();
const query = vi.fn();
const orderBy = vi.fn();
const limit = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: (...a: unknown[]) => collection(...a),
  getDocs: (...a: unknown[]) => getDocs(...a),
  query: (...a: unknown[]) => query(...a),
  orderBy: (...a: unknown[]) => orderBy(...a),
  limit: (...a: unknown[]) => limit(...a),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

import { fetchAllEntries } from "@/lib/admin-entries";

const entry = (id: string, o: Partial<Record<string, unknown>> = {}) => ({
  id,
  data: () => ({
    entryId: id,
    competitionSlug: "wireless-hair-clipper",
    competitionTitle: "Wireless hair clipper",
    quantity: 1,
    amountKobo: 10000,
    ticketNumbers: ["000001"],
    paystackReference: "RF-CART-1",
    referralReference: null,
    status: "CONFIRMED",
    createdAt: { toDate: () => new Date("2026-10-08T12:00:00Z") },
    ...o,
  }),
});

const snap = (docs: unknown[]) => ({ docs, empty: docs.length === 0, size: docs.length });

/** Path of the collection a query targets, e.g. "users" or "users/u1/entries". */
const pathOf = (q: unknown): string => {
  const col = (q as { __parts: Array<{ __args: unknown[] }> }).__parts[0]!;
  return col.__args.slice(1).join("/");
};

/**
 * Regression: the dashboard read totals through a `collectionGroup` query,
 * which needs a Firestore index with collectionGroup:true. That index is not
 * auto-created, so the query threw FAILED_PRECONDITION and the swallowed
 * rejection rendered "0 tickets / N0". These tests pin the per-user path that
 * works on the existing auto indexes.
 */
describe("fetchAllEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockImplementation((n: number) => ({ __limit: n }));
    orderBy.mockImplementation((f: string) => ({ __orderBy: f }));
    query.mockImplementation((...parts: unknown[]) => ({ __parts: parts }));
    collection.mockImplementation((...args: unknown[]) => ({ __args: args }));
  });

  it("never issues a collectionGroup query (no index dependency)", async () => {
    getDocs.mockResolvedValue(snap([]));
    await fetchAllEntries();
    const argLists = collection.mock.calls.map((c) => c.slice(1) as unknown[]);
    expect(argLists.every((a) => !a.includes("collectionGroup"))).toBe(true);
    // Only "users" and "users/{uid}/entries" are read.
    expect(argLists.every((a) => a.length === 1 || (a.length === 3 && a[2] === "entries"))).toBe(
      true,
    );
  });

  it("sums quantities and revenue across every user's entries", async () => {
    getDocs.mockImplementation(async (q: { __parts: unknown[] }) => {
      const path = pathOf(q);
      if (path === "users") return snap([{ id: "u1" }, { id: "u2" }]);
      if (path.includes("u1/entries")) return snap([entry("A"), entry("B")]);
      if (path.includes("u2/entries")) return snap([entry("C")]);
      return snap([]);
    });

    const res = await fetchAllEntries();
    expect(res.error).toBeNull();
    expect(res.entries).toHaveLength(3);
    expect(res.entries.reduce((n, e) => n + e.quantity, 0)).toBe(3);
    expect(res.entries.reduce((n, e) => n + e.amountKobo, 0)).toBe(30000);
  });

  it("attributes each entry to the user that owns it", async () => {
    getDocs.mockImplementation(async (q: { __parts: unknown[] }) => {
      const path = pathOf(q);
      if (path === "users") return snap([{ id: "alice" }, { id: "bob" }]);
      if (path.includes("alice/entries")) return snap([entry("A")]);
      if (path.includes("bob/entries")) return snap([entry("B"), entry("C")]);
      return snap([]);
    });

    const res = await fetchAllEntries();
    expect(res.entries.map((e) => `${e.userId}:${e.entryId}`).sort()).toEqual([
      "alice:A",
      "bob:B",
      "bob:C",
    ]);
  });

  it("surfaces an error instead of silently reporting zero", async () => {
    getDocs.mockRejectedValue(new Error("permission-denied"));
    const res = await fetchAllEntries();
    expect(res.entries).toEqual([]);
    expect(res.error).toBe("permission-denied");
  });

  it("keeps other users readable when one user's read fails", async () => {
    getDocs.mockImplementation(async (q: { __parts: unknown[] }) => {
      const path = pathOf(q);
      if (path === "users") return snap([{ id: "ok" }, { id: "broken" }]);
      if (path.includes("broken/entries")) throw new Error("nope");
      return snap([entry("A")]);
    });

    const res = await fetchAllEntries();
    expect(res.entries).toHaveLength(1);
    expect(res.entries[0]?.userId).toBe("ok");
  });

  it("flags truncation when the user cap is reached", async () => {
    getDocs.mockImplementation(async (q: { __parts: unknown[] }) => {
      const path = pathOf(q);
      if (path === "users") return snap(Array.from({ length: 300 }, (_, i) => ({ id: `u${i}` })));
      return snap([]);
    });

    const res = await fetchAllEntries({ maxUsers: 300, perUserLimit: 5, concurrency: 20 });
    expect(res.truncated).toBe(true);
    expect(res.scanned).toBe(300);
  });
});
