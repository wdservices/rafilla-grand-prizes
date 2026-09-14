import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCog,
  UserX,
  UserCheck,
  WalletCards,
  Mail,
  Phone,
  ShieldCheck,
  Ban,
  X,
  Check,
  PlusCircle,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { cn, formatNaira } from "@/lib/utils";

type Role = "USER" | "PARTNER" | "ADMIN";
type Status = "ACTIVE" | "SUSPENDED";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  initials: string;
  avatarUrl: string;
  tint: "sky" | "mint" | "coral" | "lemon" | "lilac" | "ink";
  role: Role;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  verifiedKyc: boolean;
  entries: number;
  wallet: number;
  created: string;
  status: Status;
}

const tintBg: Record<AdminUser["tint"], string> = {
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/35 text-ink",
  coral: "bg-coral/20 text-coral",
  lemon: "bg-lemon/40 text-ink",
  lilac: "bg-lilac/35 text-ink",
  ink: "bg-ink/10 text-ink",
};

const rolePill: Record<Role, string> = {
  USER: "bg-ink/10 text-ink",
  PARTNER: "bg-coral/20 text-coral",
  ADMIN: "bg-coral/20 text-coral",
};

const statusPill: Record<Status, string> = {
  ACTIVE: "bg-mint/35 text-ink",
  SUSPENDED: "bg-coral/20 text-coral",
};

const TINTS: AdminUser["tint"][] = ["sky", "mint", "coral", "lemon", "lilac", "ink"];

function tintFor(id: string): AdminUser["tint"] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length]!;
}

function isoDate(value: unknown): string {
  try {
    const v = value as any;
    if (v && typeof v.toDate === "function") {
      return (v.toDate() as Date).toISOString().slice(0, 10);
    }
  } catch {
    // ignore
  }
  if (typeof value === "string" && value) return value.slice(0, 10);
  return "";
}

function docToAdminUser(id: string, data: Record<string, unknown>, entries: number): AdminUser {
  const first = (data["firstName"] as string) || "";
  const last = (data["lastName"] as string) || "";
  const display = (data["displayName"] as string) || `${first} ${last}`.trim();
  const name = display || (data["handle"] as string) || (data["email"] as string) || id.slice(0, 8);
  const monogram =
    (data["avatarMonogram"] as string) ||
    ((first.slice(0, 1) + last.slice(0, 1)).toUpperCase() || "U");
  const rawRole = String(data["role"] ?? "user").toLowerCase();
  const role: Role = rawRole === "admin" ? "ADMIN" : rawRole === "partner" ? "PARTNER" : "USER";
  const verified = data["verified"] === true;
  const phone = (data["phone"] as string) || "";
  const statusRaw = String(data["status"] ?? "active").toLowerCase();
  return {
    id,
    name,
    email: (data["email"] as string) || "",
    username: (data["handle"] as string) || "",
    phone,
    initials: monogram.slice(0, 2),
    avatarUrl: (data["avatarUrl"] as string) || "",
    tint: tintFor(id),
    role,
    verifiedEmail: verified,
    verifiedPhone: phone.length > 0,
    verifiedKyc: verified,
    entries,
    wallet: Number(data["walletBalanceKobo"] ?? 0) || 0,
    created: isoDate(data["createdAt"]),
    status: statusRaw === "suspended" ? "SUSPENDED" : "ACTIVE",
  };
}

