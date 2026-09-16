import { useEffect, useState } from "react";
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
import type { AdminNotification } from "@/lib/admin-notifications";

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

const KIND_STYLE: Record<string, { icon: React.ReactNode; tint: string }> = {
  USER_CREATE: {
    icon: <Users className="w-4 h-4" />,
    tint: "bg-sky/20 border-sky text-sky",
  },
  AUTH_REGISTER: {
    icon: <Users className="w-4 h-4" />,
    tint: "bg-sky/20 border-sky text-sky",
  },
  COMPETITION_CREATE: {
    icon: <Trophy className="w-4 h-4" />,
    tint: "bg-coral/20 border-coral text-coral",
  },
  FRAUD_FLAG: {
    icon: <AlertTriangle className="w-4 h-4" />,
    tint: "bg-coral/20 border-coral text-coral",
  },
  USER_SUSPEND: {
    icon: <AlertTriangle className="w-4 h-4" />,
    tint: "bg-coral/20 border-coral text-coral",
  },
  USER_DELETE: {
    icon: <AlertTriangle className="w-4 h-4" />,
    tint: "bg-coral/20 border-coral text-coral",
  },
  PAYOUT_INITIATE: {
    icon: <CreditCard className="w-4 h-4" />,
    tint: "bg-mint/20 border-mint text-ink",
  },
  PAYOUT_COMPLETE: {
    icon: <Wallet className="w-4 h-4" />,
    tint: "bg-mint/30 border-mint text-ink",
  },
  PAYOUT_REVERSE: {
    icon: <CreditCard className="w-4 h-4" />,
    tint: "bg-coral/20 border-coral text-coral",
  },
  WALLET_FUND: {
    icon: <Wallet className="w-4 h-4" />,
    tint: "bg-mint/30 border-mint text-ink",
  },
  CONFIG_CHANGE: {
    icon: <Settings className="w-4 h-4" />,
    tint: "bg-lilac/20 border-lilac text-lilac",
  },
  TICKET_PURCHASE: {
    icon: <Ticket className="w-4 h-4" />,
    tint: "bg-lemon/30 border-lemon text-ink",
  },
  EMAIL: {
    icon: <Mail className="w-4 h-4" />,
    tint: "bg-sky/20 border-sky text-sky",
  },
  _default: {
    icon: <Bell className="w-4 h-4" />,
    tint: "bg-ink/10 border-ink/20 text-ink",
  },
};

const RECIPIENT_TINTS = [
  "bg-coral/20 text-ink",
  "bg-mint/30 text-ink",
  "bg-lemon/30 text-ink",
  "bg-sky/20 text-ink",
  "bg-lilac/20 text-ink",
];

function toNtfy(n: AdminNotification, unread: boolean): NTFY {
  const style = KIND_STYLE[n.kind] ?? KIND_STYLE["_default"]!;
  const name = n.recipient || "System";
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "R";
  let h = 0;
  for (let i = 0; i < n.id.length; i++) h = (h * 31 + n.id.charCodeAt(i)) >>> 0;
  return {
    id: n.id,
    channel: n.channel,
    title: n.title,
    preview: n.preview,
    icon: style.icon,
    iconTint: style.tint,
    time: n.time,
    unread,
    recipient: name,
    recipientInitials: initials,
    recipientTint: RECIPIENT_TINTS[h % RECIPIENT_TINTS.length]!,
  };
}
import { lagosRelativeTime } from "@/lib/format";

function ChannelIcon({ ch }: { ch: Channel }) {
  if (ch === "inapp") return <Bell className="w-4 h-4" />;
  if (ch === "email") return <Mail className="w-4 h-4" />;
  return <Smartphone className="w-4 h-4" />;
}

