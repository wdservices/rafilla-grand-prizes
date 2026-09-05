import { useEffect, useState } from "react";

export function useCountdown(totalSeconds: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const remaining = Math.max(0, totalSeconds - tick);
  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const expired = remaining <= 0;
  return { d, h, m, s, expired };
}

export function useCountdownDays(daysUntil: number) {
  const totalSeconds = Math.max(0, daysUntil * 24 * 3600);
  return useCountdown(totalSeconds);
}
