import {
  Users,
  UserCheck,
  Building2,
  Trophy,
  Ticket,
  WalletCards,
  Banknote,
  Gift,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  CheckCircle2,
  Sparkles,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminShell } from "@/components/rafilla/admin/shell";
import { cn, formatNaira } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  tone: "ink" | "sky" | "mint" | "coral" | "lemon";
}

const toneBg: Record<KpiCardProps["tone"], string> = {
  ink: "bg-ink/5",
  sky: "bg-sky/25",
  mint: "bg-mint/30",
  coral: "bg-coral/18",
  lemon: "bg-lemon/35",
};

const toneIcon: Record<KpiCardProps["tone"], string> = {
  ink: "text-ink",
  sky: "text-ink",
  mint: "text-ink",
  coral: "text-coral",
  lemon: "text-ink",
};

function KpiCard({ label, value, sub, delta, deltaPositive, icon: Icon, tone }: KpiCardProps) {
  return (
    <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">{label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {value}
            </p>
            {sub && <p className="mt-1 text-sm font-bold text-ink/55">{sub}</p>}
            {delta && (
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                  deltaPositive ? "bg-mint/30 text-ink" : "bg-rose/20 text-ink",
                )}
              >
                {deltaPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
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

function LineChartMock({ accent = "coral", accent2 = "sky" }: { accent?: "coral" | "sky" | "mint"; accent2?: "coral" | "sky" | "mint" }) {
  const w = 600;
  const h = 260;
  const pad = 30;
  const data = [42, 48, 45, 58, 62, 55, 68, 72, 70, 82, 88, 85, 95, 102, 98, 110, 118, 122, 130, 125, 140, 148, 155, 162, 170, 165, 178, 185, 192, 200];
  const data2 = [28, 32, 30, 38, 40, 36, 45, 48, 46, 55, 60, 57, 65, 70, 68, 75, 80, 82, 88, 85, 92, 98, 102, 108, 112, 110, 118, 122, 128, 135];
  const maxY = Math.max(...data) * 1.1;
  const step = (w - pad * 2) / (data.length - 1);
  const toY = (v: number) => h - pad - (v / maxY) * (h - pad * 2);
  const points1 = data.map((v, i) => `${pad + i * step},${toY(v)}`).join(" ");
  const points2 = data2.map((v, i) => `${pad + i * step},${toY(v)}`).join(" ");
  const fill1 = `${pad},${h - pad} ${points1} ${pad + (data.length - 1) * step},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[260px] w-full">
      <defs>
        <pattern id="grid" width="40" height="35" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 35" fill="none" stroke="oklch(0.929 0.013 255.508)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} fill="url(#grid)" rx="12" />
      <polygon points={fill1} fill={accent === "coral" ? "oklch(0.75 0.14 35 / 0.18)" : "oklch(0.76 0.12 255 / 0.18)"} />
      <polyline points={points2} fill="none" stroke={accent2 === "coral" ? "oklch(0.75 0.14 35)" : accent2 === "mint" ? "oklch(0.87 0.12 165)" : "oklch(0.76 0.12 255)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points1} fill="none" stroke={accent === "coral" ? "oklch(0.75 0.14 35)" : accent === "mint" ? "oklch(0.87 0.12 165)" : "oklch(0.76 0.12 255)"} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 7, 14, 21, 29].map((i) => (
        <g key={i}>
          <circle cx={pad + i * step} cy={toY(data[i])} r="4" fill={accent === "coral" ? "oklch(0.75 0.14 35)" : "oklch(0.76 0.12 255)"} />
        </g>
      ))}
      <text x={pad} y={h - 8} fontSize="10" fill="oklch(0.554 0.046 257.417)" fontWeight="700">Day 1</text>
      <text x={w - pad} y={h - 8} fontSize="10" fill="oklch(0.554 0.046 257.417)" fontWeight="700" textAnchor="end">Today</text>
    </svg>
  );
}

function BarChartMock({ tone = "mint", bars = 30 }: { tone?: "mint" | "sky" | "coral" | "lemon"; bars?: number }) {
  const w = 600;
  const h = 260;
  const pad = 30;
  const values = Array.from({ length: bars }, (_, i) => 30 + Math.sin(i / 2.5) * 18 + Math.random() * 40 + (i / bars) * 25);
  const maxY = Math.max(...values) * 1.15;
  const barArea = w - pad * 2;
  const bw = (barArea / bars) * 0.65;
  const gap = (barArea / bars) * 0.35;
  const fill =
    tone === "mint" ? "oklch(0.87 0.12 165)" :
    tone === "sky" ? "oklch(0.76 0.12 255)" :
    tone === "coral" ? "oklch(0.75 0.14 35)" :
    "oklch(0.87 0.14 88)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[260px] w-full">
      <defs>
        <pattern id="bgrid" width="40" height="35" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 35" fill="none" stroke="oklch(0.929 0.013 255.508)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} fill="url(#bgrid)" rx="12" />
      {values.map((v, i) => {
        const x = pad + i * (bw + gap) + gap / 2;
        const bh = (v / maxY) * (h - pad * 2);
        const y = h - pad - bh;
        return <rect key={i} x={x} y={y} width={bw} height={bh} rx={bw / 2 > 8 ? 8 : bw / 2} fill={fill} />;
      })}
      <text x={pad} y={h - 8} fontSize="10" fill="oklch(0.554 0.046 257.417)" fontWeight="700">Day 1</text>
      <text x={w - pad} y={h - 8} fontSize="10" fill="oklch(0.554 0.046 257.417)" fontWeight="700" textAnchor="end">Today</text>
    </svg>
  );
}

function HBarChartMock() {
  const items = [
    { name: "Mercedes C-Class 2026", val: 4210, cap: 5000 },
    { name: "Nova X1 Tech Bundle", val: 3890, cap: 10000 },
    { name: "Lagos 2-Bed Apt", val: 2100, cap: 8000 },
    { name: "Ikeja Home Studio", val: 1780, cap: 6000 },
    { name: "Abuja Generator Pack", val: 1420, cap: 5000 },
    { name: "PH Laptop Suite", val: 980, cap: 4000 },
  ];
  const max = 5000;
  return (
    <div className="space-y-4">
      {items.map((it) => {
        const pct = Math.round((it.val / max) * 100);
        const pctCap = Math.round((it.val / it.cap) * 100);
        return (
          <div key={it.name}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-extrabold text-ink">{it.name}</p>
              <div className="flex shrink-0 items-center gap-2 text-[11px] font-extrabold text-ink/55">
                <span>{it.val.toLocaleString("en-NG")} sold</span>
                <Badge className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-extrabold text-coral ring-0">
                  {pctCap}% filled
                </Badge>
              </div>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-cream">
              <div
                className="h-full rounded-full bg-coral"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ACTIVITY = [
  { type: "register", label: "User registered", who: "Tunde O.", initials: "TO", tint: "sky", time: "2 min ago", detail: "Email + phone verified" },
  { type: "publish", label: "Competition published", who: "Admin Aisha", initials: "AA", tint: "coral", time: "8 min ago", detail: "Mercedes C-Class 2026 • 5,000 entries" },
  { type: "draw", label: "Draw completed", who: "Draw Engine", initials: "DE", tint: "mint", time: "17 min ago", detail: "Abuja Generator Pack • Verified" },
  { type: "payout", label: "Payout paid", who: "Finance Bola", initials: "FB", tint: "lemon", time: "28 min ago", detail: "₦185,000 to Chidi K. • GTBank" },
  { type: "partner", label: "Partner approved", who: "Admin Aisha", initials: "AA", tint: "lilac", time: "42 min ago", detail: "Lux Wheels Ltd • Auto category" },
  { type: "wallet", label: "Wallet funded", who: "Amaka P.", initials: "AP", tint: "mint", time: "56 min ago", detail: "₦250,000 • Paystack successful" },
  { type: "ticket", label: "Ticket entry purchased", who: "Tunde O.", initials: "TO", tint: "sky", time: "1 hr ago", detail: "25 entries • Nova X1 Bundle" },
  { type: "verify", label: "Draw verification published", who: "Audit Uche", initials: "AU", tint: "ink", time: "1 hr ago", detail: "Ikeja Home Studio • Seed #7f3a…" },
  { type: "suspend", label: "User account suspended", who: "Fraud Team", initials: "FT", tint: "rose", time: "2 hr ago", detail: "Velocity alert • 3 tickets under review" },
  { type: "winner", label: "Winner claim approved", who: "Admin Aisha", initials: "AA", tint: "lemon", time: "3 hr ago", detail: "Ifeoma D. • ₦1.95M prize" },
];

const tintBgShort: Record<string, string> = {
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/35 text-ink",
  coral: "bg-coral/20 text-coral",
  lemon: "bg-lemon/40 text-ink",
  lilac: "bg-lilac/35 text-ink",
  ink: "bg-ink/10 text-ink",
  rose: "bg-rose/20 text-ink",
};

export function AdminOverviewPage() {
  return (
    <AdminShell activeNav="overview">
      <section className="rounded-[28px] bg-coral p-6 text-cream sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Platform Overview
            </h1>
            <p className="mt-3 max-w-xl text-base font-bold leading-relaxed text-cream/80 sm:text-lg">
              A live snapshot of participants, campaigns, revenue, and payout activity across the
              entire Rafilla platform.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-paper/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ring-1 ring-cream/25 backdrop-blur">
            <span className="grid size-2 place-items-center">
              <span className="size-2 animate-pulse rounded-full bg-cream" />
            </span>
            Live data from the last 30 days
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Users" value="14,286" delta="+6.2% (30d)" deltaPositive icon={Users} tone="ink" />
        <KpiCard label="Active Users (30d)" value="3,921" delta="+12.8% (30d)" deltaPositive icon={UserCheck} tone="sky" />
        <KpiCard label="Partners" value="27" sub="Approved · 8 Pending" icon={Building2} tone="mint" />
        <KpiCard label="Active Competitions" value="14" sub="2 Scheduled" icon={Trophy} tone="coral" />
        <KpiCard label="Tickets Sold (30d)" value="84,520" delta="+18.4% (30d)" deltaPositive icon={Ticket} tone="lemon" />
        <KpiCard label="Platform Revenue (30d)" value={formatNaira(42580000)} delta="+22.1% (30d)" deltaPositive icon={DollarSign} tone="ink" />
        <KpiCard label="Wallet Funding (30d)" value={formatNaira(58127450)} icon={WalletCards} tone="mint" />
        <KpiCard label="Referral Liability" value={formatNaira(4218640)} icon={Gift} tone="coral" />
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Pending Payouts", value: "38 requests", sub: formatNaira(2847200), tone: "sky" as const, icon: Banknote },
          { label: "Active Listings", value: "46", sub: "Across 5 categories", tone: "mint" as const, icon: Trophy },
          { label: "Completed Competitions", value: "126", sub: "All draws verified", tone: "lemon" as const, icon: CheckCircle2 },
          { label: "Recent Winners", value: "7 / 12", sub: "Drawn & approved", tone: "coral" as const, icon: Sparkles },
          { label: "Fraud Alerts", value: "3 open", sub: "Under review", tone: "ink" as const, icon: AlertTriangle, alert: true },
        ].map((s) => (
          <Card key={s.label} className={cn("rounded-[22px] border-0 p-0 ring-1 shadow-none", s.alert ? "bg-rose/10 ring-rose/25" : "bg-paper ring-ink/5")}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={cn("grid size-10 place-items-center rounded-xl", s.alert ? "bg-rose/20" : toneBg[s.tone])}>
                <s.icon className={cn("size-4.5", s.alert ? "text-ink" : toneIcon[s.tone])} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">{s.label}</p>
                <p className="truncate font-display text-lg font-extrabold text-ink">{s.value}</p>
                <p className="truncate text-[11px] font-bold text-ink/55">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Revenue trend</p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">₦42.58M · 30 days</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-extrabold">
                <span className="inline-flex items-center gap-1.5 text-ink/65">
                  <span className="size-2 rounded-full bg-coral" /> Revenue
                </span>
                <span className="inline-flex items-center gap-1.5 text-ink/65">
                  <span className="size-2 rounded-full bg-sky" /> Wallet funding
                </span>
              </div>
            </div>
            <div className="mt-4 -mx-2">
              <LineChartMock accent="coral" accent2="sky" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Ticket sales</p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">84,520 · per day</h3>
              </div>
              <Badge className="rounded-full bg-mint/30 px-3 py-1 text-[10px] font-extrabold text-ink ring-0">
                Mint bars · 30 days
              </Badge>
            </div>
            <div className="mt-4 -mx-2">
              <BarChartMock tone="mint" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">User growth</p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">Registrations · per day</h3>
              </div>
              <Badge className="rounded-full bg-sky/25 px-3 py-1 text-[10px] font-extrabold text-ink ring-0">
                Sky bars · 30 days
              </Badge>
            </div>
            <div className="mt-4 -mx-2">
              <BarChartMock tone="sky" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Competition performance</p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">Top 6 campaigns</h3>
              </div>
              <Badge className="rounded-full bg-coral/15 px-3 py-1 text-[10px] font-extrabold text-coral ring-0">
                Coral fill
              </Badge>
            </div>
            <div className="mt-5">
              <HBarChartMock />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Live feed</p>
                <h3 className="mt-1 font-display text-2xl font-extrabold text-ink">Recent activity</h3>
              </div>
              <Button variant="outline" size="sm">
                <ShieldCheck className="size-3.5" />
                Open audit log
              </Button>
            </div>

            <ol className="mt-6 space-y-4">
              {ACTIVITY.map((a, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <Avatar className={cn("size-10 ring-2 ring-paper", tintBgShort[a.tint])}>
                      <AvatarFallback className={cn("text-xs font-extrabold", tintBgShort[a.tint])}>
                        {a.initials}
                      </AvatarFallback>
                    </Avatar>
                    {idx < ACTIVITY.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-ink/10" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-extrabold text-ink">{a.label}</p>
                      <span className="text-xs font-bold text-ink/40">·</span>
                      <p className="text-xs font-bold text-ink/55">{a.who}</p>
                      <span className="ml-auto text-[11px] font-extrabold text-ink/45">{a.time}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-ink/65">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
