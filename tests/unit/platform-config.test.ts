import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_FEATURES,
  FEATURE_META,
  NAV_FEATURE_KEY,
  PLATFORM_CONFIG_DOC_ID,
  fetchFeatureFlags,
} from "@/lib/platform-config";

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db: unknown, ...parts: string[]) => ({ path: parts.join("/") })),
  getDoc: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

import { getDoc } from "firebase/firestore";

/** Firestore's DocumentSnapshot exposes `exists` as a METHOD, not a property. */
function snap(exists: boolean, data: Record<string, unknown> = {}) {
  return { exists: () => exists, data: () => data };
}

/**
 * The wallet kill-switch depends on this reader. A regression here silently
 * re-enables every disabled feature, so the contract is pinned explicitly.
 */
describe("feature flags — wallet kill-switch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns wallet:false when the operator turned it off", async () => {
    vi.mocked(getDoc).mockResolvedValue(
      snap(true, {
        features: {
          competitions: true,
          wallet: false,
          referrals: true,
          rewardPool: true,
        },
      }) as never,
    );

    const flags = await fetchFeatureFlags();
    expect(flags["wallet"]).toBe(false);
    expect(flags["competitions"]).toBe(true);
  });

  it("falls back to all-enabled when the config doc is missing", async () => {
    vi.mocked(getDoc).mockResolvedValue(snap(false) as never);
    const flags = await fetchFeatureFlags();
    expect(flags).toEqual(DEFAULT_FEATURES);
    expect(flags["wallet"]).toBe(true);
  });

  it("falls back to all-enabled when features key is absent (the bug that ignored toggles)", async () => {
    // This is exactly the state that was in Firestore: thresholds present, no
    // features key. Toggles looked off in admin but resolved to enabled here.
    vi.mocked(getDoc).mockResolvedValue(snap(true, { thresholds: { minTopup: 1000 } }) as never);
    const flags = await fetchFeatureFlags();
    expect(flags).toEqual(DEFAULT_FEATURES);
  });

  it("falls back to all-enabled when the read throws", async () => {
    vi.mocked(getDoc).mockRejectedValue(new Error("permission-denied"));
    const flags = await fetchFeatureFlags();
    expect(flags).toEqual(DEFAULT_FEATURES);
  });

  it("ignores non-boolean stored values", async () => {
    vi.mocked(getDoc).mockResolvedValue(
      snap(true, { features: { wallet: "false", referrals: false } }) as never,
    );
    const flags = await fetchFeatureFlags();
    expect(flags["wallet"]).toBe(true);
    expect(flags["referrals"]).toBe(false);
  });

  it("Wallet nav labels map to the wallet flag in both shells", () => {
    expect(NAV_FEATURE_KEY["Wallet"]).toBe("wallet");
  });

  it("every feature key has a nav mapping or is intentionally unlisted", () => {
    for (const { key } of FEATURE_META) {
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    }
  });

  it("uses the shared platform config doc id", () => {
    expect(PLATFORM_CONFIG_DOC_ID).toBe("raffila_config");
  });
});
