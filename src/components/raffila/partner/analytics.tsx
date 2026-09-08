import { useState } from "react";
import { PartnerShell } from "./partner-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Calendar,
  Download,
  Eye,
  TrendingUp,
  Trophy,
  Wallet,
  Ticket,
  Users,
  Landmark,
  Target,
  Star,
  Award,
  Sparkles,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

const ENTRIES_30D = [
  312, 408, 354, 498, 432, 514, 587, 612, 678, 540, 604, 698, 722, 645, 710,
  788, 822, 744, 810, 895, 932, 848, 916, 985, 1020, 940, 1005, 1088, 1145, 1204,
];
const DAYS = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);

const TOP_LISTINGS = [
  { name: "Rolex Daytona 126500LN Panda", entries: 4700, valueKobo: 3850000000, pct: 94, tint: "bg-coral" },
  { name: "2024 Lexus RX 350 F-Sport", entries: 4350, valueKobo: 4850000000, pct: 87, tint: "bg-sky" },
  { name: "2024 Mercedes GLE 450", entries: 3100, valueKobo: 6200000000, pct: 62, tint: "bg-mint" },
  { name: "Land Lekki Phase 1 600sqm", entries: 1900, valueKobo: 5500000000, pct: 38, tint: "bg-lemon" },
  { name: "Italian Leather Sectional", entries: 1100, valueKobo: 32000000, pct: 55, tint: "bg-lilac" },
];

