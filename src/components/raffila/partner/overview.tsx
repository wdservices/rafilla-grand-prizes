import { PartnerShell } from "./partner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ListOrdered,
  Ticket,
  Wallet,
  Clock,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  FileText,
  Sparkles,
  Car,
  Gem,
  Watch,
  Smartphone,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

const WEEKLY_ENTRIES = [145, 220, 187, 312, 408, 354, 498, 432, 514, 587, 612, 678];
const WEEKS = [
  "Wk27",
  "Wk28",
  "Wk29",
  "Wk30",
  "Wk31",
  "Wk32",
  "Wk33",
  "Wk34",
  "Wk35",
  "Wk36",
  "Wk37",
  "Wk38",
];

function WeeklyBarsChart() {
  const max = Math.max(...WEEKLY_ENTRIES);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 sm:gap-2 h-40 px-1">
        {WEEKLY_ENTRIES.map((v, i) => {
          const h = (v / max) * 100;
          const isMax = v === max;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <span
                className={`text-[10px] font-mono font-bold ${isMax ? "text-coral" : "text-ink/50"} opacity-0 group-hover:opacity-100 transition`}
              >
                {v.toLocaleString()}
              </span>
              <div
                className={`w-full rounded-t-xl transition-all ${isMax ? "bg-gradient-to-t from-coral to-coral/70" : "bg-gradient-to-t from-sky/40 to-sky"} group-hover:from-coral/80 group-hover:to-coral`}
                style={{ height: `${h}%` }}
                title={`${WEEKS[i]}: ${v.toLocaleString()} entries`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-end gap-1.5 sm:gap-2 px-1">
        {WEEKS.map((w, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] font-mono text-ink/40">{w}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Settlement {
  id: string;
  period: string;
  amountKobo: number;
  status: "paid" | "pending" | "processing";
  date: string;
}
const SETTLEMENTS: Settlement[] = [
  {
    id: "STL-W38-4021",
    period: "Week 38 · Sep 16 – 22",
    amountKobo: 182400000,
    status: "pending",
    date: "Pending · Sep 27",
  },
  {
    id: "STL-W37-3988",
    period: "Week 37 · Sep 09 – 15",
    amountKobo: 213600000,
    status: "processing",
    date: "Processing · Sep 23",
  },
  {
    id: "STL-W36-3944",
    period: "Week 36 · Sep 02 – 08",
    amountKobo: 145900000,
    status: "paid",
    date: "Paid · Sep 13",
  },
  {
    id: "STL-W35-3899",
    period: "Week 35 · Aug 26 – Sep 01",
    amountKobo: 98400000,
    status: "paid",
    date: "Paid · Sep 06",
  },
  {
    id: "STL-W34-3855",
    period: "Week 34 · Aug 19 – 25",
    amountKobo: 128700000,
    status: "paid",
    date: "Paid · Aug 30",
  },
];

const TOP_FIRST = [
  "Tunde",
  "Amaka",
  "Chidi",
  "Sade",
  "Funmi",
  "Kemi",
  "Bola",
  "Ifeoma",
  "Dele",
  "Zainab",
  "Emeka",
  "Ngozi",
];
const TOP_LAST = [
  "Bakare",
  "Okafor",
  "Eze",
  "Lawal",
  "Adeyemi",
  "Hassan",
  "Tinubu",
  "Dike",
  "Ogun",
  "Aliyu",
  "Nwosu",
  "Obi",
];
const TINTS = ["coral", "mint", "lemon", "sky", "lilac"];

function statusBadge(s: Settlement["status"]) {
  if (s === "paid")
    return (
      <Badge className="rounded-full bg-mint/40 border-mint text-ink text-[10px] font-bold">
        PAID
      </Badge>
    );
  if (s === "processing")
    return (
      <Badge variant="outline" className="rounded-full bg-sky/20 border-sky text-ink text-[10px]">
        PROCESSING
      </Badge>
    );
  return (
    <Badge variant="outline" className="rounded-full bg-lemon/30 border-lemon text-ink text-[10px]">
      PENDING
    </Badge>
  );
}

export function PartnerOverviewPage() {
  const kpis = [
    {
      label: "Live listings",
      value: "8",
      sub: "+2 this month",
      icon: <ListOrdered className="w-5 h-5" />,
      tint: "bg-sky/20 text-sky border-sky/40",
      accent: "text-sky",
    },
    {
      label: "Total entries sold",
      value: "12,480",
      sub: "+34.2% vs 12w ago",
      icon: <Ticket className="w-5 h-5" />,
      tint: "bg-coral/20 text-coral border-coral/40",
      accent: "text-coral",
    },
    {
      label: "Revenue share earned",
      value: formatNaira(4824000000),
      sub: "All-time · 18.2% margin",
      icon: <Wallet className="w-5 h-5" />,
      tint: "bg-mint/30 text-ink border-mint/50",
      accent: "text-ink",
    },
    {
      label: "Pending settlement",
      value: formatNaira(642000000),
      sub: "Releases Sep 27",
      icon: <Clock className="w-5 h-5" />,
      tint: "bg-lemon/30 text-ink border-lemon/50",
      accent: "text-ink",
    },
  ];

  return (
    <PartnerShell activeNav="overview" title="Overview">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink">Good morning, Adaeze 👋</h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Here's how Lekki Luxury Autos is performing on Raffila this week.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full">
              <FileText className="w-4 h-4 mr-2" /> Monthly report
            </Button>
            <Button className="rounded-full bg-coral hover:bg-coral/90 text-white">
              <Upload className="w-4 h-4 mr-2" /> Submit new asset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label} className="border-ink/10 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-2xl border ${k.tint}`}>{k.icon}</div>
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] bg-cream text-ink/60 border-ink/10 font-body"
                  >
                    <TrendingUp className="w-3 h-3 mr-1 text-mint" /> +{10 + (k.label.length % 20)}%
                  </Badge>
                </div>
                <p className="text-xs font-body uppercase tracking-wider text-ink/50 mb-1">
                  {k.label}
                </p>
                <p className={`font-display text-2xl sm:text-3xl ${k.accent}`}>{k.value}</p>
                <p className="text-[11px] font-body text-ink/50 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-coral" /> {k.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="xl:col-span-2 border-ink/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="font-display text-ink text-lg flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-coral" /> Entries by week
                  </CardTitle>
                  <CardDescription className="font-body text-sm mt-1">
                    Last 12 weeks — competition entries driven by your listings
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full bg-sky/20 text-ink border-sky/40">LIVE</Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full bg-coral/10 border-coral/30 text-coral"
                  >
                    Peak: {Math.max(...WEEKLY_ENTRIES).toLocaleString()} · Wk38
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <WeeklyBarsChart />
              <Separator className="my-4 bg-ink/10" />
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-cream/60">
                  <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">
                    12w total
                  </p>
                  <p className="font-display text-xl text-ink mt-0.5">5,149</p>
                </div>
                <div className="p-3 rounded-xl bg-cream/60">
                  <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">
                    Avg / listing
                  </p>
                  <p className="font-display text-xl text-ink mt-0.5">1,562</p>
                </div>
                <div className="p-3 rounded-xl bg-coral/10 border border-coral/20">
                  <p className="text-[10px] uppercase tracking-wider text-coral font-body">
                    Best listing
                  </p>
                  <p className="font-display text-sm text-ink mt-0.5 truncate">2024 Lexus RX 350</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-ink/10">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-ink text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-coral" /> Top performers
              </CardTitle>
              <CardDescription className="font-body text-sm">
                Players with most entries
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => {
                const first = TOP_FIRST[i % TOP_FIRST.length]!;
                const last = TOP_LAST[(i * 3) % TOP_LAST.length]!;
                const entries = 340 - i * 53;
                const pct = Math.round((entries / 340) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`rounded-full w-7 h-7 p-0 justify-center shrink-0 ${
                        i === 0
                          ? "bg-coral text-white border-coral"
                          : i === 1
                            ? "bg-lemon/40 border-lemon"
                            : "bg-cream border-ink/20"
                      }`}
                    >
                      {i + 1}
                    </Badge>
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback
                        className={`bg-${TINTS[i % TINTS.length]} text-ink font-display font-semibold text-sm`}
                      >
                        {first[0]!}
                        {last[0]!}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-body text-sm text-ink font-semibold truncate">
                          {first} {last}
                        </p>
                        <p className="font-display text-sm text-coral font-bold">{entries}</p>
                      </div>
                      <div className="h-1.5 w-full bg-ink/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-coral"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 border-ink/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="font-display text-ink text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-mint" /> Recent settlements
                  </CardTitle>
                  <CardDescription className="font-body text-sm">
                    Weekly disbursements to your Zenith account
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full">
                  View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 divide-y divide-ink/5">
              {SETTLEMENTS.map((s) => (
                <div key={s.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-2xl bg-mint/20 flex items-center justify-center text-mint shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body font-semibold text-ink">{s.period}</p>
                      {statusBadge(s.status)}
                    </div>
                    <p className="text-[11px] font-mono text-ink/40">
                      {s.id} · {s.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-lg text-ink font-bold">
                      {formatNaira(s.amountKobo)}
                    </p>
                    <p className="text-[10px] font-body text-ink/50">Net after 5% platform fee</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-gradient-to-br from-ink via-ink to-ink/90 text-cream overflow-hidden relative">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-coral/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-44 h-44 rounded-full bg-lemon/10 blur-3xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-2xl bg-coral/20 border border-coral/30 text-coral">
                  <Upload className="w-6 h-6" />
                </div>
                <Badge className="rounded-full bg-coral text-white border-coral font-bold">
                  NEW
                </Badge>
              </div>
              <h3 className="font-display text-2xl text-cream mb-2 leading-tight">
                Have a new asset to list?
              </h3>
              <p className="font-body text-cream/70 text-sm mb-6">
                Submit high-res photos, set market value, and our team will approve within 24 hours.
                Average time to LIVE: <span className="text-coral font-bold">6.2 hours</span>.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  {
                    icon: <Car className="w-4 h-4" />,
                    label: "Luxury vehicles · ₦20M+ avg ticket",
                  },
                  {
                    icon: <Watch className="w-4 h-4" />,
                    label: "Watches & jewelry · High sell-through",
                  },
                  {
                    icon: <Smartphone className="w-4 h-4" />,
                    label: "Electronics · Fastest draws",
                  },
                  {
                    icon: <Gem className="w-4 h-4" />,
                    label: "Real estate · Premium carousel slot",
                  },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-2 text-cream/80 text-sm font-body"
                  >
                    <span className="text-mint">{t.icon}</span>
                    {t.label}
                  </div>
                ))}
              </div>

              <Button className="w-full rounded-full bg-coral hover:bg-coral/90 text-white py-6 text-base">
                <Upload className="w-5 h-5 mr-2" /> Submit asset for approval
              </Button>
              <p className="text-center text-[11px] text-cream/50 mt-3 font-body">
                <Calendar className="w-3 h-3 inline mr-1" /> Typical review · 24 hours · 94%
                approval rate
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PartnerShell>
  );
}