const FILTERS = ["All", "Verified", "Not verified", "Suspended"] as const;
type FilterKey = (typeof FILTERS)[number];
const ROLE_FILTERS = ["all", "user", "partner", "admin"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

export function AdminUsersPage() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [suspendUser, setSuspendUser] = useState<AdminUser | null>(null);
  const [walletUser, setWalletUser] = useState<AdminUser | null>(null);
  const [walletType, setWalletType] = useState<"credit" | "debit">("credit");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [walletEmail, setWalletEmail] = useState(false);
  const [walletSaving, setWalletSaving] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendSaving, setSuspendSaving] = useState(false);
  const [logoutSessions, setLogoutSessions] = useState(true);
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const snap = await getDocs(query(collection(db, "users"), limit(100)));
        const rows = await Promise.all(
          snap.docs.map(async (d) => {
            let entries = 0;
            try {
              const es = await getDocs(query(collection(db, "users", d.id, "entries"), limit(500)));
              entries = es.size;
            } catch {
              entries = 0;
            }
            return docToAdminUser(d.id, d.data() as Record<string, unknown>, entries);
          }),
        );
        if (!cancelled) setUsers(rows);
      } catch (err: any) {
        if (!cancelled) {
          const code = err?.code as string | undefined;
          setLoadError(
            code === "permission-denied"
              ? "Firestore denied access. Publish the latest firestore.rules, then refresh."
              : err?.message || "Could not load users",
          );
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    if (
      s &&
      !u.name.toLowerCase().includes(s) &&
      !u.email.toLowerCase().includes(s) &&
      !u.username.toLowerCase().includes(s)
    )
      return false;
    if (roleFilter !== "all" && u.role.toLowerCase() !== roleFilter) return false;
    if (dateFrom && u.created && u.created < dateFrom) return false;
    if (dateTo && u.created && u.created > dateTo) return false;
    switch (filter) {
      case "Verified":
        return u.verifiedEmail && u.verifiedPhone && u.verifiedKyc;
      case "Not verified":
        return !(u.verifiedEmail && u.verifiedPhone && u.verifiedKyc);
      case "Suspended":
        return u.status === "SUSPENDED";
      default:
        return true;
    }
  });

  return (
    <AdminShell activeNav="users" title="Users">
      <header className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
          Admin · Users
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Users
        </h1>
        <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
          Manage all Raffila accounts — view, verify, adjust wallet, suspend, and impersonate.{" "}
          <span className="text-emerald-700">Live from Firestore ({users.length}).</span>
        </p>
      </header>

      <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              <Input
                placeholder="Search name, email, username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-full border-0 bg-cream pl-9 pr-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
              />
            </div>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as FilterKey)}
              className="w-auto"
            >
              <TabsList className="rounded-full bg-cream p-1">
                {FILTERS.map((f) => (
                  <TabsTrigger
                    key={f}
                    value={f}
                    className="rounded-full px-4 py-1.5 text-xs font-extrabold data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                  >
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-2 text-xs font-bold text-ink/65 ring-1 ring-ink/10">
              <Filter className="size-3.5" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0"
              />
              <span>→</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
              <SelectTrigger className="h-11 w-40 rounded-full bg-cream px-4 text-sm font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[22px] bg-paper p-1">
                <SelectItem value="all" className="rounded-xl font-bold">
                  All roles
                </SelectItem>
                <SelectItem value="user" className="rounded-xl font-bold">
                  Users
                </SelectItem>
                <SelectItem value="partner" className="rounded-xl font-bold">
                  Partners
                </SelectItem>
                <SelectItem value="admin" className="rounded-xl font-bold">
                  Admins
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <Table>
              <TableHeader className="[&_tr]:border-ink/10">
                <TableRow>
                  <TableHead className="py-3 font-extrabold text-ink/65">User</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Username</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Phone</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Role</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Verified</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">
                    Entries
                  </TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">
                    Wallet
                  </TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Created</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-ink/10">
                {loading && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center text-sm font-bold text-ink/55">
                      Loading users from Firestore…
                    </TableCell>
                  </TableRow>
                )}
                {!loading && loadError && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center">
                      <p className="text-sm font-extrabold text-coral">{loadError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-full"
                        onClick={() => setRefreshKey((k) => k + 1)}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !loadError && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center text-sm font-bold text-ink/55">
                      No users found. Adjust search or filters.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  !loadError &&
                  filtered.map((u) => (
                    <TableRow key={u.id} className="hover:bg-lilac/10">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("size-9 ring-2 ring-paper", tintBg[u.tint])}>
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <AvatarFallback className={cn("text-xs font-extrabold", tintBg[u.tint])}>
                              {u.initials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0 max-w-[200px]">
                          <p className="truncate text-sm font-extrabold text-ink">{u.name}</p>
                          <p className="truncate text-xs font-bold text-ink/55">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-xs font-bold text-ink/65">
                      {u.username}
                    </TableCell>
                    <TableCell className="py-3 text-xs font-bold text-ink/65 whitespace-nowrap">
                      {u.phone}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                          rolePill[u.role],
                        )}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1">
                        <Badge
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ring-0",
                            u.verifiedEmail
                              ? "bg-mint/35 text-ink"
                              : "bg-ink/10 text-ink/50 line-through",
                          )}
                        >
                          <Mail className="mr-0.5 size-2.5" />
                          Email
                        </Badge>
                        <Badge
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ring-0",
                            u.verifiedPhone
                              ? "bg-mint/35 text-ink"
                              : "bg-ink/10 text-ink/50 line-through",
                          )}
                        >
                          <Phone className="mr-0.5 size-2.5" />
                          Phone
                        </Badge>
                        <Badge
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ring-0",
                            u.verifiedKyc
                              ? "bg-mint/35 text-ink"
                              : "bg-ink/10 text-ink/50 line-through",
                          )}
                        >
                          <ShieldCheck className="mr-0.5 size-2.5" />
                          KYC
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right text-xs font-bold text-ink/70">
                      {u.entries.toLocaleString("en-NG")}
                    </TableCell>
                    <TableCell className="py-3 text-right text-xs font-extrabold text-ink whitespace-nowrap">
                      {formatNaira(u.wallet)}
                    </TableCell>
                    <TableCell className="py-3 text-xs font-bold text-ink/65 whitespace-nowrap">
                      {u.created}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                          statusPill[u.status],
                        )}
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-[22px] bg-paper p-1.5"
                        >
                          <DropdownMenuLabel className="rounded-xl px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                            {u.name}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink">
                            <Eye className="mr-2 size-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink">
                            <UserCog className="mr-2 size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink"
                            onClick={() => setWalletUser(u)}
                          >
                            <PlusCircle className="mr-2 size-4" /> Adjust wallet
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {u.status === "ACTIVE" ? (
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-coral focus:bg-coral/15"
                              onClick={() => setSuspendUser(u)}
                            >
                              <UserX className="mr-2 size-4" /> Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-mint-700 focus:bg-mint/20"
                              onClick={() => {
                                updateDoc(doc(db, "users", u.id), {
                                  status: "active",
                                  updatedAt: serverTimestamp(),
                                })
                                  .then(() => {
                                    setUsers((prev) =>
                                      prev.map((x) => (x.id === u.id ? { ...x, status: "ACTIVE" as const } : x)),
                                    );
                                    return import("@/lib/activity-log");
                                  })
                                  .then(({ logActivity }) =>
                                    logActivity({
                                      eventType: "USER_ACTIVATE",
                                      targetType: "user",
                                      targetId: u.id,
                                      summary: `Reactivated ${u.name}`,
                                      oldValue: { status: "suspended" },
                                      newValue: { status: "active" },
                                    }),
                                  )
                                  .then(() => toast.success(`${u.name} reactivated`))
                                  .catch((err: any) =>
                                    toast.error("Reactivate failed", {
                                      description: err?.message || String(err),
                                    }),
                                  );
                              }}
                            >
                              <UserCheck className="mr-2 size-4" /> Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!suspendUser} onOpenChange={(v) => !v && setSuspendUser(null)}>
        <DialogContent className="rounded-[28px] bg-paper p-0 shadow-none sm:max-w-lg">
          <DialogHeader className="border-b border-ink/10 px-6 py-5">
            <DialogTitle className="flex items-center gap-3 font-display text-2xl font-extrabold text-ink">
              <span className="grid size-10 place-items-center rounded-2xl bg-coral/20">
                <Ban className="size-4.5 text-coral" />
              </span>
              Suspend user
            </DialogTitle>
            {suspendUser && (
              <DialogDescription className="mt-1 text-sm font-bold text-ink/55">
                Restrict account access for{" "}
                <span className="font-extrabold text-ink">{suspendUser.name}</span>.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Reason for suspension
              </Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Velocity fraud pattern detected, shared bank account links, terms violation…"
                className="min-h-[100px] rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
              <Checkbox
                id="logout-all"
                checked={logoutSessions}
                onCheckedChange={(v) => setLogoutSessions(!!v)}
              />
              <Label
                htmlFor="logout-all"
                className="flex-1 cursor-pointer text-sm font-bold text-ink/75"
              >
                Also log out all active sessions for this user
              </Label>
            </div>
          </div>
          <DialogFooter className="border-t border-ink/10 px-6 py-4">
            <Button variant="outline" onClick={() => setSuspendUser(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={suspendSaving}
              onClick={() => {
                if (!suspendUser || suspendSaving) return;
                const target = suspendUser;
                setSuspendSaving(true);
                updateDoc(doc(db, "users", target.id), {
                  status: "suspended",
                  suspendedReason: suspendReason || "No reason given",
                  suspendedAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                })
                  .then(() => {
                    setUsers((prev) =>
                      prev.map((x) => (x.id === target.id ? { ...x, status: "SUSPENDED" as const } : x)),
                    );
                    return import("@/lib/activity-log");
                  })
                  .then(({ logActivity }) =>
                    logActivity({
                      eventType: "USER_SUSPEND",
                      targetType: "user",
                      targetId: target.id,
                      summary: `Suspended ${target.name}`,
                      details: {
                        reason: suspendReason || "No reason given",
                        logoutSessions,
                      },
                      oldValue: { status: "active" },
                      newValue: { status: "suspended" },
                    }),
                  )
                  .then(() => {
                    toast.success("User suspended", {
                      description: `${target.name} · action logged to audit trail.`,
                    });
                    setSuspendUser(null);
                    setSuspendReason("");
                  })
                  .catch((err: any) =>
                    toast.error("Suspend failed", {
                      description: err?.message || String(err),
                    }),
                  )
                  .finally(() => setSuspendSaving(false));
              }}
            >
              <Ban className="size-4" /> {suspendSaving ? "Suspending…" : "Confirm suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!walletUser} onOpenChange={(v) => !v && setWalletUser(null)}>
        <DialogContent className="rounded-[28px] bg-paper p-0 shadow-none sm:max-w-lg">
          <DialogHeader className="border-b border-ink/10 px-6 py-5">
            <DialogTitle className="flex items-center gap-3 font-display text-2xl font-extrabold text-ink">
              <span className="grid size-10 place-items-center rounded-2xl bg-lemon/40">
                <WalletCards className="size-4.5 text-ink" />
              </span>
              Adjust wallet balance
            </DialogTitle>
            {walletUser && (
              <DialogDescription className="mt-1 text-sm font-bold text-ink/55">
                <span className="font-extrabold text-ink">{walletUser.name}</span> · current balance{" "}
                {formatNaira(walletUser.wallet)}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Adjustment type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={walletType === "credit" ? "primary" : "outline"}
                  onClick={() => setWalletType("credit")}
                  className="rounded-2xl h-12 text-sm font-extrabold"
                >
                  <PlusCircle className="size-4 mr-1.5" /> Credit (add funds)
                </Button>
                <Button
                  variant={walletType === "debit" ? "primary" : "outline"}
                  onClick={() => setWalletType("debit")}
                  className="rounded-2xl h-12 text-sm font-extrabold"
                >
                  <Minus className="size-4 mr-1.5" /> Debit (remove funds)
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Amount (₦)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                  ₦
                </span>
                <Input
                  type="number"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="50,000"
                  className="h-12 rounded-2xl border-0 bg-cream pl-8 pr-4 text-base font-extrabold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Reason / note
              </Label>
              <Textarea
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                placeholder="Customer support goodwill, refund, comp entry, admin review…"
                className="min-h-[90px] rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
              <Checkbox
                id="email-user"
                checked={walletEmail}
                onCheckedChange={(v) => setWalletEmail(!!v)}
              />
              <Label
                htmlFor="email-user"
                className="flex-1 cursor-pointer text-sm font-bold text-ink/75"
              >
                Email user a transaction confirmation
              </Label>
            </div>
          </div>
          <DialogFooter className="border-t border-ink/10 px-6 py-4">
            <Button variant="outline" onClick={() => setWalletUser(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={walletSaving}
              onClick={() => {
                if (!walletUser || walletSaving) return;
                const target = walletUser;
                const amt = parseInt(walletAmount || "0", 10);
                if (!amt || amt <= 0) {
                  toast.error("Invalid amount", { description: "Enter an amount above zero." });
                  return;
                }
                const delta = (walletType === "credit" ? 1 : -1) * amt * 100;
                const nextBalance = target.wallet + delta;
                if (nextBalance < 0) {
                  toast.error("Insufficient balance", {
                    description: `${target.name} holds ${formatNaira(target.wallet)}.`,
                  });
                  return;
                }
                setWalletSaving(true);
                updateDoc(doc(db, "users", target.id), {
                  walletBalanceKobo: nextBalance,
                  updatedAt: serverTimestamp(),
                })
                  .then(() =>
                    addDoc(collection(db, "users", target.id, "walletTransactions"), {
                      type: walletType === "credit" ? "Wallet credit" : "Wallet debit",
                      amountKobo: amt * 100,
                      balanceAfterKobo: nextBalance,
                      reason: walletReason || "Admin adjustment",
                      emailReceipt: walletEmail,
                      createdAt: serverTimestamp(),
                    }),
                  )
                  .then(() => {
                    setUsers((prev) =>
                      prev.map((x) => (x.id === target.id ? { ...x, wallet: nextBalance } : x)),
                    );
                    return import("@/lib/activity-log");
                  })
                  .then(({ logActivity }) =>
                    logActivity({
                      eventType: "WALLET_ADJUST",
                      targetType: "user",
                      targetId: target.id,
                      summary: `${walletType === "credit" ? "Credited" : "Debited"} ${formatNaira(amt * 100)} ${walletType === "credit" ? "to" : "from"} ${target.name}`,
                      details: {
                        direction: walletType,
                        amountKobo: amt * 100,
                        balanceAfterKobo: nextBalance,
                        reason: walletReason || "No reason given",
                        emailReceipt: walletEmail,
                      },
                      oldValue: { walletBalanceKobo: target.wallet },
                      newValue: { walletBalanceKobo: nextBalance },
                    }),
                  )
                  .then(() => {
                    toast.success("Wallet adjusted", {
                      description: `${walletType.toUpperCase()} ${formatNaira(amt * 100)} for ${target.name}.`,
                    });
                    setWalletUser(null);
                    setWalletAmount("");
                    setWalletReason("");
                  })
                  .catch((err: any) =>
                    toast.error("Wallet adjust failed", {
                      description: err?.message || String(err),
                    }),
                  )
                  .finally(() => setWalletSaving(false));
              }}
            >
              <Check className="size-4" /> {walletSaving ? "Saving…" : `Confirm ${walletType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
