import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  User,
  Shield,
  CreditCard,
  UsersRound,
  Ticket,
  Activity,
  AlertTriangle,
  ClipboardList,
  X,
  Eye,
  UserX,
  UserCheck,
  UserCog,
  WalletCards,
  Check,
  Phone,
  Mail,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/components/rafilla/admin/shell";
import { cn, formatNaira } from "@/lib/utils";

type Role = "USER" | "PARTNER" | "ADMIN";
type Risk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "ACTIVE" | "SUSPENDED" | "INVITED";

interface MockUser {
  id: string;
  name: string;
  username: string;
  initials: string;
  tint: "sky" | "mint" | "coral" | "lemon" | "lilac" | "ink";
  email: string;
  phone: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  verifiedBoth: boolean;
  role: Role;
  entries: number;
  wallet: number;
  referral: number;
  risk: Risk;
  registered: string;
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
  USER: "bg-paper text-ink ring-1 ring-ink/10",
  PARTNER: "bg-mint/30 text-ink",
  ADMIN: "bg-ink text-cream",
};

const riskPill: Record<Risk, string> = {
  LOW: "bg-mint/30 text-ink",
  MEDIUM: "bg-lemon/40 text-ink",
  HIGH: "bg-coral/20 text-coral",
  CRITICAL: "bg-rose/25 text-ink",
};

const statusPill: Record<Status, string> = {
  ACTIVE: "bg-mint/30 text-ink",
  SUSPENDED: "bg-coral/20 text-coral",
  INVITED: "bg-sky/25 text-ink",
};

