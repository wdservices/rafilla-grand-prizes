import { useState } from "react";
import {
  Download,
  CalendarDays,
  FileSpreadsheet,
  FileJson,
  BarChart3,
  Users,
  DollarSign,
  Trophy,
  Banknote,
  UsersRound,
  ClipboardList,
  Filter,
  TrendingUp,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AdminShell } from "@/components/rafilla/admin/admin-shell";
import { cn, formatNaira } from "@/lib/utils";

interface ExportDef {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "ink" | "coral" | "sky" | "mint" | "lemon" | "lilac";
  formats: Array<"csv" | "xlsx" | "json">;
  lastRun: string;
}

const toneBg: Record<ExportDef["tone"], string> = {
  ink: "bg-ink/5",
  coral: "bg-coral/18",
  sky: "bg-sky/25",
  mint: "bg-mint/30",
  lemon: "bg-lemon/35",
  lilac: "bg-lilac/30",
};

const toneIcon: Record<ExportDef["tone"], string> = {
  ink: "text-ink",
  coral: "text-coral",
  sky: "text-ink",
  mint: "text-ink",
  lemon: "text-ink",
  lilac: "text-ink",
};

const EXPORT_CARDS: ExportDef[] = [
  { key: "users", label: "Users report", description: "Account sign-ups, verification, role, and status snapshots.", icon: Users, tone: "sky", formats: ["csv", "xlsx"], lastRun: "Today · 07:15" },
  { key: "revenue", label: "Revenue report", description: "Entry revenue, fees, reward pool, partner split breakdown.", icon: DollarSign, tone: "ink", formats: ["csv", "xlsx"], lastRun: "Today · 07:15" },
  { key: "competitions", label: "Competitions summary", description: "Campaign lifecycle, partner, entries, dates, winner details.", icon: Trophy, tone: "coral", formats: ["csv"], lastRun: "Today · 07:15" },
  { key: "payouts", label: "Payouts", description: "All request statuses, banks, size bands, risk-score distribution.", icon: Banknote, tone: "lilac", formats: ["csv", "xlsx"], lastRun: "Today · 07:15" },
  { key: "referrals", label: "Referral tree", description: "All 5 levels · earned, unpaid, paid, clawbacks with lineage.", icon: UsersRound, tone: "lemon", formats: ["csv"], lastRun: "Yesterday · 23:55" },
  { key: "audit", label: "Full audit JSON", description: "Complete immutable audit log export · NDJSON format.", icon: ClipboardList, tone: "mint", formats: ["json"], lastRun: "Today · 07:15" },
];

function BarChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const w = 500;
  const h = 180;
  const pad = 22;
  const max = Math.max(...data) * 1.15;
  const bw = ((w - pad * 2) / data.length) * 0.65;
  const gap = ((w - pad * 2) / data.length) * 0.35;
  const gridOklch = "oklch(0.929 0.013 255.508)";
  const labelOklch = "oklch(0.554 0.046 257.417)";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[180px] w-full">
        <defs>
          <pattern id={`bg-${color}`} width="42" height="26" patternUnits="userSpaceOnUse">
            <path d={`M 42 0 L 0 0 0 26`} fill="none" stroke={gridOklch} strokeWidth="1" />
          </pattern>
        </defs>
        <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} fill={`url(#bg-${color})`} rx="10" />
        {data.map((v, i) => {
          const x = pad + i * (bw + gap) + gap / 2;
          const bh = (v / max) * (h - pad * 2);
          const y = h - pad - bh;
          return <rect key={i} x={x} y={y} width={bw} height={bh} rx={bw / 2 > 8 ? 8 : bw / 2} fill={color} opacity={i === data.length - 1 ? 1 : 0.82} />;
        })}
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
          <text key={i} x={pad + i * (bw + gap) + gap / 2 + bw / 2} y={h - 6} fontSize="9" fill={labelOklch} fontWeight="700" textAnchor="middle">
            {months[i % 12]}
          </text>
        ))}
      </svg>
    </div>
  );
}

