import { useEffect, useState } from "react";

import type { Competition } from "@/lib/raffila-data";
import { getLiveCompetitions } from "@/lib/competitions-feed";

/**
 * Competitions everywhere in the app come from here, and Firestore is the only
 * source: the list starts empty so nothing fictional ever flashes on screen,
 * and deleted documents cannot come back on refresh. `live` is false when the
 * read failed. Pass includeDrafts for the admin management view.
 */
export function useCompetitions(includeDrafts = false) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getLiveCompetitions(includeDrafts);
        if (!cancelled) {
          setCompetitions(res.competitions);
          setLive(res.live);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [includeDrafts]);

  return { competitions, loading, live };
}

export function findCompetition(list: Competition[], slug: string): Competition | undefined {
  return list.find((c) => c.slug === slug);
}
