import { useState } from "react";
import {
  Search,
  Download,
  MoreHorizontal,
  Banknote,
  Eye,
  Clock3,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  UserRound,
  Building2,
  UsersRound,
  Receipt,
  Check,
  Undo2,
  PlayCircle,
  FileText,
  Filter,
  CalendarDays,
  Trophy,
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { cn, formatNaira } from "@/lib/utils";

type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REVERSED";
type PayoutType = "WINNER" | "PARTNER" | "REFERRAL";

interface MockPayout {
  id: string;
  date: string;
  recipient: string;
  recipientType: "USER" | "PARTNER";
  initials: string;
  tint: "sky" | "mint" | "coral" | "lemon" | "lilac";
  type: PayoutType;
  amount: number;
  sourceBank: string;
  destination: string;
  status: PayoutStatus;
}

const TINTS: MockPayout["tint"][] = ["sky", "mint", "coral", "lemon", "lilac"];
const STATUSES: PayoutStatus[] = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "PAID",
  "FAILED",
  "PENDING",
  "REVERSED",
  "PAID",
];
const TYPES: PayoutType[] = [
  "WINNER",
  "WINNER",
  "PARTNER",
  "REFERRAL",
  "WINNER",
  "PARTNER",
  "REFERRAL",
  "WINNER",
];

const FIRST = [
  "Amaka",
  "Chidi",
  "Ifeoma",
  "Tunde",
  "Zainab",
  "Uche",
  "Kemi",
  "Bola",
  "Adebayo",
  "Ngozi",
  "Femi",
  "Obioma",
];
const LAST = [
  "Peace",
  "Kelechi",
  "Dike",
  "Okafor",
  "Abubakar",
  "Nwankwo",
  "Olusanya",
  "Tinubu",
  "Homes",
  "Chukwu",
  "Adesanya",
  "Ibe",
];
const BANKS = [
  "GTBank",
  "Zenith",
  "Access",
  "UBA",
  "First Bank",
  "Wema Bank",
  "Stanbic IBTC",
  "Fidelity",
];

const PAYOUTS: MockPayout[] = [];

const tintBg: Record<MockPayout["tint"], string> = {
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/35 text-ink",
  coral: "bg-coral/20 text-coral",
  lemon: "bg-lemon/40 text-ink",
  lilac: "bg-lilac/35 text-ink",
};

const statusPill: Record<PayoutStatus, string> = {
  PENDING: "bg-lemon/40 text-ink",
  PROCESSING: "bg-sky/25 text-ink",
  PAID: "bg-mint/35 text-ink",
  FAILED: "bg-coral/20 text-coral",
  REVERSED: "bg-ink/15 text-ink",
};

const typeIcon: Record<PayoutType, { icon: typeof Trophy; label: string; tone: string }> = {
  WINNER: { icon: Trophy as any, label: "Winner payout", tone: "bg-coral/20 text-coral" },
  PARTNER: { icon: Building2, label: "Partner settlement", tone: "bg-lilac/35 text-ink" },
  REFERRAL: { icon: UsersRound, label: "Referral cash-out", tone: "bg-sky/25 text-ink" },
};