function EntriesChart() {
  const max = Math.max(...ENTRIES_30D);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-0.5 h-44 px-1 overflow-x-auto">
        {ENTRIES_30D.map((v, i) => {
          const h = (v / max) * 100;
          const isPeak = v === max;
          const isLast = i === ENTRIES_30D.length - 1;
          return (
            <div key={i} className="flex-1 min-w-[12px] flex flex-col items-center gap-1 group shrink-0">
              <span className="text-[9px] font-mono font-bold text-coral opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {v.toLocaleString()}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  isPeak ? "bg-gradient-to-t from-coral to-coral/70" : isLast ? "bg-gradient-to-t from-mint/60 to-mint" : "bg-gradient-to-t from-sky/30 to-sky/80"
                } group-hover:from-coral group-hover:to-coral/80`}
                style={{ height: `${h}%` }}
                title={`${DAYS[i]}: ${v.toLocaleString()} entries`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-end gap-0.5 px-1 overflow-x-auto">
        {DAYS.map((d, i) => (
          <div key={i} className="flex-1 min-w-[12px] text-center shrink-0">
            {i % 5 === 0 && <span className="text-[9px] font-mono text-ink/40">{d}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PartnerAnalyticsPage() {
  const [from, setFrom] = useState("2026-08-20");
  const [to, setTo] = useState("2026-09-18");
  const [granularity, setGranularity] = useState("30d");

  const stats = [
    { label: "Entries (period)", value: "22,844", delta: "+32.4%", tint: "bg-coral/20 text-coral", icon: <Ticket className="w-5 h-5" /> },
    { label: "Unique players", value: "9,182", delta: "+14.1%", tint: "bg-sky/20 text-sky", icon: <Users className="w-5 h-5" /> },
    { label: "Revenue share", value: formatNaira(4824000000), delta: "+41.8%", tint: "bg-mint/30 text-ink", icon: <Wallet className="w-5 h-5" /> },
    { label: "Avg conversion", value: "6.82%", delta: "+0.9pp", tint: "bg-lemon/30 text-ink", icon: <Target className="w-5 h-5" /> },
    { label: "Listings views", value: "618,340", delta: "+57.2%", tint: "bg-lilac/20 text-lilac", icon: <Eye className="w-5 h-5" /> },
    { label: "Prizes delivered", value: "5", delta: "+2 YoY", tint: "bg-coral/15 text-coral", icon: <Trophy className="w-5 h-5" /> },
  ];

  return (
    <PartnerShell activeNav="analytics" title="Analytics">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-coral" /> Analytics
            </h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Performance metrics for Lekki Luxury Autos · Raffila Partner Program.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full">
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" className="rounded-full">
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </div>

        <Card className="bg-cream/50 border-ink/10">
          <CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-coral" />
              <div className="flex items-center gap-2">
                <Input type="date" className="rounded-full w-40 h-9 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
                <span className="text-ink/40 font-body">to</span>
                <Input type="date" className="rounded-full w-40 h-9 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Label className="text-xs text-ink/50 uppercase tracking-wider font-body hidden sm:block">Granularity</Label>
              <Select value={granularity} onValueChange={setGranularity}>
                <SelectTrigger className="rounded-full w-32 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last quarter</SelectItem>
                  <SelectItem value="365d">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="rounded-full bg-mint/30 border-mint text-ink">
                <Sparkles className="w-3 h-3 mr-1" /> LIVE
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-ink/10 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-2xl border border-current/20 ${s.tint}`}>
                    {s.icon}
                  </div>
                  <Badge variant="outline" className="rounded-full text-[10px] bg-mint/20 border-mint text-ink font-bold">
                    <TrendingUp className="w-3 h-3 mr-1" /> {s.delta}
                  </Badge>
                </div>
                <p className="text-xs uppercase tracking-wider text-ink/50 font-body">{s.label}</p>
                <p className="font-display text-2xl sm:text-3xl text-ink mt-0.5">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <Card className="xl:col-span-3 border-ink/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="font-display text-ink text-lg flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-coral" /> Entries over time
                  </CardTitle>
                  <CardDescription className="font-body text-sm">
                    Daily entries across all listings — 30-day trend
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs font-body">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-sky/30 to-sky/80" /> Avg
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-coral" /> Peak
                  </span>
                  <Badge className="rounded-full bg-coral text-white font-bold">
                    {Math.max(...ENTRIES_30D).toLocaleString()} · peak
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <EntriesChart />
              <Separator className="my-4 bg-ink/10" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { k: "Total entries", v: ENTRIES_30D.reduce((a, b) => a + b, 0).toLocaleString(), t: "text-coral" },
                  { k: "Avg / day", v: Math.round(ENTRIES_30D.reduce((a, b) => a + b, 0) / 30).toLocaleString(), t: "text-ink" },
                  { k: "Best day", v: `D${ENTRIES_30D.indexOf(Math.max(...ENTRIES_30D)) + 1}`, t: "text-mint" },
                  { k: "Growth WoW", v: "+32.4%", t: "text-sky" },
                ].map((x) => (
                  <div key={x.k} className="p-3 rounded-xl bg-cream/50">
                    <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">{x.k}</p>
                    <p className={`font-display text-xl mt-0.5 ${x.t}`}>{x.v}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2 border-ink/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-ink text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-coral" /> Top 5 listings
                  </CardTitle>
                  <CardDescription className="font-body text-sm">Ranked by entries driven</CardDescription>
                </div>
                <Star className="w-5 h-5 text-lemon fill-lemon" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {TOP_LISTINGS.map((l, i) => {
                const maxPct = Math.max(...TOP_LISTINGS.map((t) => t.pct));
                const w = Math.round((l.entries / TOP_LISTINGS[0]!.entries) * 100);
                return (
                  <div key={l.name} className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`rounded-full w-7 h-7 p-0 justify-center shrink-0 ${
                        i === 0 ? "bg-coral text-white border-coral font-bold" : i === 1 ? "bg-lemon/40 border-lemon font-bold" : i === 2 ? "bg-mint/30 border-mint font-bold" : "bg-cream border-ink/20 text-ink/60"
                      }`}>
                        {i + 1}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-body text-sm text-ink font-semibold truncate">{l.name}</p>
                          <p className="font-display text-sm text-coral font-bold whitespace-nowrap">
                            {l.entries.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-ink/50 mt-0.5">
                          <span>{formatNaira(l.valueKobo)}</span>
                          <span className="font-semibold text-ink/60">{l.pct}% filled</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-ink/5 rounded-full overflow-hidden ms-10">
                      <div
                        className={`h-full rounded-full ${l.tint} transition-all`}
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border-ink/10 bg-gradient-to-br from-coral/[0.07] via-transparent to-sky/[0.07]">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-coral/20 text-coral">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">Audience</p>
                  <p className="font-display text-xl text-ink font-bold">Player demographics</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm font-body">
                {[
                  { k: "Top state", v: "Lagos · 58.4%", b: "bg-coral", w: "80%" },
                  { k: "Top state 2", v: "Abuja · 14.8%", b: "bg-sky", w: "65%" },
                  { k: "Gender", v: "Male · 64% / Female · 36%", b: "bg-lemon", w: "72%" },
                  { k: "Age group", v: "25-34 · 41.2%", b: "bg-mint", w: "58%" },
                  { k: "Spend tier", v: "₦100k+ · 28%", b: "bg-lilac", w: "42%" },
                ].map((x) => (
                  <div key={x.k}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-ink/60">{x.k}</span>
                      <span className="text-xs font-semibold text-ink">{x.v}</span>
                    </div>
                    <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
                      <div className={`h-full ${x.b} rounded-full`} style={{ width: x.w }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-ink/10">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-mint/30 text-ink">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">Settlements</p>
                  <p className="font-display text-xl text-ink font-bold">Cash-flow summary</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm font-body">
                {[
                  { k: "Paid (MTD)", v: formatNaira(3088000000), t: "text-mint" },
                  { k: "Processing", v: formatNaira(213600000), t: "text-sky" },
                  { k: "Pending", v: formatNaira(182400000), t: "text-lemon" },
                  { k: "YTD total", v: formatNaira(28847000000), t: "text-coral" },
                ].map((x) => (
                  <div key={x.k} className="p-3 rounded-xl bg-cream/50">
                    <p className="text-[10px] uppercase tracking-wider text-ink/50">{x.k}</p>
                    <p className={`font-display text-lg font-bold mt-0.5 ${x.t}`}>{x.v}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="font-body text-xs text-ink/60">Next payout</p>
                <Badge className="rounded-full bg-coral/15 text-coral border-coral/30 font-bold">
                  Friday · Sep 27
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-ink text-cream border-ink overflow-hidden relative">
            <div className="absolute -top-16 -right-10 w-44 h-44 rounded-full bg-coral/20 blur-3xl" />
            <CardContent className="p-5 space-y-3 relative">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-coral/30 text-coral">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-cream/60 font-body">Partner tier</p>
                  <p className="font-display text-xl text-cream font-bold">Gold · Top 8%</p>
                </div>
              </div>
              <Separator className="bg-cream/15" />
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-xs font-body">
                    <span className="text-cream/70">Progress → Platinum</span>
                    <span className="font-semibold text-coral">₦15.2M / ₦50M</span>
                  </div>
                  <div className="h-3 bg-cream/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-lemon via-coral to-coral rounded-full transition-all" style={{ width: "30%" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm font-body">
                  <div className="p-3 rounded-xl bg-cream/5">
                    <p className="text-[10px] uppercase text-cream/50">Platinum perks</p>
                    <ul className="text-xs mt-1.5 space-y-1 text-cream/80">
                      <li>✦ Homepage carousel slot</li>
                      <li>✦ Reduced 3% platform fee</li>
                      <li>✦ Dedicated account mgr</li>
                      <li>✦ Priority listing review</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-coral/15 border border-coral/30">
                    <p className="text-[10px] uppercase text-coral font-bold">Your ranking</p>
                    <p className="font-display text-3xl text-coral font-bold mt-1">#24</p>
                    <p className="text-[10px] text-cream/60">of 298 approved partners</p>
                    <p className="text-[11px] text-mint mt-1.5 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> ↑ 8 spots this month
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PartnerShell>
  );
}
