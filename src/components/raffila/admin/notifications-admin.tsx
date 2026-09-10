import { useState } from "react";
import { AdminShell } from "./admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  Smartphone,
  Search,
  CheckCheck,
  RotateCcw,
  Trophy,
  Wallet,
  Users,
  AlertTriangle,
  Settings,
  Ticket,
  CreditCard,
  FileText,
  Gift,
  Shield,
  Target,
  Star,
  Trash2,
  Filter,
  Circle,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

type Channel = "inapp" | "email" | "sms";
type ReadState = "all" | "unread" | "read";

interface NTFY {
  id: string;
  channel: Channel;
  title: string;
  preview: string;
  icon: React.ReactNode;
  iconTint: string;
  time: string;
  unread: boolean;
  recipient: string;
  recipientInitials: string;
  recipientTint: string;
  metricLabel?: string;
  metricValue?: string;
}

const ICONS = [
  { i: <Trophy className="w-4 h-4" />, t: "bg-coral/20 border-coral text-coral" },
  { i: <Wallet className="w-4 h-4" />, t: "bg-mint/30 border-mint text-ink" },
  { i: <Users className="w-4 h-4" />, t: "bg-sky/20 border-sky text-sky" },
  { i: <Ticket className="w-4 h-4" />, t: "bg-lemon/30 border-lemon text-ink" },
  { i: <CreditCard className="w-4 h-4" />, t: "bg-mint/20 border-mint text-ink" },
  { i: <AlertTriangle className="w-4 h-4" />, t: "bg-coral/20 border-coral text-coral" },
  { i: <Settings className="w-4 h-4" />, t: "bg-lilac/20 border-lilac text-lilac" },
  { i: <FileText className="w-4 h-4" />, t: "bg-ink/10 border-ink/20 text-ink" },
  { i: <Gift className="w-4 h-4" />, t: "bg-lilac/20 border-lilac text-lilac" },
  { i: <Shield className="w-4 h-4" />, t: "bg-coral/20 border-coral text-coral" },
  { i: <Target className="w-4 h-4" />, t: "bg-sky/20 border-sky text-sky" },
  { i: <Star className="w-4 h-4" />, t: "bg-lemon/30 border-lemon text-ink" },
];

const TITLES: { t: string; p: string; iconIdx: number }[] = [
  {
    t: "🏆 Winner confirmed — RF-CMP-88472",
    p: "Chidi Eze has won the 2024 Lexus RX 350. Prize value ₦48,500,000. Initiate payout workflow.",
    iconIdx: 0,
  },
  {
    t: "Wallet funded — ₦1,250,000",
    p: "Amaka Okafor (RF-USR-20041) topped up via Paystack. Ref: PYS-99288173.",
    iconIdx: 1,
  },
  {
    t: "New partner application",
    p: "Victoria Island Motors submitted asset listing for 2024 Mercedes GLE450. Awaiting KYC review.",
    iconIdx: 2,
  },
  {
    t: "🚨 Competition goes LIVE in 30min",
    p: "“Land in Lekki Phase 1” — RF-CMP-90112 final entries window. Last push notification queued.",
    iconIdx: 3,
  },
  {
    t: "💸 Payout batch #482 complete",
    p: "12 winners settled totalling ₦18,420,000. 1 item failed — see fraud queue.",
    iconIdx: 4,
  },
  {
    t: "⚠ Suspicious activity flagged",
    p: "FRQ-100414 score 91/99. 6 accounts sharing AS4123 VPN node. Review now.",
    iconIdx: 5,
  },
  {
    t: "Platform config updated",
    p: "Referral L1 rate changed 8% → 10% by Admin Console (Super Admin). Effective immediately.",
    iconIdx: 6,
  },
  {
    t: "New KYC submissions (14)",
    p: "Partners & VIP tier users submitted identity verification. SLA 24h — 8 overdue.",
    iconIdx: 7,
  },
  {
    t: "🎁 Referral bonus pool released",
    p: "₦4,820,000 distributed across L1-L5 for week 37. Top referrer: RF-USR-18820.",
    iconIdx: 8,
  },
  {
    t: "🛡 Security: 2FA bulk enabled",
    p: "1,284 users activated TOTP this week. Coverage now 62.4% (target 80%).",
    iconIdx: 9,
  },
  {
    t: "Milestone: 125,000 tickets sold (7d)",
    p: "Beat target 100k. +₦62.28M revenue vs LW. Consider extending LIVE draws.",
    iconIdx: 10,
  },
  {
    t: "⭐ VIP upgrade — Kemi Hassan",
    p: "Lifetime spend threshold hit (₦10M+). Tier: Champion. Auto-added to private draws.",
    iconIdx: 11,
  },
  {
    t: "Draw engine: RESULTED",
    p: "“iPhone 15 Pro Max x 5” completed. 5 winners picked (draw id: DRAW-24-09-331).",
    iconIdx: 0,
  },
  {
    t: "Dispute opened — payout #PY-8874",
    p: "User claims wrong bank. Evidence uploaded. Assign to finance.",
    iconIdx: 4,
  },
  {
    t: "SMS delivery report: 98.2%",
    p: "Campaign “Weekend Mega” reached 8,412 recipients. 152 bounces cleaned.",
    iconIdx: 2,
  },
];

