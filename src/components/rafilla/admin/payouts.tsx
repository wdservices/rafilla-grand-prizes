import { useMemo, useState } from "react";
import {
  Search,
  Download,
  MoreHorizontal,
  Banknote,
  Eye,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  X,
  Unlock,
  ShieldCheck,
  History,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/components/rafilla/admin/shell";
import { cn, formatNaira } from "@/lib/utils";

type PayoutStatus = "PENDING" | "UNDER REVIEW" | "APPROVED" | "PROCESSING" | "PAID" | "REJECTED" | "FAILED" | "CANCELLED";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface MockPayout {
  ref: string;
  user: string;
  username: string;
  initials: string;
  tint: "sky" | "mint" | "coral" | "lemon" | "lilac";
  amount: number;
  bankName: string;
  accountNo: string;
  accountFull: string;
  status: PayoutStatus;
  submitted: string;
  updated: string;
  updatedBy: string;
  risk: RiskLevel;
  riskScore: number;
  factors: string[];
  available: number;
  notes?: string;
}

const tintBg: Record<MockPayout["tint"], string> = {
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/35 text-ink",
  coral: "bg-coral/20 text-coral",
  lemon: "bg-lemon/40 text-ink",
  lilac: "bg-lilac/35 text-ink",
};

const statusTint: Record<PayoutStatus, string> = {
  "PENDING": "bg-sky/25 text-ink",
  "UNDER REVIEW": "bg-lemon/40 text-ink",
  "APPROVED": "bg-ink text-cream",
  "PROCESSING": "bg-coral/20 text-coral",
  "PAID": "bg-mint/35 text-ink",
  "REJECTED": "bg-rose/25 text-ink",
  "FAILED": "bg-rose/25 text-ink",
  "CANCELLED": "bg-ink/10 text-ink/55",
};

const riskTint: Record<RiskLevel, string> = {
  LOW: "bg-mint/30 text-ink",
  MEDIUM: "bg-lemon/40 text-ink",
  HIGH: "bg-coral/20 text-coral",
};

const FILTER_STATUSES: PayoutStatus[] = ["PENDING", "UNDER REVIEW", "APPROVED", "PROCESSING", "PAID", "REJECTED", "FAILED", "CANCELLED"];

const BANKS = ["All", "Access Bank", "GTBank", "First Bank", "Zenith Bank", "UBA", "FCMB", "Stanbic IBTC", "Sterling", "Wema Bank"] as const;
const RISKS = ["All", "L", "M", "H"] as const;

const MOCK_PAYOUTS: MockPayout[] = [
  { ref: "PAY-260312-001", user: "Amaka Peace", username: "@amaka.p", initials: "AP", tint: "lilac", amount: 185000, bankName: "GTBank", accountNo: "****1234", accountFull: "0123451234", status: "PAID", submitted: "2026-03-12 08:14", updated: "2026-03-12 11:42", updatedBy: "Finance Bola", risk: "LOW", riskScore: 18, factors: ["Consistent history", "Verified bank"], available: 328000, notes: "Paid via GT transfer · ref GT_77231A" },
  { ref: "PAY-260312-002", user: "Tunde Okafor", username: "@tunde.o", initials: "TO", tint: "sky", amount: 42000, bankName: "Access Bank", accountNo: "****8812", accountFull: "0034568812", status: "PENDING", submitted: "2026-03-12 09:28", updated: "2026-03-12 09:28", updatedBy: "—", risk: "LOW", riskScore: 12, factors: ["First payout · auto-reviewed"], available: 68500 },
  { ref: "PAY-260312-003", user: "Chidi Kelechi", username: "@chidi.k", initials: "CK", tint: "mint", amount: 210000, bankName: "Zenith Bank", accountNo: "****4490", accountFull: "0122004490", status: "UNDER REVIEW", submitted: "2026-03-12 06:44", updated: "2026-03-12 10:01", updatedBy: "Risk Team", risk: "MEDIUM", riskScore: 54, factors: ["Unusual size", "2x weekly cap"], available: 245000 },
  { ref: "PAY-260312-004", user: "Ifeoma Dike", username: "@ifeoma.d", initials: "ID", tint: "coral", amount: 85000, bankName: "UBA", accountNo: "****0021", accountFull: "0055780021", status: "APPROVED", submitted: "2026-03-11 17:02", updated: "2026-03-12 07:55", updatedBy: "Admin Aisha", risk: "LOW", riskScore: 10, factors: ["Partner approved winner claim"], available: 120500 },
  { ref: "PAY-260312-005", user: "Kemi Adedeji", username: "@kemi.a", initials: "KA", tint: "lemon", amount: 105400, bankName: "First Bank", accountNo: "****7702", accountFull: "0011887702", status: "PROCESSING", submitted: "2026-03-11 20:11", updated: "2026-03-12 10:30", updatedBy: "Finance Bola", risk: "LOW", riskScore: 16, factors: ["Queue · disbursing today"], available: 412000 },
  { ref: "PAY-260311-082", user: "Velocity User A", username: "@vel_a", initials: "VA", tint: "coral", amount: 150000, bankName: "Wema Bank", accountNo: "****0099", accountFull: "0011000099", status: "REJECTED", submitted: "2026-03-11 09:00", updated: "2026-03-11 16:20", updatedBy: "Fraud Team", risk: "HIGH", riskScore: 91, factors: ["Suspended account", "Duplicate bank flagged"], available: 0, notes: "Rejected: account suspended for velocity fraud. Audit: #FR-4421" },
  { ref: "PAY-260311-064", user: "Ngozi Gift", username: "@ngozi.g", initials: "NG", tint: "lemon", amount: 14200, bankName: "Sterling", accountNo: "****3301", accountFull: "0099123301", status: "FAILED", submitted: "2026-03-11 14:15", updated: "2026-03-11 14:50", updatedBy: "System", risk: "LOW", riskScore: 8, factors: ["Bank API timeout"], available: 48000, notes: "Auto retried — attempt 2" },
  { ref: "PAY-260311-041", user: "Femi Johnson", username: "@femi.j", initials: "FJ", tint: "sky", amount: 55000, bankName: "Stanbic IBTC", accountNo: "****1188", accountFull: "0009211188", status: "PAID", submitted: "2026-03-11 10:18", updated: "2026-03-11 13:04", updatedBy: "Finance Bola", risk: "LOW", riskScore: 14, factors: ["12th clean payout"], available: 410000 },
  { ref: "PAY-260310-019", user: "User retract 1", username: "@retract1", initials: "R1", tint: "ink", amount: 38000, bankName: "FCMB", accountNo: "****5512", accountFull: "0211665512", status: "CANCELLED", submitted: "2026-03-10 11:30", updated: "2026-03-10 11:58", updatedBy: "User", risk: "LOW", riskScore: 0, factors: ["User-initiated cancel"], available: 38000 },
  { ref: "PAY-260310-007", user: "Zainab Sani", username: "@zainab.s", initials: "ZS", tint: "mint", amount: 68000, bankName: "GTBank", accountNo: "****2245", accountFull: "0124882245", status: "PAID", submitted: "2026-03-10 07:45", updated: "2026-03-10 10:12", updatedBy: "Finance Bola", risk: "LOW", riskScore: 10, factors: ["Consistent history"], available: 65000 },
];

const STAT_PILLS: Array<{ label: string; count: number; amount: number; tone: "sky" | "lemon" | "ink" | "coral" | "mint" | "rose" }> = [
  { label: "Total pending", count: 38, amount: 2847200, tone: "sky" },
  { label: "Under review", count: 12, amount: 842000, tone: "lemon" },
  { label: "Approved", count: 8, amount: 427500, tone: "ink" },
  { label: "Paid", count: 182, amount: 18420300, tone: "mint" },
  { label: "Rejected", count: 6, amount: 171000, tone: "rose" },
];

const statToneBg: Record<(typeof STAT_PILLS)[number]["tone"], string> = {
  sky: "bg-sky/25 text-ink",
  lemon: "bg-lemon/40 text-ink",
  ink: "bg-ink text-cream",
  coral: "bg-coral/18 text-coral",
  mint: "bg-mint/30 text-ink",
  rose: "bg-rose/25 text-ink",
};

export function AdminPayoutsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PayoutStatus[]>([]);
  const [bank, setBank] = useState<(typeof BANKS)[number]>("All");
  const [risk, setRisk] = useState<(typeof RISKS)[number]>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [active, setActive] = useState<MockPayout | null>(null);
  const [rejecting, setRejecting] = useState<MockPayout | null>(null);

  const filtered = useMemo(
    () =>
      MOCK_PAYOUTS.filter((p) => {
        const q = query.toLowerCase().trim();
        if (q && !(p.user.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q))) return false;
        if (statusFilter.length && !statusFilter.includes(p.status)) return false;
        if (bank !== "All" && p.bankName !== bank) return false;
        if (risk !== "All") {
          const map = { L: "LOW", M: "MEDIUM", H: "HIGH" } as const;
          if (p.risk !== map[risk as "L" | "M" | "H"]) return false;
        }
        if (from && p.submitted.slice(0, 10) < from) return false;
        if (to && p.submitted.slice(0, 10) > to) return false;
        if (min && p.amount < Number(min)) return false;
        if (max && p.amount > Number(max)) return false;
        return true;
      }),
    [query, statusFilter, bank, risk, from, to, min, max],
  );

  const advance = (p: MockPayout, next: PayoutStatus) => {
    toast.success("Payout updated", {
      description: `${p.ref} · ${p.status} → ${next} · by Admin Aisha · audit written.`,
    });
  };

  const toggleStatus = (s: PayoutStatus) =>
    setStatusFilter((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <AdminShell activeNav="payouts">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Payouts</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Payout requests
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Referral-earning cash payouts go through review before being released. Every status
            change leaves an immutable trail with the admin and notes.
          </p>
        </div>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {STAT_PILLS.map((s) => (
          <Card
            key={s.label}
            className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold", statToneBg[s.tone])}>
                  <Banknote className="size-3" />
                  {s.label}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-display text-2xl font-extrabold text-ink">{s.count}</p>
                <span className="text-[11px] font-bold text-ink/45">requests</span>
              </div>
              <p className="mt-1 text-sm font-extrabold text-ink">{formatNaira(s.amount)}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mb-5 rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <label className="flex min-h-11 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50 md:col-span-4">
              <Search className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search user, ref, username..."
                className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
              />
            </label>
            <div className="md:col-span-2">
              <Select value={bank} onValueChange={(v) => setBank(v as typeof bank)}>
                <SelectTrigger className="min-h-11 rounded-full bg-sky/25 px-4 font-extrabold text-ink ring-0">
                  <SelectValue placeholder="Bank" />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  {BANKS.map((b) => (
                    <SelectItem key={b} value={b} className="rounded-xl font-bold">{b === "All" ? "All banks" : b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Select value={risk} onValueChange={(v) => setRisk(v as typeof risk)}>
                <SelectTrigger className="min-h-11 rounded-full bg-lemon/35 px-4 font-extrabold text-ink ring-0">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  {RISKS.map((r) => (
                    <SelectItem key={r} value={r} className="rounded-xl font-bold">Risk {r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-5 flex flex-wrap justify-end gap-2">
              <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-xs font-extrabold text-ink/65 ring-1 ring-ink/5">
                <Clock3 className="size-3.5" />
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 border-0 bg-transparent p-0 text-xs font-bold text-ink shadow-none focus-visible:ring-0" />
                <span>→</span>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 border-0 bg-transparent p-0 text-xs font-bold text-ink shadow-none focus-visible:ring-0" />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-xs font-extrabold text-ink/65 ring-1 ring-ink/5">
                <span>₦ min</span>
                <Input type="number" value={min} onChange={(e) => setMin(e.target.value)} placeholder="0" className="h-8 w-20 border-0 bg-transparent p-0 text-xs font-bold text-ink shadow-none focus-visible:ring-0" />
                <span>max</span>
                <Input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="500000" className="h-8 w-24 border-0 bg-transparent p-0 text-xs font-bold text-ink shadow-none focus-visible:ring-0" />
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success("CSV export queued", { description: "payouts_export.csv (UTF-8 BOM, Naira formatted)" })}>
                <Download className="size-3.5" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Status</span>
            <button
              onClick={() => setStatusFilter([])}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-colors",
                statusFilter.length === 0 ? "bg-ink text-cream" : "bg-cream text-ink/60 ring-1 ring-ink/10 hover:bg-lilac/20",
              )}
            >
              ALL
            </button>
            {FILTER_STATUSES.map((s) => {
              const on = statusFilter.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-extrabold ring-1 transition-colors",
                    on ? `${statusTint[s]} ring-transparent` : "bg-cream text-ink/60 ring-ink/10 hover:bg-lilac/20",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-cream/60 [&_tr]:border-ink/10">
                <TableRow>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Reference</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">User</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Amount</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Bank details</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Status</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Submitted</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Last updated</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Risk</TableHead>
                  <TableHead className="px-4 py-3 text-right font-extrabold text-ink/65"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-ink/10">
                {filtered.map((p) => (
                  <TableRow key={p.ref} className="cursor-pointer hover:bg-lilac/10" onClick={() => setActive(p)}>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <p className="font-mono text-xs font-extrabold text-ink">{p.ref}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("size-9", tintBg[p.tint])}>
                          <AvatarFallback className={cn("text-[11px] font-extrabold", tintBg[p.tint])}>{p.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-ink">{p.user}</p>
                          <p className="truncate text-[11px] font-bold text-ink/50">{p.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-display text-base font-extrabold text-ink">{formatNaira(p.amount)}</TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-xs font-bold">
                      <p className="font-extrabold text-ink">{p.bankName}</p>
                      <p className="text-ink/55">{p.accountNo}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", statusTint[p.status])}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-bold text-ink/65">{p.submitted}</TableCell>
                    <TableCell className="px-4 py-3 text-xs font-bold text-ink/65">
                      <p>{p.updated}</p>
                      <p className="text-[11px] text-ink/45">{p.updatedBy}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-0", riskTint[p.risk])}>
                          {p.risk}
                        </Badge>
                        <span className="text-[11px] font-extrabold text-ink/45">score {p.riskScore}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-9">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60 rounded-[22px] bg-paper p-2">
                          <DropdownMenuLabel className="rounded-xl bg-cream px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                            {p.ref}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-lilac/20" onClick={() => setActive(p)}>
                            <Eye className="mr-2 size-4" /> View details
                          </DropdownMenuItem>
                          {p.status === "PENDING" && (
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-lemon/30" onClick={() => advance(p, "UNDER REVIEW")}>
                              <Clock3 className="mr-2 size-4" /> Mark under review
                            </DropdownMenuItem>
                          )}
                          {(p.status === "PENDING" || p.status === "UNDER REVIEW") && (
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-ink/10" onClick={() => advance(p, "APPROVED")}>
                              <CheckCircle2 className="mr-2 size-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {p.status === "APPROVED" && (
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-coral/15" onClick={() => advance(p, "PROCESSING")}>
                              <TrendingUp className="mr-2 size-4" /> Mark processing
                            </DropdownMenuItem>
                          )}
                          {(p.status === "PROCESSING" || p.status === "APPROVED") && (
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-mint/25" onClick={() => advance(p, "PAID")}>
                              <CheckCircle2 className="mr-2 size-4" /> Mark Paid
                            </DropdownMenuItem>
                          )}
                          {(p.status === "PENDING" || p.status === "UNDER REVIEW" || p.status === "APPROVED") && (
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-coral/15" onClick={() => setRejecting(p)}>
                              <XCircle className="mr-2 size-4" /> Reject…
                            </DropdownMenuItem>
                          )}
                          {(p.status === "PENDING" || p.status === "UNDER REVIEW") && (
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-ink/10" onClick={() => advance(p, "CANCELLED")}>
                              <X className="mr-2 size-4" /> Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="px-4 py-12 text-center text-sm font-extrabold text-ink/45">
                      No payouts match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="w-full max-w-xl overflow-y-auto rounded-l-[28px] bg-cream p-0 sm:max-w-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur">
            {active && (
              <div className="min-w-0">
                <p className="font-mono text-xs font-extrabold text-coral">{active.ref}</p>
                <p className="mt-1 truncate font-display text-lg font-extrabold text-ink">
                  {active.user} · {formatNaira(active.amount)}
                </p>
              </div>
            )}
            <button
              className="grid size-10 place-items-center rounded-full bg-paper text-ink/65 hover:bg-lilac/20 hover:text-ink"
              onClick={() => setActive(null)}
            >
              <X className="size-4" />
            </button>
          </div>

          {active && (
            <div className="space-y-5 px-6 py-6">
              <div className="grid grid-cols-2 gap-3">
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Available balance</p>
                    <p className="mt-2 font-display text-xl font-extrabold text-ink">{formatNaira(active.available)}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Status</p>
                    <div className="mt-2"><Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", statusTint[active.status])}>{active.status}</Badge></div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">User summary</p>
                    <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-0", riskTint[active.risk])}>Risk {active.risk} · {active.riskScore}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className={cn("size-11", tintBg[active.tint])}>
                      <AvatarFallback className={cn("text-sm font-extrabold", tintBg[active.tint])}>{active.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-extrabold text-ink">{active.user}</p>
                      <p className="truncate text-xs font-bold text-ink/55">{active.username}</p>
                    </div>
                    <Button variant="outline" size="sm"><UserRound className="size-3.5" /> Open profile</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Bank details</p>
                    <Button variant="outline" size="sm" onClick={() => toast.success("Account unmasked", { description: `${active.bankName} · ${active.accountFull} (audited)` })}>
                      <Unlock className="size-3.5" /> Unmask
                    </Button>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Bank", active.bankName],
                      ["Account no", active.accountNo],
                      ["Payout amount", formatNaira(active.amount)],
                      ["Submitted", active.submitted],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/10">
                        <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">{k}</dt>
                        <dd className="mt-1 truncate font-bold text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Payout history · {active.username}</p>
                    <History className="size-4 text-ink/45" />
                  </div>
                  <div className="mt-4 divide-y divide-ink/10">
                    {[
                      ["2026-02-28", "Paid", "₦55,000", "GTBank · ****4421", "mint"],
                      ["2026-02-10", "Paid", "₦28,500", "GTBank · ****4421", "mint"],
                      ["2026-01-21", "Paid", "₦120,000", "GTBank · ****4421", "mint"],
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-ink">{r[1]} · {r[2]}</p>
                          <p className="truncate text-[11px] font-bold text-ink/55">{r[3]}</p>
                        </div>
                        <span className="text-[11px] font-extrabold text-ink/45">{r[0]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Commission source (ledger trace)</p>
                    <TrendingUp className="size-4 text-coral" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      ["Level 1 · @tunde.o (×25 entries)", "₦20,000", "coral"],
                      ["Level 2 · @chidi.k (×12 entries)", "₦3,000", "sky"],
                      ["Level 1 · @kemi.a (×40 entries)", "₦16,000", "coral"],
                      ["Referral bonus (weekly leaderboard)", "₦500", "lemon"],
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
                        <p className="text-xs font-extrabold text-ink">{r[0]}</p>
                        <p className="text-sm font-extrabold text-coral">+{r[1]}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Risk factors</p>
                    <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-0", riskTint[active.risk])}>
                      <ShieldAlert className="mr-1 size-2.5" /> Score {active.riskScore}
                    </Badge>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {active.factors.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/10">
                        <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", active.risk === "LOW" ? "text-mint" : active.risk === "MEDIUM" ? "text-lemon" : "text-coral")} />
                        <span className="text-sm font-bold text-ink">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {active.notes && (
                    <div className="mt-4 rounded-2xl bg-coral/12 px-4 py-3 text-xs font-extrabold text-coral ring-1 ring-coral/20">
                      {active.notes}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Timeline</p>
                    <ShieldCheck className="size-4 text-ink/45" />
                  </div>
                  <ol className="mt-4 space-y-4">
                    {[
                      ["Submitted by user", active.submitted, "System", "sky"],
                      ["Queued for review", active.submitted, "Auto", "lemon"],
                      ["Status → " + active.status, active.updated, active.updatedBy, active.status === "PAID" ? "mint" : active.status === "REJECTED" ? "rose" : "coral"],
                    ].map(([label, time, by, tint], i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-1 grid size-8 place-items-center rounded-full text-[11px] font-extrabold text-ink"
                          style={{ backgroundColor:
                            tint === "sky" ? "oklch(0.76 0.12 255 / 0.3)" :
                            tint === "lemon" ? "oklch(0.87 0.14 88 / 0.45)" :
                            tint === "mint" ? "oklch(0.87 0.12 165 / 0.35)" :
                            tint === "rose" ? "oklch(0.79 0.12 350 / 0.3)" :
                            "oklch(0.75 0.14 35 / 0.2)"
                          }}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-ink">{label}</p>
                          <p className="text-[11px] font-bold text-ink/55">{time} · {by}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!rejecting} onOpenChange={(v) => !v && setRejecting(null)}>
        <DialogContent className="rounded-[28px] bg-cream p-0 shadow-none sm:max-w-lg">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-3 font-display text-2xl font-extrabold text-ink">
              <span className="grid size-10 place-items-center rounded-full bg-rose/25">
                <XCircle className="size-4.5 text-ink" />
              </span>
              Reject payout
            </DialogTitle>
          </DialogHeader>
          {rejecting && (
            <div className="space-y-4 px-6 pb-6">
              <div className="rounded-2xl bg-paper px-4 py-3 text-sm">
                <p className="font-mono text-[11px] font-extrabold text-coral">{rejecting.ref}</p>
                <p className="mt-1 font-extrabold text-ink">{rejecting.user} · {formatNaira(rejecting.amount)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">
                  Reason for rejection <span className="text-coral">*</span>
                </Label>
                <Textarea
                  rows={4}
                  placeholder="Policy violation, duplicate account, insufficient balance, closed claim window, KYC missing…"
                  className="rounded-2xl border-ink/10 bg-paper p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral"
                />
                <p className="text-[11px] font-extrabold text-ink/45">
                  Rejection reason is sent to the user and written to the audit log.
                </p>
              </div>
              <DialogFooter className="!flex-col gap-2 sm:!flex-row">
                <Button variant="outline" type="button" size="md" onClick={() => setRejecting(null)}>Cancel</Button>
                <Button
                  type="button"
                  size="md"
                  variant="primary"
                  onClick={() => {
                    toast.success("Payout rejected", { description: `${rejecting.ref} · balance restored · audit written.` });
                    setRejecting(null);
                  }}
                >
                  Confirm rejection
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
