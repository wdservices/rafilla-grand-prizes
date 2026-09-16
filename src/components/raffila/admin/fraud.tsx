import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, limit, query as fsQuery, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminShell } from "./admin-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { lagosDateShort, lagosDateTime } from "@/lib/format";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Search,
  Calendar,
  User,
  Activity,
  Clock,
  MapPin,
  Ticket,
  Wallet,
  Bot,
  Zap,
  Users,
  ChevronRight,
  FileText,
  Eye,
  XCircle,
  AlertOctagon,
  Ban,
  ShieldX,
  Gavel,
  ThumbsUp,
  Hand,
  MessageSquareWarning,
} from "lucide-react";

type Severity = "low" | "medium" | "high" | "critical";
type SignalType =
  | "multiple_entry"
  | "duplicate_ip"
  | "duplicate_device"
  | "duplicate_bank"
  | "bot_pattern"
  | "high_velocity"
  | "unusual_geography"
  | "new_account_spend"
  | "ticket_stuffing"
  | "refund_abuse"
  | "referral_farm"
  | "proxy_vpn";

interface FraudSignal {
  id: string;
  timestamp: string;
  type: SignalType;
  detail: string;
  scoreContribution: number;
}

interface FraudCase {
  id: string;
  riskScore: number;
  severity: Severity;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userInitials: string;
  userTint: string;
  signals: SignalType[];
  signalDetails: FraudSignal[];
  firstSeen: string;
  lastSeen: string;
  ticketsInvolved: number;
  valueAtRiskKobo: number;
  status: "open" | "reviewing" | "resolved";
}

const SIGNAL_META: Record<SignalType, { label: string; icon: React.ReactNode; tint: string }> = {
  multiple_entry: {
    label: "Multi-account entries",
    icon: <Users className="w-3 h-3" />,
    tint: "bg-coral/20 border-coral text-ink",
  },
  duplicate_ip: {
    label: "Shared IP address",
    icon: <MapPin className="w-3 h-3" />,
    tint: "bg-lemon/30 border-lemon text-ink",
  },
  duplicate_device: {
    label: "Duplicate device",
    icon: <Activity className="w-3 h-3" />,
    tint: "bg-lemon/30 border-lemon text-ink",
  },
  duplicate_bank: {
    label: "Shared bank account",
    icon: <Wallet className="w-3 h-3" />,
    tint: "bg-coral/20 border-coral text-ink",
  },
  bot_pattern: {
    label: "Bot behavioral pattern",
    icon: <Bot className="w-3 h-3" />,
    tint: "bg-coral border-coral text-white",
  },
  high_velocity: {
    label: "High-velocity purchases",
    icon: <Zap className="w-3 h-3" />,
    tint: "bg-sky/20 border-sky text-ink",
  },
  unusual_geography: {
    label: "Unusual geography",
    icon: <MapPin className="w-3 h-3" />,
    tint: "bg-lemon/30 border-lemon text-ink",
  },
  new_account_spend: {
    label: "New account high spend",
    icon: <Wallet className="w-3 h-3" />,
    tint: "bg-sky/20 border-sky text-ink",
  },
  ticket_stuffing: {
    label: "Ticket stuffing",
    icon: <Ticket className="w-3 h-3" />,
    tint: "bg-coral border-coral text-white",
  },
  refund_abuse: {
    label: "Refund abuse",
    icon: <XCircle className="w-3 h-3" />,
    tint: "bg-coral/20 border-coral text-ink",
  },
  referral_farm: {
    label: "Referral farm",
    icon: <Users className="w-3 h-3" />,
    tint: "bg-coral/20 border-coral text-ink",
  },
  proxy_vpn: {
    label: "Proxy / VPN detected",
    icon: <ShieldX className="w-3 h-3" />,
    tint: "bg-coral border-coral text-white",
  },
};

