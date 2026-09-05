import { describe, it, expect } from "vitest";
import { applySort, competitions, type Competition, type SortKey } from "@/lib/rafilla-data";

const sample: Competition[] = [
  { ...competitions[0]!, slug: "a", title: "A", daysUntilClose: 30, entryPrice: 100000, entriesSold: 500, featured: false },
  { ...competitions[1]!, slug: "b", title: "B", daysUntilClose: 3, entryPrice: 50000, entriesSold: 9870, featured: false },
  { ...competitions[2]!, slug: "c", title: "C", daysUntilClose: 56, entryPrice: 500000, entriesSold: 2000, featured: true },
  { ...competitions[3]!, slug: "d", title: "D", daysUntilClose: 7, entryPrice: 25000, entriesSold: 150, featured: false },
];

describe("applySort helper (rafilla-data.ts)", () => {
  it("sorts by ending-soon: ascending daysUntilClose", () => {
    const result = applySort(sample, "ending-soon");
    const slugs = result.map((r) => r.slug);
    expect(slugs[0]).toBe("b");
    expect(slugs[1]).toBe("d");
    expect(slugs[2]).toBe("a");
    expect(slugs[3]).toBe("c");
  });

  it("sorts by newest: reverse of original order", () => {
    const original = [...sample];
    const result = applySort(sample, "newest");
    expect(result[0]!.slug).toBe(original[original.length - 1]!.slug);
    expect(result[result.length - 1]!.slug).toBe(original[0]!.slug);
  });

  it("sorts by price-asc: entryPrice ascending", () => {
    const result = applySort(sample, "price-asc");
    const prices = result.map((r) => r.entryPrice);
    expect(prices).toEqual([25000, 50000, 100000, 500000]);
  });

  it("sorts by price-desc: entryPrice descending", () => {
    const result = applySort(sample, "price-desc");
    const prices = result.map((r) => r.entryPrice);
    expect(prices).toEqual([500000, 100000, 50000, 25000]);
  });

  it("sorts by most-entries: entriesSold descending", () => {
    const result = applySort(sample, "most-entries");
    const entries = result.map((r) => r.entriesSold);
    expect(entries).toEqual([9870, 2000, 500, 150]);
  });

  it("sorts by featured-first: featured items first", () => {
    const result = applySort(sample, "featured-first");
    expect(result[0]!.slug).toBe("c");
    expect(result[0]!.featured).toBe(true);
  });

  it("does not mutate the original array identity", () => {
    const original = [...sample];
    const beforeSlugs = original.map((x) => x.slug).join(",");
    const result = applySort(original, "price-desc");
    const afterSlugs = original.map((x) => x.slug).join(",");
    expect(beforeSlugs).toBe(afterSlugs);
    expect(result).not.toBe(original);
  });

  it("handles empty array without error", () => {
    const result = applySort([], "ending-soon");
    expect(result).toEqual([]);
  });

  const allSortKeys: SortKey[] = ["ending-soon", "newest", "price-asc", "price-desc", "most-entries", "featured-first"];
  allSortKeys.forEach((key) => {
    it(`preserves same count for sort key "${key}"`, () => {
      const result = applySort(sample, key);
      expect(result.length).toBe(sample.length);
    });
  });
});
