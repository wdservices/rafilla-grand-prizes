import { describe, it, expect } from "vitest";
import { docToCompetition } from "@/lib/competitions-feed";

/**
 * A competition saved as a draft must never appear on any public surface, and
 * every other status must. Getting this wrong is how "Competition unavailable"
 * happens on a listing the operator believes is live.
 */
describe("docToCompetition — public visibility by status", () => {
  const base = {
    slug: "wireless-hair-clipper",
    title: "Wireless hair clipper",
    category: "Electronics",
    entryPrice: 100000,
    totalEntries: 100,
    closes: new Date(Date.now() + 86400000 * 5).toISOString(),
  };

  const publicStatuses = ["LIVE", "SCHEDULED", "UPCOMING", "CLOSING SOON", "COMPLETED", "live"];

  for (const status of publicStatuses) {
    it(`exposes status ${status} to the public`, () => {
      const c = docToCompetition("doc-1", { ...base, status }, 0);
      expect(c).not.toBeNull();
      expect(c!.slug).toBe("wireless-hair-clipper");
    });
  }

  for (const status of ["DRAFT", "draft", "CANCELLED", "cancelled"]) {
    it(`hides status ${status} from the public`, () => {
      expect(docToCompetition("doc-1", { ...base, status }, 0)).toBeNull();
    });
  }

  it("includes drafts for the admin view only", () => {
    const c = docToCompetition("doc-1", { ...base, status: "DRAFT" }, 0, true);
    expect(c).not.toBeNull();
    expect(c!.slug).toBe("wireless-hair-clipper");
  });

  it("falls back to the document ID when the slug field is missing", () => {
    const { slug: _drop, ...noSlug } = base;
    const c = docToCompetition("doc-abc", noSlug as Record<string, unknown>, 0);
    expect(c!.slug).toBe("doc-abc");
  });

  it("defaults a missing status to LIVE so listings are not silently hidden", () => {
    const c = docToCompetition("doc-1", base, 0);
    expect(c).not.toBeNull();
    expect(c!.status).toBe("LIVE");
  });
});
