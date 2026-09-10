import {
  Users,
  Trophy,
  Ticket,
  DollarSign,
  Banknote,
  Gift,
  TrendingUp,
  UserPlus,
  Clock,
  Eye,
  PlayCircle,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { cn, formatNaira } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  tone: "ink" | "sky" | "mint" | "coral" | "lemon" | "lilac";
}

const toneBg: Record<KpiCardProps["tone"], string> = {
  ink: "bg-ink/5",
  sky: "bg-sky/25",
  mint: "bg-mint/30",
  coral: "bg-coral/18",
  lemon: "bg-lemon/35",
  lilac: "bg-lilac/30",
};

const toneIcon: Record<KpiCardProps["tone"], string> = {
  ink: "text-ink",
  sky: "text-ink",
  mint: "text-ink",
  coral: "text-coral",
  lemon: "text-ink",
  lilac: "text-ink",
};

function KpiCard({ label, value, sub, delta, deltaPositive, icon: Icon, tone }: KpiCardProps) {
  return (
    <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {value}
            </p>
            {sub && <p className="mt-1 text-sm font-bold text-ink/55">{sub}</p>}
            {delta && (
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                  deltaPositive ? "bg-mint/30 text-ink" : "bg-coral/20 text-ink",
                )}
              >
                {deltaPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingUp className="size-3 rotate-180" />
                )}
                {delta}
              </div>
            )}
          </div>
          <div
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl sm:size-14",
              toneBg[tone],
            )}
          >
            <Icon className={cn("size-5 sm:size-6", toneIcon[tone])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DualChartBars() {
  const days = 14;
  const w = 720;
  const h = 240;
  const pad = 28;
  const tickets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const revenueBase = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const maxT = Math.max(...tickets) * 1.15;
  const maxR = Math.max(...revenueBase) * 1.15;
  const barArea = w - pad * 2;
  const bw = (barArea / days) * 0.38;
  const gap = (barArea / days) * 0.62;
  const toYT = (v: number) => h - pad - (v / maxT) * (h - pad * 2);
  const toYR = (v: number) => h - pad - (v / maxR) * (h - pad * 2);
  const labels = [
    "Mon 1",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
    "Mon 8",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];
  const coralOklch = "oklch(0.75 0.14 35)";
  const skyOklch = "oklch(0.76 0.12 255)";
  const gridOklch = "oklch(0.929 0.013 255.508)";
  const labelOklch = "oklch(0.554 0.046 257.417)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[240px] w-full">
      <defs>
        <pattern id="agrid" width="60" height="32" patternUnits="userSpaceOnUse">
          <path d={`M 60 0 L 0 0 0 32`} fill="none" stroke={gridOklch} strokeWidth="1" />
        </pattern>
      </defs>
      <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} fill="url(#agrid)" rx="12" />
      {tickets.map((v, i) => {
        const x = pad + i * (bw + gap) + gap / 2;
        const bh = (v / maxT) * (h - pad * 2);
        const y = h - pad - bh;
        return (
          <rect
            key={`t${i}`}
            x={x}
            y={y}
            width={bw}
            height={bh}
            rx={bw / 2}
            fill={coralOklch}
            opacity="0.85"
          />
        );
      })}
      {revenueBase.map((v, i) => {
        const x = pad + i * (bw + gap) + gap / 2 + bw;
        const bh = (v / maxR) * (h - pad * 2);
        const y = h - pad - bh;
        return (
          <rect
            key={`r${i}`}
            x={x}
            y={y}
            width={bw}
            height={bh}
            rx={bw / 2}
            fill={skyOklch}
            opacity="0.75"
          />
        );
      })}
      {[0, 3, 6, 9, 13].map((i) => (
        <text
          key={i}
          x={pad + i * (bw + gap) + gap / 2 + bw}
          y={h - 8}
          fontSize="9"
          fill={labelOklch}
          fontWeight="700"
          textAnchor="middle"
        >
          {labels[i]}
        </text>
      ))}
      <circle
        cx={pad + 13 * (bw + gap) + gap / 2 + bw / 2}
        cy={toYT(tickets[13]!)}
        r="3.5"
        fill={coralOklch}
      />
      <circle
        cx={pad + 13 * (bw + gap) + gap / 2 + bw + bw / 2}
        cy={toYR(revenueBase[13]!)}
        r="3.5"
        fill={skyOklch}
      />
    </svg>
  );
}

const REGISTRATIONS: Array<{
  name: string;
  email: string;
  initials: string;
  tint: "coral" | "sky" | "mint" | "lemon" | "lilac";
  date: string;
  verified: boolean;
}> = [];

const tintBg: Record<string, string> = {
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/35 text-ink",
  coral: "bg-coral/20 text-coral",
  lemon: "bg-lemon/40 text-ink",
  lilac: "bg-lilac/35 text-ink",
  ink: "bg-ink/10 text-ink",
};

const PAYOUTS_QUEUE: Array<{
  user: string;
  initials: string;
  tint: "lemon" | "sky" | "mint" | "coral" | "lilac";
  amount: number;
}> = [];

type CompStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "DRAWING" | "RESULTED" | "CLOSED" | "COMPLETED";

const COMP_LIFECYCLE: Array<{ name: string; pct: number; status: CompStatus; action: string }> = [
  { name: "Mercedes-Benz C-Class 2025", pct: 0, status: "LIVE", action: "Monitor entries" },
  { name: "Nova X1 Tech Bundle", pct: 0, status: "DRAWING", action: "Start draw now" },
  { name: "Luxury 2-Bed Apartment", pct: 0, status: "SCHEDULED", action: "Review asset" },
  { name: "Ikeja Home Studio", pct: 0, status: "RESULTED", action: "Verify winner" },
  { name: "Abuja Generator Pack", pct: 0, status: "COMPLETED", action: "Archive" },
  { name: "PH Laptop Suite", pct: 0, status: "CLOSED", action: "Settle partner" },
  { name: "Eko Weekend Giveaway", pct: 0, status: "DRAFT", action: "Publish schedule" },
  { name: "Lekki Jewelry Set", pct: 0, status: "DRAFT", action: "Add asset" },
];

