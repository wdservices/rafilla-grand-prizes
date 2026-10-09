import { describe, expect, it } from "vitest";

import { buildCompetitionRows } from "@/components/raffila/admin/overview";

const entry = (o: {
  competitionSlug: string;
  quantity: number;
  amountKobo: number;
  isReferral?: boolean;
}) => ({
  competitionSlug: o.competitionSlug,
  competitionTitle: o.competitionSlug,
  quantity: o.quantity,
  amountKobo: o.amountKobo,
  isReferral: o.isReferral ?? false,
  createdAtMs: 0,
});

const comps = [
  {
    slug: "wireless-hair-clipper",
    title: "Clipper",
    entriesSold: 5,
    totalEntries: 500,
    entryPriceKobo: 10000,
  },
];

/**
 * Regression: revenue and tickets were accumulated through two interleaved
 * writes to the same map key. The first entry's revenue was overwritten by a
 * stale snapshot, so 3 + 1 + 1 tickets (N500) reported as N200 — the largest
 * single order's revenue vanished silently.
 */
describe("buildCompetitionRows", () => {
  it("sums every order for one competition, including the first", () => {
    const rows = buildCompetitionRows(
      [
        entry({ competitionSlug: "wireless-hair-clipper", quantity: 3, amountKobo: 30000 }),
        entry({ competitionSlug: "wireless-hair-clipper", quantity: 1, amountKobo: 10000 }),
        entry({ competitionSlug: "wireless-hair-clipper", quantity: 1, amountKobo: 10000 }),
      ],
      comps,
    );
    expect(rows[0]?.tickets).toBe(5);
    expect(rows[0]?.revenueKobo).toBe(50000);
  });

  it("keeps totals equal to the sum of amounts, whatever the order", () => {
    const orderA = entry({
      competitionSlug: "wireless-hair-clipper",
      quantity: 1,
      amountKobo: 10000,
    });
    const orderB = entry({
      competitionSlug: "wireless-hair-clipper",
      quantity: 3,
      amountKobo: 30000,
    });
    const orderC = entry({
      competitionSlug: "wireless-hair-clipper",
      quantity: 1,
      amountKobo: 10000,
    });
    const expected = orderA.amountKobo + orderB.amountKobo + orderC.amountKobo;
    // Every permutation must agree, so no entry can be dropped by ordering.
    const perms = [
      [orderA, orderB, orderC],
      [orderB, orderC, orderA],
      [orderC, orderA, orderB],
    ];
    for (const p of perms) {
      expect(buildCompetitionRows(p, comps)[0]?.revenueKobo).toBe(expected);
    }
  });

  it("counts a single order correctly", () => {
    const rows = buildCompetitionRows(
      [entry({ competitionSlug: "wireless-hair-clipper", quantity: 3, amountKobo: 30000 })],
      comps,
    );
    expect(rows[0]?.revenueKobo).toBe(30000);
  });

  it("splits revenue across competitions", () => {
    const rows = buildCompetitionRows(
      [
        entry({ competitionSlug: "wireless-hair-clipper", quantity: 3, amountKobo: 30000 }),
        entry({ competitionSlug: "lexus-rx-350", quantity: 1, amountKobo: 100000 }),
      ],
      [
        ...comps,
        {
          slug: "lexus-rx-350",
          title: "Lexus",
          entriesSold: 1,
          totalEntries: 5000,
          entryPriceKobo: 100000,
        },
      ],
    );
    expect(rows.find((r) => r.slug === "lexus-rx-350")?.revenueKobo).toBe(100000);
    expect(rows.find((r) => r.slug === "wireless-hair-clipper")?.revenueKobo).toBe(30000);
  });

  it("excludes referral orders from cash revenue but still counts tickets", () => {
    const rows = buildCompetitionRows(
      [
        entry({
          competitionSlug: "wireless-hair-clipper",
          quantity: 2,
          amountKobo: 20000,
          isReferral: true,
        }),
        entry({ competitionSlug: "wireless-hair-clipper", quantity: 1, amountKobo: 10000 }),
      ],
      comps,
    );
    expect(rows[0]?.tickets).toBe(3);
    expect(rows[0]?.revenueKobo).toBe(10000);
  });

  it("reports zero for a competition with no entries", () => {
    const rows = buildCompetitionRows([], comps);
    expect(rows[0]?.tickets).toBe(0);
    expect(rows[0]?.revenueKobo).toBe(0);
  });

  it("does not mutate the inputs", () => {
    const input = [
      entry({ competitionSlug: "wireless-hair-clipper", quantity: 2, amountKobo: 20000 }),
    ];
    const snapshot = JSON.stringify(input);
    buildCompetitionRows(input, comps);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});
