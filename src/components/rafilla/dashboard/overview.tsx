import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Wallet,
  Users,
  Ticket,
  Trophy,
  Copy,
  Check,
  Clock,
} from "lucide-react";

import { DashboardAppShell } from "@/components/rafilla/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { competitions, formatNaira } from "@/lib/rafilla-data";
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
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            {value}
          </p>
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

const recentEntries = [
  {
    id: "RF-2026-8B4A2C91",
    competition: "Mercedes-Benz C-Class 2025",
    tickets: 5,
    drawDate: "18 Mar 2026",
    status: "Entered" as const,
  },
  {
    id: "RF-2026-7F3D1E8A",
    competition: "Nova X1 Bundle",
    tickets: 10,
    drawDate: "12 Mar 2026",
    status: "Entered" as const,
  },
  {
    id: "RF-2026-9C5E3B72",
    competition: "Luxury 2-Bed Apartment",
    tickets: 25,
    drawDate: "02 Feb 2026",
    status: "Won" as const,
  },
  {
    id: "RF-2026-4A8B6D2F",
    competition: "Mercedes-Benz C-Class 2025",
    tickets: 2,
    drawDate: "15 Jan 2026",
    status: "Lost" as const,
  },
  {
    id: "RF-2026-2E7A9C14",
    competition: "Nova X1 Bundle",
    tickets: 8,
    drawDate: "28 Jan 2026",
    status: "Drawn" as const,
  },
];

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
        <div className="overflow-hidden rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
                Good afternoon, Tunmise 👋
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/60">
                Your next win could be one ticket away.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-cream px-5 py-4 ring-1 ring-ink/5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                My wallet balance
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-ink">
                {formatNaira(45000000)}
              </p>
            </div>
            <div className="rounded-2xl bg-cream px-5 py-4 ring-1 ring-ink/5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Referral earnings
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-ink">
                {formatNaira(1240000)}
              </p>
            </div>
            <Button asChild variant="primary" size="lg" className="self-end">
              <Link to="/dashboard/competitions">
                Browse competitions <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total entries"
            value="87"
            sub="Across 11 competitions"
            icon={<Ticket className="size-5 text-coral" />}
            iconBg="bg-sky/20"
          />
          <KpiCard
            label="Active competitions"
            value="6"
            sub="Draws coming up"
            icon={<Trophy className="size-5 text-coral" />}
            iconBg="bg-lemon/30"
          />
          <KpiCard
            label="Prizes won"
            value="2"
            sub={`${formatNaira(125000000)} value`}
            icon={<Trophy className="size-5 text-coral" />}
            iconBg="bg-mint/30"
          />
          <KpiCard
            label="Referrals recruited"
            value="4"
            sub="In your network"
            icon={<Users className="size-5 text-coral" />}
            iconBg="bg-coral/15"
          />
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Don't miss out
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Upcoming draws
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/competitions">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {competitions.slice(0, 2).map((comp) => {
              const sold = comp.entriesSold;
              const total = comp.totalEntries;
              return (
                <article
                  key={comp.slug}
                  className="flex flex-col sm:flex-row overflow-hidden rounded-2xl ring-1 ring-ink/5 bg-cream"
                >
                  <div className="sm:w-3/4 aspect-[4/3] sm:aspect-auto overflow-hidden">
                    <img
                      src={comp.image}
                      alt={`${comp.title} prize`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-ink leading-tight">
                        {comp.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-xs font-bold text-ink/50">
                        <span className="inline-flex items-center gap-1">
                          <Ticket className="size-3" /> {sold} / {total} entries
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-lemon/30 px-3 py-1 text-[10px] font-extrabold text-ink">
                        <Clock className="size-3" />
                        Ends {comp.closes}
                      </span>
                      <Button asChild variant="primary" size="sm">
                        <Link to={`/competitions/${comp.slug}`}>
                          View <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Your ticket trail
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
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

          <div className="mt-5 overflow-x-auto -mx-4 px-4">
            <table className="w-full text-left text-sm min-w-[680px]">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3 rounded-l-2xl">Entry ID</th>
                  <th className="px-4 py-3">Competition</th>
                  <th className="px-4 py-3 text-center">Ticket count</th>
                  <th className="px-4 py-3">Draw date</th>
                  <th className="px-4 py-3 rounded-r-2xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink/70">
                          {entry.id}
                        </span>
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
                    <td className="px-4 py-3 font-bold text-ink">{entry.competition}</td>
                    <td className="px-4 py-3 text-center font-display font-extrabold text-ink">
                      {entry.tickets}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-ink/50">
                      {entry.drawDate}
                    </td>
                    <td className="px-4 py-3">
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
        </div>
      </div>
    </DashboardAppShell>
  );
}
