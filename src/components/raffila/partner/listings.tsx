import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PartnerShell } from "./partner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Banknote,
  Ticket,
  Calendar,
  FileText,
  ShieldCheck,
  Eye,
  Building2,
  AlertCircle,
  Hash,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { partnerStore } from "@/lib/partner-store";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { PartnerCompetition, RevenueLedgerEntry } from "@/types/partner";

type FilterTab = "ALL" | "ACTIVE" | "COMPLETED" | "UPCOMING";

export function PartnerListingsPage() {
  const { session } = useAuthSession();
  const activePartnerId = session?.user?.partnerId || "partner_abc_motors";

  const [competitions, setCompetitions] = useState<PartnerCompetition[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComp, setSelectedComp] = useState<PartnerCompetition | null>(null);

  useEffect(() => {
    const update = () => {
      setCompetitions(partnerStore.getPartnerCompetitions(activePartnerId));
    };
    update();
    const unsub = partnerStore.subscribe(update);
    return unsub;
  }, [activePartnerId]);

  const filteredCompetitions = competitions.filter((c) => {
    if (filterTab === "ACTIVE" && c.status !== "ACTIVE") return false;
    if (filterTab === "COMPLETED" && c.status !== "COMPLETED") return false;
    if (filterTab === "UPCOMING" && c.status !== "UPCOMING" && c.status !== "DRAFT") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.prizeName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: PartnerCompetition["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="rounded-full bg-mint/40 text-ink border-mint text-[10px] font-extrabold px-2.5 py-0.5">
            ACTIVE
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="rounded-full bg-ink text-cream border-0 text-[10px] font-extrabold px-2.5 py-0.5">
            COMPLETED
          </Badge>
        );
      case "UPCOMING":
        return (
          <Badge className="rounded-full bg-sky/20 text-sky-800 border-0 text-[10px] font-extrabold px-2.5 py-0.5">
            UPCOMING
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full text-[10px] font-semibold border-ink/20">
            DRAFT
          </Badge>
        );
    }
  };

  const getDrawStatusBadge = (drawStatus: PartnerCompetition["drawStatus"]) => {
    switch (drawStatus) {
      case "DRAWN":
        return (
          <Badge className="rounded-full bg-mint/30 text-ink text-[10px] font-bold">
            <CheckCircle2 className="size-3 mr-1 text-mint-700" /> Winner Drawn
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="rounded-full bg-lemon/40 text-ink text-[10px] font-bold">
            <Clock className="size-3 mr-1" /> Scheduled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full text-[10px] text-ink/50 border-ink/20">
            Pending Sellout
          </Badge>
        );
    }
  };

  const compLedger: RevenueLedgerEntry[] = selectedComp
    ? partnerStore.getRevenueLedger(selectedComp.id)
    : [];

  return (
    <PartnerShell activeNav="listings" title="My Competitions">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              My Competitions
            </h1>
            <p className="font-body text-ink/65 text-sm mt-1">
              Real-time monitor for all competitions and prize assets assigned to your partner
              account.
            </p>
          </div>

          <Button
            asChild
            className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs h-10 px-5 shadow-sm"
          >
            <Link to="/partner/submit">+ Submit New Asset</Link>
          </Button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-ink/10 shadow-sm">
          {/* Filter Tabs: ALL, ACTIVE, COMPLETED, DRAFT / UPCOMING */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "ACTIVE", label: "Active" },
                { id: "COMPLETED", label: "Completed" },
                { id: "UPCOMING", label: "Draft / Upcoming" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  filterTab === tab.id
                    ? "bg-coral text-white shadow-sm"
                    : "text-ink/65 hover:bg-paper hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competition, prize..."
              className="pl-9 h-9 rounded-full bg-paper/60 border-ink/10 text-xs font-bold"
            />
          </div>
        </div>

        {/* Competitions Data Table */}
        <Card className="border-ink/10 rounded-[28px] bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {filteredCompetitions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Ticket className="size-12 text-ink/25 mx-auto mb-3" />
                <p className="font-display text-lg font-bold text-ink">No Competitions Found</p>
                <p className="text-xs text-ink/60 max-w-sm mx-auto mt-1">
                  {searchQuery
                    ? "No competitions matched your search query."
                    : "You currently have no competitions matching this filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-paper border-b border-ink/10 text-ink/50 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Competition</th>
                      <th className="py-3.5 px-3">Prize</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Entry Price</th>
                      <th className="py-3.5 px-3">Tickets Sold</th>
                      <th className="py-3.5 px-3">Total Entries</th>
                      <th className="py-3.5 px-3">Gross Revenue</th>
                      <th className="py-3.5 px-3">Partner %</th>
                      <th className="py-3.5 px-3 font-bold text-mint-800">Partner Amount</th>
                      <th className="py-3.5 px-3">Rafilla %</th>
                      <th className="py-3.5 px-3">Rafilla Amount</th>
                      <th className="py-3.5 px-3">Closing Date</th>
                      <th className="py-3.5 px-3">Draw Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filteredCompetitions.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedComp(c)}
                        className="hover:bg-paper/50 cursor-pointer transition group"
                      >
                        {/* Competition */}
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-ink group-hover:text-coral transition">
                            {c.title}
                          </p>
                          <p className="text-[10px] text-ink/40 font-mono mt-0.5">{c.id}</p>
                        </td>

                        {/* Prize */}
                        <td className="py-4 px-3 font-medium text-ink/80">{c.prizeName}</td>

                        {/* Status */}
                        <td className="py-4 px-3">{getStatusBadge(c.status)}</td>

                        {/* Entry Price */}
                        <td className="py-4 px-3 font-bold text-ink">
                          {formatNaira(c.entryPriceKobo)}
                        </td>

                        {/* Tickets Sold */}
                        <td className="py-4 px-3 font-bold text-ink">
                          {c.ticketsSold.toLocaleString()}
                        </td>

                        {/* Total Entries */}
                        <td className="py-4 px-3 text-ink/65">{c.totalEntries.toLocaleString()}</td>

                        {/* Gross Revenue */}
                        <td className="py-4 px-3 font-extrabold text-ink">
                          {formatNaira(c.grossRevenueKobo)}
                        </td>

                        {/* Partner % */}
                        <td className="py-4 px-3 font-bold text-ink">{c.partnerPercentage}%</td>

                        {/* Partner Amount */}
                        <td className="py-4 px-3 font-extrabold text-mint-700 bg-mint/5">
                          {formatNaira(c.partnerAmountKobo)}
                        </td>

                        {/* Rafilla % */}
                        <td className="py-4 px-3 text-ink/65">{c.raffilaPercentage}%</td>

                        {/* Rafilla Amount */}
                        <td className="py-4 px-3 text-ink/65">
                          {formatNaira(c.raffilaAmountKobo)}
                        </td>

                        {/* Closing Date */}
                        <td className="py-4 px-3 text-ink/75 font-medium">{c.closingDate}</td>

                        {/* Draw Status */}
                        <td className="py-4 px-3">{getDrawStatusBadge(c.drawStatus)}</td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-[11px] font-bold h-7 px-3 border-ink/20 group-hover:border-coral group-hover:text-coral"
                          >
                            <Eye className="size-3 mr-1" /> View Breakdown
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

        {/* Detailed Breakdown Modal */}
        <Dialog open={Boolean(selectedComp)} onOpenChange={(o) => !o && setSelectedComp(null)}>
          <DialogContent className="max-w-3xl rounded-[32px] p-6 sm:p-8 bg-white max-h-[90vh] overflow-y-auto">
            {selectedComp && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                      Competition Breakdown · {selectedComp.id}
                    </span>
                    {getStatusBadge(selectedComp.status)}
                  </div>
                  <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                    {selectedComp.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-ink/60">
                    Prize Asset: {selectedComp.prizeName} · Closing Date: {selectedComp.closingDate}
                  </DialogDescription>
                </DialogHeader>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-paper">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                      Gross Revenue
                    </p>
                    <p className="font-display text-lg font-bold text-ink mt-0.5">
                      {formatNaira(selectedComp.grossRevenueKobo)}
                    </p>
                    <p className="text-[10px] text-ink/50">
                      {selectedComp.ticketsSold} tickets sold
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-mint/20 ring-1 ring-mint/40">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-mint-800">
                      Partner Share ({selectedComp.partnerPercentage}%)
                    </p>
                    <p className="font-display text-lg font-bold text-mint-800 mt-0.5">
                      {formatNaira(selectedComp.partnerAmountKobo)}
                    </p>
                    <p className="text-[10px] text-mint-700">Contractual entitlement</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-paper">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                      Rafilla Share ({selectedComp.raffilaPercentage}%)
                    </p>
                    <p className="font-display text-lg font-bold text-ink mt-0.5">
                      {formatNaira(selectedComp.raffilaAmountKobo)}
                    </p>
                    <p className="text-[10px] text-ink/50">Platform operations</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-paper">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                      Settlement Status
                    </p>
                    <p className="font-display text-sm font-bold text-ink mt-1">
                      {selectedComp.status === "COMPLETED" ? "SCHEDULED" : "ACCRUING"}
                    </p>
                    <p className="text-[10px] text-ink/50 font-mono">
                      Ref: STL-{selectedComp.id.slice(-6)}
                    </p>
                  </div>
                </div>

                {/* Draw Status & certified audit details */}
                <div className="p-4 rounded-2xl bg-paper/60 border border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-ink flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-mint-700" />
                      NLRC Certified Draw Engine
                    </p>
                    <p className="text-ink/60 mt-0.5">
                      Draw Status:{" "}
                      <span className="font-bold text-ink">{selectedComp.drawStatus}</span> ·
                      Certified verifiable entropy hash generated at closing.
                    </p>
                  </div>
                  {getDrawStatusBadge(selectedComp.drawStatus)}
                </div>

                {/* Full Revenue Ledger Entries */}
                <div>
                  <h3 className="font-display text-base font-extrabold text-ink mb-2 flex items-center gap-2">
                    <FileText className="size-4 text-coral" /> Full Revenue Ledger & Ticket Batches
                  </h3>
                  <div className="rounded-2xl border border-ink/10 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-paper border-b border-ink/5 text-ink/50 uppercase font-extrabold tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Batch ID</th>
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">Tickets</th>
                          <th className="py-2.5 px-3">Batch Gross</th>
                          <th className="py-2.5 px-3 text-right">Partner Accrual</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {compLedger.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-ink/50">
                              No transaction batches recorded yet.
                            </td>
                          </tr>
                        ) : (
                          compLedger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-paper/30">
                              <td className="py-2.5 px-3 font-mono font-bold text-ink">
                                {entry.batchId}
                              </td>
                              <td className="py-2.5 px-3 text-ink/65">
                                {new Date(entry.timestamp).toLocaleString("en-NG", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-ink">
                                {entry.ticketsCount}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-ink">
                                {formatNaira(entry.grossAmountKobo)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-extrabold text-mint-700">
                                {formatNaira(entry.partnerShareKobo)}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge className="text-[9px] px-1.5 py-0.5 rounded-full bg-mint/25 text-ink border-0">
                                  {entry.status}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedComp(null)}
                    className="rounded-full text-xs font-bold border-ink/20"
                  >
                    Close Breakdown
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PartnerShell>
  );
}