export function AdminPayoutsPage() {
  const [tab, setTab] = useState<"winner" | "partner" | "referral">("winner");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [receiptFor, setReceiptFor] = useState<MockPayout | null>(null);

  const filtered = PAYOUTS.filter((p) => {
    const s = search.toLowerCase();
    if (s && !p.recipient.toLowerCase().includes(s) && !p.id.toLowerCase().includes(s))
      return false;
    if (statusFilter !== "all" && p.status.toLowerCase() !== statusFilter) return false;
    const typeMap: Record<string, PayoutType> = {
      winner: "WINNER",
      partner: "PARTNER",
      referral: "REFERRAL",
    };
    return p.type === typeMap[tab];
  });

  const allSelected = filtered.length > 0 && filtered.every((p) => selected[p.id]);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const stats = PAYOUTS.reduce(
    (acc, p) => {
      acc.all++;
      acc.total += p.amount;
      if (p.status === "PENDING") acc.pending++;
      if (p.status === "PROCESSING") acc.processing++;
      if (p.status === "PAID") {
        acc.paid++;
        acc.paidTotal += p.amount;
      }
      if (p.status === "FAILED") acc.failed++;
      if (p.status === "REVERSED") acc.reversed++;
      return acc;
    },
    { all: 0, pending: 0, processing: 0, paid: 0, failed: 0, reversed: 0, total: 0, paidTotal: 0 },
  );

  const pillBg: Record<string, string> = {
    all: "bg-ink/5 text-ink",
    pending: "bg-lemon/40 text-ink",
    processing: "bg-sky/25 text-ink",
    paid: "bg-mint/35 text-ink",
    failed: "bg-coral/20 text-coral",
    reversed: "bg-ink/15 text-ink",
  };

  return (
    <AdminShell activeNav="payouts" title="Payouts">
      <header className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
          Admin · Payouts
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Payouts
        </h1>
        <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
          Winner payouts, partner settlements, and referral cash-outs — all finance movements in one
          queue.
        </p>
      </header>

      <section className="mb-5 flex flex-wrap gap-2">
        {[
          {
            k: "all",
            label: "All payouts",
            sub: stats.all,
            tone: "all" as const,
            icon: Banknote,
            subIsCount: true,
          },
          {
            k: "pending",
            label: "Pending",
            sub: stats.pending,
            tone: "pending" as const,
            icon: Clock3,
            subIsCount: true,
          },
          {
            k: "processing",
            label: "Processing",
            sub: stats.processing,
            tone: "processing" as const,
            icon: PlayCircle,
            subIsCount: true,
          },
          {
            k: "paid",
            label: "Paid",
            sub: stats.paid,
            tone: "paid" as const,
            icon: CheckCircle2,
            subIsCount: true,
            alt: formatNaira(stats.paidTotal),
          },
          {
            k: "failed",
            label: "Failed",
            sub: stats.failed,
            tone: "failed" as const,
            icon: XCircle,
            subIsCount: true,
          },
          {
            k: "reversed",
            label: "Reversed",
            sub: stats.reversed,
            tone: "reversed" as const,
            icon: Undo2,
            subIsCount: true,
          },
        ].map((p) => (
          <Card
            key={p.k}
            className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none min-w-[160px]"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={cn("grid size-10 place-items-center rounded-xl", pillBg[p.tone])}>
                <p.icon className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  {p.label}
                </p>
                <p className="truncate font-display text-lg font-extrabold text-ink">
                  {p.subIsCount ? p.sub : formatNaira(p.sub as any)}
                </p>
                {p.alt && <p className="truncate text-[11px] font-bold text-ink/55">{p.alt}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <TabsList className="rounded-full bg-cream p-1">
                <TabsTrigger
                  value="winner"
                  className="rounded-full px-4 py-1.5 text-xs font-extrabold data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                >
                  <Trophy className="mr-1.5 size-3.5" /> Winner payouts
                </TabsTrigger>
                <TabsTrigger
                  value="partner"
                  className="rounded-full px-4 py-1.5 text-xs font-extrabold data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                >
                  <Building2 className="mr-1.5 size-3.5" /> Partner settlements
                </TabsTrigger>
                <TabsTrigger
                  value="referral"
                  className="rounded-full px-4 py-1.5 text-xs font-extrabold data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                >
                  <UsersRound className="mr-1.5 size-3.5" /> Referral cash-outs
                </TabsTrigger>
              </TabsList>
              {selectedCount > 0 && (
                <Button
                  variant="primary"
                  onClick={() => {
                    import("@/lib/activity-log").then(({ logActivity }) =>
                      logActivity({
                        eventType: "PAYOUT_INITIATE",
                        targetType: "payout_batch",
                        summary: `Queued ${selectedCount} payouts for processing`,
                        details: { count: selectedCount },
                      }),
                    );
                    toast.success(`${selectedCount} payouts queued for processing`, {
                      description: "Settlement batch created.",
                    });
                  }}
                >
                  <PlayCircle className="size-4" /> Process selected ({selectedCount})
                </Button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <Input
                  placeholder="Search recipient or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 rounded-full border-0 bg-cream pl-9 pr-4 text-xs font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-ink/65 ring-1 ring-ink/10">
                <CalendarDays className="size-3.5" />
                <Input
                  type="date"
                  defaultValue="2026-03-01"
                  className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0"
                />
                <span>→</span>
                <Input
                  type="date"
                  defaultValue="2026-03-12"
                  className="h-7 w-32 border-0 bg-transparent p-0 font-bold text-ink shadow-none focus-visible:ring-0"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-40 rounded-full bg-cream px-4 text-xs font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  <SelectItem value="all" className="rounded-xl font-bold">
                    All statuses
                  </SelectItem>
                  <SelectItem value="pending" className="rounded-xl font-bold">
                    Pending
                  </SelectItem>
                  <SelectItem value="processing" className="rounded-xl font-bold">
                    Processing
                  </SelectItem>
                  <SelectItem value="paid" className="rounded-xl font-bold">
                    Paid
                  </SelectItem>
                  <SelectItem value="failed" className="rounded-xl font-bold">
                    Failed
                  </SelectItem>
                  <SelectItem value="reversed" className="rounded-xl font-bold">
                    Reversed
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="size-3.5" /> Export CSV
              </Button>
            </div>

            <TabsContent value={tab} className="mt-0">
              <div className="overflow-x-auto -mx-2 px-2">
                <Table>
                  <TableHeader className="[&_tr]:border-ink/10">
                    <TableRow>
                      <TableHead className="py-3 w-10">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(v) => {
                            const next: Record<string, boolean> = {};
                            if (v) filtered.forEach((p) => (next[p.id] = true));
                            setSelected(next);
                          }}
                        />
                      </TableHead>
                      <TableHead className="py-3 font-extrabold text-ink/65">ID</TableHead>
                      <TableHead className="py-3 font-extrabold text-ink/65">Date</TableHead>
                      <TableHead className="py-3 font-extrabold text-ink/65">Recipient</TableHead>
                      <TableHead className="py-3 font-extrabold text-ink/65">Type</TableHead>
                      <TableHead className="py-3 text-right font-extrabold text-ink/65">
                        Amount
                      </TableHead>
                      <TableHead className="py-3 font-extrabold text-ink/65">Source</TableHead>
                      <TableHead className="py-3 font-extrabold text-ink/65">Destination</TableHead>
                      <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                      <TableHead className="py-3 text-right font-extrabold text-ink/65">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr]:border-ink/10">
                    {filtered.map((p) => (
                      <TableRow key={p.id} className="hover:bg-lilac/10">
                        <TableCell className="py-3">
                          <Checkbox
                            checked={!!selected[p.id]}
                            onCheckedChange={(v) => setSelected({ ...selected, [p.id]: !!v })}
                          />
                        </TableCell>
                        <TableCell className="py-3 text-[11px] font-extrabold text-ink/70 whitespace-nowrap">
                          {p.id}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-bold text-ink/65 whitespace-nowrap">
                          {p.date}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className={cn("size-9 ring-2 ring-paper", tintBg[p.tint])}>
                              <AvatarFallback
                                className={cn("text-xs font-extrabold", tintBg[p.tint])}
                              >
                                {p.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-ink max-w-[160px]">
                                {p.recipient}
                              </p>
                              <Badge
                                className={cn(
                                  "mt-0.5 rounded-full px-1.5 py-0 text-[9px] font-extrabold uppercase tracking-wider ring-0",
                                  p.recipientType === "USER"
                                    ? "bg-sky/25 text-ink"
                                    : "bg-lilac/35 text-ink",
                                )}
                              >
                                {p.recipientType}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-0",
                              typeIcon[p.type].tone,
                            )}
                          >
                            {typeIcon[p.type].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right text-xs font-extrabold text-ink whitespace-nowrap">
                          {formatNaira(p.amount)}
                        </TableCell>
                        <TableCell className="py-3 text-[11px] font-bold text-ink/65 whitespace-nowrap">
                          {p.sourceBank}
                        </TableCell>
                        <TableCell className="py-3 text-[11px] font-bold text-ink/65 whitespace-nowrap">
                          {p.destination}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                              statusPill[p.status],
                            )}
                          >
                            {p.status}
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
                              className="w-52 rounded-[22px] bg-paper p-1.5"
                            >
                              <DropdownMenuLabel className="rounded-xl px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                                {p.id}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink"
                                onClick={() => setReceiptFor(p)}
                              >
                                <Receipt className="mr-2 size-4" /> View receipt
                              </DropdownMenuItem>
                              {(p.status === "PENDING" || p.status === "FAILED") && (
                                <DropdownMenuItem
                                  className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink"
                                  onClick={() => {
                                    import("@/lib/activity-log").then(({ logActivity }) =>
                                      logActivity({
                                        eventType: "PAYOUT_INITIATE",
                                        targetType: "payout",
                                        targetId: p.id,
                                        summary: `Processing payout ${p.id} (${formatNaira(p.amount)})`,
                                        details: { amountKobo: p.amount },
                                      }),
                                    );
                                    toast.success("Processing payout", {
                                      description: `${p.id} · ${formatNaira(p.amount)}`,
                                    });
                                  }}
                                >
                                  <PlayCircle className="mr-2 size-4" /> Process
                                </DropdownMenuItem>
                              )}
                              {p.status === "PROCESSING" && (
                                <DropdownMenuItem
                                  className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-mint-700 focus:bg-mint/20"
                                  onClick={() => {
                                    import("@/lib/activity-log").then(({ logActivity }) =>
                                      logActivity({
                                        eventType: "PAYOUT_COMPLETE",
                                        targetType: "payout",
                                        targetId: p.id,
                                        summary: `Marked payout ${p.id} as paid (${formatNaira(p.amount)})`,
                                        details: { amountKobo: p.amount },
                                      }),
                                    );
                                    toast.success("Payout marked paid", { description: p.id });
                                  }}
                                >
                                  <CheckCircle2 className="mr-2 size-4" /> Mark paid
                                </DropdownMenuItem>
                              )}
                              {(p.status === "PAID" || p.status === "PROCESSING") && (
                                <DropdownMenuItem
                                  className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-coral focus:bg-coral/15"
                                  onClick={() => {
                                    import("@/lib/activity-log").then(({ logActivity }) =>
                                      logActivity({
                                        eventType: "PAYOUT_REVERSE",
                                        targetType: "payout",
                                        targetId: p.id,
                                        summary: `Requested reversal of payout ${p.id}`,
                                      }),
                                    );
                                    toast.info("Reversal requested", { description: p.id });
                                  }}
                                >
                                  <Undo2 className="mr-2 size-4" /> Reverse
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="py-10 text-center text-sm font-bold text-ink/50"
                        >
                          No payouts for this filter yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!receiptFor} onOpenChange={(v) => !v && setReceiptFor(null)}>
        <DialogContent className="rounded-[28px] bg-cream p-0 shadow-none sm:max-w-2xl">
          <DialogHeader className="flex-row items-start justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:!flex-row sm:!items-center sm:!justify-between sm:!text-left">
            <div>
              <DialogTitle className="flex items-center gap-3 font-display text-2xl font-extrabold text-ink">
                <span className="grid size-10 place-items-center rounded-2xl bg-mint/35">
                  <Receipt className="size-4.5 text-ink" />
                </span>
                {receiptFor && `Payout receipt · ${receiptFor.id}`}
              </DialogTitle>
              {receiptFor && (
                <p className="mt-1 text-[11px] font-bold text-ink/55">Issued {receiptFor.date}</p>
              )}
            </div>
            <Button variant="outline" size="sm">
              <FileText className="size-3.5" /> Download PDF
            </Button>
          </DialogHeader>
          {receiptFor && (
            <div className="space-y-4 px-6 py-5">
              <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5">
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                        Amount
                      </Label>
                      <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                        {formatNaira(receiptFor.amount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                        Status
                      </Label>
                      <div className="mt-1">
                        <Badge
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ring-0",
                            statusPill[receiptFor.status],
                          )}
                        >
                          {receiptFor.status}
                        </Badge>
                      </div>
                    </div>
                    <Separator className="col-span-2" />
                    <div>
                      <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                        Recipient
                      </Label>
                      <p className="mt-1 font-extrabold text-ink">{receiptFor.recipient}</p>
                      <p className="text-xs font-bold text-ink/55">{receiptFor.destination}</p>
                    </div>
                    <div>
                      <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                        Type
                      </Label>
                      <p className="mt-1 font-extrabold text-ink">
                        {typeIcon[receiptFor.type].label}
                      </p>
                      <p className="text-xs font-bold text-ink/55">
                        Source: {receiptFor.sourceBank}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