const FIRST = [
  "Amaka",
  "Tunde",
  "Funmi",
  "Chidi",
  "Sade",
  "Kemi",
  "Bola",
  "Ifeoma",
  "Dele",
  "Zainab",
  "Emeka",
  "Ngozi",
  "Seun",
  "Tobi",
  "Wale",
  "Aisha",
  "Musa",
  "Ebi",
  "Dapo",
  "Rita",
];
const LAST = [
  "Okafor",
  "Bakare",
  "Adeyemi",
  "Eze",
  "Lawal",
  "Hassan",
  "Tinubu",
  "Dike",
  "Ogun",
  "Aliyu",
  "Nwosu",
  "Obi",
  "Adeyinka",
  "Balogun",
  "Olayiwola",
];
const TINTS = ["coral", "mint", "lemon", "sky", "lilac"];

function mkList(channel: Channel): NTFY[] {
  const now = Date.now();
  return TITLES.map((tpl, i) => {
    const icon = ICONS[tpl.iconIdx]!;
    const first = FIRST[(i * 3) % FIRST.length]!;
    const last = LAST[(i * 7) % LAST.length]!;
    const name = `${first} ${last}`;
    const minsAgo = i * 31 + 4;
    const result: NTFY = {
      id: `NTF-${channel.toUpperCase()}-${String(500000 + i).slice(0, 6)}`,
      channel,
      title: tpl.t,
      preview: tpl.p,
      icon: icon.i,
      iconTint: icon.t,
      time: new Date(now - minsAgo * 60 * 1000).toISOString(),
      unread: i < 6,
      recipient: name,
      recipientInitials: `${first[0]!}${last[0]!}`,
      recipientTint: TINTS[i % TINTS.length]!,
    };
    if (i === 1) {
      result.metricLabel = "Top-up amount";
      result.metricValue = formatNaira(1250000 * 100);
    } else if (i === 4) {
      result.metricLabel = "Batch total";
      result.metricValue = formatNaira(18420000 * 100);
    } else if (i === 8) {
      result.metricLabel = "Pool released";
      result.metricValue = formatNaira(4820000 * 100);
    } else if (i === 10) {
      result.metricLabel = "Tickets / Revenue";
      result.metricValue = "124,560 / " + formatNaira(62280000 * 100);
    }
    return result;
  });
}

const INAPP = mkList("inapp");
const EMAIL = mkList("email").map((n) => ({
  ...n,
  title: "[Raffila] " + n.title,
  unread: n.unread || n.id.endsWith("1"),
}));
const SMS = mkList("sms").map((n, i) => ({
  ...n,
  preview: n.preview.slice(0, 70) + "…",
  unread: i < 4,
}));

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
}

function ChannelIcon({ ch }: { ch: Channel }) {
  if (ch === "inapp") return <Bell className="w-4 h-4" />;
  if (ch === "email") return <Mail className="w-4 h-4" />;
  return <Smartphone className="w-4 h-4" />;
}

