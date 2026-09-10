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
  UserPlus,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { AdminShell } from "@/components/raffila/admin/admin-shell";
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
const STATUSES: PartnerStatus[] = [
  "APPROVED",
  "APPROVED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "APPROVED",
  "PENDING",
  "APPROVED",
];

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
  sky: "bg-sky/25 text-ink",
  mint: "bg-mint/30 text-ink",
  coral: "bg-coral/15 text-coral",
  lemon: "bg-lemon/35 text-ink",
  lilac: "bg-lilac/30 text-ink",
};

const statusPill: Record<PartnerStatus, string> = {
  APPROVED: "bg-mint/30 text-ink",
  PENDING: "bg-lemon/35 text-ink",
  REJECTED: "bg-coral/15 text-coral",
  SUSPENDED: "bg-ink/12 text-ink",
};

let partnerList: MockPartner[] = COMPANIES.map((c, i) => ({
  id: `RF-P-${String(i + 1).padStart(5, "0")}`,
  name: c.name,
  logoTint: TINTS[i % TINTS.length]!,
  logoInitials: c.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]!)
    .join(""),
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

const CATEGORIES = [
  "All categories",
  "Auto",
  "Tech",
  "Property",
  "Jewelry",
  "Home",
  "Experience",
] as const;
const MANAGERS = ["Aisha Olamide", "Tunmise Adebayo", "Musa Bello", "Amaka Chukwu"] as const;

export function AdminPartnersPage() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [search, setSearch] = useState("");
  const [partners, setPartners] = useState<MockPartner[]>(partnerList);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
    category: "Auto",
    manager: "Aisha Olamide",
  });

  const filtered = partners.filter((p) => {
    const s = search.toLowerCase();
    if (
      s &&
      !p.name.toLowerCase().includes(s) &&
      !p.contactPerson.toLowerCase().includes(s) &&
      !p.email.toLowerCase().includes(s)
    )
      return false;
    switch (filter) {
      case "Approved":
        return p.status === "APPROVED";
      case "Pending":
        return p.status === "PENDING";
      case "Rejected":
        return p.status === "REJECTED";
      case "Suspended":
        return p.status === "SUSPENDED";
      default:
        return true;
    }
  });

  const kpis = [
    { label: "Total partners", val: partners.length, tone: "ink" as const, icon: Building2 },
    {
      label: "Approved",
      val: partners.filter((p) => p.status === "APPROVED").length,
      tone: "mint" as const,
      icon: Check,
    },
    {
      label: "Pending review",
      val: partners.filter((p) => p.status === "PENDING").length,
      tone: "lemon" as const,
      icon: X,
    },
    {
      label: "Revenue driven",
      val: formatNaira(partners.reduce((a, b) => a + b.totalRevenue, 0)),
      tone: "coral" as const,
      icon: TrendingUp,
    },
  ];

  const submitInvite = () => {
    if (!inviteForm.company || !inviteForm.contact || !inviteForm.email) {
      toast.error("Please fill required fields", {
        description: "Company name, contact person, and email are required.",
      });
      return;
    }
    const nextIdx = partners.length;
    const tintIdx = nextIdx % TINTS.length;
    const newPartner: MockPartner = {
      id: `RF-P-${String(nextIdx + 1).padStart(5, "0")}`,
      name: inviteForm.company,
      logoTint: TINTS[tintIdx]!,
      logoInitials:
        inviteForm.company
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0]!)
          .filter(Boolean)
          .join("")
          .toUpperCase() || "XX",
      contactPerson: inviteForm.contact,
      email: inviteForm.email,
      phone: inviteForm.phone || "—",
      approved: false,
      assetsListed: 0,
      totalRevenue: 0,
      status: "PENDING",
      joined: new Date().toISOString().slice(0, 10),
    };
    const next = [...partners, newPartner];
    setPartners(next);
    partnerList = next;
    toast.success("Invitation sent", {
      description: `Partner invite for ${inviteForm.company} emailed to ${inviteForm.email} · assigned to ${inviteForm.manager}.`,
    });
    setInviteOpen(false);
    setInviteForm({
      company: "",
      contact: "",
      email: "",
      phone: "",
      category: "Auto",
      manager: "Aisha Olamide",
    });
  };

  return (
    <AdminShell activeNav="partners" title="Partners">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Admin · Partners
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Partners
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Onboard, approve, and monitor prize asset partners and their revenue contribution.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setInviteOpen(true)}
          className="rounded-full h-11 px-5"
        >
          <UserPlus className="size-4 mr-1.5" /> Invite partner
        </Button>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((s, i) => {
          const bg: Record<string, string> = {
            ink: "bg-ink/8",
            mint: "bg-mint/25",
            lemon: "bg-lemon/35",
            coral: "bg-coral/15",
          };
          const ic: Record<string, string> = {
            ink: "text-ink",
            mint: "text-ink",
            lemon: "text-ink",
            coral: "text-coral",
          };
          return (
            <Card
              key={i}
              className="rounded-[24px] border-0 bg-white p-0 ring-1 ring-ink/8 shadow-sm"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={cn("grid size-12 place-items-center rounded-2xl shrink-0", bg[s.tone])}
                >
                  <s.icon className={cn("size-5", ic[s.tone])} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45 whitespace-nowrap">
                    {s.label}
                  </p>
                  <p className="font-display text-xl font-extrabold text-ink mt-0.5 whitespace-nowrap">
                    {s.val}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-[24px] border-0 bg-white p-0 ring-1 ring-ink/8 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-lg">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              <Input
                placeholder="Search partner name, contact, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-full border-0 bg-white ring-1 ring-ink/10 pl-11 pr-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral focus-visible:ring-2"
              />
            </div>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as FilterKey)}
              className="w-auto"
            >
              <TabsList className="rounded-full bg-cream p-1.5">
                {FILTERS.map((f) => (
                  <TabsTrigger
                    key={f}
                    value={f}
                    className="rounded-full px-4.5 py-1.5 text-xs font-extrabold data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                  >
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Select defaultValue="all">
              <SelectTrigger className="h-12 w-48 rounded-full bg-white ring-1 ring-ink/10 px-5 text-sm font-extrabold text-ink shadow-none focus:ring-coral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[22px] bg-white p-1.5 ring-1 ring-ink/10">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={
                      cat === "All categories" ? "all" : cat.toLowerCase().replace(/[^a-z]/g, "")
                    }
                    className="rounded-xl font-bold"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <Table>
              <TableHeader className="[&_tr]:border-ink/10">
                <TableRow>
                  <TableHead className="py-3.5 font-extrabold text-ink/65">Partner</TableHead>
                  <TableHead className="py-3.5 font-extrabold text-ink/65">
                    Contact person
                  </TableHead>
                  <TableHead className="py-3.5 font-extrabold text-ink/65">Email</TableHead>
                  <TableHead className="py-3.5 font-extrabold text-ink/65">Phone</TableHead>
                  <TableHead className="py-3.5 font-extrabold text-ink/65">Approved</TableHead>
                  <TableHead className="py-3.5 text-right font-extrabold text-ink/65">
                    Assets listed
                  </TableHead>
                  <TableHead className="py-3.5 text-right font-extrabold text-ink/65">
                    Revenue driven
                  </TableHead>
                  <TableHead className="py-3.5 font-extrabold text-ink/65">Status</TableHead>
                  <TableHead className="py-3.5 text-right font-extrabold text-ink/65">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-ink/10">
                {filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-lilac/10">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3.5">
                        <Avatar className={cn("size-11 ring-2 ring-white", tintBg[p.logoTint])}>
                          <AvatarFallback
                            className={cn("text-[11px] font-extrabold", tintBg[p.logoTint])}
                          >
                            {p.logoInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 max-w-[200px]">
                          <p className="truncate text-sm font-extrabold text-ink">{p.name}</p>
                          <p className="truncate text-[11px] font-bold text-ink/50">
                            Joined {p.joined}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-ink/40" />
                        <span className="text-xs font-bold text-ink/75">{p.contactPerson}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5 text-ink/40" />
                        <span className="text-xs font-bold text-ink/65 truncate max-w-[200px]">
                          {p.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-ink/40" />
                        <span className="text-xs font-bold text-ink/65">{p.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      {p.approved ? (
                        <Badge className="rounded-full bg-mint/30 px-2.5 py-0.5 text-[10px] font-extrabold text-ink ring-0">
                          <Check className="mr-0.5 size-2.5" /> Approved
                        </Badge>
                      ) : (
                        <Badge className="rounded-full bg-ink/10 px-2.5 py-0.5 text-[10px] font-extrabold text-ink/60 ring-0">
                          <X className="mr-0.5 size-2.5" /> No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/70">
                        <Trophy className="size-3.5 text-coral" />
                        {p.assetsListed}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-right text-xs font-extrabold text-ink whitespace-nowrap">
                      {formatNaira(p.totalRevenue)}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                          statusPill[p.status],
                        )}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 text-mint-700 hover:bg-mint/20 rounded-full"
                              onClick={() => {
                                const next = partners.map((x) =>
                                  x.id === p.id
                                    ? { ...x, status: "APPROVED" as PartnerStatus, approved: true }
                                    : x,
                                );
                                setPartners(next);
                                partnerList = next;
                                toast.success("Partner approved", {
                                  description: `${p.name} is now active.`,
                                });
                              }}
                            >
                              <ThumbsUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 text-coral hover:bg-coral/15 rounded-full"
                              onClick={() => {
                                const next = partners.map((x) =>
                                  x.id === p.id
                                    ? { ...x, status: "REJECTED" as PartnerStatus, approved: false }
                                    : x,
                                );
                                setPartners(next);
                                partnerList = next;
                                toast.info("Partner rejected", {
                                  description: `${p.name} · rejection sent.`,
                                });
                              }}
                            >
                              <ThumbsDown className="size-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9 rounded-full">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-[22px] bg-white p-1.5 ring-1 ring-ink/10"
                          >
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
                                onClick={() => {
                                  const next = partners.map((x) =>
                                    x.id === p.id
                                      ? {
                                          ...x,
                                          status: "APPROVED" as PartnerStatus,
                                          approved: true,
                                        }
                                      : x,
                                  );
                                  setPartners(next);
                                  partnerList = next;
                                  toast.success("Partner approved", { description: p.name });
                                }}
                              >
                                <ThumbsUp className="mr-2 size-4" /> Approve
                              </DropdownMenuItem>
                            )}
                            {p.status === "APPROVED" && (
                              <DropdownMenuItem
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-coral focus:bg-coral/15"
                                onClick={() => {
                                  const next = partners.map((x) =>
                                    x.id === p.id
                                      ? {
                                          ...x,
                                          status: "SUSPENDED" as PartnerStatus,
                                          approved: false,
                                        }
                                      : x,
                                  );
                                  setPartners(next);
                                  partnerList = next;
                                  toast.info("Partner suspended", { description: p.name });
                                }}
                              >
                                <ThumbsDown className="mr-2 size-4" /> Suspend
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-14 text-ink/50 font-bold">
                      No partners match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="rounded-[28px] bg-white border-0 ring-1 ring-ink/10 shadow-xl max-w-[520px] sm:max-w-[560px] p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-mint/25 via-sky/15 to-lemon/30 px-7 pt-7 pb-5">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-white ring-1 ring-ink/10 shadow-sm">
                  <Send className="size-5 text-coral" />
                </div>
                <div>
                  <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                    Invite a partner
                  </DialogTitle>
                  <DialogDescription className="text-sm font-bold text-ink/55 mt-1">
                    Send an onboarding invite to a prize asset partner. They'll receive a setup
                    email.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="space-y-4 px-7 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                  Company name *
                </Label>
                <Input
                  placeholder="e.g. Lux Wheels Ltd"
                  value={inviteForm.company}
                  onChange={(e) => setInviteForm((f) => ({ ...f, company: e.target.value }))}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 px-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral focus-visible:ring-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                  Contact person *
                </Label>
                <Input
                  placeholder="Full name"
                  value={inviteForm.contact}
                  onChange={(e) => setInviteForm((f) => ({ ...f, contact: e.target.value }))}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 px-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral focus-visible:ring-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                  Email *
                </Label>
                <Input
                  type="email"
                  placeholder="partners@company.ng"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 px-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral focus-visible:ring-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                  Phone
                </Label>
                <Input
                  placeholder="+234 800 000 0000"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 px-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral focus-visible:ring-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                  Partner category
                </Label>
                <Select
                  value={inviteForm.category}
                  onValueChange={(v) => setInviteForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-white ring-1 ring-ink/10 px-4 text-sm font-extrabold text-ink shadow-none focus:ring-coral">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[22px] bg-white p-1.5 ring-1 ring-ink/10">
                    {["Auto", "Tech", "Property", "Jewelry", "Home", "Experience"].map((c) => (
                      <SelectItem key={c} value={c} className="rounded-xl font-bold">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                  Assigned manager
                </Label>
                <Select
                  value={inviteForm.manager}
                  onValueChange={(v) => setInviteForm((f) => ({ ...f, manager: v }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-white ring-1 ring-ink/10 px-4 text-sm font-extrabold text-ink shadow-none focus:ring-coral">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[22px] bg-white p-1.5 ring-1 ring-ink/10">
                    {MANAGERS.map((m) => (
                      <SelectItem key={m} value={m} className="rounded-xl font-bold">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="px-7 pb-7 pt-0 flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setInviteOpen(false)}
              className="rounded-full h-11 px-6"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={submitInvite} className="rounded-full h-11 px-6">
              <Send className="size-4 mr-1.5" /> Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
