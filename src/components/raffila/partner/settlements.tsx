import { useState } from "react";
import { toast } from "sonner";
import { PartnerShell } from "./partner-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Landmark,
  Search,
  FileText,
  Download,
  Calendar,
  Filter,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Building,
  TrendingUp,
  CreditCard,
  Receipt,
  ChevronDown,
  ChevronUp,
  Info,
  Eye,
  XCircle,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

type StlStatus = "pending" | "processing" | "paid" | "failed" | "reversed";

interface Settlement {
  id: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  grossKobo: number;
  feeKobo: number;
  taxKobo: number;
  netKobo: number;
  status: StlStatus;
  payoutDate: string;
  txnRef: string;
  bankName: string;
  acctMask: string;
  listings: number;
  entries: number;
  invoiceId: string;
}

const BANKS = [
  "Zenith Bank",
  "GTBank",
  "Access Bank",
  "UBA",
  "First Bank",
  "Stanbic IBTC",
  "Wema",
  "FCMB",
];

function makeStl(i: number): Settlement {
  const base = 8000000 + i * 2145000;
  const fee = Math.floor(base * 0.05);
  const tax = Math.floor(base * 0.0075);
  const statuses: StlStatus[] = [
    "paid",
    "paid",
    "paid",
    "paid",
    "processing",
    "pending",
    "paid",
    "failed",
    "paid",
    "reversed",
  ];
  const s = statuses[i % statuses.length]!;
  const wStart = new Date(Date.now() - (i + 1) * 7 * 86400000);
  const wEnd = new Date(wStart.getTime() + 6 * 86400000);
  const fmtD = (d: Date) => d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", timeZone: "Africa/Lagos" });
  const payoutD = new Date(
    wEnd.getTime() +
      (s === "pending" ? 2 : s === "processing" ? 1 : s === "paid" ? 3 : 5) * 86400000,
  );
  return {
    id: `STL-W${38 - i}-${String(4000 - i * 31).slice(0, 4)}`,
    period: `Week ${38 - i} · ${fmtD(wStart)} – ${fmtD(wEnd)}`,
    periodStart: wStart.toISOString().slice(0, 10),
    periodEnd: wEnd.toISOString().slice(0, 10),
    grossKobo: base * 100,
    feeKobo: fee * 100,
    taxKobo: tax * 100,
    netKobo: (base - fee - tax) * 100,
    status: s,
    payoutDate: payoutD.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      timeZone: "Africa/Lagos",
    }),
    txnRef:
      s === "paid"
        ? `PSTK-${String(5000000 + i * 831).slice(0, 7)}`
        : s === "failed"
          ? "FAILED-NSF"
          : s === "reversed"
            ? `RV-${String(2000 + i).slice(0, 4)}`
            : "PROCESSING",
    bankName: BANKS[i % BANKS.length]!,
    acctMask: `***${String(1000 + i * 137).slice(0, 4)}`,
    listings: 3 + (i % 6),
    entries: 1800 + i * 287,
    invoiceId: `INV-RFL-${String(8000 + i).slice(0, 4)}`,
  };
}

const SETTLEMENTS: Settlement[] = Array.from({ length: 22 }, (_, i) => makeStl(i));

function statusBadge(s: StlStatus) {
  switch (s) {
    case "paid":
      return (
        <Badge className="rounded-full bg-mint/40 border-mint text-ink font-bold text-[10px]">
          <CheckCircle2 className="w-3 h-3 mr-1" /> PAID
        </Badge>
      );
    case "processing":
      return (
        <Badge
          variant="outline"
          className="rounded-full bg-sky/20 border-sky text-ink text-[10px] animate-pulse"
        >
          <ArrowLeftRight className="w-3 h-3 mr-1" /> PROCESSING
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="rounded-full bg-lemon/30 border-lemon text-ink text-[10px]"
        >
          <Clock className="w-3 h-3 mr-1" /> PENDING
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="rounded-full bg-coral/15 border-coral text-coral text-[10px] font-bold"
        >
          <XCircle className="w-3 h-3 mr-1" /> FAILED
        </Badge>
      );
    case "reversed":
      return (
        <Badge
          variant="outline"
          className="rounded-full bg-ink/10 border-ink/30 text-ink text-[10px]"
        >
          REVERSED
        </Badge>
      );
  }
}

