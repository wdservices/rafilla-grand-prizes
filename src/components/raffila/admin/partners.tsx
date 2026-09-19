import { useState, useEffect } from "react";
import {
  Search,
  Building2,
  User,
  Mail,
  Phone,
  Check,
  X,
  Eye,
  Percent,
  TrendingUp,
  Package,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Clock,
  Ban,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Sparkles,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { formatNaira } from "@/lib/utils";
import { partnerStore } from "@/lib/partner-store";
import type { PartnerProfile, PartnerAsset } from "@/types/partner";

export function AdminPartnersPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "assets">("directory");
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [assets, setAssets] = useState<PartnerAsset[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dialog States
  const [selectedPartner, setSelectedPartner] = useState<PartnerProfile | null>(null);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitPartner, setSplitPartner] = useState<PartnerProfile | null>(null);
  const [newSplitPercentage, setNewSplitPercentage] = useState<number>(85);

  const [rejectAssetTarget, setRejectAssetTarget] = useState<PartnerAsset | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [createPartnerOpen, setCreatePartnerOpen] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({
    businessName: "",
    businessType: "car_dealership",
    cacNumber: "",
    address: "",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    companyEmail: "",
    companyPhone: "",
    description: "",
    contactPersonFullName: "",
    contactPersonPosition: "Managing Director",
    contactPersonEmail: "",
    contactPersonPhone: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    defaultRevenueSplitPercent: 85,
  });

  const refreshData = () => {
    setPartners(partnerStore.getAllPartners());
    setAssets(partnerStore.getAllAssets());
  };

  useEffect(() => {
    refreshData();
    const unsub = partnerStore.subscribe(refreshData);
    return unsub;
  }, []);

  // Filter partners
  const filteredPartners = partners.filter((p) => {
    if (statusFilter !== "ALL" && p.verificationStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.businessName.toLowerCase().includes(q) ||
        p.authorizedRepresentative.fullName.toLowerCase().includes(q) ||
        p.companyEmail.toLowerCase().includes(q) ||
        p.cacNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter assets
  const filteredAssets = assets.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingAssetsCount = assets.filter((a) => a.status === "PENDING_REVIEW").length;

  const handleApprovePartner = (id: string, name: string) => {
    partnerStore.approvePartner(id);
    toast.success("Partner Approved!", {
      description: `${name} is now approved to list assets and run competitions.`,
    });
  };

  const handleRejectPartner = (id: string, name: string) => {
    partnerStore.rejectPartner(id, "Corporate document verification failed.");
    toast.error("Partner Application Rejected", {
      description: `${name} status set to REJECTED.`,
    });
  };

  const handleSuspendPartner = (id: string, name: string) => {
    partnerStore.suspendPartner(id, "Account under administrative audit.");
    toast.warning("Partner Suspended", {
      description: `${name} has been suspended from publishing new campaigns.`,
    });
  };

  const handleSaveRevenueSplit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitPartner) return;
    partnerStore.setRevenueSplit(splitPartner.id, Number(newSplitPercentage));
    toast.success("Revenue Split Updated", {
      description: `${splitPartner.businessName} default share set to ${newSplitPercentage}% (Raffila: ${100 - newSplitPercentage}%).`,
    });
    setIsSplitModalOpen(false);
  };

  const handleApproveAsset = (asset: PartnerAsset) => {
    partnerStore.approveAsset(asset.id);
    toast.success("Prize Asset Approved!", {
      description: `${asset.name} is now eligible for active competition assignments.`,
    });
  };

  const handleConfirmRejectAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectAssetTarget) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting this asset.");
      return;
    }
    partnerStore.rejectAsset(rejectAssetTarget.id, rejectionReason);
    toast.error("Asset Rejected", {
      description: `${rejectAssetTarget.name} has been rejected. Notification sent to partner.`,
    });
    setRejectAssetTarget(null);
    setRejectionReason("");
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.businessName || !newPartnerForm.companyEmail) {
      toast.error("Business Name and Email are required");
      return;
    }

    partnerStore.registerPartner({
      userId: `admin_created_${Date.now().toString(36)}`,
      businessName: newPartnerForm.businessName,
      businessType: newPartnerForm.businessType,
      cacNumber: newPartnerForm.cacNumber || "RC-PENDING",
      address: newPartnerForm.address,
      city: newPartnerForm.city,
      state: newPartnerForm.state,
      country: newPartnerForm.country,
      companyEmail: newPartnerForm.companyEmail,
      companyPhone: newPartnerForm.companyPhone || "+234 800 000 0000",
      description: newPartnerForm.description || `${newPartnerForm.businessName} - Registered Partner`,
      authorizedRepresentative: {
        fullName: newPartnerForm.contactPersonFullName || "Primary Contact",
        position: newPartnerForm.contactPersonPosition,
        email: newPartnerForm.contactPersonEmail || newPartnerForm.companyEmail,
        phone: newPartnerForm.contactPersonPhone || newPartnerForm.companyPhone || "+234 800 000 0000",
      },
      documents: {},
    });

    toast.success("Partner Registered!", {
      description: `${newPartnerForm.businessName} created in PENDING review status.`,
    });
    setCreatePartnerOpen(false);
    setNewPartnerForm({
      businessName: "",
      businessType: "car_dealership",
      cacNumber: "",
      address: "",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      companyEmail: "",
      companyPhone: "",
      description: "",
      contactPersonFullName: "",
      contactPersonPosition: "Managing Director",
      contactPersonEmail: "",
      contactPersonPhone: "",
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      defaultRevenueSplitPercent: 85,
    });
    refreshData();
  };

  const getPartnerStatusBadge = (status: PartnerProfile["verificationStatus"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-mint/40 text-ink border-mint text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <CheckCircle2 className="size-3 mr-1 text-mint-700 inline" /> APPROVED
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-lemon/40 text-ink text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <Clock className="size-3 mr-1 inline" /> PENDING
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className="bg-ink/15 text-ink text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <Ban className="size-3 mr-1 inline" /> SUSPENDED
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-coral/20 text-coral text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <X className="size-3 mr-1 inline" /> REJECTED
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAssetStatusBadge = (status: PartnerAsset["status"]) => {
    switch (status) {
      case "ASSIGNED":
        return (
          <Badge className="bg-mint/40 text-ink border-mint text-[10px] font-bold rounded-full px-2 py-0.5">
            IN COMPETITION
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-mint/30 text-ink text-[10px] font-bold rounded-full px-2 py-0.5">
            APPROVED
          </Badge>
        );
      case "PENDING_REVIEW":
        return (
          <Badge className="bg-lemon/40 text-ink text-[10px] font-bold rounded-full px-2 py-0.5 animate-pulse">
            UNDER REVIEW
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-coral/20 text-coral text-[10px] font-bold rounded-full px-2 py-0.5">
            REJECTED
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminShell activeNav="partners" title="Partner & Asset Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
              <Building2 className="size-8 text-coral" /> Partner Management
            </h1>
            <p className="font-body text-ink/65 text-sm mt-1">
              Verify dealerships, configure contractual revenue splits, and review physical prize
              assets.
            </p>
          </div>

          <Button
            onClick={() => setCreatePartnerOpen(true)}
            className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs h-10 px-5 shadow-sm"
          >
            <Plus className="size-4 mr-1.5" /> Register New Partner
          </Button>
        </div>

        {/* Primary Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/10 pb-4">
            <TabsList className="rounded-full p-1 bg-paper/80 h-11">
              <TabsTrigger
                value="directory"
                className="rounded-full text-xs font-extrabold px-5 data-[state=active]:bg-coral data-[state=active]:text-white"
              >
                <Building2 className="size-4 mr-2" /> Partner Directory ({partners.length})
              </TabsTrigger>
              <TabsTrigger
                value="assets"
                className="rounded-full text-xs font-extrabold px-5 data-[state=active]:bg-coral data-[state=active]:text-white"
              >
                <Package className="size-4 mr-2" /> Asset Approvals
                {pendingAssetsCount > 0 && (
                  <span className="ml-2 bg-coral text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {pendingAssetsCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {activeTab === "directory" && (
                <div className="flex items-center gap-1 bg-paper/60 p-1 rounded-full border border-ink/10 overflow-x-auto">
                  {["ALL", "APPROVED", "PENDING", "SUSPENDED"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-full transition ${
                        statusFilter === st
                          ? "bg-white shadow-xs text-ink"
                          : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative min-w-[220px]">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search partner, contact, asset..."
                  className="pl-8 h-9 rounded-full bg-paper/60 border-ink/10 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: PARTNER DIRECTORY */}
          <TabsContent value="directory" className="pt-4 m-0">
            <Card className="border-ink/10 rounded-[28px] bg-white shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-paper border-b border-ink/10 text-ink/50 uppercase font-extrabold tracking-wider">
                      <tr>
                        <th className="py-3.5 px-5">Business Name</th>
                        <th className="py-3.5 px-4">Contact Person</th>
                        <th className="py-3.5 px-4">Email & Phone</th>
                        <th className="py-3.5 px-4">CAC Number</th>
                        <th className="py-3.5 px-4">Verification Status</th>
                        <th className="py-3.5 px-4">Active Comps</th>
                        <th className="py-3.5 px-4">Revenue Generated</th>
                        <th className="py-3.5 px-4">Partner Payout Total</th>
                        <th className="py-3.5 px-4 font-bold text-mint-800">Split %</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {filteredPartners.map((p) => {
                        const comps = partnerStore.getPartnerCompetitions(p.id);
                        const activeCompsCount = comps.filter((c) => c.status === "ACTIVE").length;
                        const totalRevKobo = comps.reduce((sum, c) => sum + c.grossRevenueKobo, 0);
                        const totalPayoutKobo = comps.reduce(
                          (sum, c) => sum + c.partnerAmountKobo,
                          0,
                        );

                        return (
                          <tr key={p.id} className="hover:bg-paper/40 transition">
                            {/* Business Name */}
                            <td className="py-4 px-5">
                              <p className="font-extrabold text-ink text-sm">{p.businessName}</p>
                              <p className="text-[10px] text-ink/40 font-mono mt-0.5">{p.id}</p>
                            </td>

                            {/* Contact Person */}
                            <td className="py-4 px-4">
                              <p className="font-bold text-ink">{p.authorizedRepresentative.fullName}</p>
                              <p className="text-[10px] text-ink/50">{p.authorizedRepresentative.position}</p>
                            </td>

                            {/* Email & Phone */}
                            <td className="py-4 px-4">
                              <p className="text-ink font-medium">{p.companyEmail}</p>
                              <p className="text-[10px] text-ink/50">{p.companyPhone}</p>
                            </td>

                            {/* CAC Number */}
                            <td className="py-4 px-4 font-mono font-bold text-ink/80">
                              {p.cacNumber}
                            </td>

                            {/* Verification Status */}
                            <td className="py-4 px-4">
                              {getPartnerStatusBadge(p.verificationStatus)}
                            </td>

                            {/* Active Competitions Count */}
                            <td className="py-4 px-4 font-extrabold text-ink">
                              {activeCompsCount} active
                            </td>

                            {/* Total Revenue Generated */}
                            <td className="py-4 px-4 font-bold text-ink">
                              {formatNaira(totalRevKobo)}
                            </td>

                            {/* Partner Payout Total */}
                            <td className="py-4 px-4 font-extrabold text-mint-700 bg-mint/5">
                              {formatNaira(totalPayoutKobo)}
                            </td>

                            {/* Default Revenue Split % */}
                            <td className="py-4 px-4 font-extrabold text-ink">
                              <Badge className="bg-coral/10 text-coral text-[10px] font-bold border-0">
                                {p.defaultRevenueSplitPercent || 80}% Partner
                              </Badge>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPartner(p)}
                                className="rounded-full text-[10px] font-bold h-7 px-2.5 border-ink/20"
                              >
                                View Profile
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSplitPartner(p);
                                   setNewSplitPercentage(p.defaultRevenueSplitPercent || 80);
                                  setIsSplitModalOpen(true);
                                }}
                                className="rounded-full text-[10px] font-bold h-7 px-2.5 border-ink/20 text-coral hover:bg-coral/10"
                              >
                                Split %
                              </Button>

                              {p.verificationStatus !== "APPROVED" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePartner(p.id, p.businessName)}
                                  className="rounded-full text-[10px] font-bold h-7 px-2.5 bg-mint/40 text-ink hover:bg-mint"
                                >
                                  Approve
                                </Button>
                              )}

                              {p.verificationStatus === "PENDING" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectPartner(p.id, p.businessName)}
                                  className="rounded-full text-[10px] font-bold h-7 px-2.5 bg-coral/20 text-coral hover:bg-coral hover:text-white"
                                >
                                  Reject
                                </Button>
                              )}

                              {p.verificationStatus === "APPROVED" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSuspendPartner(p.id, p.businessName)}
                                  className="rounded-full text-[10px] font-bold h-7 px-2.5 text-ink/50 hover:bg-ink/10"
                                >
                                  Suspend
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: ASSET APPROVALS */}
          <TabsContent value="assets" className="pt-4 m-0">
            <Card className="border-ink/10 rounded-[28px] bg-white shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-paper border-b border-ink/10 text-ink/50 uppercase font-extrabold tracking-wider">
                      <tr>
                        <th className="py-3.5 px-5">Asset Name</th>
                        <th className="py-3.5 px-4">Partner Business Name</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Declared Retail Value</th>
                        <th className="py-3.5 px-4">Date Submitted</th>
                        <th className="py-3.5 px-4">Proof Documents</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {filteredAssets.map((asset) => {
                        const ownerPartner = partners.find((p) => p.id === asset.partnerId);

                        return (
                          <tr key={asset.id} className="hover:bg-paper/40 transition">
                            <td className="py-4 px-5">
                              <p className="font-extrabold text-ink text-sm">{asset.name}</p>
                              <p className="text-[10px] text-ink/50">
                                {asset.location} · {asset.condition}
                              </p>
                            </td>

                            <td className="py-4 px-4 font-bold text-ink">
                              {ownerPartner?.businessName || asset.partnerId}
                            </td>

                            <td className="py-4 px-4 font-medium text-ink/80">{asset.category}</td>

                            <td className="py-4 px-4 font-extrabold text-coral text-sm">
                              {formatNaira(asset.declaredValueKobo)}
                            </td>

                            <td className="py-4 px-4 text-ink/65 font-medium">
                              {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : "-"}
                            </td>

                            <td className="py-4 px-4">
                              <Badge className="bg-mint/25 text-ink font-bold text-[10px] border-0 rounded-full px-2 py-0.5">
                                <FileCheck2 className="size-3 mr-1 text-mint-700 inline" /> Title
                                Attached
                              </Badge>
                            </td>

                            <td className="py-4 px-4">{getAssetStatusBadge(asset.status)}</td>

                            <td className="py-4 px-5 text-right space-x-1.5">
                              {asset.status === "PENDING_REVIEW" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveAsset(asset)}
                                    className="rounded-full text-[10px] font-bold h-7 px-3 bg-mint/40 text-ink hover:bg-mint"
                                  >
                                    Approve Asset
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => setRejectAssetTarget(asset)}
                                    className="rounded-full text-[10px] font-bold h-7 px-3 bg-coral/20 text-coral hover:bg-coral hover:text-white"
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      toast.info("Physical Inspection Scheduled", {
                                        description: `Inspection order dispatched for ${asset.name} at ${asset.location}.`,
                                      })
                                    }
                                    className="rounded-full text-[10px] font-bold h-7 px-3 border-ink/20"
                                  >
                                    Request Inspection
                                  </Button>
                                </>
                              )}
                              {asset.status === "APPROVED" && (
                                <Badge className="bg-mint/20 text-mint-800 text-[10px] font-bold rounded-full">
                                  Eligible for Draw
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Profile Dialog */}
        <Dialog
          open={Boolean(selectedPartner)}
          onOpenChange={(o) => !o && setSelectedPartner(null)}
        >
          <DialogContent className="max-w-xl rounded-[32px] p-6 sm:p-8 bg-white max-h-[90vh] overflow-y-auto">
            {selectedPartner && (
              <div className="space-y-5">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    {getPartnerStatusBadge(selectedPartner.verificationStatus)}
                    <span className="text-[10px] font-mono text-ink/40">{selectedPartner.id}</span>
                  </div>
                  <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                    {selectedPartner.businessName}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-ink/60">
                    Trading Name: {selectedPartner.businessName} · Registered in {selectedPartner.country}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-paper">
                    <span className="text-ink/50 block">CAC Registration Number</span>
                    <span className="font-mono font-bold text-ink">
                      {selectedPartner.cacNumber}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-paper">
                    <span className="text-ink/50 block">Business Type</span>
                    <span className="font-mono font-bold text-ink">
                      {selectedPartner.businessType}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-paper/60 border border-ink/10 space-y-2 text-xs">
                  <p className="font-extrabold uppercase tracking-wider text-ink/65 text-[10px]">
                    Authorized Contact
                  </p>
                  <div className="flex justify-between">
                    <span className="text-ink/60">Full Name</span>
                    <span className="font-bold text-ink">{selectedPartner.authorizedRepresentative.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/60">Role</span>
                    <span className="font-bold text-ink">{selectedPartner.authorizedRepresentative.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/60">Email</span>
                    <span className="font-bold text-ink">{selectedPartner.companyEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/60">Phone</span>
                    <span className="font-bold text-ink">{selectedPartner.companyPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/60">Physical Address</span>
                    <span className="font-bold text-ink">{selectedPartner.address}, {selectedPartner.city}, {selectedPartner.state}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-mint/15 border border-mint/30 space-y-2 text-xs">
                  <p className="font-extrabold uppercase tracking-wider text-mint-800 text-[10px]">
                    Settlement Bank Account
                  </p>
                  {selectedPartner.bankDetails ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-ink/60">Bank</span>
                        <span className="font-bold text-ink">
                          {selectedPartner.bankDetails.bankName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink/60">Account Number</span>
                        <span className="font-mono font-bold text-ink">
                          {selectedPartner.bankDetails.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink/60">Beneficiary Name</span>
                        <span className="font-bold text-ink">
                          {selectedPartner.bankDetails.accountName}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-ink/40 italic">No bank details provided</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPartner(null)}
                    className="rounded-full text-xs font-bold border-ink/20"
                  >
                    Close Profile
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Set Revenue Split Modal */}
        <Dialog open={isSplitModalOpen} onOpenChange={setIsSplitModalOpen}>
          <DialogContent className="max-w-md rounded-[32px] p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-extrabold text-ink">
                Set Contractual Revenue Split
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Configure default gross ticket split percentage for {splitPartner?.businessName}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveRevenueSplit} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                  Partner Revenue Share % *
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={newSplitPercentage}
                    onChange={(e) => setNewSplitPercentage(Number(e.target.value))}
                    required
                    className="h-11 rounded-xl border-ink/15 font-bold text-base"
                  />
                  <span className="text-sm font-bold text-ink">%</span>
                </div>
                <p className="text-xs text-ink/60 mt-1.5">
                  Raffila platform fee will be{" "}
                  <span className="font-bold text-coral">{100 - newSplitPercentage}%</span>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-paper/60 border border-ink/10 text-xs space-y-1">
                <p className="font-bold text-ink">Preview on ₦100,000,000 Campaign Sellout:</p>
                <p className="text-mint-700 font-extrabold">
                  Partner Receives: {formatNaira(10000000000 * (newSplitPercentage / 100))}
                </p>
                <p className="text-ink/60">
                  Raffila Receives: {formatNaira(10000000000 * ((100 - newSplitPercentage) / 100))}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSplitModalOpen(false)}
                  className="rounded-full text-xs font-bold border-ink/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs px-6 shadow-sm"
                >
                  Save Split
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reject Asset Dialog */}
        <Dialog
          open={Boolean(rejectAssetTarget)}
          onOpenChange={(o) => !o && setRejectAssetTarget(null)}
        >
          <DialogContent className="max-w-md rounded-[32px] p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-extrabold text-coral">
                Reject Prize Asset
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Provide specific reasons why {rejectAssetTarget?.name} failed compliance or
                inspection.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmRejectAsset} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                  Rejection Reason *
                </Label>
                <Textarea
                  placeholder="e.g. Incomplete title documents, odometer discrepancy, missing ownership affidavit..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  rows={3}
                  className="rounded-xl border-ink/15 text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectAssetTarget(null)}
                  className="rounded-full text-xs font-bold border-ink/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs px-6 shadow-sm"
                >
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Register New Partner Dialog */}
        <Dialog open={createPartnerOpen} onOpenChange={setCreatePartnerOpen}>
          <DialogContent className="max-w-xl rounded-[32px] p-6 sm:p-8 bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                Register New Enterprise Partner
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Onboard a car dealership, real estate developer, or luxury asset merchant.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePartner} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    Business Legal Name *
                  </Label>
                  <Input
                    required
                    placeholder="e.g. ABC Luxury Motors Limited"
                    value={newPartnerForm.businessName}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({ ...f, businessName: e.target.value }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    CAC Registration (RC/BN)
                  </Label>
                  <Input
                    placeholder="RC-1294829"
                    value={newPartnerForm.cacNumber}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({ ...f, cacNumber: e.target.value }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    Business Type
                  </Label>
                  <Input
                    placeholder="e.g. Car Dealership"
                    value={newPartnerForm.businessType}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({ ...f, businessType: e.target.value }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    Contact Person Name
                  </Label>
                  <Input
                    placeholder="Managing Director Name"
                    value={newPartnerForm.contactPersonFullName}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({ ...f, contactPersonFullName: e.target.value }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    Business Email *
                  </Label>
                  <Input
                    type="email"
                    required
                    placeholder="partner@domain.ng"
                    value={newPartnerForm.companyEmail}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({ ...f, companyEmail: e.target.value }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    Business Phone
                  </Label>
                  <Input
                    placeholder="+234 803 000 0000"
                    value={newPartnerForm.companyPhone}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({ ...f, companyPhone: e.target.value }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    Business Address
                  </Label>
                  <Input
                    placeholder="Physical address"
                    value={newPartnerForm.address}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({ ...f, address: e.target.value }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1">
                    Default Partner Revenue %
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={newPartnerForm.defaultRevenueSplitPercent}
                    onChange={(e) =>
                      setNewPartnerForm((f) => ({
                        ...f,
                        defaultRevenueSplitPercent: Number(e.target.value),
                      }))
                    }
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-ink/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatePartnerOpen(false)}
                  className="rounded-full text-xs font-bold border-ink/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs px-6 shadow-sm"
                >
                  Complete Registration
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}
