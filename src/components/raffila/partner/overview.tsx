import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PartnerShell } from "./partner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ListOrdered,
  Ticket,
  Wallet,
  Clock,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  PieChart,
  Percent,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { partnerStore } from "@/lib/partner-store";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { PartnerProfile, PartnerCompetition } from "@/types/partner";

export function PartnerOverviewPage() {
  const { session } = useAuthSession();
  const [partners, setPartners] = useState<PartnerProfile[]>(partnerStore.getPartners());
  const [partnerCompetitions, setPartnerCompetitions] = useState<PartnerCompetition[]>([]);

  const activePartnerId = session?.user?.partnerId || "partner_abc_motors";

  useEffect(() => {
    const updateData = () => {
      setPartners(partnerStore.getPartners());
      setPartnerCompetitions(partnerStore.getPartnerCompetitions(activePartnerId));
    };

    updateData();
    const unsub = partnerStore.subscribe(updateData);
    return unsub;
  }, [activePartnerId]);

  const activePartner: PartnerProfile = partnerStore.getPartnerById(activePartnerId) ||
    partners[0] || {
      id: "partner_abc_motors",
      businessName: session?.user?.businessName || "ABC Motors Ltd",
      businessType: "Automotive",
      cacNumber: "RC-1849204",
      address: "Victoria Island",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      companyEmail: session?.user?.email || "partner.demo@abcmotors.example",
      companyPhone: "+234 803 111 2233",
      description: "Verified Partner",
      authorizedRepresentative: {
        fullName: `${session?.user?.firstName || "Michael"} ${session?.user?.lastName || "Ade"}`,
        position: "Managing Director",
        email: session?.user?.email || "partner.demo@abcmotors.example",
        phone: "+234 803 111 2233",
      },
      documents: {},
      verificationStatus: "APPROVED",
      createdAt: "",
      updatedAt: "",
    };

  const activeCompetitions = partnerCompetitions.filter((c) => c.status === "ACTIVE");
  const completedCompetitions = partnerCompetitions.filter((c) => c.status === "COMPLETED");
  const totalTicketsSold = partnerCompetitions.reduce((sum, c) => sum + c.ticketsSold, 0);
  const totalGrossKobo = partnerCompetitions.reduce((sum, c) => sum + c.grossRevenueKobo, 0);
  const partnerShareKobo = partnerCompetitions.reduce((sum, c) => sum + c.partnerAmountKobo, 0);
  const raffilaShareKobo = partnerCompetitions.reduce((sum, c) => sum + c.raffilaAmountKobo, 0);

  const partnerPayouts = partnerStore.getPartnerPayouts(activePartner.id);
  const pendingPayoutsKobo = partnerPayouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amountKobo, 0);

  return (
    <PartnerShell activeNav="overview" title="Partner Overview">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-ink/50">
                Partner Portal · ID: {activePartner.id}
              </span>
              <Badge
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 ${
                  activePartner.verificationStatus === "APPROVED"
                    ? "bg-mint/40 text-ink"
                    : "bg-lemon/40 text-ink"
                }`}
              >
                {activePartner.verificationStatus === "APPROVED" ? (
                  <>
                    <ShieldCheck className="size-3 mr-1 inline text-mint-700" />
                    Verified Partner
                  </>
                ) : (
                  <>
                    <Clock className="size-3 mr-1 inline" />
                    Pending Verification
                  </>
                )}
              </Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              Welcome, {activePartner.businessName}
            </h1>
            <p className="font-body text-ink/65 text-sm mt-1">
              Real-time campaign performance, ticket sales analytics, and automated revenue share
              settlements.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-ink/20 font-bold text-xs h-10 px-4"
            >
              <Link to="/partner/settlements">
                <Banknote className="size-4 mr-2 text-mint-700" /> View Settlements
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs h-10 px-5 shadow-sm"
            >
              <Link to="/partner/submit">
                <Upload className="size-4 mr-2" /> Submit New Asset
              </Link>
            </Button>
          </div>
        </div>

        {/* Verification / Onboarding Status Notice */}
        {activePartner.verificationStatus === "PENDING" && (
          <div className="rounded-2xl border border-lemon/40 bg-lemon/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-lemon/50 flex items-center justify-center text-amber-900 shrink-0 mt-0.5">
                <Clock className="size-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-extrabold text-ink">
                  Partner Application Under Compliance Review
                </h4>
                <p className="text-xs text-ink/75 mt-0.5 leading-relaxed">
                  Welcome to Raffila,{" "}
                  <strong className="font-extrabold">{activePartner.businessName}</strong>! Your CAC
                  corporate verification documents and initial asset proposal have been logged. Your
                  partner portal is live, and you can track campaign performance, submit new assets,
                  and view settlements anytime.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full border-ink/20 text-xs font-bold bg-white"
              >
                <Link to="/partner/submit">
                  <Upload className="size-3.5 mr-1 text-coral" /> My Assets
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* 7 Core Dashboard Cards as requested */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Card 1: ACTIVE COMPETITIONS */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="size-11 rounded-2xl bg-sky/20 text-sky-700 flex items-center justify-center">
                  <ListOrdered className="size-5" />
                </div>
                <Badge className="bg-sky/15 text-sky-800 text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  LIVE NOW
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                ACTIVE COMPETITIONS
              </p>
              <p className="font-display text-3xl font-extrabold text-ink mt-1">
                {activeCompetitions.length}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">
                Currently open for ticket sales
              </p>
            </CardContent>
          </Card>

          {/* Card 2: COMPLETED COMPETITIONS */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="size-11 rounded-2xl bg-mint/30 text-mint-700 flex items-center justify-center">
                  <CheckCircle2 className="size-5" />
                </div>
                <Badge className="bg-mint/20 text-mint-800 text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  SETTLED
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                COMPLETED COMPETITIONS
              </p>
              <p className="font-display text-3xl font-extrabold text-ink mt-1">
                {completedCompetitions.length}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">Successfully drawn & awarded</p>
            </CardContent>
          </Card>

          {/* Card 3: TOTAL TICKETS SOLD */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="size-11 rounded-2xl bg-coral/15 text-coral flex items-center justify-center">
                  <Ticket className="size-5" />
                </div>
                <Badge className="bg-coral/10 text-coral text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  ALL-TIME
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                TOTAL TICKETS SOLD
              </p>
              <p className="font-display text-3xl font-extrabold text-ink mt-1">
                {totalTicketsSold.toLocaleString()}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">Across all partner campaigns</p>
            </CardContent>
          </Card>

          {/* Card 4: TOTAL GROSS ENTRY REVENUE */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="size-11 rounded-2xl bg-lemon/35 text-ink flex items-center justify-center">
                  <Banknote className="size-5 text-amber-700" />
                </div>
                <Badge className="bg-lemon/40 text-ink text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  GROSS
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                TOTAL GROSS ENTRY REVENUE
              </p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink mt-1 truncate">
                {formatNaira(totalGrossKobo)}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">
                100% of validated ticket receipts
              </p>
            </CardContent>
          </Card>

          {/* Card 5: PARTNER SHARE */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden ring-1 ring-mint/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="size-11 rounded-2xl bg-mint/35 text-ink flex items-center justify-center">
                  <Percent className="size-5 text-mint-700" />
                </div>
                <Badge className="bg-mint/30 text-ink text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  YOUR EARNINGS
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                PARTNER SHARE
              </p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-mint-700 mt-1 truncate">
                {formatNaira(partnerShareKobo)}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">
                {totalGrossKobo > 0
                  ? `${((partnerShareKobo / totalGrossKobo) * 100).toFixed(1)}% weighted average`
                  : "Based on agreed split"}
              </p>
            </CardContent>
          </Card>

          {/* Card 6: RAFFILA SHARE */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="size-11 rounded-2xl bg-lilac/30 text-ink flex items-center justify-center">
                  <PieChart className="size-5 text-indigo-700" />
                </div>
                <Badge className="bg-lilac/30 text-ink text-[10px] font-bold border-0 rounded-full px-2 py-0.5">
                  PLATFORM FEE
                </Badge>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                RAFFILA SHARE
              </p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink mt-1 truncate">
                {formatNaira(raffilaShareKobo)}
              </p>
              <p className="text-xs text-ink/60 mt-1 font-medium">
                Platform marketing & operations
              </p>
            </CardContent>
          </Card>

          {/* Card 7: PENDING PAYOUTS */}
          <Card className="border-ink/10 rounded-2xl bg-white shadow-sm overflow-hidden col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-2">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-8 rounded-xl bg-lemon/40 text-amber-800 flex items-center justify-center">
                    <Clock className="size-4" />
                  </div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                    PENDING PAYOUTS
                  </p>
                </div>
                <p className="font-display text-3xl font-extrabold text-ink mt-1">
                  {formatNaira(pendingPayoutsKobo)}
                </p>
                <p className="text-xs text-ink/60 mt-0.5">
                  Scheduled for automated bank disbursement this Friday
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full text-xs font-bold border-ink/20 shrink-0"
              >
                <Link to="/partner/settlements">
                  View Ledger & Invoices <ArrowUpRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Competitions Table Preview */}
        <Card className="border-ink/10 rounded-[28px] bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-6 border-b border-ink/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-xl font-extrabold text-ink flex items-center gap-2">
                  <ListOrdered className="size-5 text-coral" /> My Partner Competitions
                </CardTitle>
                <CardDescription className="text-xs text-ink/60 mt-1">
                  Every live and concluded competition powered by {activePartner.businessName}{" "}
                  assets.
                </CardDescription>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-xs font-bold text-coral"
              >
                <Link to="/partner/listings">
                  View All Competitions <ArrowUpRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {partnerCompetitions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="size-16 rounded-full bg-paper mx-auto flex items-center justify-center text-ink/30 mb-3">
                  <ListOrdered className="size-8" />
                </div>
                <p className="font-display text-lg font-bold text-ink">
                  No Competitions Created Yet
                </p>
                <p className="text-xs text-ink/60 max-w-sm mx-auto mt-1">
                  Submit your first luxury prize asset for admin compliance review to launch your
                  first campaign.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-coral text-white mt-4 font-bold"
                >
                  <Link to="/partner/submit">Submit Asset Proposal</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper border-b border-ink/5 text-ink/50 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Competition & Prize</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Ticket Price</th>
                      <th className="py-3.5 px-4">Tickets Sold</th>
                      <th className="py-3.5 px-4">Gross Revenue</th>
                      <th className="py-3.5 px-4 text-right">Partner Share</th>
                      <th className="py-3.5 px-4 text-right">Closing Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {partnerCompetitions.map((comp) => (
                      <tr key={comp.id} className="hover:bg-paper/40 transition">
                        <td className="py-4 px-5">
                          <p className="font-bold text-ink text-sm">{comp.title}</p>
                          <p className="text-[11px] text-ink/55 mt-0.5">{comp.prizeName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={`text-[10px] font-bold rounded-full border-0 px-2.5 py-0.5 ${
                              comp.status === "ACTIVE"
                                ? "bg-mint/35 text-ink"
                                : comp.status === "COMPLETED"
                                  ? "bg-sky/20 text-sky-800"
                                  : "bg-paper text-ink/60"
                            }`}
                          >
                            {comp.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 font-bold text-ink">
                          {formatNaira(comp.entryPriceKobo)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-ink">
                            {comp.ticketsSold.toLocaleString()}
                          </span>{" "}
                          <span className="text-ink/40 text-[10px]">
                            / {comp.totalEntries.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-ink">
                          {formatNaira(comp.grossRevenueKobo)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-extrabold text-mint-700 text-sm">
                            {formatNaira(comp.partnerAmountKobo)}
                          </p>
                          <p className="text-[10px] text-ink/40">{comp.partnerPercentage}% split</p>
                        </td>
                        <td className="py-4 px-4 text-right text-ink/65 font-medium">
                          {comp.closingDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PartnerShell>
  );
}