export function PartnerSettlementsPage() {
  const [tab, setTab] = useState<"all" | "pending" | "paid">("all");
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("2026");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = SETTLEMENTS.filter((s) => {
    if (tab === "pending" && s.status !== "pending" && s.status !== "processing") return false;
    if (tab === "paid" && s.status !== "paid") return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !s.id.toLowerCase().includes(q) &&
        !s.period.toLowerCase().includes(q) &&
        !s.invoiceId.toLowerCase().includes(q) &&
        !s.txnRef.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const stats = {
    totalPaid: SETTLEMENTS.filter((s) => s.status === "paid").reduce(
      (sum, s) => sum + s.netKobo,
      0,
    ),
    pending: SETTLEMENTS.filter((s) => s.status === "pending").reduce(
      (sum, s) => sum + s.netKobo,
      0,
    ),
    processing: SETTLEMENTS.filter((s) => s.status === "processing").reduce(
      (sum, s) => sum + s.netKobo,
      0,
    ),
    ytd: SETTLEMENTS.reduce((sum, s) => sum + s.netKobo, 0),
    failed: SETTLEMENTS.filter((s) => s.status === "failed" || s.status === "reversed").length,
  };

  const nextUp = SETTLEMENTS.find((s) => s.status === "pending") ?? SETTLEMENTS[0]!;

  return (
    <PartnerShell activeNav="settlements" title="Settlements">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              <Landmark className="w-7 h-7 text-coral" /> Settlements
            </h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Weekly disbursements to your registered bank account — Zenith · Acc ***7821.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full">
              <FileText className="w-4 h-4 mr-2" /> Tax statement
            </Button>
            <Button variant="outline" className="rounded-full">
              <Download className="w-4 h-4 mr-2" /> Export all
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <Card className="xl:col-span-2 bg-gradient-to-br from-coral/[0.08] via-lemon/[0.08] to-mint/[0.08] border-ink/10">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full bg-lemon/30 border-lemon text-ink text-[10px] font-bold"
                >
                  <Clock className="w-3 h-3 mr-1" /> NEXT UP
                </Badge>
                <Badge className="rounded-full bg-ink/10 text-ink/70 text-[10px] border-0">
                  {nextUp.period}
                </Badge>
              </div>
              <p className="text-xs text-ink/60 font-body uppercase tracking-wider">
                Amount releasing
              </p>
              <p className="font-display text-4xl text-coral font-bold">
                {formatNaira(nextUp.netKobo)}
              </p>
              <Separator className="bg-ink/10" />
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm font-body">
                <span className="text-ink/60">Payout date</span>
                <Badge className="rounded-full bg-coral text-white border-coral font-bold">
                  {nextUp.payoutDate}
                </Badge>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm font-body">
                <span className="text-ink/60">Destination</span>
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> {nextUp.bankName} · {nextUp.acctMask}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-ink/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-mint/30 text-ink">
                  <Wallet className="w-5 h-5" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">
                  Paid · MTD
                </p>
              </div>
              <p className="font-display text-2xl text-ink font-bold">
                {formatNaira(stats.totalPaid)}
              </p>
              <p className="text-[11px] font-body text-mint flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +41.8% vs last month
              </p>
            </CardContent>
          </Card>
          <Card className="border-ink/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-sky/20 text-sky">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">
                  In flight
                </p>
              </div>
              <p className="font-display text-2xl text-ink font-bold">
                {formatNaira(stats.pending + stats.processing)}
              </p>
              <p className="text-[11px] font-body text-ink/60 mt-1">
                Pending {formatNaira(stats.pending)} · Processing {formatNaira(stats.processing)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-ink/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-lemon/30 text-ink">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">
                  YTD total
                </p>
              </div>
              <p className="font-display text-2xl text-ink font-bold">{formatNaira(stats.ytd)}</p>
              <p className="text-[11px] font-body text-ink/60 mt-1">
                {SETTLEMENTS.filter((s) => s.status === "paid").length} settlements · {stats.failed}{" "}
                exceptions
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-ink/10 overflow-hidden">
          <CardHeader className="pb-3 bg-cream/40 border-b border-ink/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
                <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                  <TabsList className="rounded-full">
                    <TabsTrigger
                      value="all"
                      className="rounded-full px-5 data-[state=active]:bg-coral data-[state=active]:text-white"
                    >
                      All · {SETTLEMENTS.length}
                    </TabsTrigger>
                    <TabsTrigger
                      value="pending"
                      className="rounded-full px-5 data-[state=active]:bg-coral data-[state=active]:text-white"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending ·{" "}
                      {
                        SETTLEMENTS.filter(
                          (s) => s.status === "pending" || s.status === "processing",
                        ).length
                      }
                    </TabsTrigger>
                    <TabsTrigger
                      value="paid"
                      className="rounded-full px-5 data-[state=active]:bg-coral data-[state=active]:text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Paid ·{" "}
                      {SETTLEMENTS.filter((s) => s.status === "paid").length}
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-ink/40" />
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="rounded-full w-28 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                      <Input
                        className="pl-9 rounded-full w-56 h-9 text-sm"
                        placeholder="ID, period, invoice..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={tab}>
              {(["all", "pending", "paid"] as const).map((t) => (
                <TabsContent key={t} value={t} className="m-0 mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b border-ink/10 bg-cream/30">
                          <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3">
                            Settlement
                          </th>
                          <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden sm:table-cell">
                            Period
                          </th>
                          <th className="text-right text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden md:table-cell">
                            Gross
                          </th>
                          <th className="text-right text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden md:table-cell">
                            Fees
                          </th>
                          <th className="text-right text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3">
                            Net
                          </th>
                          <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3">
                            Status
                          </th>
                          <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden lg:table-cell">
                            Payout
                          </th>
                          <th className="text-right text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-12 text-center">
                              <Landmark className="w-10 h-10 text-ink/20 mx-auto mb-2" />
                              <p className="font-body text-ink/50 text-sm">No settlements match</p>
                            </td>
                          </tr>
                        )}
                        {filtered.map((s) => {
                          const isExpanded = expanded === s.id;
                          return (
                            <>
                              <tr
                                key={s.id}
                                className={`hover:bg-cream/40 cursor-pointer ${isExpanded ? "bg-coral/[0.04]" : ""}`}
                                onClick={() => setExpanded(isExpanded ? null : s.id)}
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                        s.status === "paid"
                                          ? "bg-mint/30 text-ink"
                                          : s.status === "processing"
                                            ? "bg-sky/20 text-sky"
                                            : s.status === "pending"
                                              ? "bg-lemon/30 text-ink"
                                              : "bg-ink/10 text-ink/60"
                                      }`}
                                    >
                                      <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="font-display text-ink font-semibold text-sm">
                                        {s.id}
                                      </p>
                                      <p className="text-[11px] font-mono text-ink/40">
                                        {s.invoiceId}
                                      </p>
                                    </div>
                                    <div className="lg:hidden">
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-coral" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-ink/30" />
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4 hidden sm:table-cell">
                                  <p className="font-body text-ink text-sm">{s.period}</p>
                                  <p className="text-[11px] text-ink/40 font-body">
                                    {s.listings} listings · {s.entries.toLocaleString()} entries
                                  </p>
                                </td>
                                <td className="px-5 py-4 text-right hidden md:table-cell">
                                  <p className="font-display text-ink font-semibold">
                                    {formatNaira(s.grossKobo)}
                                  </p>
                                </td>
                                <td className="px-5 py-4 text-right hidden md:table-cell">
                                  <p className="font-body text-ink/60 text-sm">
                                    -{formatNaira(s.feeKobo + s.taxKobo)}
                                  </p>
                                  <p className="text-[10px] text-ink/40 font-mono">
                                    5% fee + 0.75% tax
                                  </p>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <p className="font-display text-coral font-bold">
                                    {formatNaira(s.netKobo)}
                                  </p>
                                </td>
                                <td className="px-5 py-4">{statusBadge(s.status)}</td>
                                <td className="px-5 py-4 hidden lg:table-cell">
                                  <p className="font-body text-ink text-sm">{s.payoutDate}</p>
                                  <p className="text-[11px] text-ink/40 font-mono">{s.txnRef}</p>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div
                                    className="flex items-center justify-end gap-1.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="rounded-full h-8 w-8 hover:bg-coral/10 hover:text-coral"
                                      onClick={() =>
                                        toast.success(`Invoice ${s.invoiceId} downloaded`)
                                      }
                                    >
                                      <Receipt className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="rounded-full hidden sm:inline-flex"
                                      onClick={() => toast.success(`Opening ${s.id} receipt`)}
                                    >
                                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                                    </Button>
                                    <span className="lg:hidden">
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-coral" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-ink/30" />
                                      )}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-cream/50 border-b-2 border-coral/20">
                                  <td colSpan={8} className="px-5 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                      <div className="p-4 rounded-xl bg-paper border border-ink/10">
                                        <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body mb-2 flex items-center gap-1">
                                          <Info className="w-3 h-3" /> Breakdown
                                        </p>
                                        <div className="space-y-1.5 text-sm font-body">
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Gross</span>
                                            <span className="font-semibold">
                                              {formatNaira(s.grossKobo)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Platform fee (5%)</span>
                                            <span className="text-coral">
                                              -{formatNaira(s.feeKobo)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">
                                              Withholding tax (0.75%)
                                            </span>
                                            <span className="text-coral">
                                              -{formatNaira(s.taxKobo)}
                                            </span>
                                          </div>
                                          <Separator className="my-1 bg-ink/10" />
                                          <div className="flex justify-between">
                                            <span className="font-bold text-ink">NET</span>
                                            <span className="font-display font-bold text-coral text-lg">
                                              {formatNaira(s.netKobo)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-4 rounded-xl bg-paper border border-ink/10">
                                        <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body mb-2 flex items-center gap-1">
                                          <Building className="w-3 h-3" /> Destination
                                        </p>
                                        <div className="space-y-1.5 text-sm font-body">
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Bank</span>
                                            <span className="font-semibold">{s.bankName}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Account</span>
                                            <span className="font-mono font-semibold">
                                              {s.acctMask}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Scheduled</span>
                                            <span className="font-semibold">{s.payoutDate}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Txn ref</span>
                                            <span className="font-mono text-[11px]">
                                              {s.txnRef}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-4 rounded-xl bg-paper border border-ink/10">
                                        <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body mb-2 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" /> Period details
                                        </p>
                                        <div className="space-y-1.5 text-sm font-body">
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Start</span>
                                            <span>{s.periodStart}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">End</span>
                                            <span>{s.periodEnd}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Listings</span>
                                            <span className="font-semibold">{s.listings}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-ink/60">Entries</span>
                                            <span className="font-semibold">
                                              {s.entries.toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-4 rounded-xl bg-gradient-to-br from-ink via-ink to-ink/90 text-cream">
                                        <p className="text-[10px] uppercase tracking-wider text-cream/50 font-body mb-3 flex items-center gap-1">
                                          <FileText className="w-3 h-3" /> Actions
                                        </p>
                                        <div className="space-y-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full rounded-full bg-cream/10 border-cream/20 text-cream hover:bg-cream hover:text-ink"
                                            onClick={() =>
                                              toast.success(`Invoice ${s.invoiceId}.pdf`)
                                            }
                                          >
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                                            invoice PDF
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full rounded-full bg-cream/10 border-cream/20 text-cream hover:bg-cream hover:text-ink"
                                            onClick={() => toast.success(`Receipt ${s.id} opened`)}
                                          >
                                            <Receipt className="w-3.5 h-3.5 mr-1.5" /> View receipt
                                          </Button>
                                          {s.status === "failed" && (
                                            <Button
                                              size="sm"
                                              className="w-full rounded-full bg-coral text-white hover:bg-coral/90"
                                              onClick={() => toast.info("Retrying settlement...")}
                                            >
                                              <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />{" "}
                                              Retry payout
                                            </Button>
                                          )}
                                          {s.status === "pending" && (
                                            <p className="text-[11px] text-lemon text-center pt-1 font-body">
                                              ⏳ Releases {s.payoutDate} · No action required
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length > 0 && (
                    <div className="p-4 border-t border-ink/10 bg-cream/30 flex items-center justify-between flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full font-body">
                        Showing {filtered.length} / {SETTLEMENTS.length}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full" disabled>
                          ← Prev
                        </Button>
                        <Badge className="rounded-full bg-ink text-cream font-mono">1 / 2</Badge>
                        <Button variant="outline" size="sm" className="rounded-full" disabled>
                          Next →
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PartnerShell>
  );
}
