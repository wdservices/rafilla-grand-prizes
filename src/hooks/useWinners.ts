import { useEffect, useState } from "react";

import type { WinnerCard } from "@/lib/raffila-data";
import { getLiveWinners } from "@/lib/competitions-feed";

export function useWinners() {
  const [winners, setWinners] = useState<WinnerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getLiveWinners();
        if (!cancelled) {
          setWinners(res.winners);
          setLive(res.live);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { winners, loading, live };
}
