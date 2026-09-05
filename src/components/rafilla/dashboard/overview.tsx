import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Wallet,
  Users,
  Ticket,
  Trophy,
  ShieldCheck,
  BadgeCheck,
  Phone,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/rafilla-data";

type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  right?: React.ReactNode;
};

function StatCard({ label, value, sub, icon, iconBg, right }: StatCardProps) {
  return (
    <div className="rounded-[22px] bg-paper p-5 ring-1 ring-ink/5">
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
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${iconBg} text-coral`}
        >
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
    date: "2d ago",
    status: "ACTIVE",
  },
  {
    id: "RF-2026-7F3D1E8A",
    competition: "Nova X1 Bundle",
    date: "2d ago",
    status: "ACTIVE",
  },
  {
    id: "RF-2026-9C5E3B72",
    competition: "Luxury 2-Bed Apartment",
    date: "3d ago",
    status: "PAID",
  },
  {
    id: "RF-2026-4A8B6D2F",
    competition: "Mercedes-Benz C-Class 2025",
    date: "5d ago",
    status: "ACTIVE",
  },
  {
    id: "RF-2026-2E7A9C14",
    competition: "Nova X1 Bundle",
    date: "1w ago",
    status: "PAID",
  },
];

export function DashboardOverviewPage() {
  return (
    <DashboardShell activeNav="Overview">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
                Welcome back
              </p>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
                Hi Tunmise 👋
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/60">
                Ready to win something big today?
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <Link to="/competitions">
                  Browse competitions <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard/wallet">Fund wallet</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Rafilla Wallet"
            value={formatNaira(142500)}
            sub="Spend-only balance"
            icon={<Wallet className="size-5" />}
            iconBg="bg-mint/30"
          />
          <StatCard
            label="Referral Earnings"
            value={formatNaira(28400)}
            sub=""
            icon={<Users className="size-5" />}
            iconBg="bg-coral/15"
            right={
              <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-xs font-bold">
                <span className="text-mint">Available {formatNaira(28400)}</span>
                <span className="text-coral">Pending {formatNaira(15200)}</span>
              </div>
            }
          />
          <StatCard
            label="Active Entries"
            value="18"
            sub="Across 5 competitions"
            icon={<Ticket className="size-5" />}
            iconBg="bg-sky/20"
          />
          <StatCard
            label="Winnings"
            value={formatNaira(0)}
            sub="Verified prizes"
            icon={<Trophy className="size-5" />}
            iconBg="bg-lemon/30"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Latest activity
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  Recent Entries
                </h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/entries">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-ink/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  <tr>
                    <th className="px-4 py-3">Entry ID</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Competition</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {recentEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-cream/40">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-ink/70">
                        {entry.id}
                      </td>
                      <td className="px-4 py-3 hidden font-bold text-ink sm:table-cell">
                        {entry.competition}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-ink/50">
                        {entry.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                            entry.status === "ACTIVE"
                              ? "bg-mint/30 text-ink"
                              : "bg-sky/20 text-ink"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-coral" />
                <h2 className="font-display text-xl font-extrabold text-ink">
                  Verification Status
                </h2>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-cream p-3">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="size-5 text-mint" />
                    <span className="text-sm font-bold text-ink">Email</span>
                  </div>
                  <span className="rounded-full bg-mint/30 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                    VERIFIED
                  </span>
                </div>
                <div className="rounded-2xl bg-lemon/25 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="size-5 text-coral" />
                      <span className="text-sm font-bold text-ink">Phone</span>
                    </div>
                    <span className="rounded-full bg-lemon/40 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                      PENDING
                    </span>
                  </div>
                  <p className="mt-2 pl-8 text-xs font-bold text-ink/50">
                    Phone number awaiting verification
                  </p>
                  <Button variant="primary" size="sm" className="mt-3 w-full">
                    Verify phone
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-cream p-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 size-5 text-ink/50" />
                    <div>
                      <span className="block text-sm font-bold text-ink">Identity</span>
                      <span className="mt-0.5 block text-[11px] font-bold text-ink/45">
                        Not required for entry
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-ink/10 px-2.5 py-1 text-[10px] font-extrabold text-ink/70">
                    NOT REQUIRED
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/dashboard/security"
              className="group flex items-center justify-between rounded-[22px] bg-coral p-5 text-cream shadow-[0_8px_20px_-8px_var(--coral)]"
            >
              <div>
                <p className="font-display text-lg font-extrabold">Secure your account</p>
                <p className="mt-1 text-xs font-bold text-cream/70">
                  Password, 2FA, active sessions
                </p>
              </div>
              <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
