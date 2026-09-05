import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Building2,
  User,
  Mail,
  Phone,
  Check,
  X,
  Eye,
  UserCog,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { AdminShell } from "@/components/rafilla/admin/admin-shell";
import { cn, formatNaira } from "@/lib/utils";

type PartnerStatus = "APPROVED" | "PENDING" | "REJECTED" | "SUSPENDED";

interface MockPartner {
  id: string;
  name: string;
  logoTint: "sky" | "mint" | "coral" | "lemon" | "lilac";
  logoInitials: string;
  contactPerson: string;
  email: string;
  phone: string;
  approved: boolean;
  assetsListed: number;
  totalRevenue: number;
  status: PartnerStatus;
  joined: string;
}

const TINTS: MockPartner["logoTint"][] = ["sky", "mint", "coral", "lemon", "lilac"];
const STATUSES: PartnerStatus[] = ["APPROVED", "APPROVED", "PENDING", "APPROVED", "REJECTED", "APPROVED", "PENDING", "APPROVED"];

const COMPANIES = [
  { name: "Lux Wheels Ltd", contact: "Tunde Adebayo" },
  { name: "TechHome NG", contact: "Amaka Ibe" },
  { name: "Adebayo Homes", contact: "Chidi Okafor" },
  { name: "Lekki Luxury Autos", contact: "Ifeoma Nwosu" },
  { name: "Abuja Tech Hub", contact: "Uche Dike" },
  { name: "Port Harcourt Jewelry", contact: "Zainab Mohammed" },
  { name: "Eko Furniture Co.", contact: "Bola Tinubu" },
  { name: "Ikeja Electronics", contact: "Kemi Olusanya" },
  { name: "VI Properties", contact: "Obioma Eze" },
  { name: "Lagos Yacht Club", contact: "Ngozi Chukwu" },
  { name: "Jos Mining Co.", contact: "Musa Shehu" },
  { name: "Kano Textiles", contact: "Hauwa Abubakar" },
];

const tintBg: Record<MockPartner["logoTint"], string> = {
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/35 text-ink",
  coral: "bg-coral/20 text-coral",
  lemon: "bg-lemon/40 text-ink",
  lilac: "bg-lilac/35 text-ink",
};

const statusPill: Record<PartnerStatus, string> = {
  APPROVED: "bg-mint/35 text-ink",
  PENDING: "bg-lemon/40 text-ink",
  REJECTED: "bg-coral/20 text-coral",
  SUSPENDED: "bg-ink/15 text-ink",
};

