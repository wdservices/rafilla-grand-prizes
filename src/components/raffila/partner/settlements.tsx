import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PartnerShell } from "./partner-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Landmark,
  Search,
  FileText,
  Download,
  Calendar,
  Filter,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Building,
  CreditCard,
  Receipt,
  Info,
  Edit2,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { partnerStore } from "@/lib/partner-store";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { PartnerProfile, SettlementRecord } from "@/types/partner";

const NIGERIAN_BANKS = [
  "Zenith Bank",
  "Guaranty Trust Bank (GTBank)",
  "Access Bank",
  "United Bank for Africa (UBA)",
  "First Bank of Nigeria",
  "Stanbic IBTC Bank",
  "Fidelity Bank",
  "Sterling Bank",
  "Wema Bank",
  "FCMB",
  "Providus Bank",
  "Kuda Bank",
];

export function PartnerSettlementsPage() {
  const { session } = useAuthSession();
  const activePartnerId = session?.user?.partnerId || "partner_abc_motors";

  const [partner, setPartner] = useState<PartnerProfile | null>(() =>
    partnerStore.getPartnerById(activePartnerId),
  );
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [tab, setTab] = useState<"all" | "pending" | "paid">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Bank Edit Dialog State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankName, setBankName] = useState(partner?.settlementAccount?.bankName || "Zenith Bank");
  const [accountNumber, setAccountNumber] = useState(
    partner?.settlementAccount?.accountNumber || "1012398472",
  );
  const [accountName, setAccountName] = useState(
    partner?.settlementAccount?.accountName || "ABC MOTORS LTD - REVENUE ESCROW",
  );

  useEffect(() => {
    const update = () => {
      const p = partnerStore.getPartnerById(activePartnerId);
      setPartner(p);
      setSettlements(partnerStore.getPartnerPayouts(activePartnerId));
      if (p?.settlementAccount) {
        setBankName(p.settlementAccount.bankName);
        setAccountNumber(p.settlementAccount.accountNumber);
        setAccountName(p.settlementAccount.accountName);
      }
    };
    update();
    const unsub = partnerStore.subscribe(update);
    return unsub;
  }, [activePartnerId]);

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || accountNumber.length < 10) {
      toast.error("Please enter a valid 10-digit Nigerian NUBAN account number");
      return;
    }
    if (!accountName.trim()) {
      toast.error("Account name is required");
      return;
    }

    partnerStore.updatePartnerProfile(activePartnerId, {
      settlementAccount: {
        bankName,
        accountNumber,
        accountName,
        payoutSchedule: partner?.settlementAccount?.payoutSchedule || "Weekly every Friday",
      },
    });

    toast.success("Settlement Bank Details Updated!", {
      description: `Future disbursements will route to ${bankName} (${accountNumber}).`,
    });
    setIsBankModalOpen(false);
  };

  const partnerComps = partnerStore.getPartnerCompetitions(activePartnerId);
  const partnerShareEarnedKobo = partnerComps.reduce((sum, c) => sum + c.partnerAmountKobo, 0);

  const settledKobo = settlements
    .filter((s) => s.status === "PAID")
    .reduce((sum, s) => sum + s.netPayoutKobo, 0);

  const pendingPayoutKobo = settlements
    .filter((s) => s.status === "PENDING" || s.status === "PROCESSING")
    .reduce((sum, s) => sum + s.netPayoutKobo, 0);

  const filtered = settlements.filter((s) => {
    if (tab === "pending" && s.status !== "PENDING" && s.status !== "PROCESSING") return false;
    if (tab === "paid" && s.status !== "PAID") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.reference.toLowerCase().includes(q) ||
        s.competitionTitle.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PartnerShell activeNav="settlements" title="Settlements & Payouts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
              <Landmark className="size-8 text-coral" /> Settlements & Payouts
            </h1>
            <p className="font-body text-ink/65 text-sm mt-1">
              Automated disbursement ledger for {partner?.businessName || "your partner account"}.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Exporting full tax ledger...")}
              className="rounded-full border-ink/20 font-bold text-xs h-10 px-4"
            >
              <FileText className="size-4 mr-2" /> Download Tax Statement
            </Button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Partner Share Earned */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 rounded-xl bg-mint/30 text-mint-700 flex items-center justify-center">
                  <Percent className="size-5" />
                </div>
                <Badge className="bg-mint/20 text-mint-800 text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  LIFETIME
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                Partner Share Earned
              </p>
              <p className="font-display text-2xl font-extrabold text-ink mt-1 truncate">
                {formatNaira(partnerShareEarnedKobo)}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">
                All contractual partner earnings
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Settled Amount */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 rounded-xl bg-mint/40 text-mint-800 flex items-center justify-center">
                  <CheckCircle2 className="size-5" />
                </div>
                <Badge className="bg-mint/30 text-ink text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  DISBURSED
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                Settled Amount
              </p>
              <p className="font-display text-2xl font-extrabold text-mint-700 mt-1 truncate">
                {formatNaira(settledKobo)}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">Processed to your bank account</p>
            </CardContent>
          </Card>

          {/* Card 3: Pending Payout */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden ring-1 ring-lemon/40">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 rounded-xl bg-lemon/40 text-amber-800 flex items-center justify-center">
                  <Clock className="size-5" />
                </div>
                <Badge className="bg-lemon/40 text-ink text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  QUEUE
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                Pending Payout
              </p>
              <p className="font-display text-2xl font-extrabold text-coral mt-1 truncate">
                {formatNaira(pendingPayoutKobo)}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">Scheduled for current cycle</p>
            </CardContent>
          </Card>

          {/* Card 4: Payout Schedule */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 rounded-xl bg-sky/20 text-sky-700 flex items-center justify-center">
                  <Calendar className="size-5" />
                </div>
                <Badge className="bg-sky/20 text-sky-800 text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  CYCLE
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                Payout Schedule
              </p>
              <p className="font-display text-base font-extrabold text-ink mt-1 truncate">
                {partner?.settlementAccount?.payoutSchedule || "Weekly every Friday"}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">Disbursed via automated NIP</p>
            </CardContent>
          </Card>
        </div>

        {/* Bank Account Details Card with Edit Trigger */}
        <Card className="border-ink/10 rounded-[28px] bg-white shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center shrink-0">
                <Building className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-extrabold text-ink">
                    Settlement Bank Account
                  </h3>
                  <Badge className="bg-mint/30 text-ink text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                    <ShieldCheck className="size-3 mr-1 text-mint-700 inline" /> Verified Escrow
                  </Badge>
                </div>
                <p className="text-xs text-ink/60 mt-0.5">
                  All weekly competition ticket proceeds and revenue shares are routed to this
                  account.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-ink/5 text-xs">
                  <div>
                    <span className="text-ink/50 block">Bank Name</span>
                    <span className="font-extrabold text-ink">
                      {partner?.settlementAccount?.bankName || "Zenith Bank"}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink/50 block">Account Number (NUBAN)</span>
                    <span className="font-mono font-extrabold text-ink tracking-wider">
                      {partner?.settlementAccount?.accountNumber || "1012398472"}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink/50 block">Account Beneficiary Name</span>
                    <span className="font-extrabold text-ink truncate block">
                      {partner?.settlementAccount?.accountName || partner?.businessName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsBankModalOpen(true)}
              variant="outline"
              className="rounded-full text-xs font-bold border-ink/20 shrink-0 h-10 px-5"
            >
              <Edit2 className="size-3.5 mr-1.5" /> Edit Banking Details
            </Button>
          </div>
        </Card>

        {/* Settlement History Table */}
        <Card className="border-ink/10 rounded-[28px] bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-6 border-b border-ink/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-display text-xl font-extrabold text-ink">
                  Settlement History & Invoices
                </CardTitle>
                <CardDescription className="text-xs text-ink/60 mt-1">
                  Itemized ledger of all past and queued settlements with verified bank references.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
                  <TabsList className="rounded-full h-9">
                    <TabsTrigger value="all" className="rounded-full text-xs font-bold px-3">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-full text-xs font-bold px-3">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="paid" className="rounded-full text-xs font-bold px-3">
                      Paid
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative min-w-[200px]">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reference, campaign..."
                    className="pl-8 h-9 rounded-full bg-paper/60 border-ink/10 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Receipt className="size-12 text-ink/20 mx-auto mb-2" />
                <p className="font-display text-lg font-bold text-ink">No Settlements Found</p>
                <p className="text-xs text-ink/60 max-w-sm mx-auto mt-1">
                  Settlement records are generated automatically as ticket sales accrue and
                  competitions reach closing draws.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-paper border-b border-ink/10 text-ink/50 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Settlement Ref</th>
                      <th className="py-3.5 px-4">Period / Competition</th>
                      <th className="py-3.5 px-4">Total Gross</th>
                      <th className="py-3.5 px-4">Partner %</th>
                      <th className="py-3.5 px-4 font-bold text-mint-800">Partner Amount</th>
                      <th className="py-3.5 px-4">Deductions / Fees</th>
                      <th className="py-3.5 px-4 font-extrabold text-ink">Net Payout</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Date / Scheduled</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-paper/40 transition">
                        {/* Reference */}
                        <td className="py-4 px-5 font-mono font-bold text-ink">{s.reference}</td>

                        {/* Period / Competition */}
                        <td className="py-4 px-4">
                          <p className="font-bold text-ink">{s.competitionTitle}</p>
                          <p className="text-[10px] text-ink/40 font-medium">{s.period}</p>
                        </td>

                        {/* Total Gross */}
                        <td className="py-4 px-4 font-bold text-ink">
                          {formatNaira(s.totalGrossKobo)}
                        </td>

                        {/* Partner % */}
                        <td className="py-4 px-4 font-medium text-ink/70">
                          {s.partnerSharePercentage}%
                        </td>

                        {/* Partner Amount */}
                        <td className="py-4 px-4 font-bold text-mint-700 bg-mint/5">
                          {formatNaira(s.partnerAmountKobo)}
                        </td>

                        {/* Deductions / Fees */}
                        <td className="py-4 px-4 text-coral font-medium">
                          -{formatNaira(s.deductionsKobo)}
                        </td>

                        {/* Net Payout */}
                        <td className="py-4 px-4 font-extrabold text-ink text-sm">
                          {formatNaira(s.netPayoutKobo)}
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-4 text-ink/75 font-medium">{s.paymentMethod}</td>

                        {/* Date Paid / Scheduled */}
                        <td className="py-4 px-4 text-ink/75 font-medium">{s.datePaid}</td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <Badge
                            className={`rounded-full border-0 text-[10px] font-bold px-2.5 py-0.5 ${
                              s.status === "PAID"
                                ? "bg-mint/40 text-ink"
                                : s.status === "PROCESSING"
                                  ? "bg-sky/20 text-sky-800"
                                  : "bg-lemon/40 text-ink"
                            }`}
                          >
                            {s.status}
                          </Badge>
                        </td>

                        {/* Action: Invoice */}
                        <td className="py-4 px-5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toast.success(`Statement & Invoice for ${s.reference} downloaded.`)
                            }
                            className="rounded-full text-[11px] font-bold h-7 px-3 text-coral hover:bg-coral/10"
                          >
                            <Download className="size-3 mr-1" /> PDF Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Bank Details Modal */}
        <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
          <DialogContent className="max-w-md rounded-[32px] p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-extrabold text-ink">
                Update Settlement Bank Details
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Ensure this is an official corporate account registered to {partner?.businessName}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveBankDetails} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                  Bank Name *
                </label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger className="h-11 rounded-xl border-ink/15 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {NIGERIAN_BANKS.map((b) => (
                      <SelectItem key={b} value={b} className="font-bold text-xs">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                  Account Number (10 Digits NUBAN) *
                </label>
                <Input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="0123456789"
                  required
                  className="h-11 rounded-xl border-ink/15 font-mono font-bold text-sm tracking-wider"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                  Account Beneficiary Name *
                </label>
                <Input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  placeholder="EXACT ACCOUNT HOLDER NAME"
                  required
                  className="h-11 rounded-xl border-ink/15 font-bold text-xs uppercase"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBankModalOpen(false)}
                  className="rounded-full text-xs font-bold border-ink/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs px-6 shadow-sm"
                >
                  Save Banking Details
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PartnerShell>
  );
}
