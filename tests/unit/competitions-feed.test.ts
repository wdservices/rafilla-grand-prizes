import { beforeEach, describe, expect, it, vi } from "vitest";

import { getLiveCompetitions } from "@/lib/competitions-feed";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  query: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

import { getDocs } from "firebase/firestore";

type FakeDoc = { id: string; data: () => Record<string, unknown> };

function snap(docs: FakeDoc[]) {
  return { docs };
}

function liveDoc(id: string, extra: Record<string, unknown> = {}): FakeDoc {
  return {
    id,
    data: () => ({
      slug: id,
      title: `Title ${id}`,
      status: "LIVE",
      entryPrice: 1000,
      totalEntries: 100,
      closes: new Date(Date.now() + 86400000 * 10).toISOString(),
      ...extra,
    }),
  };
}

/**
 * Contract: Firestore is the ONLY source of competitions. There is no
 * hardcoded catalogue, so a deleted document can never come back — not on
 * refresh, not on an empty read, and not on a failed read.
 */
describe("getLiveCompetitions — Firestore is the only source", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns exactly the DB documents", async () => {
    const dbIds = ["lexus-rx-350", "mercedes-benz-c-class-2025"];
    vi.mocked(getDocs).mockResolvedValue(snap(dbIds.map((id) => liveDoc(id))) as never);
    const res = await getLiveCompetitions();
    expect(res.live).toBe(true);
    expect(res.competitions.map((c) => c.slug).sort()).toEqual([...dbIds].sort());
    expect(res.competitions).toHaveLength(dbIds.length);
  });

  it("uses the document's slug field, falling back to its ID", async () => {
    vi.mocked(getDocs).mockResolvedValue(
      snap([liveDoc("doc-id-1", { slug: "real-slug" }), liveDoc("doc-id-2")]) as never,
    );
    const res = await getLiveCompetitions();
    expect(res.competitions.map((c) => c.slug)).toEqual(["real-slug", "doc-id-2"]);
  });

  it("reachable-but-empty DB resolves to empty (respects total deletion)", async () => {
    vi.mocked(getDocs).mockResolvedValue(snap([]) as never);
    const res = await getLiveCompetitions();
    expect(res.live).toBe(true);
    expect(res.competitions).toEqual([]);
  });

  it("failed read returns empty and reports live=false (never invents competitions)", async () => {
    vi.mocked(getDocs).mockRejectedValue(new Error("offline"));
    const res = await getLiveCompetitions();
    expect(res.live).toBe(false);
    expect(res.competitions).toEqual([]);
  });

  it("excludes DRAFT docs by default, includes them for admin view", async () => {
    const docs = [liveDoc("live-one"), liveDoc("draft-one", { status: "DRAFT" })];
    vi.mocked(getDocs).mockResolvedValue(snap(docs) as never);
    const pub = await getLiveCompetitions(false);
    expect(pub.competitions.map((c) => c.slug)).toEqual(["live-one"]);
    const admin = await getLiveCompetitions(true);
    expect(admin.competitions.map((c) => c.slug).sort()).toEqual(["draft-one", "live-one"]);
  });
});
