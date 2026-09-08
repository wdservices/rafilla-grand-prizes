import { useState } from "react";
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

interface MockUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  initials: string;
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

const tintBg: Record<MockUser["tint"], string> = {
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

const TINTS: MockUser["tint"][] = ["sky", "mint", "coral", "lemon", "lilac", "ink"];
const ROLES: Role[] = ["USER", "USER", "USER", "USER", "USER", "USER", "PARTNER", "USER", "USER", "ADMIN", "USER", "PARTNER"];
const STATUSES: Status[] = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "SUSPENDED", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "SUSPENDED", "ACTIVE"];

const FIRST_NAMES = ["Aisha", "Tunde", "Chidi", "Amaka", "Ifeoma", "Uche", "Bola", "Zainab", "Kelechi", "Ngozi", "Obioma", "Femi", "Kemi", "Olu", "Tobi", "Dami", "Sola", "Ade", "Nneka", "Uju", "Tega", "Ovie", "Wale", "Musa", "Hauwa"];
const LAST_NAMES = ["Mohammed", "Okafor", "Kelechi", "Peace", "Dike", "Nwankwo", "Tinubu", "Abubakar", "Okonkwo", "Okafor", "Ibe", "Adesanya", "Adewale", "Olumide", "Bakare", "Ogunleye", "Sanni", "Oyelaran", "Eze", "Chukwu", "Akpobome", "Ejeviome", "Ogunwande", "Musa", "Shehu"];

const EMAIL_DOMAINS = ["raffila.ng", "mail.ng", "gmail.com", "outlook.com", "yahoo.com"];
const USERS: MockUser[] = Array.from({ length: 25 }, (_, i) => {
  const fn = FIRST_NAMES[i % FIRST_NAMES.length]!;
  const ln = LAST_NAMES[i % LAST_NAMES.length]!;
  const initials = `${fn[0]!}${ln[0]!}`;
  return {
    id: `RF-U-${String(i + 1).padStart(5, "0")}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${EMAIL_DOMAINS[i % 5]!}`,
    username: `@${fn.toLowerCase()}.${ln.toLowerCase().slice(0, 3)}`,
    phone: `+234 80${String(10000000 + i * 37).slice(0, 8)}`,
    initials,
    tint: TINTS[i % TINTS.length]!,
    role: ROLES[i % ROLES.length]!,
    verifiedEmail: i % 5 !== 2,
    verifiedPhone: i % 7 !== 3,
    verifiedKyc: i % 4 !== 0,
    entries: 0,
    wallet: 0,
    created: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    status: STATUSES[i % STATUSES.length]!,
  };
});

const FILTERS = ["All", "Verified", "Not verified", "Suspended"] as const;
type FilterKey = (typeof FILTERS)[number];