const MOCK_USERS: MockUser[] = [
  { id: "u-001", name: "Aisha Mohammed", username: "@aisha.m", initials: "AM", tint: "coral", email: "aisha.m@rafilla.ng", phone: "+234 803 111 0001", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "ADMIN", entries: 42, wallet: 1250000, referral: 84200, risk: "LOW", registered: "2024-08-14", status: "ACTIVE" },
  { id: "u-002", name: "Tunde Okafor", username: "@tunde.o", initials: "TO", tint: "sky", email: "tunde.okafor@mail.ng", phone: "+234 802 220 4410", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "USER", entries: 128, wallet: 340500, referral: 12150, risk: "LOW", registered: "2025-01-22", status: "ACTIVE" },
  { id: "u-003", name: "Chidi Kelechi", username: "@chidi.k", initials: "CK", tint: "mint", email: "chidi.k@outlook.com", phone: "+234 701 330 5512", verifiedEmail: true, verifiedPhone: false, verifiedBoth: false, role: "USER", entries: 76, wallet: 185000, referral: 4820, risk: "MEDIUM", registered: "2025-02-10", status: "ACTIVE" },
  { id: "u-004", name: "Lux Wheels Ltd", username: "@luxwheels", initials: "LW", tint: "lemon", email: "hello@luxwheels.ng", phone: "+234 1 772 0088", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "PARTNER", entries: 0, wallet: 0, referral: 0, risk: "LOW", registered: "2024-11-02", status: "ACTIVE" },
  { id: "u-005", name: "Amaka Peace", username: "@amaka.p", initials: "AP", tint: "lilac", email: "amaka.p@gmail.com", phone: "+234 902 440 2201", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "USER", entries: 254, wallet: 612000, referral: 142300, risk: "LOW", registered: "2024-12-08", status: "ACTIVE" },
  { id: "u-006", name: "Ifeoma Dike", username: "@ifeoma.d", initials: "ID", tint: "coral", email: "ifeoma.d@yahoo.com", phone: "+234 809 550 8877", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "USER", entries: 91, wallet: 120000, referral: 9800, risk: "LOW", registered: "2025-02-28", status: "ACTIVE" },
  { id: "u-007", name: "Bola Finance", username: "@bola.f", initials: "BF", tint: "ink", email: "bola.f@rafilla.ng", phone: "+234 803 660 1122", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "ADMIN", entries: 18, wallet: 0, referral: 0, risk: "LOW", registered: "2024-09-20", status: "ACTIVE" },
  { id: "u-008", name: "Suspicious #4712", username: "@anon_4712", initials: "S4", tint: "coral", email: "temp4712@dispostable.com", phone: "+234 000 000 0000", verifiedEmail: false, verifiedPhone: false, verifiedBoth: false, role: "USER", entries: 210, wallet: 10000, referral: 0, risk: "CRITICAL", registered: "2026-03-01", status: "SUSPENDED" },
  { id: "u-009", name: "Uche Audit", username: "@uche.a", initials: "UA", tint: "sky", email: "uche.a@rafilla.ng", phone: "+234 814 770 3344", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "ADMIN", entries: 7, wallet: 0, referral: 0, risk: "LOW", registered: "2024-10-01", status: "ACTIVE" },
  { id: "u-010", name: "Ngozi Gift", username: "@ngozi.g", initials: "NG", tint: "lemon", email: "ngozi.gift@mail.ng", phone: "+234 812 880 5519", verifiedEmail: true, verifiedPhone: false, verifiedBoth: false, role: "USER", entries: 32, wallet: 48000, referral: 2200, risk: "MEDIUM", registered: "2025-03-15", status: "ACTIVE" },
  { id: "u-011", name: "TechHome NG", username: "@techhomeng", initials: "TH", tint: "mint", email: "partners@techhome.ng", phone: "+234 1 234 9900", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "PARTNER", entries: 0, wallet: 0, referral: 0, risk: "LOW", registered: "2024-12-19", status: "ACTIVE" },
  { id: "u-012", name: "Kemi Adedeji", username: "@kemi.a", initials: "KA", tint: "lilac", email: "kemi.a@hotmail.com", phone: "+234 805 990 1177", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "USER", entries: 165, wallet: 820000, referral: 42800, risk: "LOW", registered: "2024-11-27", status: "ACTIVE" },
  { id: "u-013", name: "Pending Invite 081", username: "@inv_081", initials: "I8", tint: "ink", email: "invite081@rafilla.ng", phone: "+234 800 000 0081", verifiedEmail: false, verifiedPhone: false, verifiedBoth: false, role: "USER", entries: 0, wallet: 0, referral: 0, risk: "LOW", registered: "2026-03-12", status: "INVITED" },
  { id: "u-014", name: "Yusuf Bello", username: "@yusuf.b", initials: "YB", tint: "sky", email: "yusuf.bello@mail.ng", phone: "+234 703 100 6620", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "USER", entries: 58, wallet: 210000, referral: 7400, risk: "HIGH", registered: "2025-05-02", status: "ACTIVE" },
  { id: "u-015", name: "Adebayo Homes", username: "@adebayohomes", initials: "AH", tint: "coral", email: "info@adebayohomes.ng", phone: "+234 1 442 0010", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "PARTNER", entries: 0, wallet: 0, referral: 0, risk: "LOW", registered: "2025-01-10", status: "ACTIVE" },
  { id: "u-016", name: "Zainab Sani", username: "@zainab.s", initials: "ZS", tint: "mint", email: "zainab.sani@gmail.com", phone: "+234 816 220 3344", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "USER", entries: 22, wallet: 65000, referral: 1800, risk: "LOW", registered: "2025-06-20", status: "ACTIVE" },
  { id: "u-017", name: "Velocity User A", username: "@vel_a", initials: "VA", tint: "coral", email: "vel.a@protonmail.com", phone: "+234 000 000 1101", verifiedEmail: true, verifiedPhone: false, verifiedBoth: false, role: "USER", entries: 412, wallet: 5000, referral: 0, risk: "HIGH", registered: "2026-02-28", status: "SUSPENDED" },
  { id: "u-018", name: "Femi Johnson", username: "@femi.j", initials: "FJ", tint: "lemon", email: "femi.j@outlook.com", phone: "+234 803 440 2250", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "USER", entries: 104, wallet: 410000, referral: 26400, risk: "LOW", registered: "2024-10-14", status: "ACTIVE" },
  { id: "u-019", name: "Grace Property", username: "@graceprop", initials: "GP", tint: "lilac", email: "admin@graceproperty.ng", phone: "+234 1 667 0044", verifiedEmail: true, verifiedPhone: true, verifiedBoth: true, role: "PARTNER", entries: 0, wallet: 0, referral: 0, risk: "LOW", registered: "2025-02-01", status: "ACTIVE" },
  { id: "u-020", name: "Daniel Eze", username: "@daniel.e", initials: "DE", tint: "sky", email: "daniel.eze@mail.ng", phone: "+234 902 550 8833", verifiedEmail: false, verifiedPhone: true, verifiedBoth: false, role: "USER", entries: 14, wallet: 28000, referral: 600, risk: "MEDIUM", registered: "2026-02-10", status: "ACTIVE" },
];

