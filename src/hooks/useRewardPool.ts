import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { REWARD_POOL } from "@/lib/raffila-data";
import { DEFAULT_REWARD_POOL_PCT } from "@/lib/paystack-server";

export type RewardPoolState = {
  totalKobo: number;
  contributionPct: number;
  label: string;
  seasonLabel: string;
  tagline: string;
  updatedAt: string | null;
  loading: boolean;
};

const FALLBACK: RewardPoolState = {
  totalKobo: REWARD_POOL.totalKobo,
  contributionPct: DEFAULT_REWARD_POOL_PCT,
  label: REWARD_POOL.label,
  seasonLabel: REWARD_POOL.seasonLabel,
  tagline: REWARD_POOL.tagline,
  updatedAt: null,
  loading: true,
};

function normalizePct(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_REWARD_POOL_PCT;
  return Math.min(100, Math.max(0, n));
}

/**
 * Live reward-pool balance from Firestore (`platformSettings/rewardPool`),
 * with the admin-configured contribution rate from
 * `platformSettings/raffila_config.rewardPool.contributionPct`. Both docs are
 * public-read per firestore.rules, so this works signed-out (homepage) and
 * signed-in (dashboard) alike. Never throws — falls back to the static
 * defaults when the docs or listeners are unavailable.
 */
export function useRewardPool(): RewardPoolState {
  const [state, setState] = useState<RewardPoolState>(FALLBACK);
  const [pctRaw, setPctRaw] = useState<unknown>(undefined);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "platformSettings", "rewardPool"),
      (snap) => {
        const d = snap.exists() ? (snap.data() as Record<string, unknown>) : undefined;
        setState((prev) => ({
          totalKobo: d ? Number(d["totalKobo"] ?? 0) || 0 : FALLBACK.totalKobo,
          contributionPct: prev.contributionPct,
          label: d?.["label"] ? String(d["label"]) : FALLBACK.label,
          seasonLabel: d?.["seasonLabel"] ? String(d["seasonLabel"]) : FALLBACK.seasonLabel,
          tagline: d?.["tagline"] ? String(d["tagline"]) : FALLBACK.tagline,
          updatedAt: d?.["updatedAt"] ? String(d["updatedAt"]) : null,
          loading: false,
        }));
      },
      () => setState((prev) => ({ ...prev, loading: false })),
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "platformSettings", "raffila_config"),
      (snap) => {
        const cfg = snap.exists() ? (snap.data() as Record<string, unknown>) : undefined;
        setPctRaw((cfg?.["rewardPool"] as Record<string, unknown> | undefined)?.["contributionPct"]);
      },
      () => setPctRaw(undefined),
    );
    return unsub;
  }, []);

  return { ...state, contributionPct: normalizePct(pctRaw) };
}
