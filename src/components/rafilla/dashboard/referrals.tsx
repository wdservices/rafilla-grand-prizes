import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Copy,
  Share2,
  Check,
  Users,
  ArrowRight,
  Trophy,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

const treeLevels = [
  { level: 1, name: "L1", count: 8, color: "bg-coral/15 text-coral" },
  { level: 2, name: "L2", count: 14, color: "bg-sky/20 text-ink" },
  { level: 3, name: "L3", count: 27, color: "bg-lemon/30 text-ink" },
  { level: 4, name: "L4", count: 41, color: "bg-mint/30 text-ink" },
  { level: 5, name: "L5", count: 83, color: "bg-lilac/30 text-ink" },
] as const;

const AvatarNames: Record<number, string[]> = {
  1: ["Femi K.", "Tola A.", "Amaka O.", "Chidi E.", "Yetunde B.", "Ifeoma D.", "Ngozi S.", "Dayo P."],
  2: ["Wale O.", "Bisi A.", "Uche J.", "Aisha M.", "Tunde L.", "Zainab I.", "Kunle O.", "Remi S."],
  3: ["Blessing C.", "Emeka N.", "Fatima A.", "Segun O.", "Adebayo T.", "Nosa E.", "Ibrahim K.", "Temitope R."],
  4: ["Onyeka G.", "Musa D.", "Chioma O.", "Samuel F.", "Halima U.", "Ayo J.", "Rita M.", "Kola B."],
  5: ["Dami L.", "Glory E.", "Hassan I.", "Joy P.", "Kelechi N.", "Lilian T.", "Musa D.", "Nkiru A."],
};

type Commission = {
  date: string;
  user: string;
  level: number;
  entry: string;
  amount: number;
  status: "PENDING" | "AVAILABLE";
};

const commissions: Commission[] = [
  { date: "05 Mar · 16:02", user: "Femi K.", level: 1, entry: "Mercedes-Benz C-Class", amount: 200000, status: "AVAILABLE" },
  { date: "05 Mar · 12:44", user: "Amaka O.", level: 2, entry: "Nova X1 Bundle", amount: 75000, status: "PENDING" },
  { date: "04 Mar · 22:11", user: "Tola A.", level: 1, entry: "Nova X1 Bundle", amount: 500000, status: "AVAILABLE" },
  { date: "04 Mar · 17:30", user: "Wale O.", level: 3, entry: "Luxury 2-Bed Apt", amount: 25000, status: "PENDING" },
  { date: "04 Mar · 14:05", user: "Uche J.", level: 2, entry: "Mercedes-Benz C-Class", amount: 100000, status: "AVAILABLE" },
  { date: "03 Mar · 20:14", user: "Blessing C.", level: 3, entry: "Nova X1 Bundle", amount: 50000, status: "AVAILABLE" },
  { date: "03 Mar · 11:50", user: "Ifeoma D.", level: 1, entry: "Luxury 2-Bed Apt", amount: 250000, status: "AVAILABLE" },
  { date: "02 Mar · 18:33", user: "Aisha M.", level: 2, entry: "Mercedes-Benz C-Class", amount: 80000, status: "PENDING" },
  { date: "02 Mar · 09:18", user: "Onyeka G.", level: 4, entry: "Nova X1 Bundle", amount: 15000, status: "PENDING" },
  { date: "01 Mar · 21:07", user: "Ngozi S.", level: 1, entry: "Nova X1 Bundle", amount: 500000, status: "AVAILABLE" },
];

const levelBadge: Record<number, string> = {
  1: "bg-coral/15 text-coral",
  2: "bg-sky/20 text-ink",
  3: "bg-lemon/30 text-ink",
  4: "bg-mint/30 text-ink",
  5: "bg-lilac/30 text-ink",
};

