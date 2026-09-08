import { useState, useEffect } from "react";
import {
  Trophy,
  Clock,
  Users,
  Gift,
  Sparkles,
  ArrowRight,
  Ticket,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { DashboardAppShell } from "@/components/raffila/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { formatNaira, REWARD_POOL } from "@/lib/raffila-data";
import { cn } from "@/lib/utils";

const leaderboard = [
  { rank: 1, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 2, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 3, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 4, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 5, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 6, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 7, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 8, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 9, name: "—", entries: 0, bonus: 0, avatar: "—" },
  { rank: 10, name: "—", entries: 0, bonus: 0, avatar: "—" },
];

const rankTone: Record<number, string> = {
  1: "bg-lemon/40 ring-lemon/40",
  2: "bg-ink/10 ring-ink/10",
  3: "bg-coral/15 ring-coral/20",
};

export function DashboardRewardPoolPage() {
  const [time, setTime] = useState({ d: 3, h: 14, m: 22, s: 5 });

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        let { d, h, m, s } = t;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        if (d < 0) d = 0;
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <DashboardAppShell
      title="Reward pool"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Reward pool" },
      ]}
    >
      <div className="space-y-6">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/60 -mt-3">
          A single community pool funded by every competition entry across Raffila. Invite more friends to grow your proportional share.
        </p>

        <div className="overflow-hidden rounded-[24px] bg-coral/5 p-6 ring-1 ring-coral/15 sm:p-8 relative">
          <div className="absolute -top-16 -right-16 size-56 rounded-full bg-lemon/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 size-60 rounded-full bg-lilac/25 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-ink ring-1 ring-ink/5">
                <Sparkles className="size-3.5 text-coral" /> {REWARD_POOL.tagline}
              </div>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                {REWARD_POOL.label}
              </p>
              <p className="mt-2 font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold leading-none tracking-tight text-ink">
                {formatNaira(REWARD_POOL.totalKobo)}
              </p>
              <p className="mt-3 text-xs font-bold text-ink/55">
                Funded by {REWARD_POOL.totalParticipants.toLocaleString("en-NG")} participants · grows live with every entry
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-ink/5 min-w-[320px]">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-coral" />
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Next pool drop
                </p>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  ["D", time.d],
                  ["H", time.h],
                  ["M", time.m],
                  ["S", time.s],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-2xl bg-cream p-3 text-center ring-1 ring-ink/5">
                    <p className="font-display text-2xl font-extrabold text-ink tabular-nums">
                      {pad(v as number)}
                    </p>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45 mt-0.5">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
              <Button variant="primary" size="md" className="mt-4 w-full" asChild>
                <Link to="/dashboard/referrals">
                  Grow my share <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Top 10 referrers
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Referral leaderboard
              </h2>
            </div>
            <p className="text-xs font-bold text-ink/50">
              You're ranked <span className="font-display font-extrabold text-coral">#{REWARD_POOL.rank}</span>
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-ink/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3 text-right">Entries referred</th>
                  <th className="px-4 py-3 text-right">Pool bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {leaderboard.map((r) => (
                  <tr key={r.rank} className={cn(r.rank === REWARD_POOL.rank && "bg-lemon/10")}>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-grid size-8 place-items-center rounded-xl font-display text-sm font-extrabold text-ink ring-1",
                        rankTone[r.rank] ?? "bg-cream ring-ink/10"
                      )}>
                        {r.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lilac/30 font-display text-xs font-extrabold text-ink ring-1 ring-ink/5">
                          {r.avatar}
                        </span>
                        <span className="font-extrabold text-ink">{r.name}</span>
                        {r.rank === REWARD_POOL.rank && (
                          <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-extrabold text-coral">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-display font-extrabold text-ink">
                      {r.entries.toLocaleString("en-NG")}
                    </td>
                    <td className="px-4 py-3 text-right font-display text-base font-extrabold text-mint">
                      +{formatNaira(r.bonus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45 mb-3">
            How the reward pool works
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: <Ticket className="size-5 text-coral" />,
                title: "Every entry pools",
                text: "Each competition entry contributes a tiny slice to the community pool.",
                tone: "bg-mint/30 text-ink",
              },
              {
                step: "2",
                icon: <Users className="size-5 text-coral" />,
                title: "Invites grow your share",
                text: "The more entries flow through your referral tree, the bigger your piece of the pool.",
                tone: "bg-sky/20 text-ink",
              },
              {
                step: "3",
                icon: <Gift className="size-5 text-coral" />,
                title: "Cyclical drops",
                text: "At each cycle the pool is split among qualifying top referrers and winners.",
                tone: "bg-lilac/30 text-ink",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-white p-5 ring-1 ring-ink/5">
                <div className="grid size-10 place-items-center rounded-2xl bg-cream ring-1 ring-ink/5">
                  <div className={cn("grid size-8 place-items-center rounded-xl", s.tone)}>
                    {s.icon}
                  </div>
                </div>
                <h3 className="mt-4 font-display text-base font-extrabold text-ink">
                  Step {s.step} · {s.title}
                </h3>
                <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardAppShell>
  );
}
