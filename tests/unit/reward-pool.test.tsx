import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import {
  DEFAULT_REWARD_POOL_PCT,
  normalizeRewardPoolPct,
  rewardPoolContributionKobo,
} from "@/lib/paystack-server";

describe("reward pool — contribution math", () => {
  it("defaults to the configured 5% rate when nothing is stored", () => {
    expect(DEFAULT_REWARD_POOL_PCT).toBe(5);
    expect(normalizeRewardPoolPct(undefined)).toBe(5);
    expect(normalizeRewardPoolPct("abc")).toBe(5);
  });

  it("accepts admin-entered rates and clamps them to 0–100", () => {
    expect(normalizeRewardPoolPct("15")).toBe(15);
    expect(normalizeRewardPoolPct(15)).toBe(15);
    expect(normalizeRewardPoolPct(12.5)).toBe(12.5);
    expect(normalizeRewardPoolPct(0)).toBe(0);
    expect(normalizeRewardPoolPct(-3)).toBe(0);
    expect(normalizeRewardPoolPct(150)).toBe(100);
  });

  it("credits the percentage of the entry fee, in kobo", () => {
    // ₦10,000 entry line at the default 5% → ₦500 = 50,000 kobo.
    expect(rewardPoolContributionKobo(1_000_000, 5)).toBe(50_000);
    // At an admin-set 15% → ₦1,500 = 150,000 kobo.
    expect(rewardPoolContributionKobo(1_000_000, 15)).toBe(150_000);
    // A single ₦10,000 ticket (the wireless hair clipper order).
    expect(rewardPoolContributionKobo(1_000_000, 5)).toBe(50_000);
    expect(rewardPoolContributionKobo(3_000_000, 5)).toBe(150_000);
  });

  it("never credits on zero, negative, or invalid input", () => {
    expect(rewardPoolContributionKobo(0, 5)).toBe(0);
    expect(rewardPoolContributionKobo(-100, 5)).toBe(0);
    expect(rewardPoolContributionKobo(1_000_000, 0)).toBe(0);
    expect(rewardPoolContributionKobo(1_000_000, -1)).toBe(0);
    expect(rewardPoolContributionKobo(Number.NaN, 5)).toBe(0);
  });

  it("rounds to the nearest kobo", () => {
    expect(rewardPoolContributionKobo(333_333, 5)).toBe(16_667);
  });
});

type DocSnap = { exists: () => boolean; data: () => Record<string, unknown> | undefined };
const listeners: Array<{ path: string; next: (s: DocSnap) => void }> = [];

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db: unknown, ...parts: string[]) => ({ path: parts.join("/") })),
  onSnapshot: vi.fn((ref: { path: string }, next: (s: DocSnap) => void) => {
    listeners.push({ path: ref.path, next });
    return () => {};
  }),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children?: React.ReactNode }) => <a href="#">{children}</a>,
}));

vi.mock("@/components/raffila/dashboard/app-shell", () => ({
  DashboardAppShell: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

import { DashboardRewardPoolPage } from "@/components/raffila/dashboard/reward-pool";

const fire = (path: string, data: Record<string, unknown> | undefined) => {
  const l = listeners.find((x) => x.path === path);
  if (!l) throw new Error(`no listener registered for ${path}`);
  act(() => {
    l.next({ exists: () => data !== undefined, data: () => data });
  });
};

/**
 * Regression: the pool amount was the static REWARD_POOL constant (always
 * ₦0) — no Firestore read existed, so accrued contributions could never
 * show. The page must render the live platformSettings/rewardPool balance
 * and the admin-configured contribution rate.
 */
describe("reward pool page — live Firestore value", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listeners.length = 0;
  });

  it("renders the accrued balance and contribution rate from Firestore", () => {
    render(<DashboardRewardPoolPage />);
    fire("platformSettings/rewardPool", {
      totalKobo: 2_500_000,
      label: "Current reward pool",
    });
    fire("platformSettings/raffila_config", { rewardPool: { contributionPct: 15 } });

    expect(screen.getByText("₦25,000")).toBeTruthy();
    expect(screen.getByText(/Funded by 15% of every entry/)).toBeTruthy();
  });

  it("falls back to ₦0 (not a crash) when the pool doc is missing", () => {
    render(<DashboardRewardPoolPage />);
    fire("platformSettings/rewardPool", undefined);
    fire("platformSettings/raffila_config", undefined);

    expect(screen.getByText("₦0")).toBeTruthy();
    expect(screen.getByText(/Funded by 5% of every entry/)).toBeTruthy();
  });
});