export function AdminNotificationsCenterPage() {
  const [tab, setTab] = useState<Channel>("inapp");
  const [readFilter, setReadFilter] = useState<ReadState>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<{ inapp: NTFY[]; email: NTFY[]; sms: NTFY[] }>({
    inapp: INAPP,
    email: EMAIL,
    sms: SMS,
  });

  const allItems = items[tab];
  const filtered = allItems.filter((n) => {
    if (readFilter === "unread" && !n.unread) return false;
    if (readFilter === "read" && n.unread) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !n.title.toLowerCase().includes(q) &&
        !n.preview.toLowerCase().includes(q) &&
        !n.recipient.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const unreadCounts = {
    inapp: items.inapp.filter((n) => n.unread).length,
    email: items.email.filter((n) => n.unread).length,
    sms: items.sms.filter((n) => n.unread).length,
  };
  const totalUnread = unreadCounts.inapp + unreadCounts.email + unreadCounts.sms;

  const markAllRead = () => {
    setItems({
      inapp: items.inapp.map((n) => ({ ...n, unread: false })),
      email: items.email.map((n) => ({ ...n, unread: false })),
      sms: items.sms.map((n) => ({ ...n, unread: false })),
    });
    toast.success(`Marked ${totalUnread} notifications as read`);
  };

  const markOneRead = (id: string) => {
    setItems({
      ...items,
      [tab]: items[tab].map((n) => (n.id === id ? { ...n, unread: false } : n)),
    });
  };

  const resend = (n: NTFY) => {
    toast.success(`Queued ${n.channel.toUpperCase()} resend — ${n.title.slice(0, 40)}…`);
  };

  return (
    <AdminShell activeNav="notifications" title="Notifications Center">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              <Bell className="w-7 h-7 text-coral" /> Notifications Center
            </h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Monitor system-wide broadcasts across in-app, email, and SMS channels.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => toast.info("Compose notification — draft wizard (mock)")}
            >
              <Bell className="w-4 h-4 mr-2" /> Compose
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={markAllRead}
              disabled={totalUnread === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" /> Mark all read ({totalUnread})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(["inapp", "email", "sms"] as Channel[]).map((ch) => (
            <Card
              key={ch}
              className={`cursor-pointer border transition ${
                tab === ch ? "ring-2 ring-coral border-coral" : "border-ink/10 hover:border-ink/30"
              }`}
              onClick={() => setTab(ch)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-2xl border ${
                      ch === "inapp"
                        ? "bg-coral/20 border-coral text-coral"
                        : ch === "email"
                          ? "bg-sky/20 border-sky text-sky"
                          : "bg-mint/30 border-mint text-ink"
                    }`}
                  >
                    <ChannelIcon ch={ch} />
                  </div>
                  <div>
                    <p className="font-display text-ink text-lg capitalize">
                      {ch === "inapp" ? "In-app" : ch}
                    </p>
                    <p className="text-xs font-body text-ink/50">{allItems.length} total</p>
                  </div>
                </div>
                {unreadCounts[ch] > 0 && (
                  <Badge className="rounded-full bg-coral border-coral text-white font-bold px-3 py-1">
                    {unreadCounts[ch]} new
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs value={tab} onValueChange={(v) => setTab(v as Channel)} className="w-full">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TabsList className="rounded-full">
                    <TabsTrigger
                      value="inapp"
                      className="rounded-full data-[state=active]:bg-coral data-[state=active]:text-white px-5"
                    >
                      <Bell className="w-4 h-4 mr-1.5" /> In-app
                      {unreadCounts.inapp > 0 && (
                        <Badge className="ml-2 rounded-full bg-coral/20 text-coral border-0 text-[10px]">
                          {unreadCounts.inapp}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="email"
                      className="rounded-full data-[state=active]:bg-coral data-[state=active]:text-white px-5"
                    >
                      <Mail className="w-4 h-4 mr-1.5" /> Email
                      {unreadCounts.email > 0 && (
                        <Badge className="ml-2 rounded-full bg-coral/20 text-coral border-0 text-[10px]">
                          {unreadCounts.email}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="sms"
                      className="rounded-full data-[state=active]:bg-coral data-[state=active]:text-white px-5"
                    >
                      <Smartphone className="w-4 h-4 mr-1.5" /> SMS
                      {unreadCounts.sms > 0 && (
                        <Badge className="ml-2 rounded-full bg-coral/20 text-coral border-0 text-[10px]">
                          {unreadCounts.sms}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-ink/40" />
                    <Select value={readFilter} onValueChange={(v) => setReadFilter(v as ReadState)}>
                      <SelectTrigger className="rounded-full w-40 h-9 text-sm">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All items</SelectItem>
                        <SelectItem value="unread">Unread only</SelectItem>
                        <SelectItem value="read">Read only</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                      <Input
                        className="pl-9 rounded-full w-56 h-9 text-sm"
                        placeholder="Search notifications..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs value={tab}>
              {(["inapp", "email", "sms"] as Channel[]).map((ch) => (
                <TabsContent key={ch} value={ch} className="m-0 mt-0">
                  <Card className="border-ink/10 overflow-hidden">
                    <div className="divide-y divide-ink/5">
                      {filtered.length === 0 && (
                        <div className="p-12 text-center">
                          <Bell className="w-12 h-12 text-ink/20 mx-auto mb-3" />
                          <p className="font-display text-ink text-lg">No notifications</p>
                          <p className="font-body text-ink/50 text-sm">
                            Try adjusting filters or compose a new broadcast.
                          </p>
                        </div>
                      )}
                      {filtered.map((n, i) => (
                        <div
                          key={n.id}
                          className={`p-4 sm:p-5 flex gap-4 items-start transition ${
                            n.unread ? "bg-coral/[0.04]" : "hover:bg-cream/40"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div
                              className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${n.iconTint}`}
                            >
                              {n.icon}
                            </div>
                            {n.unread && (
                              <Circle className="absolute -top-0.5 -right-0.5 w-3 h-3 fill-coral text-coral bg-paper border-2 border-paper rounded-full" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <h3
                                  className={`font-display text-base truncate ${n.unread ? "text-ink" : "text-ink/70"}`}
                                >
                                  {n.title}
                                </h3>
                                {n.unread && (
                                  <Badge className="rounded-full bg-coral border-coral text-white text-[10px] font-bold px-2 py-0">
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                  variant="outline"
                                  className="rounded-full text-[10px] bg-ink/5 border-ink/15 text-ink/60"
                                >
                                  <ChannelIcon ch={n.channel} />
                                  <span className="ml-1 capitalize">
                                    {n.channel === "inapp" ? "In-app" : n.channel}
                                  </span>
                                </Badge>
                                <span className="text-[11px] text-ink/40 font-mono whitespace-nowrap">
                                  {fmtTime(n.time)}
                                </span>
                              </div>
                            </div>

                            <p className="font-body text-sm text-ink/70 line-clamp-2 mb-2">
                              {n.preview}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-7 h-7 border border-ink/10">
                                    <AvatarFallback
                                      className={`bg-${n.recipientTint} text-ink font-display font-semibold text-xs`}
                                    >
                                      {n.recipientInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-[11px] text-ink/50 font-body uppercase tracking-wider">
                                      Recipient
                                    </p>
                                    <p className="font-body text-xs text-ink font-semibold">
                                      {n.recipient}
                                    </p>
                                  </div>
                                </div>
                                {n.metricLabel && (
                                  <>
                                    <Separator orientation="vertical" className="h-8" />
                                    <div>
                                      <p className="text-[11px] text-ink/50 font-body uppercase tracking-wider">
                                        {n.metricLabel}
                                      </p>
                                      <p className="font-display text-sm text-coral font-bold">
                                        {n.metricValue}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {n.unread && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => markOneRead(n.id)}
                                  >
                                    <CheckCheck className="w-3.5 h-3.5 mr-1" /> Read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => resend(n)}
                                >
                                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Resend
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-full text-ink/40 hover:text-coral"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {filtered.length > 0 && (
                      <div className="p-4 flex items-center justify-between border-t border-ink/10 bg-cream/30">
                        <Badge variant="outline" className="rounded-full font-body">
                          Showing {filtered.length} / {allItems.length}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-full" disabled>
                            ← Previous
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full" disabled>
                            Next →
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