export function AdminUsersPage() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [suspendUser, setSuspendUser] = useState<MockUser | null>(null);
  const [walletUser, setWalletUser] = useState<MockUser | null>(null);
  const [walletType, setWalletType] = useState<"credit" | "debit">("credit");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [walletEmail, setWalletEmail] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [logoutSessions, setLogoutSessions] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = USERS.filter((u) => {
    const s = search.toLowerCase();
    if (s && !u.name.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s) && !u.username.toLowerCase().includes(s)) return false;
    switch (filter) {
      case "Verified": return u.verifiedEmail && u.verifiedPhone && u.verifiedKyc;
      case "Not verified": return !(u.verifiedEmail && u.verifiedPhone && u.verifiedKyc);
      case "Suspended": return u.status === "SUSPENDED";
      default: return true;
    }
  });

  return (
    <AdminShell activeNav="users" title="Users">
      <header className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Users</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Users</h1>
        <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
          Manage all Raffila accounts — view, verify, adjust wallet, suspend, and impersonate.
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
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)} className="w-auto">
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
              <Input type="date" defaultValue="2026-02-01" className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0" />
              <span>→</span>
              <Input type="date" defaultValue="2026-03-12" className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="h-11 w-40 rounded-full bg-cream px-4 text-sm font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[22px] bg-paper p-1">
                <SelectItem value="all" className="rounded-xl font-bold">All roles</SelectItem>
                <SelectItem value="user" className="rounded-xl font-bold">Users</SelectItem>
                <SelectItem value="partner" className="rounded-xl font-bold">Partners</SelectItem>
                <SelectItem value="admin" className="rounded-xl font-bold">Admins</SelectItem>
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
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">Entries</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">Wallet</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Created</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-ink/10">
                {filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-lilac/10">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("size-9 ring-2 ring-paper", tintBg[u.tint])}>
                          <AvatarFallback className={cn("text-xs font-extrabold", tintBg[u.tint])}>{u.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 max-w-[200px]">
                          <p className="truncate text-sm font-extrabold text-ink">{u.name}</p>
                          <p className="truncate text-xs font-bold text-ink/55">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-xs font-bold text-ink/65">{u.username}</TableCell>
                    <TableCell className="py-3 text-xs font-bold text-ink/65 whitespace-nowrap">{u.phone}</TableCell>
                    <TableCell className="py-3">
                      <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0", rolePill[u.role])}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1">
                        <Badge className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ring-0", u.verifiedEmail ? "bg-mint/35 text-ink" : "bg-ink/10 text-ink/50 line-through")}>
                          <Mail className="mr-0.5 size-2.5" />
                          Email
                        </Badge>
                        <Badge className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ring-0", u.verifiedPhone ? "bg-mint/35 text-ink" : "bg-ink/10 text-ink/50 line-through")}>
                          <Phone className="mr-0.5 size-2.5" />
                          Phone
                        </Badge>
                        <Badge className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ring-0", u.verifiedKyc ? "bg-mint/35 text-ink" : "bg-ink/10 text-ink/50 line-through")}>
                          <ShieldCheck className="mr-0.5 size-2.5" />
                          KYC
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right text-xs font-bold text-ink/70">{u.entries.toLocaleString("en-NG")}</TableCell>
                    <TableCell className="py-3 text-right text-xs font-extrabold text-ink whitespace-nowrap">{formatNaira(u.wallet)}</TableCell>
                    <TableCell className="py-3 text-xs font-bold text-ink/65 whitespace-nowrap">{u.created}</TableCell>
                    <TableCell className="py-3">
                      <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0", statusPill[u.status])}>
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
                        <DropdownMenuContent align="end" className="w-44 rounded-[22px] bg-paper p-1.5">
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
                              onClick={() => toast.success(`${u.name} reactivated`)}
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
                Restrict account access for <span className="font-extrabold text-ink">{suspendUser.name}</span>.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Reason for suspension</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Velocity fraud pattern detected, shared bank account links, terms violation…"
                className="min-h-[100px] rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
              <Checkbox id="logout-all" checked={logoutSessions} onCheckedChange={(v) => setLogoutSessions(!!v)} />
              <Label htmlFor="logout-all" className="flex-1 cursor-pointer text-sm font-bold text-ink/75">
                Also log out all active sessions for this user
              </Label>
            </div>
          </div>
          <DialogFooter className="border-t border-ink/10 px-6 py-4">
            <Button variant="outline" onClick={() => setSuspendUser(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                toast.success("User suspended", { description: `${suspendUser?.name} · action logged to audit trail.` });
                setSuspendUser(null);
                setSuspendReason("");
              }}
            >
              <Ban className="size-4" /> Confirm suspend
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
                <span className="font-extrabold text-ink">{walletUser.name}</span> · current balance {formatNaira(walletUser.wallet)}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Adjustment type</Label>
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
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Amount (₦)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">₦</span>
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
              <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Reason / note</Label>
              <Textarea
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                placeholder="Customer support goodwill, refund, comp entry, admin review…"
                className="min-h-[90px] rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
              <Checkbox id="email-user" checked={walletEmail} onCheckedChange={(v) => setWalletEmail(!!v)} />
              <Label htmlFor="email-user" className="flex-1 cursor-pointer text-sm font-bold text-ink/75">
                Email user a transaction confirmation
              </Label>
            </div>
          </div>
          <DialogFooter className="border-t border-ink/10 px-6 py-4">
            <Button variant="outline" onClick={() => setWalletUser(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const amt = parseInt(walletAmount || "0", 10);
                toast.success("Wallet adjusted", {
                  description: `${walletType.toUpperCase()} ${formatNaira(amt * 100)} for ${walletUser?.name}.`,
                });
                setWalletUser(null);
                setWalletAmount("");
                setWalletReason("");
              }}
            >
              <Check className="size-4" /> Confirm {walletType}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
