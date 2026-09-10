import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Wallet, Users, Ticket, Trophy, Copy, Check, Clock } from "lucide-react";

import { DashboardAppShell } from "@/components/raffila/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { competitions, formatNaira } from "@/lib/raffila-data";
import { cn } from "@/lib/utils";

type KpiProps = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  right?: React.ReactNode;
};

function KpiCard({ label, value, sub, icon, iconBg, right }: KpiProps) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">{value}</p>
          {sub && <p className="mt-1 text-xs font-bold text-ink/45">{sub}</p>}
        </div>
        <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      {right}
    </div>
  );
}

const recentEntries: Array<{
  id: string;
  competition: string;
  tickets: number;
  drawDate: string;
  status: "Entered" | "Won" | "Lost" | "Drawn";
}> = [];

const statusStyles: Record<(typeof recentEntries)[number]["status"], string> = {
  Entered: "bg-mint/30 text-ink",
  Drawn: "bg-sky/20 text-ink",
  Won: "bg-lemon/40 text-ink",
  Lost: "bg-ink/10 text-ink/70",
};

export function DashboardOverviewPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <DashboardAppShell
      title="Overview"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Overview" }]}
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-coral">
                Welcome back
              </p>
              <h2 className="mt-2 break-words font-display text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
                Good afternoon, Tunmise 👋
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/55">
                Your next win could be one ticket away.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto">
              <div className="flex-1 rounded-2xl bg-cream px-4 py-3.5 ring-1 ring-ink/5 sm:min-w-[140px] sm:flex-none">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Wallet balance
                </p>
                <p className="mt-1 break-words font-display text-lg font-extrabold text-ink sm:text-xl lg:text-2xl">
                  {formatNaira(0)}
                </p>
              </div>
              <div className="flex-1 rounded-2xl bg-cream px-4 py-3.5 ring-1 ring-ink/5 sm:min-w-[140px] sm:flex-none">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Referral earnings
                </p>
                <p className="mt-1 break-words font-display text-lg font-extrabold text-ink sm:text-xl lg:text-2xl">
                  {formatNaira(0)}
                </p>
              </div>
              <Button asChild variant="primary" size="md" className="w-full sm:w-auto">
                <Link to="/dashboard/competitions">
                  Browse competitions <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total entries"
            value="0"
            sub="Across 0 competitions"
            icon={<Ticket className="size-5 text-coral" />}
            iconBg="bg-sky/20"
          />
          <KpiCard
            label="Active competitions"
            value="0"
            sub="Draws coming up"
            icon={<Trophy className="size-5 text-coral" />}
            iconBg="bg-lemon/30"
          />
          <KpiCard
            label="Prizes won"
            value="0"
            sub={`${formatNaira(0)} value`}
            icon={<Trophy className="size-5 text-coral" />}
            iconBg="bg-mint/30"
          />
          <KpiCard
            label="Referrals recruited"
            value="0"
            sub="In your network"
            icon={<Users className="size-5 text-coral" />}
            iconBg="bg-coral/15"
          />
        </div>

        <section className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Don't miss out
              </p>
              <h2 className="mt-2 font-display text-xl font-extrabold text-ink sm:text-2xl">
                Upcoming draws
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/competitions">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-4 grid-cols-1 lg:grid-cols-2">
            {competitions.slice(0, 2).map((comp) => {
              const sold = comp.entriesSold;
              const total = comp.totalEntries;
              return (
                <article
                  key={comp.slug}
                  className="flex flex-col overflow-hidden rounded-2xl ring-1 ring-ink/5 bg-white hover:ring-coral/20 transition-all sm:flex-row"
                >
                  <div className="bg-cream/60 p-3 flex items-center justify-center sm:w-[42%] sm:shrink-0">
                    <img
                      src={comp.image}
                      alt={`${comp.title} prize`}
                      loading="lazy"
                      decoding="async"
                      className="h-[160px] w-full object-contain rounded-xl sm:h-full sm:max-h-[180px]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 font-display text-base font-extrabold leading-tight text-ink sm:text-lg">
                        {comp.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-ink/50">
                        <span className="inline-flex items-center gap-1">
                          <Ticket className="size-3.5 shrink-0" />{" "}
                          {Math.min(100, Math.round((sold / total) * 100))}% sold
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-cream overflow-hidden">
                        <div
                          className="h-full rounded-full bg-coral transition-all duration-500"
                          style={{ width: `${Math.min(100, (sold / total) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-lemon/30 px-3 py-1 text-[10px] font-extrabold text-ink">
                        <Clock className="size-3 shrink-0" />
                        Ends {comp.closes}
                      </span>
                      <Button asChild variant="primary" size="sm">
                        <Link to="/competitions/$slug" params={{ slug: comp.slug }}>
                          View <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Your ticket trail
              </p>
              <h2 className="mt-2 font-display text-xl font-extrabold text-ink sm:text-2xl">
                Recent entries
              </h2>
            </div>
            <Link
              to="/dashboard/entries"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-coral hover:underline"
            >
              View all entries <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead className="bg-cream text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45 rounded-2xl">
                <tr>
                  <th className="px-4 py-3 first:rounded-l-2xl last:rounded-r-2xl">Entry ID</th>
                  <th className="px-4 py-3">Competition</th>
                  <th className="px-4 py-3 text-center">Tickets</th>
                  <th className="px-4 py-3">Draw date</th>
                  <th className="px-4 py-3 first:rounded-l-2xl last:rounded-r-2xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink/70">{entry.id}</span>
                        <button
                          onClick={() => copyId(entry.id)}
                          className={cn(
                            "grid size-6 place-items-center rounded-full transition-colors",
                            copiedId === entry.id
                              ? "bg-mint/30 text-ink"
                              : "bg-cream text-ink/45 hover:text-coral",
                          )}
                          aria-label="Copy entry ID"
                        >
                          {copiedId === entry.id ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-ink">{entry.competition}</td>
                    <td className="px-4 py-3.5 text-center font-display font-extrabold text-ink">
                      {entry.tickets}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-ink/50">{entry.drawDate}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          statusStyles[entry.status],
                        )}
                      >
                        {entry.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardAppShell>
  );
}