export function AdminNotificationsCenterPage() {
  const [tab, setTab] = useState<Channel>("inapp");
  const [readFilter, setReadFilter] = useState<ReadState>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<{ inapp: NTFY[]; email: NTFY[]; sms: NTFY[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [{ fetchAdminNotifications, getReadIds, getDismissedIds }] = await Promise.all([
          import("@/lib/admin-notifications"),
        ]);
        const data = await fetchAdminNotifications();
        if (cancelled) return;
        const read = getReadIds();
        const dismissed = getDismissedIds();
        const map = (list: AdminNotification[]) =>
          list
            .filter((n) => !dismissed.has(n.id))
            .map((n) => toNtfy(n, !read.has(n.id)));
        setItems({ inapp: map(data.inapp), email: map(data.email), sms: map(data.sms) });
      } catch (err: any) {
        if (!cancelled) {
          const code = err?.code as string | undefined;
          setLoadError(
            code === "permission-denied"
              ? "Firestore denied access. Publish the latest firestore.rules, then refresh."
              : err?.message || "Could not load notifications",
          );
          setItems({ inapp: [], email: [], sms: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const allItems = items?.[tab] ?? [];
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
    inapp: (items?.inapp ?? []).filter((n) => n.unread).length,
    email: (items?.email ?? []).filter((n) => n.unread).length,
    sms: (items?.sms ?? []).filter((n) => n.unread).length,
  };
  const totalUnread = unreadCounts.inapp + unreadCounts.email + unreadCounts.sms;

  const markAllRead = () => {
    if (!items) return;
    import("@/lib/admin-notifications").then(({ markAllNotifsRead }) => {
      const ids = [...items.inapp, ...items.email, ...items.sms].map((n) => n.id);
      markAllNotifsRead(ids);
      setItems({
        inapp: items.inapp.map((n) => ({ ...n, unread: false })),
        email: items.email.map((n) => ({ ...n, unread: false })),
        sms: items.sms.map((n) => ({ ...n, unread: false })),
      });
      toast.success(`Marked ${totalUnread} notifications as read`);
    });
  };

  const markOneRead = (id: string) => {
    if (!items) return;
    import("@/lib/admin-notifications").then(({ markNotifRead }) => {
      markNotifRead(id);
      setItems({
        ...items,
        [tab]: items[tab].map((n) => (n.id === id ? { ...n, unread: false } : n)),
      });
    });
  };

  const dismissOne = (id: string) => {
    if (!items) return;
    import("@/lib/admin-notifications").then(({ dismissNotif }) => {
      dismissNotif(id);
      setItems({
        ...items,
        [tab]: items[tab].filter((n) => n.id !== id),
      });
    });
  };

  const resend = (n: NTFY) => {
    import("@/lib/activity-log").then(({ logActivity }) =>
      logActivity({
        eventType: "NOTIFICATION_SEND",
        targetType: "notification",
        targetId: n.id,
        summary: `Queued ${n.channel.toUpperCase()} resend — ${n.title.slice(0, 40)}`,
      }),
    );
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
              Live from Firestore — high-risk activity, new users, new competitions, and queued
              emails.
            </p>
            {loadError && (
              <p className="mt-2 max-w-2xl rounded-xl bg-coral/10 px-4 py-2 font-body text-sm font-bold text-coral">
                {loadError}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Refresh
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
                      {loading && (
                        <div className="p-12 text-center">
                          <Bell className="w-12 h-12 text-ink/20 mx-auto mb-3 animate-pulse" />
                          <p className="font-display text-ink text-lg">Loading notifications…</p>
                        </div>
                      )}
                      {!loading && filtered.length === 0 && (
                        <div className="p-12 text-center">
                          <Bell className="w-12 h-12 text-ink/20 mx-auto mb-3" />
                          <p className="font-display text-ink text-lg">No notifications</p>
                          <p className="font-body text-ink/50 text-sm">
                            {tab === "sms"
                              ? "SMS pipeline is not connected yet — nothing to show."
                              : "Try adjusting filters."}
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
                                  {lagosRelativeTime(n.time)}
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
                                      className={`${n.recipientTint} font-display font-semibold text-xs`}
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
                                  title="Dismiss"
                                  onClick={() => dismissOne(n.id)}
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
