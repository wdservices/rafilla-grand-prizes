import { useState } from "react";
import { AdminShell } from "./admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Calendar,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Activity,
  UserPlus,
  LogIn,
  KeyRound,
  Ticket,
  Wallet,
  Settings,
  CreditCard,
  Trash2,
  Edit3,
  Ban,
  CheckCircle2,
  FileText,
  Users,
  Trophy,
  Bell,
  Mail,
  Smartphone,
  Lock,
} from "lucide-react";

const EVENT_TYPES = [
  "AUTH_LOGIN",
  "AUTH_REGISTER",
  "AUTH_OTP",
  "AUTH_LOGOUT",
  "AUTH_PASSWORD_RESET",
  "AUTH_2FA_ENABLE",
  "AUTH_2FA_DISABLE",
  "TICKET_PURCHASE",
  "TICKET_REFUND",
  "TICKET_WINNER",
  "PAYOUT_INITIATE",
  "PAYOUT_COMPLETE",
  "PAYOUT_FAIL",
  "PAYOUT_REVERSE",
  "WALLET_FUND",
  "WALLET_ADJUST",
  "WALLET_WITHDRAW",
  "CONFIG_CHANGE",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_SUSPEND",
  "USER_ACTIVATE",
  "USER_DELETE",
  "PARTNER_APPROVE",
  "PARTNER_REJECT",
  "COMPETITION_CREATE",
  "COMPETITION_UPDATE",
  "COMPETITION_DRAW",
  "COMPETITION_CANCEL",
  "NOTIFICATION_SEND",
  "REFERRAL_PAY",
  "CRM_NOTE_ADD",
  "FRAUD_FLAG",
  "FRAUD_RESOLVE",
] as const;

type EventType = (typeof EVENT_TYPES)[number];
type RiskLevel = "low" | "medium" | "high" | "critical";

interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorId: string;
  actorIp: string;
  eventType: EventType;
  targetType: string;
  targetId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  riskLevel: RiskLevel;
}

const riskBadge = (r: RiskLevel) => {
  switch (r) {
    case "low":
      return (
        <Badge variant="outline" className="bg-mint/20 text-ink border-mint">
          <ShieldCheck className="w-3 h-3 mr-1" /> Low
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-lemon/30 text-ink border-lemon">
          <AlertCircle className="w-3 h-3 mr-1" /> Med
        </Badge>
      );
    case "high":
      return (
        <Badge variant="outline" className="bg-coral/20 text-ink border-coral">
          <AlertTriangle className="w-3 h-3 mr-1" /> High
        </Badge>
      );
    case "critical":
      return (
        <Badge className="bg-coral text-white border-coral">
          <ShieldAlert className="w-3 h-3 mr-1" /> CRITICAL
        </Badge>
      );
  }
};

const eventIcon = (e: EventType) => {
  if (e.startsWith("AUTH")) {
    if (e === "AUTH_LOGIN") return <LogIn className="w-3.5 h-3.5" />;
    if (e === "AUTH_REGISTER" || e === "USER_CREATE") return <UserPlus className="w-3.5 h-3.5" />;
    if (e === "AUTH_OTP" || e.startsWith("AUTH_2FA") || e === "AUTH_PASSWORD_RESET")
      return <KeyRound className="w-3.5 h-3.5" />;
    return <Lock className="w-3.5 h-3.5" />;
  }
  if (e.startsWith("TICKET")) return <Ticket className="w-3.5 h-3.5" />;
  if (e.startsWith("PAYOUT")) return <CreditCard className="w-3.5 h-3.5" />;
  if (e.startsWith("WALLET")) return <Wallet className="w-3.5 h-3.5" />;
  if (e.startsWith("CONFIG")) return <Settings className="w-3.5 h-3.5" />;
  if (e.startsWith("USER")) return <Users className="w-3.5 h-3.5" />;
  if (e.startsWith("PARTNER")) return <Users className="w-3.5 h-3.5" />;
  if (e.startsWith("COMPETITION")) return <Trophy className="w-3.5 h-3.5" />;
  if (e.startsWith("NOTIFICATION"))
    return e === "NOTIFICATION_SEND" ? (
      <Mail className="w-3.5 h-3.5" />
    ) : (
      <Bell className="w-3.5 h-3.5" />
    );
  if (e.startsWith("REFERRAL")) return <Users className="w-3.5 h-3.5" />;
  if (e.startsWith("FRAUD")) return <ShieldAlert className="w-3.5 h-3.5" />;
  if (e.startsWith("CRM")) return <FileText className="w-3.5 h-3.5" />;
  return <Activity className="w-3.5 h-3.5" />;
};