const FILTER_VERIFIED = ["All", "Email", "Phone", "Both"] as const;
const FILTER_RISK = ["All", "Low", "Medium", "High", "Critical"] as const;
const FILTER_ROLE = ["All", "User", "Partner", "Admin"] as const;

export function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [verified, setVerified] = useState<(typeof FILTER_VERIFIED)[number]>("All");
  const [risk, setRisk] = useState<(typeof FILTER_RISK)[number]>("All");
  const [role, setRole] = useState<(typeof FILTER_ROLE)[number]>("All");
  const [suspendedOnly, setSuspendedOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [activeUser, setActiveUser] = useState<MockUser | null>(null);
  const [walletFor, setWalletFor] = useState<MockUser | null>(null);

  const filtered = MOCK_USERS.filter((u) => {
    const q = query.toLowerCase().trim();
    if (q && !(u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q) || u.username.toLowerCase().includes(q))) return false;
    if (verified === "Email" && !u.verifiedEmail) return false;
    if (verified === "Phone" && !u.verifiedPhone) return false;
    if (verified === "Both" && !u.verifiedBoth) return false;
    if (risk !== "All" && u.risk !== risk.toUpperCase()) return false;
    if (role !== "All" && u.role !== role.toUpperCase()) return false;
    if (suspendedOnly && u.status !== "SUSPENDED") return false;
    if (dateFrom && u.registered < dateFrom) return false;
    if (dateTo && u.registered > dateTo) return false;
    return true;
  });

  const copyToast = (text: string, label: string) => {
    void navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`, { description: text });
  };

  return (
    <AdminShell activeNav="users">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Users</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            User management
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            View and manage participant accounts, verification statuses, wallet balances, and risk
            flags.
          </p>
        </div>
      </header>

      <Card className="mb-5 rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <label className="flex min-h-11 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50 md:col-span-4">
              <Search className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search email, username, phone..."
                className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
              />
            </label>

            <div className="md:col-span-2">
              <Select value={verified} onValueChange={(v) => setVerified(v as typeof verified)}>
                <SelectTrigger className="min-h-11 rounded-full bg-lilac/20 px-4 font-extrabold text-ink ring-0">
                  <SelectValue placeholder="Verified" />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  {FILTER_VERIFIED.map((v) => (
                    <SelectItem key={v} value={v} className="rounded-xl font-bold">
                      Verified · {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select value={risk} onValueChange={(v) => setRisk(v as typeof risk)}>
                <SelectTrigger className="min-h-11 rounded-full bg-lemon/35 px-4 font-extrabold text-ink ring-0">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  {FILTER_RISK.map((v) => (
                    <SelectItem key={v} value={v} className="rounded-xl font-bold">
                      Risk · {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                <SelectTrigger className="min-h-11 rounded-full bg-sky/25 px-4 font-extrabold text-ink ring-0">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  {FILTER_ROLE.map((v) => (
                    <SelectItem key={v} value={v} className="rounded-xl font-bold">
                      Role · {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-2 md:col-span-2">
              <Label className="flex items-center gap-2 text-xs font-extrabold text-ink/65">
                <Switch checked={suspendedOnly} onCheckedChange={setSuspendedOnly} />
                Suspended only
              </Label>
            </div>

            <div className="md:col-span-4">
              <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-xs font-extrabold text-ink/65 ring-1 ring-ink/5">
                <Filter className="size-3.5" />
                <span>From</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 border-0 bg-transparent p-0 text-xs font-bold text-ink shadow-none focus-visible:ring-0"
                />
                <span>→</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 border-0 bg-transparent p-0 text-xs font-bold text-ink shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 md:col-span-8">
              <Button variant="outline" size="sm" onClick={() => toast.success("CSV export queued", { description: "Preparing users_export.csv (UTF-8 BOM + Naira formatting)" })}>
                <Download className="size-3.5" />
                Export CSV
              </Button>
              <Button variant="primary" size="sm" onClick={() => toast.success("New user stub", { description: "Opens create user form in a future build." })}>
                <Plus className="size-3.5" />
                New user
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-cream/60 [&_tr]:border-ink/10">
                <TableRow>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">User</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Verification</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Role</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Entries</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Wallet</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Referral</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Risk</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Registered</TableHead>
                  <TableHead className="px-4 py-3 font-extrabold text-ink/65">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right font-extrabold text-ink/65"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-ink/10">
                {filtered.map((u) => (
                  <TableRow
                    key={u.id}
                    className="cursor-pointer transition-colors hover:bg-lilac/10"
                    onClick={() => setActiveUser(u)}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("size-10", tintBg[u.tint])}>
                          <AvatarFallback className={cn("text-xs font-extrabold", tintBg[u.tint])}>
                            {u.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-ink">{u.name}</p>
                          <p className="truncate text-[11px] font-bold text-ink/50">{u.username} · {u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-0", u.verifiedEmail ? "bg-sky/25 text-ink" : "bg-ink/5 text-ink/35")}>
                          <Mail className="mr-1 size-2.5" /> {u.verifiedEmail ? "Email" : "—"}
                        </Badge>
                        <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-0", u.verifiedPhone ? "bg-mint/30 text-ink" : "bg-ink/5 text-ink/35")}>
                          <Phone className="mr-1 size-2.5" /> {u.verifiedPhone ? "Phone" : "—"}
                        </Badge>
                        {u.verifiedBoth && (
                          <Badge className="rounded-full bg-ink text-cream px-2 py-0.5 text-[10px] font-extrabold ring-0">
                            <Check className="mr-1 size-2.5" /> Full
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", rolePill[u.role])}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-extrabold text-ink">{u.entries.toLocaleString("en-NG")}</TableCell>
                    <TableCell className="px-4 py-3 font-extrabold text-ink">{formatNaira(u.wallet)}</TableCell>
                    <TableCell className="px-4 py-3 font-extrabold text-ink">{formatNaira(u.referral)}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", riskPill[u.risk])}>
                        {u.risk}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-bold text-ink/65">{u.registered}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", statusPill[u.status])}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-9">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-[22px] bg-paper p-2">
                          <DropdownMenuLabel className="rounded-xl bg-cream px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                            Actions · {u.username}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-lilac/20" onClick={() => setActiveUser(u)}>
                            <Eye className="mr-2 size-4" /> View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-coral/15"
                            onClick={() =>
                              toast.success(u.status === "SUSPENDED" ? "User restored" : "User suspended", {
                                description: `${u.name} status updated · audit log created.`,
                              })
                            }
                            disabled={u.role === "ADMIN"}
                          >
                            {u.status === "SUSPENDED" ? (
                              <><UserCheck className="mr-2 size-4" /> Restore user</>
                            ) : (
                              <><UserX className="mr-2 size-4" /> Suspend user</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-lemon/30"
                            onClick={() => toast.success("Impersonation token issued", { description: `Logged in as ${u.username} · session logged.` })}
                            disabled={u.role === "ADMIN"}
                          >
                            <UserCog className="mr-2 size-4" /> Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-sky/20" onClick={() => toast.success("Audit log opened", { description: `Full audit trail for ${u.username}` })}>
                            <ClipboardList className="mr-2 size-4" /> View audit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-mint/25" onClick={() => setWalletFor(u)}>
                            <WalletCards className="mr-2 size-4" /> Wallet adjustment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="px-4 py-12 text-center text-sm font-extrabold text-ink/45">
                      No users match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between border-t border-ink/10 px-5 py-3 text-xs font-extrabold text-ink/55">
            <span>Showing {filtered.length} of {MOCK_USERS.length} users</span>
            <span>Pagination · 1 – {filtered.length}</span>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!activeUser} onOpenChange={(v) => !v && setActiveUser(null)}>
        <SheetContent side="right" className="w-full max-w-xl overflow-y-auto rounded-l-[28px] bg-cream p-0 sm:max-w-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur">
            {activeUser && (
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className={cn("size-12 ring-2 ring-paper", tintBg[activeUser.tint])}>
                  <AvatarFallback className={cn("text-sm font-extrabold", tintBg[activeUser.tint])}>
                    {activeUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-extrabold text-ink">{activeUser.name}</p>
                  <p className="truncate text-xs font-bold text-ink/55">
                    {activeUser.username} · {activeUser.email}
                  </p>
                </div>
              </div>
            )}
            <button
              className="grid size-10 place-items-center rounded-full bg-paper text-ink/65 hover:bg-lilac/20 hover:text-ink"
              onClick={() => setActiveUser(null)}
            >
              <X className="size-4" />
            </button>
          </div>

          <Tabs defaultValue="profile" className="px-6 py-5">
            <TabsList className="flex h-auto flex-wrap gap-1 rounded-2xl bg-paper p-1">
              {[
                { key: "profile", label: "Profile", icon: User },
                { key: "wallet", label: "Wallet", icon: CreditCard },
                { key: "referrals", label: "Referrals", icon: UsersRound },
                { key: "entries", label: "Entries", icon: Ticket },
                { key: "activity", label: "Activity", icon: Activity },
                { key: "risk", label: "Risk", icon: AlertTriangle },
                { key: "audit", label: "Audit", icon: ClipboardList },
              ].map((t) => (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
                >
                  <t.icon className="size-3.5" /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="profile" className="mt-5 space-y-5">
              {activeUser && (
                <>
                  <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Account summary</p>
                      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {[
                          ["Full name", activeUser.name],
                          ["Username", activeUser.username],
                          ["Email", activeUser.email],
                          ["Phone", activeUser.phone],
                          ["Role", activeUser.role],
                          ["Registered", activeUser.registered],
                          ["Status", activeUser.status],
                          ["ID", activeUser.id],
                        ].map(([k, v]) => (
                          <div key={k} className="min-w-0">
                            <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">{k}</dt>
                            <dd className="mt-1 truncate font-bold text-ink">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToast(activeUser.email, "Email")}>Copy email</Button>
                        <Button variant="outline" size="sm" onClick={() => copyToast(activeUser.phone, "Phone")}>Copy phone</Button>
                        <Button variant="primary" size="sm" onClick={() => setWalletFor(activeUser)}>
                          <WalletCards className="size-3.5" /> Wallet adjustment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Verification</p>
                      <div className="mt-4 space-y-3 text-sm">
                        {[
                          { label: "Email", value: activeUser.verifiedEmail, tint: "sky" as const },
                          { label: "Phone", value: activeUser.verifiedPhone, tint: "mint" as const },
                          { label: "Full (both)", value: activeUser.verifiedBoth, tint: "coral" as const },
                        ].map((v) => (
                          <div key={v.label} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
                            <span className="font-extrabold text-ink">{v.label}</span>
                            <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", v.value ? `${tintBg[v.tint]}` : "bg-ink/5 text-ink/35")}>
                              {v.value ? <><Check className="mr-1 size-3" /> Verified</> : "Not verified"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="wallet" className="mt-5 space-y-5">
              {activeUser && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="rounded-[22px] border-0 bg-mint/25 p-0 ring-1 ring-ink/5 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Available wallet</p>
                        <p className="mt-2 font-display text-2xl font-extrabold text-ink">{formatNaira(activeUser.wallet)}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-[22px] border-0 bg-coral/15 p-0 ring-1 ring-ink/5 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Referral balance</p>
                        <p className="mt-2 font-display text-2xl font-extrabold text-ink">{formatNaira(activeUser.referral)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Wallet ledger · last 15</p>
                        <Button variant="outline" size="sm" onClick={() => setWalletFor(activeUser)}>
                          <WalletCards className="size-3.5" /> Adjust
                        </Button>
                      </div>
                      <div className="mt-4 divide-y divide-ink/10">
                        {[
                          ["Entry purchase", "Mercedes C-Class 2026 · ×25", "-₦250,000", "2026-03-10", "lemon"],
                          ["Wallet funding", "Paystack · reference PS_8821a", "+₦500,000", "2026-03-09", "mint"],
                          ["Referral commission", "Level 1 · @tunde.o entry", "+₦4,000", "2026-03-08", "coral"],
                          ["Entry purchase", "Nova X1 Bundle · ×12", "-₦60,000", "2026-03-07", "lemon"],
                          ["Wallet funding", "Bank transfer · FCMB", "+₦100,000", "2026-03-05", "mint"],
                          ["Admin adjustment", "Correction · duplicate refund", "+₦10,000", "2026-03-03", "sky"],
                        ].map(([t, d, a, date, tint], i) => (
                          <div key={i} className="flex items-center justify-between gap-3 py-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-extrabold text-ink">{t}</p>
                              <p className="truncate text-xs font-bold text-ink/55">{d}</p>
                            </div>
                            <div className="text-right">
                              <p className={cn("text-sm font-extrabold", (a as string).startsWith("+") ? "text-ink" : "text-coral")}>{a}</p>
                              <p className="text-[11px] font-bold text-ink/45">{date}</p>
                            </div>
                            <span className={cn("grid size-2.5 shrink-0 rounded-full", (tint === "mint" && "bg-mint") || (tint === "coral" && "bg-coral") || (tint === "sky" && "bg-sky") || "bg-lemon")} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="referrals" className="mt-5 space-y-5">
              {activeUser && (
                <>
                  <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Referral tree · 5 levels</p>
                      <div className="mt-4 space-y-3">
                        {[
                          ["Level 1 (8%)", 12, 48200],
                          ["Level 2 (5%)", 38, 22150],
                          ["Level 3 (4%)", 74, 11800],
                          ["Level 4 (2%)", 142, 3200],
                          ["Level 5 (1%)", 216, 1200],
                        ].map(([lvl, count, amt], i) => (
                          <div key={i} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
                            <div className="grid size-9 place-items-center rounded-xl bg-lilac/30 font-display text-sm font-extrabold text-ink">
                              L{i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-extrabold text-ink">{lvl as string}</p>
                              <p className="text-[11px] font-bold text-ink/55">{count as number} direct referrals</p>
                            </div>
                            <p className="font-display text-lg font-extrabold text-ink">{formatNaira(amt as number)}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Recent commissions</p>
                      <div className="mt-4 space-y-3 text-sm">
                        {[
                          ["Direct · @tunde.o entered 25x", "Level 1 · 8%", "₦20,000"],
                          ["L2 · @chidi.k entered 12x", "Level 2 · 5%", "₦3,000"],
                          ["L3 · @ngozi.g entered 5x", "Level 3 · 4%", "₦500"],
                          ["Direct · @kemi.a entered 40x", "Level 1 · 8%", "₦16,000"],
                        ].map((r, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-extrabold text-ink">{r[0]}</p>
                              <p className="truncate text-[11px] font-bold text-ink/55">{r[1]}</p>
                            </div>
                            <p className="font-extrabold text-coral">+{r[2]}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="entries" className="mt-5 space-y-5">
              {activeUser && (
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="p-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Entries summary</p>
                    <p className="mt-2 font-display text-3xl font-extrabold text-ink">{activeUser.entries.toLocaleString("en-NG")} entries</p>
                    <div className="mt-5 space-y-3">
                      {[
                        ["Mercedes C-Class 2026", 25, 5000, "LIVE"],
                        ["Nova X1 Bundle", 12, 10000, "CLOSING SOON"],
                        ["Lagos 2-Bed Apt", 8, 20000, "LIVE"],
                        ["Abuja Generator Pack", 18, 6500, "LIVE"],
                      ].map(([t, q, tix, s], i) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold text-ink">{t as string}</p>
                            <p className="text-[11px] font-bold text-ink/55">{q as number} entries · ticket range #{(tix as number).toLocaleString()} – #{((tix as number) + (q as number) - 1).toLocaleString()}</p>
                          </div>
                          <Badge className="rounded-full bg-mint/30 px-2.5 py-1 text-[11px] font-extrabold text-ink ring-0">{s as string}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-5 space-y-5">
              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Recent activity</p>
                  <ol className="mt-4 space-y-3">
                    {[
                      ["Wallet funded", "₦500,000 via Paystack", "2h ago", "mint"],
                      ["Entered competition", "Mercedes C-Class 2026 ×25", "1h ago", "sky"],
                      ["Profile updated", "Primary phone changed", "1d ago", "lemon"],
                      ["Login", "Chrome · Lagos IP", "2d ago", "lilac"],
                      ["Email verified", "Link opened", "4d ago", "mint"],
                      ["Account created", "Invite accepted", "2025-01-22", "coral"],
                    ].map(([t, d, time, tint], i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={cn("mt-1 grid size-3 rounded-full", (tint === "mint" && "bg-mint") || (tint === "sky" && "bg-sky") || (tint === "lemon" && "bg-lemon") || (tint === "lilac" && "bg-lilac") || "bg-coral")} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-extrabold text-ink">{t as string}</p>
                            <span className="shrink-0 text-[11px] font-extrabold text-ink/45">{time as string}</span>
                          </div>
                          <p className="text-xs font-bold text-ink/55">{d as string}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk" className="mt-5 space-y-5">
              {activeUser && (
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Risk score</p>
                        <p className="mt-2 font-display text-3xl font-extrabold text-ink">{activeUser.risk}</p>
                      </div>
                      <Badge className={cn("rounded-full px-3 py-1.5 text-xs font-extrabold ring-0", riskPill[activeUser.risk])}>
                        <Shield className="mr-1 size-3.5" /> Assessed
                      </Badge>
                    </div>
                    <div className="mt-5 space-y-3 text-sm">
                      {activeUser.risk === "LOW" && [
                        "Fully verified email + phone",
                        "Consistent single device usage",
                        "No velocity alerts in 90 days",
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-2xl bg-mint/20 px-4 py-3">
                          <Check className="size-4 text-ink" />
                          <span className="font-bold text-ink">{f}</span>
                        </div>
                      ))}
                      {(activeUser.risk === "MEDIUM" || activeUser.risk === "HIGH" || activeUser.risk === "CRITICAL") && [
                        activeUser.risk === "CRITICAL" ? "Multiple shared-bank links flagged" : "Phone not yet verified",
                        "Ticket velocity alert on 2026-03-01",
                        "IP changed 4x in last 48h",
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-2xl bg-coral/10 px-4 py-3">
                          <AlertTriangle className="size-4 text-coral" />
                          <span className="font-bold text-ink">{f}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="audit" className="mt-5 space-y-5">
              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                <CardContent className="p-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Immutable audit trail</p>
                  <div className="mt-4 divide-y divide-ink/10 text-sm">
                    {[
                      ["2026-03-10 14:22", "Status updated", "Admin Aisha · suspended → active"],
                      ["2026-03-08 09:14", "Wallet adjustment", "Admin Bola · +₦10,000 · duplicate refund"],
                      ["2026-03-03 11:02", "Impersonation", "Admin Uche · customer support session"],
                      ["2026-02-28 20:01", "Risk flag", "Fraud engine · velocity alert opened"],
                    ].map((r, i) => (
                      <div key={i} className="flex flex-wrap items-start justify-between gap-2 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-extrabold text-ink">{r[1]}</p>
                          <p className="truncate text-xs font-bold text-ink/55">{r[2]}</p>
                        </div>
                        <p className="text-[11px] font-extrabold text-ink/45">{r[0]}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!walletFor}
        onOpenChange={(v) => {
          if (!v) setWalletFor(null);
        }}
      >
        <DialogContent className="rounded-[28px] bg-cream p-0 shadow-none sm:max-w-lg">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-3 font-display text-2xl font-extrabold text-ink">
              <span className="grid size-10 place-items-center rounded-full bg-mint/30">
                <WalletCards className="size-4.5 text-ink" />
              </span>
              Wallet adjustment
            </DialogTitle>
          </DialogHeader>
          {walletFor && <WalletAdjustmentForm user={walletFor} onDone={() => setWalletFor(null)} />}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function WalletAdjustmentForm({ user, onDone }: { user: MockUser; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState(`WADJ-${Date.now().toString(36).toUpperCase()}`);
  const [reason, setReason] = useState("");
  const [type, setType] = useState<"Credit" | "Debit">("Credit");
  const [reasonOpen, setReasonOpen] = useState(false);

  const disabled = !amount || Number(amount) <= 0 || !reason.trim() || reason.trim().length < 8;

  const apply = () => {
    if (disabled) return;
    toast.success("Wallet adjusted successfully", {
      description: `${type} ${formatNaira(Number(amount))} · ${user.username} · reason: ${reason.slice(0, 60)}… — audit log written.`,
    });
    setTimeout(onDone, 400);
  };

  return (
    <div className="space-y-4 px-6 pb-6">
      <div className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className={cn("text-xs font-extrabold", tintBg[user.tint])}>
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-ink">{user.name}</p>
            <p className="truncate text-[11px] font-bold text-ink/55">
              Current wallet {formatNaira(user.wallet)} · referral {formatNaira(user.referral)}
            </p>
          </div>
        </div>
        <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", rolePill[user.role])}>
          {user.role}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Adjustment type</Label>
        <RadioGroup value={type} onValueChange={(v) => setType(v as typeof type)} className="grid grid-cols-2 gap-2">
          {(["Credit", "Debit"] as const).map((t) => (
            <label
              key={t}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition-colors",
                type === t
                  ? t === "Credit"
                    ? "border-mint bg-mint/25 text-ink"
                    : "border-coral/50 bg-coral/15 text-coral"
                  : "border-ink/10 bg-paper text-ink/55 hover:border-ink/20",
              )}
            >
              {t}
              <RadioGroupItem value={t} id={t} className="sr-only" />
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Amount (₦)</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            className="min-h-12 rounded-2xl border-ink/10 bg-paper px-4 text-base font-extrabold text-ink shadow-none placeholder:font-bold placeholder:text-ink/35 focus-visible:ring-coral"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Reference</Label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="min-h-12 rounded-2xl border-ink/10 bg-paper px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">
          Reason for change <span className="text-coral">*</span>
        </Label>
        <Textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onFocus={() => setReasonOpen(true)}
          rows={4}
          placeholder="Never make silent adjustments. Describe the source: customer support ticket ID, duplicate entry refund, settlement correction, fraud clawback, etc."
          className="rounded-2xl border-ink/10 bg-paper p-4 text-sm font-bold text-ink shadow-none placeholder:font-bold placeholder:text-ink/35 focus-visible:ring-coral"
        />
        <p className="text-[11px] font-extrabold text-ink/45">
          {reason.length < 8
            ? `Minimum 8 characters · ${reason.length}/8`
            : "Reason will be written to the immutable audit log."}
        </p>
      </div>

      {!reasonOpen && (
        <div className="flex items-start gap-3 rounded-2xl bg-coral/12 px-4 py-3 text-xs font-extrabold text-coral ring-1 ring-coral/20">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Adjustments are never silent. A reason and timestamped audit log are required before the
            wallet balance changes.
          </p>
        </div>
      )}

      <DialogFooter className="!flex-col gap-2 sm:!flex-row">
        <Button variant="outline" type="button" size="md" onClick={onDone}>
          Cancel
        </Button>
        <Button type="button" size="md" variant="primary" disabled={disabled} onClick={apply}>
          Apply adjustment
        </Button>
      </DialogFooter>
    </div>
  );
}