const statusTone: Record<CompStatus, string> = {
  DRAFT: "bg-ink/10 text-ink",
  SCHEDULED: "bg-sky/25 text-ink",
  LIVE: "bg-mint/35 text-ink",
  DRAWING: "bg-lemon/40 text-ink",
  RESULTED: "bg-lilac/35 text-ink",
  CLOSED: "bg-ink/15 text-ink",
  COMPLETED: "bg-coral/20 text-coral",
};

export function AdminOverview() {
  return (
    <AdminShell activeNav="dashboard" title="Dashboard">
      <header className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
          Admin · Overview
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
          Key metrics and live snapshot of the Raffila platform.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Total users"
          value="0"
          delta="0% week"
          deltaPositive
          icon={Users}
          tone="ink"
        />
        <KpiCard label="Active competitions" value="0" icon={Trophy} tone="sky" />
        <KpiCard
          label="Tickets sold (7 days)"
          value="0"
          sub={formatNaira(0)}
          delta="0%"
          deltaPositive
          icon={Ticket}
          tone="lemon"
        />
        <KpiCard
          label="Revenue (MTD)"
          value={formatNaira(0)}
          delta="0%"
          deltaPositive
          icon={DollarSign}
          tone="coral"
        />
        <KpiCard
          label="Pending payouts"
          value="0"
          sub={formatNaira(0)}
          icon={Banknote}
          tone="lilac"
        />
        <KpiCard label="Referral pool (all-time)" value={formatNaira(0)} icon={Gift} tone="mint" />
      </section>

      <section className="mt-6">
        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Daily performance · last 14 days
                </p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
                  Tickets & revenue trend
                </h3>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-extrabold">
                <span className="inline-flex items-center gap-1.5 text-ink/65">
                  <span className="size-2.5 rounded-full bg-coral" /> Tickets sold
                </span>
                <span className="inline-flex items-center gap-1.5 text-ink/65">
                  <span className="size-2.5 rounded-full bg-sky" /> Daily revenue
                </span>
              </div>
            </div>
            <div className="mt-4 -mx-2">
              <DualChartBars />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none lg:col-span-2 xl:col-span-1">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Sign-ups
                </p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
                  Recent registrations
                </h3>
              </div>
              <Button variant="outline" size="sm">
                <UserPlus className="size-3.5" /> Invite
              </Button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader className="[&_tr]:border-ink/10">
                  <TableRow>
                    <TableHead className="px-0 py-3 font-extrabold text-ink/65">User</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Date</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Verified</TableHead>
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-ink/10">
                  {REGISTRATIONS.map((r, i) => (
                    <TableRow key={i} className="hover:bg-lilac/10">
                      <TableCell className="px-0 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className={cn("size-9 ring-2 ring-paper", tintBg[r.tint])}>
                            <AvatarFallback
                              className={cn("text-xs font-extrabold", tintBg[r.tint])}
                            >
                              {r.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-ink">{r.name}</p>
                            <p className="truncate text-xs font-bold text-ink/55">{r.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-bold text-ink/65 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {r.date}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {r.verified ? (
                          <Badge className="rounded-full bg-mint/30 px-2 py-0.5 text-[10px] font-extrabold text-ink ring-0">
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-extrabold text-ink ring-0">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="size-3.5" /> Impersonate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Finance
                </p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
                  Pending payouts
                </h3>
              </div>
              <Badge className="rounded-full bg-coral/15 px-2.5 py-1 text-[10px] font-extrabold text-coral ring-0">
                0 items
              </Badge>
            </div>
            <div className="mt-4 space-y-2.5">
              {PAYOUTS_QUEUE.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl bg-cream/50 px-3 py-2.5"
                >
                  <Avatar className={cn("size-9 ring-2 ring-paper", tintBg[p.tint])}>
                    <AvatarFallback className={cn("text-xs font-extrabold", tintBg[p.tint])}>
                      {p.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ink">{p.user}</p>
                    <p className="truncate text-[11px] font-bold text-ink/55">
                      {formatNaira(p.amount)}
                    </p>
                  </div>
                  <Badge className="rounded-full bg-lemon/40 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink ring-0">
                    Pending
                  </Badge>
                  <Button variant="primary" size="sm">
                    <PlayCircle className="size-3.5" /> Process
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Competitions
                </p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
                  Lifecycle status
                </h3>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href="/admin/competitions">View all</a>
              </Button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader className="[&_tr]:border-ink/10">
                  <TableRow>
                    <TableHead className="px-0 py-3 font-extrabold text-ink/65">Name</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Entries</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">
                      Next
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-ink/10">
                  {COMP_LIFECYCLE.map((c, i) => (
                    <TableRow key={i} className="hover:bg-lilac/10">
                      <TableCell className="px-0 py-3">
                        <p className="truncate text-sm font-extrabold text-ink max-w-[220px]">
                          {c.name}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-cream">
                            <div className="h-full bg-coral" style={{ width: `${c.pct}%` }} />
                          </div>
                          <span className="text-[11px] font-extrabold text-ink/65">{c.pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                            statusTone[c.status],
                          )}
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right text-xs font-bold text-ink/65 whitespace-nowrap">
                        {c.action}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