const eventBadge = (e: EventType) => {
  const tint = e.startsWith("AUTH")
    ? "bg-sky/20 text-ink border-sky"
    : e.startsWith("TICKET")
      ? "bg-coral/20 text-ink border-coral"
      : e.startsWith("PAYOUT")
        ? "bg-mint/20 text-ink border-mint"
        : e.startsWith("WALLET")
          ? "bg-lemon/30 text-ink border-lemon"
          : e.startsWith("CONFIG")
            ? "bg-lilac/20 text-ink border-lilac"
            : e.startsWith("USER")
              ? "bg-sky/20 text-ink border-sky"
              : e.startsWith("PARTNER")
                ? "bg-mint/20 text-ink border-mint"
                : e.startsWith("COMPETITION")
                  ? "bg-coral/20 text-ink border-coral"
                  : e.startsWith("FRAUD")
                    ? "bg-coral/20 text-ink border-coral"
                    : "bg-ink/10 text-ink border-ink/30";
  return (
    <Badge variant="outline" className={`${tint} font-mono text-[10px]`}>
      {eventIcon(e)}
      <span className="ml-1">{e.replace(/_/g, " ")}</span>
    </Badge>
  );
};

const ACTOR_NAMES = [
  "Amaka Okafor",
  "Tunde Bakare",
  "Funmi Adeyemi",
  "Chidi Eze",
  "Sade Lawal",
  "Admin Console",
  "System",
  "Kemi Hassan",
  "Bola Tinubu",
  "Ifeoma Dike",
  "Dele Ogun",
  "Zainab Aliyu",
];

const TARGET_TYPES = [
  "user_id",
  "ticket_id",
  "payout_id",
  "wallet_id",
  "config_key",
  "competition_id",
  "partner_id",
  "entry_id",
  "notification_id",
  "session_id",
];

function makeLogs(count: number): AuditLog[] {
  const logs: AuditLog[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const eventType = EVENT_TYPES[i % EVENT_TYPES.length]!;
    const riskRoll = i % 11;
    const risk: RiskLevel =
      riskRoll <= 6 ? "low" : riskRoll <= 8 ? "medium" : riskRoll === 9 ? "high" : "critical";
    const targetType = TARGET_TYPES[i % TARGET_TYPES.length]!;
    const tgtSuffix = String(100000 + i * 37).slice(0, 8);
    const oldValue =
      i % 4 === 0
        ? null
        : {
            status: i % 3 === 0 ? "pending" : "active",
            amount: (i * 5000 + 1000) * 100,
            role: i % 5 === 0 ? "user" : "partner",
          };
    const newValue = {
      status: i % 3 === 1 ? "completed" : "suspended",
      amount: (i * 5000 + 2500) * 100,
      role: i % 5 === 2 ? "admin" : "user",
      updatedBy: ACTOR_NAMES[i % ACTOR_NAMES.length]!,
    };
    const minsAgo = i * 13 + 2;
    const d = new Date(now - minsAgo * 60 * 1000);
    logs.push({
      id: `AUD-${String(900000 + i).slice(0, 6)}`,
      timestamp: d.toISOString(),
      actorName: ACTOR_NAMES[i % ACTOR_NAMES.length]!,
      actorId: `RF-USR-${String(10000 + i * 11).slice(0, 5)}`,
      actorIp: `192.168.${(i * 3) % 255}.${(i * 7) % 255}`,
      eventType,
      targetType,
      targetId: `${targetType.toUpperCase().slice(0, 3)}-${tgtSuffix}`,
      oldValue,
      newValue,
      riskLevel: risk,
    });
  }
  return logs;
}

