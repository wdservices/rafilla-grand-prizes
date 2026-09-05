import { useState } from "react";
import {
  Users,
  Trophy,
  Ticket,
  DollarSign,
  WalletCards,
  UsersRound,
  Banknote,
  Gift,
  Building2,
  Award,
  Undo2,
  ShieldAlert,
  Eye,
  Download,
  CalendarDays,
  X,
  Filter,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminShell } from "@/components/rafilla/admin/shell";
import { cn, formatNaira } from "@/lib/utils";

type ReportKey =
  | "users"
  | "campaigns"
  | "tickets"
  | "revenue"
  | "wallet"
  | "referrals"
  | "payouts"
  | "pool"
  | "partners"
  | "winners"
  | "refunds"
  | "fraud";

interface ReportDef {
  key: ReportKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "ink" | "coral" | "sky" | "mint" | "lemon" | "lilac";
  lastRun: string;
}

const toneBg: Record<ReportDef["tone"], string> = {
  ink: "bg-ink/10",
  coral: "bg-coral/20",
  sky: "bg-sky/30",
  mint: "bg-mint/35",
  lemon: "bg-lemon/40",
  lilac: "bg-lilac/35",
};

const toneText: Record<ReportDef["tone"], string> = {
  ink: "text-ink",
  coral: "text-coral",
  sky: "text-ink",
  mint: "text-ink",
  lemon: "text-ink",
  lilac: "text-ink",
};

const REPORTS: ReportDef[] = [
  { key: "users", label: "Users report", description: "Account sign-ups, verification, role, and status snapshots.", icon: Users, tone: "sky", lastRun: "Today · 07:15" },
  { key: "campaigns", label: "Campaigns / Competition", description: "Full campaign lifecycle: status, partner, entries, dates.", icon: Trophy, tone: "coral", lastRun: "Today · 07:15" },
  { key: "tickets", label: "Tickets sold", description: "Per-competition and aggregate ticket sales with timestamps.", icon: Ticket, tone: "lemon", lastRun: "Today · 07:15" },
  { key: "revenue", label: "Revenue breakdown", description: "Entry revenue, fees, reward pool, partner settlement splits.", icon: DollarSign, tone: "ink", lastRun: "Today · 07:15" },
  { key: "wallet", label: "Wallet funding", description: "Top-ups, channels, success/failure, failed-attempt analysis.", icon: WalletCards, tone: "mint", lastRun: "Today · 07:15" },
  { key: "referrals", label: "Referral commissions", description: "All 5 levels · commission earned, unpaid, paid, clawbacks.", icon: UsersRound, tone: "lemon", lastRun: "Yesterday · 23:55" },
  { key: "payouts", label: "Payouts", description: "Request statuses, banks, size bands, risk-score distribution.", icon: Banknote, tone: "lilac", lastRun: "Today · 07:15" },
  { key: "pool", label: "Reward pool contributions", description: "Per-competition pool % contribution + running platform total.", icon: Gift, tone: "coral", lastRun: "Today · 07:15" },
  { key: "partners", label: "Partners", description: "Partner roster, approval state, campaign count, settlement.", icon: Building2, tone: "sky", lastRun: "Yesterday · 23:55" },
  { key: "winners", label: "Winners", description: "Winners, draw reference, prize value, claim & delivery state.", icon: Award, tone: "mint", lastRun: "Yesterday · 23:55" },
  { key: "refunds", label: "Refunds", description: "Refund requests, reasons, amounts, approvals, and denials.", icon: Undo2, tone: "lemon", lastRun: "2 days ago · 18:40" },
  { key: "fraud", label: "Fraud events", description: "Velocity, duplicate, shared-bank, and review-open event stream.", icon: ShieldAlert, tone: "coral", lastRun: "Today · 07:15" },
];