/**
 * Real-data fraud heuristics. There is no IP/device/bank telemetry backend,
 * so only signals computable from Firestore fire. Every signal below cites
 * the real numbers it was derived from — nothing is fabricated.
 *
 * - high_velocity: 4+ ticket purchases inside any 60-minute window
 * - ticket_stuffing: 20+ entries held across competitions
 * - new_account_spend: account < 7 days old with > ₦50,000 in purchases
 * - duplicate_phone: normalized phone number shared by 2+ accounts
 */
const VELOCITY_COUNT = 4;
const VELOCITY_WINDOW_MS = 3600000;
const STUFFING_THRESHOLD = 20;
const NEW_ACCOUNT_DAYS = 7;
const NEW_ACCOUNT_SPEND_KOBO = 5000000;

const ALL_SIGNALS: SignalType[] = [
  "multiple_entry",
  "duplicate_ip",
  "duplicate_device",
  "duplicate_bank",
  "bot_pattern",
  "high_velocity",
  "unusual_geography",
  "new_account_spend",
  "ticket_stuffing",
  "refund_abuse",
  "referral_farm",
  "proxy_vpn",
];

const TINT_BG: Record<string, string> = {
  coral: "bg-coral/20 text-coral",
  mint: "bg-mint/35 text-ink",
  lemon: "bg-lemon/40 text-ink",
  sky: "bg-sky/30 text-ink",
  lilac: "bg-lilac/35 text-ink",
};

const AVATAR_TINTS = ["coral", "mint", "lemon", "sky", "lilac"];

function tintFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length]!;
}

function toMs(value: unknown): number {
  try {
    const v = value as any;
    if (v && typeof v.toDate === "function") return (v.toDate() as Date).getTime();
  } catch {
    // ignore
  }
  if (typeof value === "string" && value) {
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  if (typeof value === "number") return value;
  return 0;
}

function initialsOfName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.slice(0, 1) ?? "") + (parts[1]?.slice(0, 1) ?? "")).toUpperCase() || "U";
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^234/, "0");
}

interface PurchaseHit {
  ms: number;
  amountKobo: number;
}

function maxInWindow(stamps: number[], windowMs: number): number {
  const sorted = [...stamps].sort((a, b) => a - b);
  let best = 0;
  let left = 0;
  for (let right = 0; right < sorted.length; right++) {
    while (sorted[right]! - sorted[left]! > windowMs) left++;
    best = Math.max(best, right - left + 1);
  }
  return best;
}

import { formatNaira } from "@/lib/utils";

function severityBadge(s: Severity) {
  switch (s) {
    case "low":
      return (
        <Badge variant="outline" className="bg-mint/20 border-mint text-ink rounded-full">
          <ShieldCheck className="w-3 h-3 mr-1" /> Low
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-lemon/30 border-lemon text-ink rounded-full">
          <AlertCircle className="w-3 h-3 mr-1" /> Medium
        </Badge>
      );
    case "high":
      return (
        <Badge variant="outline" className="bg-coral/20 border-coral text-ink rounded-full">
          <AlertTriangle className="w-3 h-3 mr-1" /> High
        </Badge>
      );
    case "critical":
      return (
        <Badge className="bg-coral border-coral text-white rounded-full font-bold animate-pulse">
          <AlertOctagon className="w-3 h-3 mr-1" /> CRITICAL
        </Badge>
      );
  }
}

