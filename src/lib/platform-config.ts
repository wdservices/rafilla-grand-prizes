import { doc, getDoc } from "firebase/firestore";

import { db } from "./firebase";

export const PLATFORM_CONFIG_DOC_ID = "raffila_config";

/** Platform modules that can be toggled from Admin → Settings. */
export const FEATURE_META: Array<{
  key: string;
  label: string;
  description: string;
}> = [
  {
    key: "competitions",
    label: "Competitions",
    description: "Browse and enter prize competitions.",
  },
  {
    key: "wallet",
    label: "Wallet funding",
    description: "Top up wallet balance for entries.",
  },
  {
    key: "referrals",
    label: "Referrals",
    description: "Invite friends and earn commissions.",
  },
  {
    key: "rewardPool",
    label: "Reward pool",
    description: "Community reward pool leaderboard.",
  },
];

export const DEFAULT_FEATURES: Record<string, boolean> = {
  competitions: true,
  wallet: true,
  referrals: true,
  rewardPool: true,
};

/** User-dashboard nav label → feature key. Labels without a key are always shown. */
export const NAV_FEATURE_KEY: Record<string, string> = {
  Competitions: "competitions",
  Wallet: "wallet",
  Referrals: "referrals",
  "Reward pool": "rewardPool",
};

/**
 * Read live feature flags from Firestore (`platformSettings/raffila_config`
 * → `features`). Missing doc/keys fall back to enabled. Never throws.
 */
export async function fetchFeatureFlags(): Promise<Record<string, boolean>> {
  try {
    const snap = await getDoc(doc(db, "platformSettings", PLATFORM_CONFIG_DOC_ID));
    if (!snap.exists()) return { ...DEFAULT_FEATURES };
    const data = snap.data() as Record<string, unknown>;
    const stored = (data["features"] as Record<string, unknown> | undefined) ?? {};
    const out: Record<string, boolean> = { ...DEFAULT_FEATURES };
    for (const { key } of FEATURE_META) {
      if (typeof stored[key] === "boolean") out[key] = stored[key] as boolean;
    }
    return out;
  } catch {
    return { ...DEFAULT_FEATURES };
  }
}