const PREVIEW_ROWS: Record<ReportKey, { headers: string[]; rows: string[][] }> = {
  users: {
    headers: ["User", "Username", "Email", "Role", "Status", "Verified", "Registered"],
    rows: [
      ["Aisha Mohammed", "@aisha.m", "aisha.m@rafilla.ng", "ADMIN", "ACTIVE", "Full", "2024-08-14"],
      ["Tunde Okafor", "@tunde.o", "tunde.okafor@mail.ng", "USER", "ACTIVE", "Full", "2025-01-22"],
      ["Chidi Kelechi", "@chidi.k", "chidi.k@outlook.com", "USER", "ACTIVE", "Email only", "2025-02-10"],
      ["Amaka Peace", "@amaka.p", "amaka.p@gmail.com", "USER", "ACTIVE", "Full", "2024-12-08"],
      ["Suspicious #4712", "@anon_4712", "temp4712@dispostable.com", "USER", "SUSPENDED", "None", "2026-03-01"],
    ],
  },
  campaigns: {
    headers: ["Title", "Category", "Partner", "Status", "Tickets", "Ticket price", "Start", "Close"],
    rows: [
      ["2026 Mercedes-Benz C-Class", "Auto", "Lux Wheels Ltd", "LIVE", "4,210 / 5,000", formatNaira(10000), "2026-02-12", "2026-03-18"],
      ["Nova X1 Tech Bundle", "Tech", "TechHome NG", "CLOSING", "9,420 / 10,000", formatNaira(5000), "2026-02-01", "2026-03-12"],
      ["Luxury 2-Bed Apartment", "Property", "Adebayo Homes", "SCHEDULED", "0 / 22,500", formatNaira(2500), "2026-03-20", "2026-06-25"],
    ],
  },
  tickets: {
    headers: ["Campaign", "Sold", "Capacity", "Gross revenue", "Pool contribution", "Sold %"],
    rows: [
      ["Mercedes C-Class", "4,210", "5,000", formatNaira(42100000), formatNaira(2105000), "84%"],
      ["Nova X1 Bundle", "9,420", "10,000", formatNaira(47100000), formatNaira(2355000), "94%"],
      ["Ikeja Home Studio", "5,800", "6,000", formatNaira(8700000), formatNaira(435000), "97%"],
    ],
  },
  revenue: {
    headers: ["Date", "Entry revenue", "Fees 3%", "Reward pool 5%", "Partner share", "Net platform"],
    rows: [
      ["2026-03-12", formatNaira(5280000), formatNaira(158400), formatNaira(264000), formatNaira(4060800), formatNaira(796800)],
      ["2026-03-11", formatNaira(4890000), formatNaira(146700), formatNaira(244500), formatNaira(3762330), formatNaira(736470)],
      ["2026-03-10", formatNaira(3920000), formatNaira(117600), formatNaira(196000), formatNaira(3014080), formatNaira(592320)],
    ],
  },
  wallet: {
    headers: ["Date", "Top-ups", "Volume", "Success", "Fail", "Avg size"],
    rows: [
      ["2026-03-12", "312", formatNaira(58127450), "304", "8", formatNaira(186200)],
      ["2026-03-11", "284", formatNaira(52180000), "276", "8", formatNaira(183700)],
      ["2026-03-10", "260", formatNaira(48020000), "255", "5", formatNaira(184700)],
    ],
  },
  referrals: {
    headers: ["Level", "Rate", "Active referrals", "Earned (30d)", "Paid", "Outstanding"],
    rows: [
      ["Level 1", "8%", "2,112", formatNaira(4820000), formatNaira(3420000), formatNaira(1400000)],
      ["Level 2", "5%", "5,820", formatNaira(1920000), formatNaira(1240000), formatNaira(680000)],
      ["Level 3", "4%", "10,400", formatNaira(840000), formatNaira(520000), formatNaira(320000)],
    ],
  },
  payouts: {
    headers: ["Reference", "User", "Amount", "Bank", "Status", "Risk", "Submitted"],
    rows: [
      ["PAY-260312-001", "Amaka Peace", formatNaira(185000), "GTBank", "PAID", "LOW 18", "2026-03-12"],
      ["PAY-260312-003", "Chidi Kelechi", formatNaira(210000), "Zenith", "UNDER REVIEW", "MED 54", "2026-03-12"],
      ["PAY-260311-082", "Velocity User A", formatNaira(150000), "Wema Bank", "REJECTED", "HIGH 91", "2026-03-11"],
    ],
  },
  pool: {
    headers: ["Campaign", "Contribution %", "Tickets", "Amount", "Cumulative pool"],
    rows: [
      ["Mercedes C-Class", "5%", "4,210", formatNaira(2105000), formatNaira(2105000)],
      ["Nova X1 Bundle", "5%", "9,420", formatNaira(2355000), formatNaira(4460000)],
      ["Ikeja Home Studio", "5%", "5,800", formatNaira(435000), formatNaira(4895000)],
    ],
  },
  partners: {
    headers: ["Partner", "Category", "Status", "Campaigns", "Tickets sold", "Settled"],
    rows: [
      ["Lux Wheels Ltd", "Auto", "APPROVED", "4", "12,200", formatNaira(28800000)],
      ["TechHome NG", "Tech", "APPROVED", "6", "28,400", formatNaira(42300000)],
      ["Adebayo Homes", "Property", "APPROVED", "2", "2,100", formatNaira(5600000)],
    ],
  },
  winners: {
    headers: ["Winner", "Campaign", "Prize value", "Draw ref", "Claim", "Delivery"],
    rows: [
      ["Ifeoma D.", "Abuja Generator Pack", "₦750,000", "DRAW-260302-AGP", "VERIFIED", "DELIVERED"],
      ["TBD", "Ikeja Home Studio", "₦12,000,000", "DRAW-260304-IHS", "PENDING", "—"],
      ["Kemi A.", "PH Laptop Suite", "₦950,000", "DRAW-260228-PLS", "IN PROGRESS", "—"],
    ],
  },
  refunds: {
    headers: ["Ref", "User", "Campaign", "Amount", "Reason", "Status"],
    rows: [
      ["REF-260311-04", "Suspended #041", "Eko Weekend", formatNaira(25000), "Duplicate entry", "APPROVED"],
      ["REF-260310-11", "Amaka P.", "Mercedes C-Class", formatNaira(50000), "Customer error", "APPROVED"],
      ["REF-260310-09", "Chidi K.", "Nova Bundle", formatNaira(15000), "Policy exception", "DENIED"],
    ],
  },
  fraud: {
    headers: ["Event", "User", "Signal", "Risk score", "Opened", "Owner"],
    rows: [
      ["Velocity alert", "@anon_4712", "412 entries / 1h", "92 CRITICAL", "2026-03-01", "Fraud Team"],
      ["Duplicate bank", "@vel_a", "Shared bank with 3", "88 HIGH", "2026-02-28", "Fraud Team"],
      ["OTP rate limit", "@bot_trial_04", "12 OTP / 10m", "72 HIGH", "2026-03-05", "Auto"],
    ],
  },
};