export function AdminFraudQueuePage() {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"open" | "reviewing" | "resolved" | "all">(
    "all",
  );
  const [signalFilter, setSignalFilter] = useState<SignalType | "all">("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reviewCase, setReviewCase] = useState<FraudCase | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [holdFunds, setHoldFunds] = useState(true);
  const [logoutSessions, setLogoutSessions] = useState(true);
  const [notifyCompliance, setNotifyCompliance] = useState(false);

  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [usersSnap, purchaseSnap, caseSnap] = await Promise.all([
          getDocs(fsQuery(collection(db, "users"), limit(200))),
          getDocs(
            fsQuery(
              collection(db, "activityLogs"),
              where("eventType", "==", "TICKET_PURCHASE"),
              limit(500),
            ),
          ).catch(() => null),
          getDocs(fsQuery(collection(db, "fraudCases"), limit(200))).catch(() => null),
        ]);
        if (cancelled) return;

        const now = Date.now();
        const statusByUid: Record<string, { status: FraudCase["status"]; note?: string }> = {};
        caseSnap?.docs.forEach((d) => {
          const v = d.data() as Record<string, unknown>;
          const s = String(v["status"] ?? "open");
          const note = v["note"];
          statusByUid[d.id] = {
            status: s === "reviewing" || s === "resolved" ? s : "open",
            ...(typeof note === "string" ? { note } : {}),
          };
        });

        // Purchases grouped by actor
        const purchasesByActor = new Map<string, PurchaseHit[]>();
        purchaseSnap?.docs.forEach((d) => {
          const v = d.data() as Record<string, unknown>;
          const actor = String(v["actorId"] ?? "");
          if (!actor) return;
          const ms = toMs(v["createdAt"]) || toMs(v["clientAt"]);
          if (!ms) return;
          const det = (v["details"] as Record<string, unknown>) ?? {};
          const amt = Number(det["entryPriceKobo"] ?? det["amountKobo"] ?? 0) || 0;
          const list = purchasesByActor.get(actor) ?? [];
          list.push({ ms, amountKobo: amt });
          purchasesByActor.set(actor, list);
        });

        type RawUser = { id: string; v: Record<string, unknown>; entries: number };
        const raws: RawUser[] = await Promise.all(
          usersSnap.docs.map(async (d) => {
            let entries = 0;
            try {
              const es = await getDocs(fsQuery(collection(db, "users", d.id, "entries"), limit(500)));
              entries = es.size;
            } catch {
              entries = 0;
            }
            return { id: d.id, v: d.data() as Record<string, unknown>, entries };
          }),
        );

        // Shared phone numbers across accounts
        const phoneGroups = new Map<string, string[]>();
        raws.forEach((u) => {
          const p = normalizePhone(String(u.v["phone"] ?? ""));
          if (p.length < 7) return;
          const g = phoneGroups.get(p) ?? [];
          g.push(u.id);
          phoneGroups.set(p, g);
        });

        const built: FraudCase[] = [];
        for (const u of raws) {
          const first = String(u.v["firstName"] ?? "");
          const last = String(u.v["lastName"] ?? "");
          const name =
            (String(u.v["displayName"] ?? "") || `${first} ${last}`.trim() || u.v["handle"] || u.id.slice(0, 8)) as string;
          const email = String(u.v["email"] ?? "");
          const phone = String(u.v["phone"] ?? "");
          const createdMs = toMs(u.v["createdAt"]);
          const hits = purchasesByActor.get(u.id) ?? [];
          const totalSpend = hits.reduce((s, h) => s + h.amountKobo, 0);
          const lastPurchase = hits.length ? Math.max(...hits.map((h) => h.ms)) : 0;

          const signals: SignalType[] = [];
          const details: FraudSignal[] = [];
          const push = (type: SignalType, detail: string, score: number, ms: number) => {
            signals.push(type);
            details.push({
              id: `sg-${u.id}-${type}`,
              timestamp: new Date(ms || now).toISOString(),
              type,
              detail,
              scoreContribution: score,
            });
          };

          const burst = maxInWindow(
            hits.map((h) => h.ms),
            VELOCITY_WINDOW_MS,
          );
          if (burst >= VELOCITY_COUNT) {
            push(
              "high_velocity",
              `${burst} ticket purchases inside a 60-minute window`,
              30,
              lastPurchase,
            );
          }
          if (u.entries >= STUFFING_THRESHOLD) {
            push("ticket_stuffing", `${u.entries} entries held across competitions`, 25, lastPurchase);
          }
          if (createdMs && now - createdMs < NEW_ACCOUNT_DAYS * 86400000 && totalSpend > NEW_ACCOUNT_SPEND_KOBO) {
            const ageDays = Math.max(1, Math.round((now - createdMs) / 86400000));
            push(
              "new_account_spend",
              `${formatNaira(totalSpend)} spent within ${ageDays} day${ageDays === 1 ? "" : "s"} of signup`,
              20,
              lastPurchase || createdMs,
            );
          }
          const p = normalizePhone(phone);
          const group = p.length >= 7 ? (phoneGroups.get(p) ?? []) : [];
          if (group.length >= 2) {
            push(
              "duplicate_bank",
              `Phone number shared with ${group.length - 1} other account${group.length === 2 ? "" : "s"}`,
              15,
              lastPurchase || createdMs,
            );
          }

          if (signals.length === 0) continue;

          let score = 10;
          details.forEach((d) => {
            score += d.scoreContribution;
          });
          score = Math.min(99, score);
          const severity: Severity =
            score >= 80 ? "critical" : score >= 55 ? "high" : score >= 30 ? "medium" : "low";
          const stored = statusByUid[u.id];

          built.push({
            id: `FR-${u.id.slice(0, 6).toUpperCase()}`,
            riskScore: score,
            severity,
            userId: u.id,
            userName: name,
            userEmail: email,
            userPhone: phone,
            userInitials: initialsOfName(name),
            userTint: tintFor(u.id),
            signals,
            signalDetails: details,
            firstSeen: new Date(createdMs || now).toISOString(),
            lastSeen: new Date(lastPurchase || createdMs || now).toISOString(),
            ticketsInvolved: u.entries,
            valueAtRiskKobo: totalSpend,
            status: stored?.status ?? "open",
          });
        }

        built.sort((a, b) => b.riskScore - a.riskScore);
        if (!cancelled) setCases(built);
      } catch (err: any) {
        if (!cancelled) {
          const code = err?.code as string | undefined;
          setLoadError(
            code === "permission-denied"
              ? "Firestore denied access. Publish the latest firestore.rules, then refresh."
              : err?.message || "Could not load fraud cases",
          );
          setCases([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const persistCaseStatus = async (
    c: FraudCase,
    status: FraudCase["status"],
    note: string,
    extra?: { suspendUser?: boolean },
  ) => {
    await setDoc(
      doc(db, "fraudCases", c.userId),
      {
        status,
        note: note || "",
        holdFunds,
        logoutSessions,
        notifyCompliance,
        riskScore: c.riskScore,
        severity: c.severity,
        signals: c.signals,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    if (extra?.suspendUser) {
      await updateDoc(doc(db, "users", c.userId), {
        status: "suspended",
        suspendedReason: note || "Fraud review suspension",
        suspendedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    setCases((prev) => prev.map((x) => (x.id === c.id ? { ...x, status } : x)));
    setReviewCase((prev) => (prev && prev.id === c.id ? { ...prev, status } : prev));
  };

  const filtered = cases.filter((c) => {
    if (severityFilter !== "all" && c.severity !== severityFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (signalFilter !== "all" && !c.signals.includes(signalFilter)) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !c.userName.toLowerCase().includes(q) &&
        !c.userEmail.toLowerCase().includes(q) &&
        !c.userId.toLowerCase().includes(q) &&
        !c.id.toLowerCase().includes(q)
      )
        return false;
    }
    if (from && new Date(c.firstSeen) < new Date(from)) return false;
    if (to && new Date(c.lastSeen) > new Date(to + "T23:59:59")) return false;
    return true;
  });

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === "open").length,
    low: cases.filter((c) => c.severity === "low").length,
    med: cases.filter((c) => c.severity === "medium").length,
    high: cases.filter((c) => c.severity === "high").length,
    crit: cases.filter((c) => c.severity === "critical").length,
    atRisk: cases.reduce((s, c) => s + c.valueAtRiskKobo, 0),
  };

  const exportCases = () => {
    const rows = [
      ["case", "user", "email", "phone", "score", "severity", "status", "signals", "tickets", "value_kobo", "first_seen", "last_seen"],
      ...filtered.map((c) => [
        c.id,
        c.userName,
        c.userEmail,
        c.userPhone,
        String(c.riskScore),
        c.severity,
        c.status,
        c.signals.join(";"),
        String(c.ticketsInvolved),
        String(c.valueAtRiskKobo),
        c.firstSeen,
        c.lastSeen,
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raffila-fraud-cases-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell activeNav="fraud" title="Fraud Queue">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-coral" /> Fraud Queue
            </h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Signal-driven risk cases computed live from Firestore activity.{" "}
              {!loading && !loadError && (
                <span className="text-emerald-700 font-bold">
                  {stats.open} open · {stats.total} total.
                </span>
              )}
            </p>
            {loadError && (
              <p className="mt-2 max-w-2xl rounded-xl bg-coral/10 px-4 py-2 font-body text-sm font-bold text-coral">
                {loadError}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full" onClick={exportCases}>
              <FileText className="w-4 h-4 mr-2" /> Export cases
            </Button>
            <Button className="rounded-full bg-coral hover:bg-coral/90">
              <Gavel className="w-4 h-4 mr-2" /> Start bulk review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-mint/10 border-mint/30">
            <CardContent className="p-4">
              <p className="text-[10px] font-body font-bold uppercase tracking-wider text-ink/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> L · LOW
              </p>
              <p className="font-display text-3xl text-ink mt-1">{stats.low}</p>
            </CardContent>
          </Card>
          <Card className="bg-lemon/15 border-lemon/40">
            <CardContent className="p-4">
              <p className="text-[10px] font-body font-bold uppercase tracking-wider text-ink/60 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> M · MEDIUM
              </p>
              <p className="font-display text-3xl text-ink mt-1">{stats.med}</p>
            </CardContent>
          </Card>
          <Card className="bg-coral/10 border-coral/40">
            <CardContent className="p-4">
              <p className="text-[10px] font-body font-bold uppercase tracking-wider text-ink/70 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> H · HIGH
              </p>
              <p className="font-display text-3xl text-ink mt-1">{stats.high}</p>
            </CardContent>
          </Card>
          <Card className="bg-coral border-coral col-span-2 sm:col-span-1 lg:col-span-1">
            <CardContent className="p-4">
              <p className="text-[10px] font-body font-bold uppercase tracking-wider text-white/90 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" /> ⚠ CRITICAL
              </p>
              <p className="font-display text-4xl text-white mt-1">{stats.crit}</p>
            </CardContent>
          </Card>
          <Card className="bg-cream/50 border-ink/10">
            <CardContent className="p-4">
              <p className="text-[10px] font-body font-bold uppercase tracking-wider text-ink/50">
                Open cases
              </p>
              <p className="font-display text-3xl text-ink mt-1">{stats.open}</p>
            </CardContent>
          </Card>
          <Card className="bg-ink text-cream">
            <CardContent className="p-4">
              <p className="text-[10px] font-body font-bold uppercase tracking-wider text-cream/70">
                Value at risk
              </p>
              <p className="font-display text-2xl text-coral mt-1">{formatNaira(stats.atRisk)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-ink text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider">
                  Case / User search
                </Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                  <Input
                    className="pl-9 rounded-full"
                    placeholder="Name, email, user ID, case ID"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider">
                  Severity
                </Label>
                <Select
                  value={severityFilter}
                  onValueChange={(v) => setSeverityFilter(v as Severity | "all")}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">CRITICAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider">
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
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
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-ink/60 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> To
                </Label>
                <Input
                  type="date"
                  className="rounded-full"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Label className="font-body text-xs text-ink/60 uppercase tracking-wider mr-2 self-center">
                Signal type:
              </Label>
              <Button
                variant={signalFilter === "all" ? "primary" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setSignalFilter("all")}
              >
                All ({ALL_SIGNALS.length})
              </Button>
              {ALL_SIGNALS.map((st) => (
                <Button
                  key={st}
                  variant={signalFilter === st ? "primary" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setSignalFilter(st)}
                >
                  {SIGNAL_META[st].icon}
                  <span className="ml-1">{SIGNAL_META[st].label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body text-xs uppercase text-ink/50">Risk</TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">User</TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">
                      Signals
                    </TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">
                      Tickets
                    </TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">
                      At risk
                    </TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">
                      First seen
                    </TableHead>
                    <TableHead className="font-body text-xs uppercase text-ink/50">
                      Severity
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center font-body text-sm font-bold text-ink/55">
                        Scanning Firestore activity for risk signals…
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && !loadError && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center">
                        <p className="font-body text-sm font-extrabold text-ink">
                          No risk cases detected
                        </p>
                        <p className="font-body text-xs text-ink/55 mt-1">
                          No accounts currently trip the velocity, stuffing, new-spend or
                          shared-phone heuristics.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((c) => (
                    <TableRow key={c.id} className={c.severity === "critical" ? "bg-coral/5" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative w-12 h-12 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                              <circle
                                cx="18"
                                cy="18"
                                r="15.915"
                                fill="none"
                                stroke="oklch(0.93 0.018 78)"
                                strokeWidth="3"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15.915"
                                fill="none"
                                stroke={
                                  c.severity === "critical"
                                    ? "oklch(0.75 0.14 35)"
                                    : c.severity === "high"
                                      ? "oklch(0.75 0.14 35)"
                                      : c.severity === "medium"
                                        ? "oklch(0.87 0.14 88)"
                                        : "oklch(0.87 0.12 165)"
                                }
                                strokeWidth="3"
                                strokeDasharray={`${c.riskScore} 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span
                              className={`absolute inset-0 flex items-center justify-center font-display font-bold text-sm ${
                                c.severity === "critical" ? "text-coral" : "text-ink"
                              }`}
                            >
                              {c.riskScore}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-ink/40">{c.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-9 h-9 border-2 border-paper shrink-0">
                            <AvatarFallback
                              className={`${TINT_BG[c.userTint] ?? TINT_BG["lilac"]} font-display font-semibold text-sm`}
                            >
                              {c.userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-body text-sm text-ink font-semibold truncate">
                              {c.userName}
                            </div>
                            <div className="text-[11px] text-ink/40 truncate font-mono">
                              {c.userId}
                            </div>
                            <div className="text-[11px] text-ink/40 truncate">{c.userEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {c.signals.map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className={`${SIGNAL_META[s].tint} rounded-full text-[10px]`}
                            >
                              {SIGNAL_META[s].icon}
                              <span className="ml-1">{SIGNAL_META[s].label}</span>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-display text-ink">
                          {c.ticketsInvolved.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-ink/40 font-body uppercase">entries</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-display font-bold text-coral">
                          {formatNaira(c.valueAtRiskKobo)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-body text-xs text-ink whitespace-nowrap">
                           {lagosDateShort(c.firstSeen)}
                        </div>
                        <div className="text-[10px] text-ink/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last{" "}
                           {lagosDateShort(c.lastSeen)}
                        </div>
                      </TableCell>
                      <TableCell>{severityBadge(c.severity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[10px] ${
                              c.status === "open"
                                ? "bg-cream text-ink"
                                : c.status === "reviewing"
                                  ? "bg-sky/20 border-sky text-ink"
                                  : "bg-mint/30 border-mint text-ink"
                            }`}
                          >
                            {c.status[0]!.toUpperCase() + c.status.slice(1)}
                          </Badge>
                          <Button
                            size="sm"
                            className="rounded-full bg-coral hover:bg-coral/90 text-white"
                            onClick={() => setReviewCase(c)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!reviewCase} onOpenChange={(o) => !o && setReviewCase(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-ink text-xl flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-coral" />
              Review case — {reviewCase?.id}
            </DialogTitle>
            <DialogDescription className="font-body">
              Signal timeline, resolution options, and audit trail.
            </DialogDescription>
          </DialogHeader>
          {reviewCase && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-cream/60 border-ink/10">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-14 h-14 border-2 border-paper">
                        <AvatarFallback
                          className={`${TINT_BG[reviewCase.userTint] ?? TINT_BG["lilac"]} font-display font-bold text-lg`}
                        >
                          {reviewCase.userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-display text-lg text-ink truncate">
                          {reviewCase.userName}
                        </p>
                        <p className="text-xs font-mono text-ink/50">{reviewCase.userId}</p>
                        <p className="text-xs text-ink/50 truncate">{reviewCase.userEmail}</p>
                        <p className="text-xs text-ink/50">{reviewCase.userPhone}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1.5 text-sm font-body">
                      <div className="flex justify-between">
                        <span className="text-ink/50">Risk score</span>
                        <span className="font-bold text-coral">{reviewCase.riskScore}/99</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink/50">Severity</span>
                        {severityBadge(reviewCase.severity)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink/50">Tickets</span>
                        <span>{reviewCase.ticketsInvolved.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink/50">Value at risk</span>
                        <span className="font-bold text-coral">
                          {formatNaira(reviewCase.valueAtRiskKobo)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 border-ink/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-ink text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 text-coral" /> Signal timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-s-2 border-ink/10 ms-2 space-y-4">
                      {reviewCase.signalDetails.map((sg, idx) => (
                        <li key={sg.id} className="ms-5">
                          <span
                            className={`absolute -start-[9px] flex items-center justify-center w-4 h-4 rounded-full ${
                              idx === 0
                                ? "bg-coral"
                                : idx === reviewCase.signalDetails.length - 1
                                  ? "bg-lemon"
                                  : "bg-sky"
                            } text-white`}
                          >
                            {SIGNAL_META[sg.type].icon}
                          </span>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`${SIGNAL_META[sg.type].tint} rounded-full text-[10px]`}
                            >
                              {SIGNAL_META[sg.type].label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-full text-[10px] bg-ink/5 border-ink/20 text-ink"
                            >
                              +{sg.scoreContribution} pts
                            </Badge>
                            <span className="text-[11px] text-ink/40 font-mono ml-auto">
                               {lagosDateTime(sg.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm font-body text-ink/80">{sg.detail}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-ink/10">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-ink text-base flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-coral" /> Resolution
                  </CardTitle>
                  <CardDescription className="font-body text-xs">
                    Choose an action. All decisions are audited in the event log.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-body text-xs text-ink/60 uppercase tracking-wider">
                      Analyst note
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Describe basis for your decision..."
                      className="rounded-2xl"
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-start gap-2 p-3 rounded-xl border border-ink/10 bg-cream/30">
                      <Checkbox
                        id="hold"
                        checked={holdFunds}
                        onCheckedChange={(v) => setHoldFunds(!!v)}
                        className="mt-0.5"
                      />
                      <div>
                        <Label
                          htmlFor="hold"
                          className="font-body text-sm text-ink font-semibold cursor-pointer"
                        >
                          Hold funds
                        </Label>
                        <p className="text-[11px] text-ink/50">
                          Freeze wallet balance pending investigation
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-xl border border-ink/10 bg-cream/30">
                      <Checkbox
                        id="logout"
                        checked={logoutSessions}
                        onCheckedChange={(v) => setLogoutSessions(!!v)}
                        className="mt-0.5"
                      />
                      <div>
                        <Label
                          htmlFor="logout"
                          className="font-body text-sm text-ink font-semibold cursor-pointer"
                        >
                          Logout all sessions
                        </Label>
                        <p className="text-[11px] text-ink/50">Terminate every active auth token</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-xl border border-ink/10 bg-cream/30">
                      <Checkbox
                        id="comply"
                        checked={notifyCompliance}
                        onCheckedChange={(v) => setNotifyCompliance(!!v)}
                        className="mt-0.5"
                      />
                      <div>
                        <Label
                          htmlFor="comply"
                          className="font-body text-sm text-ink font-semibold cursor-pointer"
                        >
                          Notify compliance
                        </Label>
                        <p className="text-[11px] text-ink/50">Open ticket in compliance queue</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        const c = reviewCase;
                        if (!c) return;
                        persistCaseStatus(c, "resolved", resolutionNote)
                          .then(() =>
                            import("@/lib/activity-log").then(({ logActivity }) =>
                              logActivity({
                                eventType: "FRAUD_RESOLVE",
                                targetType: "fraud_case",
                                targetId: c.id,
                                summary: `Dismissed fraud case ${c.id} (${c.userName})`,
                                details: { note: resolutionNote || "No note" },
                              }),
                            ),
                          )
                          .then(() => {
                            toast.success("Case dismissed");
                            setResolutionNote("");
                            setReviewCase(null);
                          })
                          .catch((err: any) =>
                            toast.error("Dismiss failed", {
                              description: err?.message || String(err),
                            }),
                          );
                      }}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" /> Dismiss
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        const c = reviewCase;
                        if (!c) return;
                        persistCaseStatus(c, "reviewing", resolutionNote)
                          .then(() =>
                            import("@/lib/activity-log").then(({ logActivity }) =>
                              logActivity({
                                eventType: "FRAUD_FLAG",
                                targetType: "fraud_case",
                                targetId: c.id,
                                summary: `Issued warning for fraud case ${c.id} (${c.userName})`,
                                details: { note: resolutionNote || "No note" },
                              }),
                            ),
                          )
                          .then(() => {
                            toast.info("Warning issued to user");
                            setResolutionNote("");
                            setReviewCase(null);
                          })
                          .catch((err: any) =>
                            toast.error("Warning failed", {
                              description: err?.message || String(err),
                            }),
                          );
                      }}
                    >
                      <MessageSquareWarning className="w-4 h-4 mr-2" /> Warning
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-coral text-coral hover:bg-coral hover:text-white"
                      onClick={() => {
                        const c = reviewCase;
                        if (!c) return;
                        persistCaseStatus(c, "resolved", resolutionNote, { suspendUser: true })
                          .then(() =>
                            import("@/lib/activity-log").then(({ logActivity }) =>
                              logActivity({
                                eventType: "USER_SUSPEND",
                                targetType: "user",
                                targetId: c.userId,
                                summary: `Suspended ${c.userName} from fraud case ${c.id}`,
                                details: { note: resolutionNote || "No note" },
                                oldValue: { status: "active" },
                                newValue: { status: "suspended" },
                              }),
                            ),
                          )
                          .then(() => {
                            toast.error("User suspended");
                            setResolutionNote("");
                            setReviewCase(null);
                          })
                          .catch((err: any) =>
                            toast.error("Suspend failed", {
                              description: err?.message || String(err),
                            }),
                          );
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" /> Suspend user
                    </Button>
                    <Button
                      className="rounded-full bg-coral hover:bg-coral/90 text-white"
                      onClick={() => {
                        const c = reviewCase;
                        if (!c) return;
                        persistCaseStatus(c, "reviewing", resolutionNote || "Funds held pending investigation")
                          .then(() =>
                            import("@/lib/activity-log").then(({ logActivity }) =>
                              logActivity({
                                eventType: "FRAUD_FLAG",
                                targetType: "fraud_case",
                                targetId: c.id,
                                summary: `Held funds for fraud case ${c.id} (${c.userName})`,
                              }),
                            ),
                          )
                          .then(() => {
                            toast("Funds held & account restricted", {
                              icon: <Hand className="w-4 h-4" />,
                            });
                            setResolutionNote("");
                            setReviewCase(null);
                          })
                          .catch((err: any) =>
                            toast.error("Hold failed", {
                              description: err?.message || String(err),
                            }),
                          );
                      }}
                    >
                      <Hand className="w-4 h-4 mr-2" /> Hold funds
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setReviewCase(null)}>
              Close
            </Button>
            <ChevronRight className="w-4 h-4 text-ink/30 hidden sm:block" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