export function DashboardReferralsPage() {
  const [copied, setCopied] = useState<"code" | "url" | null>(null);
  const refCode = "RAF-68B2AEA7";
  const refUrl = "rafilla.com/?ref=raf-tunmise-24";

  const copy = (what: "code" | "url", value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <DashboardShell activeNav="Referrals">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Grow the Rafilla network
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Referrals
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            Invite friends and earn up to 5 levels of commissions every time someone you bring in enters a competition.
          </p>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Your referral tools
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Share code
              </h2>
              <p className="mt-2 max-w-md text-xs font-bold leading-relaxed text-ink/55">
                Anyone who joins with your code or link joins your 5-level referral tree.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-2xl bg-lilac/30 px-4 py-3 ring-1 ring-ink/5">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Code
                </span>
                <span className="font-mono text-sm font-extrabold text-ink">{refCode}</span>
                <button
                  onClick={() => copy("code", refCode)}
                  className={cn(
                    "ml-1 grid size-8 place-items-center rounded-full text-xs font-extrabold transition-colors",
                    copied === "code" ? "bg-mint/40 text-ink" : "bg-paper text-coral hover:bg-coral hover:text-cream",
                  )}
                  aria-label="Copy code"
                >
                  {copied === "code" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[22px] bg-cream p-4 ring-1 ring-ink/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Referral URL
                </p>
                <p className="mt-1 truncate font-mono text-sm font-bold text-ink">
                  https://{refUrl}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copy("url", `https://${refUrl}`)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold transition-colors",
                    copied === "url"
                      ? "bg-mint/40 text-ink"
                      : "bg-coral text-cream hover:bg-coral/90",
                  )}
                >
                  {copied === "url" ? (
                    <>
                      <Check className="size-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy link
                    </>
                  )}
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-xs font-extrabold text-ink ring-1 ring-ink/10 hover:bg-lilac/20">
                  <Share2 className="size-3.5" /> Share
                </button>
              </div>
            </div>
            {copied && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                <Check className="size-3" /> Copied to clipboard
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] bg-coral/10 p-5 ring-1 ring-coral/20">
              <div className="flex items-center gap-2 text-coral">
                <Users className="size-5" />
                <span className="text-xs font-extrabold uppercase tracking-[0.14em]">
                  People invited
                </span>
              </div>
              <p className="mt-3 font-display text-4xl font-extrabold text-ink">24</p>
              <p className="mt-1 text-xs font-bold text-ink/45">Direct + network</p>
            </div>

            <div className="rounded-[22px] bg-cream p-5 ring-1 ring-ink/5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                5-level tree
              </p>
              <div className="mt-4 space-y-2">
                {treeLevels.map((lv, idx) => (
                  <div key={lv.level} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-16 shrink-0 rounded-xl px-2 py-1 text-center text-[10px] font-extrabold",
                        lv.color,
                      )}
                      style={{ marginLeft: `${idx * 16}px` }}
                    >
                      {lv.name}
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full rounded-full bg-coral/70"
                        style={{
                          width: `${Math.min(100, (lv.count / 83) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-display text-sm font-extrabold text-ink">
                      {lv.count}
                    </span>
                  </div>
                ))}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer list-none text-xs font-extrabold text-ink/55 hover:text-coral">
                  See names in tree <ChevronRight className="inline size-3.5" />
                </summary>
                <div className="mt-3 space-y-3">
                  {treeLevels.map((lv) => (
                    <div key={lv.level}>
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-lg px-2 py-0.5 text-[10px] font-extrabold",
                            lv.color,
                          )}
                        >
                          {lv.name}
                        </span>
                        <span className="text-[10px] font-bold text-ink/45">
                          {lv.count} people
                        </span>
                      </div>
                      <div
                        className="flex flex-wrap gap-1.5"
                        style={{ paddingLeft: `${lv.level * 8}px` }}
                      >
                        {AvatarNames[lv.level].map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2 py-1 text-[10px] font-extrabold text-ink ring-1 ring-ink/5"
                          >
                            <span className="grid size-4 place-items-center rounded-full bg-lilac/30 text-[9px]">
                              {n
                                .split(" ")
                                .map((x) => x[0])
                                .join("")}
                            </span>
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total earned", amount: 58200, tone: "bg-mint/30" },
            { label: "Available", amount: 28400, tone: "bg-coral/15" },
            { label: "Pending", amount: 15200, tone: "bg-lemon/30" },
            { label: "Paid out", amount: 14600, tone: "bg-sky/20" },
          ].map((e) => (
              <div
                key={e.label}
                className="rounded-[22px] bg-paper p-5 ring-1 ring-ink/5"
              >
                <span
                  className={cn(
                    "inline-block rounded-xl px-2.5 py-1 text-[10px] font-extrabold",
                    e.tone,
                    "text-ink",
                  )}
                >
                  {e.label}
                </span>
                <p className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                  {formatNaira(e.amount)}
                </p>
              </div>
            ))}
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Commission ledger
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Commissions history
              </h2>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Referred user</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Entry they bought</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {commissions.map((c, i) => (
                  <tr key={i} className="hover:bg-cream/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50">
                      {c.date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                            levelBadge[c.level],
                          )}
                        >
                          L{c.level}
                        </span>
                        <span className="text-sm font-extrabold text-ink">{c.user}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm font-bold text-ink/70 sm:table-cell">
                      {c.entry}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-display text-base font-extrabold text-mint">
                      +{formatNaira(Math.floor(c.amount / 100))}
                      <span className="text-[10px]">
                        .{String(c.amount % 100).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          c.status === "AVAILABLE"
                            ? "bg-mint/30 text-ink"
                            : "bg-lemon/40 text-ink",
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg" className="min-h-14 text-sm">
            <Link to="/competitions">
              <Trophy className="size-4" /> USE FOR ENTRY <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="primary" size="lg" className="min-h-14 text-sm">
            <Link to="/dashboard/referrals/payout">
              REQUEST CASH PAYOUT <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