export function AdminReportsPage() {
  const [viewing, setViewing] = useState<ReportDef | null>(null);

  const runReport = (r: ReportDef, kind: "view" | "csv") => {
    if (kind === "view") {
      setViewing(r);
      return;
    }
    toast.success("Report generating…", {
      description: `${r.label} · CSV (UTF-8 BOM + Naira formatted) will download when ready. · Last snapshot ${r.lastRun}`,
    });
    setTimeout(() => toast.success(`${r.label}.csv ready`, { description: "Download queued in your browser." }), 900);
  };

  return (
    <AdminShell activeNav="reports">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Reports</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Reports
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Export data snapshots for finance, audit, and operations. All CSVs are UTF-8 BOM encoded
            with consistent naira formatting (integer kobo storage; preview shows formatted Naira).
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {REPORTS.map((r) => (
          <Card
            key={r.key}
            className="group rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none transition-transform hover:-translate-y-0.5"
          >
            <CardContent className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("grid size-12 place-items-center rounded-2xl", toneBg[r.tone])}>
                  <r.icon className={cn("size-5", toneText[r.tone])} />
                </div>
                <Badge className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-extrabold text-ink/60 ring-1 ring-ink/10">
                  <CalendarDays className="mr-1 size-2.5" />
                  {r.lastRun}
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{r.label}</h3>
              <p className="mt-2 min-h-[3.25rem] text-sm font-bold leading-relaxed text-ink/60">
                {r.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runReport(r, "view")}
                  className="group-hover:bg-lilac/20"
                >
                  <Eye className="size-3.5" />
                  View live
                </Button>
                <Button variant="primary" size="sm" onClick={() => runReport(r, "csv")}>
                  <Download className="size-3.5" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="rounded-[28px] bg-cream p-0 shadow-none sm:max-w-5xl">
          <DialogHeader className="flex-row items-start justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:!flex-row sm:!items-center sm:!justify-between sm:!text-left">
            <div>
              <DialogTitle className="flex items-center gap-3 font-display text-2xl font-extrabold text-ink">
                {viewing && (
                  <>
                    <span className={cn("grid size-10 place-items-center rounded-2xl", toneBg[viewing.tone])}>
                      <viewing.icon className={cn("size-4.5", toneText[viewing.tone])} />
                    </span>
                    <div>
                      <p className="font-display text-2xl font-extrabold leading-none">{viewing.label}</p>
                      <p className="mt-1 text-[11px] font-bold text-ink/55">
                        Live preview · Last run {viewing.lastRun}
                      </p>
                    </div>
                  </>
                )}
              </DialogTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewing && toast.success("Report generating…", { description: `${viewing.label} · CSV queued.` })}
              >
                <Download className="size-3.5" />
                Download CSV
              </Button>
              <button
                className="grid size-10 place-items-center rounded-full bg-paper text-ink/65 hover:bg-lilac/20 hover:text-ink"
                onClick={() => setViewing(null)}
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          {viewing && (
            <div className="space-y-4 px-6 py-5">
              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Date range</Label>
                    <div className="mt-2 flex items-center gap-2 rounded-full bg-cream px-3 py-2 text-xs font-bold text-ink/65 ring-1 ring-ink/10">
                      <Filter className="size-3.5" />
                      <Input type="date" defaultValue="2026-02-12" className="h-8 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0" />
                      <span>→</span>
                      <Input type="date" defaultValue="2026-03-12" className="h-8 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Granularity</Label>
                    <Select defaultValue="day">
                      <SelectTrigger className="mt-2 min-h-11 rounded-2xl bg-cream px-3 font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[22px] bg-paper p-1">
                        {["Hour", "Day", "Week", "Month"].map((g) => (
                          <SelectItem key={g} value={g.toLowerCase()} className="rounded-xl font-bold">By {g.toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Format</Label>
                    <Select defaultValue="formatted">
                      <SelectTrigger className="mt-2 min-h-11 rounded-2xl bg-cream px-3 font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[22px] bg-paper p-1">
                        <SelectItem value="formatted" className="rounded-xl font-bold">Naira formatted (preview)</SelectItem>
                        <SelectItem value="kobo" className="rounded-xl font-bold">Integer kobo (raw)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Currency</Label>
                    <Select defaultValue="NGN">
                      <SelectTrigger className="mt-2 min-h-11 rounded-2xl bg-cream px-3 font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[22px] bg-paper p-1">
                        <SelectItem value="NGN" className="rounded-xl font-bold">Nigerian Naira (₦)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="primary" size="md" className="w-full" onClick={() => toast.success("Filters applied", { description: "Preview updated · new CSV ready to export." })}>
                      <BarChart3 className="size-4" /> Apply filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between text-xs font-extrabold text-ink/55">
                <span>Preview · 5 rows · full export contains all matching records</span>
                <span>UTF-8 BOM · columns: {PREVIEW_ROWS[viewing.key].headers.length}</span>
              </div>

              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-cream/60 [&_tr]:border-ink/10">
                        <TableRow>
                          {PREVIEW_ROWS[viewing.key].headers.map((h) => (
                            <TableHead key={h} className="px-4 py-3 font-extrabold text-ink/65">
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="[&_tr]:border-ink/10">
                        {PREVIEW_ROWS[viewing.key].rows.map((row, i) => (
                          <TableRow key={i} className="hover:bg-lilac/10">
                            {row.map((cell, j) => (
                              <TableCell key={j} className="px-4 py-3 text-xs font-bold text-ink/75 whitespace-nowrap">
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
