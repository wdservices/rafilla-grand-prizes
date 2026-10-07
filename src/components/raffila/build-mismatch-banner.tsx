import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Baked at build time by scripts/build-namecheap.ps1. Empty in dev. */
const CLIENT_BUILD_ID = String(
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_BUILD_ID"]) || "",
).trim();

/**
 * Detects a split-brain deploy (page HTML/JS from one build, Node server from
 * another) and says so in plain language instead of leaving dead buttons.
 * Renders nothing when the build is unstamped (dev) or both sides match.
 */
export function BuildMismatchBanner() {
  const [serverBuildId, setServerBuildId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!CLIENT_BUILD_ID) return;
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ buildId?: unknown }>)
      .then((d) => {
        if (!cancelled && typeof d?.buildId === "string" && d.buildId) {
          setServerBuildId(d.buildId);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_BUILD_ID || !serverBuildId || serverBuildId === CLIENT_BUILD_ID || dismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-2xl bg-ink p-4",
        "text-cream shadow-2xl ring-1 ring-cream/20",
      )}
    >
      <p className="font-display text-sm font-extrabold">Site update in progress</p>
      <p className="mt-1 text-xs font-bold leading-relaxed text-cream/75">
        The site and server are on different versions, so some buttons may not respond. Refresh in a
        minute to load the matching version.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="h-9 rounded-full bg-cream px-4 text-xs font-extrabold text-ink"
        >
          Refresh now
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="h-9 rounded-full px-4 text-xs font-extrabold text-cream/70 ring-1 ring-cream/25"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
