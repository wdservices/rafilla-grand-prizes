import { useEffect, useState } from "react";

import { competitions as mockCompetitions, type Competition } from "@/lib/raffila-data";
import { getLiveCompetitions } from "@/lib/competitions-feed";

/**
 * Competitions everywhere in the app come from here: Firestore documents
 * first (so admin-published competitions appear), mock catalogue filling
 * gaps. Pass includeDrafts for the admin management view.
 */
export function useCompetitions(includeDrafts = false) {
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeDrafts]);

  return { competitions, loading, live };
}

export function findCompetition(list: Competition[], slug: string): Competition | undefined {
  return list.find((c) => c.slug === slug);
}