const ALL_LOGS = makeLogs(80);
const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

export function AdminAuditLogsPage() {
  const [eventFilter, setEventFilter] = useState<EventType | "all">("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [userQuery, setUserQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [diffLog, setDiffLog] = useState<AuditLog | null>(null);

  const filtered = ALL_LOGS.filter((l) => {
    if (eventFilter !== "all" && l.eventType !== eventFilter) return false;
    if (riskFilter !== "all" && l.riskLevel !== riskFilter) return false;
    if (userQuery) {
      const q = userQuery.toLowerCase();
      if (
        !l.actorName.toLowerCase().includes(q) &&
        !l.actorId.toLowerCase().includes(q) &&
        !l.actorIp.includes(q)
      )
        return false;
    }
    if (dateFrom) {
      if (new Date(l.timestamp) < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      if (new Date(l.timestamp) > new Date(dateTo + "T23:59:59")) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageLogs = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = {
    total: ALL_LOGS.length,
    low: ALL_LOGS.filter((l) => l.riskLevel === "low").length,
    medium: ALL_LOGS.filter((l) => l.riskLevel === "medium").length,
    high: ALL_LOGS.filter((l) => l.riskLevel === "high").length,
    critical: ALL_LOGS.filter((l) => l.riskLevel === "critical").length,
  };

  return (
    <AdminShell activeNav="audit-logs" title="Audit Logs">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink">Audit Logs</h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Immutable event log. All platform activity — 24 month retention.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full">
              <FileText className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" className="rounded-full">
              <FileText className="w-4 h-4 mr-2" /> Export JSON
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="bg-cream/50 border-ink/10">
            <CardContent className="p-4">
              <p className="text-xs font-body text-ink/50 uppercase tracking-wider">Total events</p>
              <p className="font-display text-2xl text-ink mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-mint/10 border-mint/30">
            <CardContent className="p-4">
              <p className="text-xs font-body text-ink/60 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Low
              </p>
              <p className="font-display text-2xl text-ink mt-1">{stats.low}</p>
            </CardContent>
          </Card>
          <Card className="bg-lemon/15 border-lemon/40">
            <CardContent className="p-4">
              <p className="text-xs font-body text-ink/60 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Medium
              </p>
              <p className="font-display text-2xl text-ink mt-1">{stats.medium}</p>
            </CardContent>
          </Card>
          <Card className="bg-coral/10 border-coral/40">
            <CardContent className="p-4">
              <p className="text-xs font-body text-ink/60 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> High
              </p>
              <p className="font-display text-2xl text-ink mt-1">{stats.high}</p>
            </CardContent>
          </Card>
          <Card className="bg-coral/25 border-coral col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs font-body text-ink/70 uppercase tracking-wider flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3 h-3" /> CRITICAL
              </p>
              <p className="font-display text-2xl text-coral mt-1">{stats.critical}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-ink text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider">
                  Actor / IP search
                </Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                  <Input
                    className="pl-9 rounded-full"
                    placeholder="Name, ID, 192.168..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider">
                  Event type
                </Label>
                <Select
                  value={eventFilter}
                  onValueChange={(v) => setEventFilter(v as EventType | "all")}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all">All event types ({EVENT_TYPES.length})</SelectItem>
                    {EVENT_TYPES.map((e) => (
                      <SelectItem key={e} value={e} className="font-mono text-xs">
                        {e.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider">
                  Risk level
                </Label>
                <Select
                  value={riskFilter}
                  onValueChange={(v) => setRiskFilter(v as RiskLevel | "all")}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="All risks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All risk levels</SelectItem>
                    {RISK_LEVELS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r === "critical" ? "CRITICAL" : r[0]!.toUpperCase() + r.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> From
                </Label>
                <Input
                  type="date"
                  className="rounded-full"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> To
                </Label>
                <Input
                  type="date"
                  className="rounded-full"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setEventFilter("all");
                  setRiskFilter("all");
                  setUserQuery("");
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
              >
                Reset filters
              </Button>
              <Badge variant="outline" className="font-body">
                {filtered.length} results
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body text-xs uppercase text-ink/50">
                      Timestamp
                    </TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">Actor</TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">Event</TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">
                      Target
                    </TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">Delta</TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">Risk</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageLogs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-body text-sm whitespace-nowrap">
                        <div className="text-ink">
                          {new Date(l.timestamp).toLocaleString("en-NG", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-ink/40 text-[11px]">{l.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-body text-sm text-ink">{l.actorName}</div>
                        <div className="text-[11px] text-ink/40 font-mono">
                          {l.actorId} · {l.actorIp}
                        </div>
                      </TableCell>
                      <TableCell>{eventBadge(l.eventType)}</TableCell>
                      <TableCell>
                        <div className="text-xs font-body text-ink/70">{l.targetType}</div>
                        <div className="font-mono text-[11px] text-ink">{l.targetId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {l.oldValue ? (
                            <>
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-mono">
                                -old
                              </span>
                              <ChevronRight className="w-3 h-3 text-ink/30" />
                              <span className="px-1.5 py-0.5 rounded bg-mint/30 text-ink font-mono">
                                +new
                              </span>
                            </>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-ink/5 text-ink/50 font-mono">
                              CREATE
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{riskBadge(l.riskLevel)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setDiffLog(l)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Diff
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 flex items-center justify-between border-t border-ink/10">
              <p className="font-body text-xs text-ink/50">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <Pagination className="justify-end m-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(i + 1);
                        }}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!diffLog} onOpenChange={(o) => !o && setDiffLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-ink flex items-center gap-2">
              <Shield className="w-5 h-5 text-coral" /> Event diff — {diffLog?.id}
            </DialogTitle>
            <DialogDescription className="font-body">
              {diffLog && (
                <>
                  <span className="font-mono text-ink">{diffLog.eventType}</span> by{" "}
                  <span className="text-ink font-semibold">{diffLog.actorName}</span> ·{" "}
                  {new Date(diffLog.timestamp).toLocaleString("en-NG")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {diffLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-body">
                <div className="p-3 rounded-xl bg-cream/60">
                  <p className="text-ink/50 uppercase tracking-wider mb-1">Actor</p>
                  <p className="text-ink font-semibold">{diffLog.actorName}</p>
                  <p className="font-mono text-ink/60">{diffLog.actorId}</p>
                  <p className="font-mono text-ink/60">{diffLog.actorIp}</p>
                </div>
                <div className="p-3 rounded-xl bg-cream/60">
                  <p className="text-ink/50 uppercase tracking-wider mb-1">Target</p>
                  <p className="text-ink font-mono">{diffLog.targetType}</p>
                  <p className="text-ink font-mono font-semibold">{diffLog.targetId}</p>
                  <div className="mt-1">{riskBadge(diffLog.riskLevel)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-700 border-red-200 rounded-full text-[10px]"
                    >
                      <ChevronLeft className="w-3 h-3 mr-1" /> OLD VALUE
                    </Badge>
                  </div>
                  <pre className="bg-ink text-cream p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed">
                    {JSON.stringify(diffLog.oldValue ?? null, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="bg-mint/30 text-ink border-mint rounded-full text-[10px]"
                    >
                      NEW VALUE <ChevronRight className="w-3 h-3 ml-1" />
                    </Badge>
                  </div>
                  <pre className="bg-ink text-cream p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed">
                    {JSON.stringify(diffLog.newValue ?? null, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setDiffLog(null)}>
              Close
            </Button>
            <Button className="rounded-full">
              <Edit3 className="w-4 h-4 mr-2" /> Escalate to review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