function HBarChart({ items, color }: { items: Array<{ name: string; val: number }>; color: string }) {
  const max = Math.max(...items.map((i) => i.val));
  const gridOklch = "oklch(0.929 0.013 255.508)";
  return (
    <div className="space-y-3.5">
      {items.map((it) => {
        const pct = Math.round((it.val / max) * 100);
        return (
          <div key={it.name}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-extrabold text-ink max-w-[200px]">{it.name}</p>
              <span className="text-[11px] font-extrabold text-ink/65 shrink-0">{it.val.toLocaleString("en-NG")}</span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full" style={{ backgroundColor: gridOklch }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminReportsPage() {
  const [granularity, setGranularity] = useState("day");

  const runReport = (r: ExportDef, fmt: "csv" | "xlsx" | "json") => {
    toast.success("Report generating…", {
      description: `${r.label} · ${fmt.toUpperCase()} queued. Last snapshot ${r.lastRun}.`,
    });
    setTimeout(() => toast.success(`${r.label}.${fmt} ready`, { description: "Download queued in your browser." }), 900);
  };

  const revenueByMonth = [48, 54, 62, 78, 82, 95, 110, 104, 128, 142, 165, 180];
  const ticketsByCat = [
    { name: "Auto", val: 42150 },
    { name: "Tech", val: 38420 },
    { name: "Property", val: 21600 },
    { name: "Jewelry", val: 15200 },
    { name: "Home", val: 12800 },
    { name: "Experience", val: 9400 },
  ];
  const topCompetitions = [
    { name: "Mercedes C-Class 2025", val: 421000000 },
    { name: "Nova X1 Tech Bundle", val: 389200000 },
    { name: "Lagos 2-Bed Apt", val: 285000000 },
    { name: "Ikeja Home Studio", val: 187000000 },
    { name: "Abuja Generator Pack", val: 142000000 },
    { name: "PH Laptop Suite", val: 98000000 },
    { name: "Lekki Jewelry Set", val: 87000000 },
    { name: "Eko Weekend Giveaway", val: 64000000 },
    { name: "Jos Land Plot", val: 52000000 },
    { name: "VI Penthouse Week", val: 41000000 },
  ];

  return (
    <AdminShell activeNav="reports" title="Reports">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Reports</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Reports</h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Export data snapshots for finance, audit, and operations. Money stored as integer kobo; exports show formatted Naira.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-2 text-xs font-bold text-ink/65 ring-1 ring-ink/10">
            <CalendarDays className="size-3.5" />
            <Input type="date" defaultValue="2026-01-01" className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0" />
            <span>→</span>
            <Input type="date" defaultValue="2026-03-12" className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0" />
          </div>
          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger className="h-10 w-40 rounded-full bg-cream px-4 text-xs font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[22px] bg-paper p-1">
              <SelectItem value="hour" className="rounded-xl font-bold">By hour</SelectItem>
              <SelectItem value="day" className="rounded-xl font-bold">By day</SelectItem>
              <SelectItem value="week" className="rounded-xl font-bold">By week</SelectItem>
              <SelectItem value="month" className="rounded-xl font-bold">By month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORT_CARDS.map((r) => (
          <Card key={r.key} className="group rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
            <CardContent className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("grid size-12 place-items-center rounded-2xl", toneBg[r.tone])}>
                  <r.icon className={cn("size-5", toneIcon[r.tone])} />
                </div>
                <Badge className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-extrabold text-ink/60 ring-1 ring-ink/10">
                  {r.lastRun}
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{r.label}</h3>
              <p className="mt-2 min-h-[3.25rem] text-sm font-bold leading-relaxed text-ink/60">{r.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 pt-2">
                {r.formats.map((fmt) => (
                  <Button
                    key={fmt}
                    variant={fmt === "csv" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => runReport(r, fmt)}
                  >
                    {fmt === "xlsx" ? <FileSpreadsheet className="size-3.5" /> : fmt === "json" ? <FileJson className="size-3.5" /> : <Download className="size-3.5" />}
                    {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-8" />

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Preview charts</p>
            <h3 className="mt-1 font-display text-2xl font-extrabold text-ink">Data at a glance</h3>
          </div>
          <Badge className="rounded-full bg-lilac/30 px-3 py-1 text-[10px] font-extrabold text-ink ring-0">
            <BarChart3 className="mr-1 size-3" /> Rolling MTD
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
            <CardContent className="p-5 sm:p-6">
              <BarChart data={revenueByMonth} color="oklch(0.75 0.14 35)" label="Revenue by month (₦M)" />
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
            <CardContent className="p-5 sm:p-6">
              <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Tickets by category</p>
              <HBarChart items={ticketsByCat} color="oklch(0.76 0.12 255)" />
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none lg:col-span-1 xl:col-span-1">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Top 10 competitions · revenue</p>
                <TrendingUp className="size-4 text-coral" />
              </div>
              <div className="space-y-3">
                {topCompetitions.slice(0, 6).map((c) => (
                  <div key={c.name} className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2">
                    <Trophy className="size-3.5 shrink-0 text-coral" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-extrabold text-ink">{c.name}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-ink/70 whitespace-nowrap">{formatNaira(c.val)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminShell>
  );
}