const PARTNERS: MockPartner[] = COMPANIES.map((c, i) => ({
  id: `RF-P-${String(i + 1).padStart(5, "0")}`,
  name: c.name,
  logoTint: TINTS[i % TINTS.length]!,
  logoInitials: c.name.split(" ").slice(0, 2).map(w => w[0]!).join(""),
  contactPerson: c.contact,
  email: `partners@${c.name.toLowerCase().replace(/[^a-z]/g, "")}.ng`,
  phone: `+234 80${String(10000000 + i * 91).slice(0, 8)}`,
  approved: STATUSES[i % STATUSES.length]! === "APPROVED",
  assetsListed: Math.floor(Math.random() * 14) + (i % 3),
  totalRevenue: (Math.floor(Math.random() * 480) + 25) * 1000000,
  status: STATUSES[i % STATUSES.length]!,
  joined: `2025-${String((i % 11) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
}));

const FILTERS = ["All", "Approved", "Pending", "Rejected", "Suspended"] as const;
type FilterKey = (typeof FILTERS)[number];

export function AdminPartnersPage() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [search, setSearch] = useState("");

  const filtered = PARTNERS.filter((p) => {
    const s = search.toLowerCase();
    if (s && !p.name.toLowerCase().includes(s) && !p.contactPerson.toLowerCase().includes(s) && !p.email.toLowerCase().includes(s)) return false;
    switch (filter) {
      case "Approved": return p.status === "APPROVED";
      case "Pending": return p.status === "PENDING";
      case "Rejected": return p.status === "REJECTED";
      case "Suspended": return p.status === "SUSPENDED";
      default: return true;
    }
  });

  return (
    <AdminShell activeNav="partners" title="Partners">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Partners</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Partners</h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Onboard, approve, and monitor prize asset partners and their revenue contribution.
          </p>
        </div>
        <Button variant="primary">
          <User className="size-4" /> Invite partner
        </Button>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total partners", val: PARTNERS.length, tone: "ink" as const, icon: Building2 },
          { label: "Approved", val: PARTNERS.filter(p => p.status === "APPROVED").length, tone: "mint" as const, icon: Check },
          { label: "Pending review", val: PARTNERS.filter(p => p.status === "PENDING").length, tone: "lemon" as const, icon: X },
          { label: "Revenue driven", val: formatNaira(PARTNERS.reduce((a, b) => a + b.totalRevenue, 0)), tone: "coral" as const, icon: TrendingUp },
        ].map((s, i) => {
          const bg: Record<string, string> = { ink: "bg-ink/5", mint: "bg-mint/30", lemon: "bg-lemon/40", coral: "bg-coral/18" };
          const ic: Record<string, string> = { ink: "text-ink", mint: "text-ink", lemon: "text-ink", coral: "text-coral" };
          return (
            <Card key={i} className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("grid size-10 place-items-center rounded-xl", bg[s.tone])}>
                  <s.icon className={cn("size-4.5", ic[s.tone])} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">{s.label}</p>
                  <p className="truncate font-display text-lg font-extrabold text-ink">{s.val}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              <Input
                placeholder="Search partner name, contact, email…"
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
            <Select defaultValue="all">
              <SelectTrigger className="h-11 w-44 rounded-full bg-cream px-4 text-sm font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[22px] bg-paper p-1">
                <SelectItem value="all" className="rounded-xl font-bold">All categories</SelectItem>
                <SelectItem value="auto" className="rounded-xl font-bold">Auto</SelectItem>
                <SelectItem value="tech" className="rounded-xl font-bold">Tech</SelectItem>
                <SelectItem value="property" className="rounded-xl font-bold">Property</SelectItem>
                <SelectItem value="jewelry" className="rounded-xl font-bold">Jewelry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <Table>
              <TableHeader className="[&_tr]:border-ink/10">
                <TableRow>
                  <TableHead className="py-3 font-extrabold text-ink/65">Partner</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Contact person</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Email</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Phone</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Approved</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">Assets listed</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">Revenue driven</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-ink/10">
                {filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-lilac/10">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("size-10 ring-2 ring-paper", tintBg[p.logoTint])}>
                          <AvatarFallback className={cn("text-[11px] font-extrabold", tintBg[p.logoTint])}>
                            {p.logoInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 max-w-[180px]">
                          <p className="truncate text-sm font-extrabold text-ink">{p.name}</p>
                          <p className="truncate text-[11px] font-bold text-ink/50">Joined {p.joined}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-ink/40" />
                        <span className="text-xs font-bold text-ink/75">{p.contactPerson}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5 text-ink/40" />
                        <span className="text-xs font-bold text-ink/65 truncate max-w-[180px]">{p.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-ink/40" />
                        <span className="text-xs font-bold text-ink/65">{p.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {p.approved ? (
                        <Badge className="rounded-full bg-mint/35 px-2 py-0.5 text-[10px] font-extrabold text-ink ring-0">
                          <Check className="mr-0.5 size-2.5" /> Approved
                        </Badge>
                      ) : (
                        <Badge className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-extrabold text-ink/60 ring-0">
                          <X className="mr-0.5 size-2.5" /> No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/70">
                        <Trophy className="size-3.5 text-coral" />
                        {p.assetsListed}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right text-xs font-extrabold text-ink whitespace-nowrap">
                      {formatNaira(p.totalRevenue)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0", statusPill[p.status])}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-mint-700 hover:bg-mint/20"
                              onClick={() => toast.success("Partner approved", { description: `${p.name} is now active.` })}
                            >
                              <ThumbsUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-coral hover:bg-coral/15"
                              onClick={() => toast.info("Partner rejected", { description: `${p.name} · rejection sent.` })}
                            >
                              <ThumbsDown className="size-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-[22px] bg-paper p-1.5">
                            <DropdownMenuLabel className="rounded-xl px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                              {p.name}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink">
                              <Eye className="mr-2 size-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink">
                              <UserCog className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            {p.status !== "PENDING" && p.status !== "APPROVED" && (
                              <DropdownMenuItem
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-mint-700 focus:bg-mint/20"
                                onClick={() => toast.success("Partner approved", { description: p.name })}
                              >
                                <ThumbsUp className="mr-2 size-4" /> Approve
                              </DropdownMenuItem>
                            )}
                            {p.status === "APPROVED" && (
                              <DropdownMenuItem
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-coral focus:bg-coral/15"
                                onClick={() => toast.info("Partner rejected", { description: p.name })}
                              >
                                <ThumbsDown className="mr-2 size-4" /> Reject
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
