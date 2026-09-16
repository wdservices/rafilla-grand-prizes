import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PartnerShell } from "./partner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Upload,
  Plus,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  Eye,
  Camera,
  MapPin,
  Tag,
  ShieldCheck,
  Building,
  Car,
  Smartphone,
  Watch,
  Gem,
  ArrowRight,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { partnerStore } from "@/lib/partner-store";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { PartnerAsset } from "@/types/partner";

const CATEGORIES = [
  "Automotive",
  "Real Estate",
  "Consumer Electronics",
  "Luxury Watches",
  "Fine Jewelry",
  "Marine & Aviation",
  "Lifestyle & Travel",
];

const CONDITIONS = [
  "Brand New (Factory Zero / Sealed)",
  "Like New (Pristine / Showroom)",
  "Certified Pre-Owned",
  "Refurbished / Serviced",
];

export function PartnerSubmitAssetPage() {
  const { session } = useAuthSession();
  const activePartnerId = session?.user?.partnerId || "partner_abc_motors";

  const [viewMode, setViewMode] = useState<"LIST" | "FORM">("LIST");
  const [assets, setAssets] = useState<PartnerAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<PartnerAsset | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Automotive");
  const [description, setDescription] = useState("");
  const [declaredValueNaira, setDeclaredValueNaira] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("Brand New (Factory Zero / Sealed)");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [proofDocUploaded, setProofDocUploaded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const update = () => {
      setAssets(partnerStore.getPartnerAssets(activePartnerId));
    };
    update();
    const unsub = partnerStore.subscribe(update);
    return unsub;
  }, [activePartnerId]);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Asset Name is required");
      return;
    }
    if (!declaredValueNaira || Number(declaredValueNaira) <= 0) {
      toast.error("Valid Declared Market Value is required");
      return;
    }
    if (!location.trim()) {
      toast.error("Physical location is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const valKobo = Math.round(Number(declaredValueNaira) * 100);
      partnerStore.addAsset({
        partnerId: activePartnerId,
        name,
        category,
        description,
        declaredRetailValueKobo: valKobo,
        images: ["/mercedes-benz-c-class.png"],
        proofOfOwnershipDoc: `https://secure-docs.raffila.internal/ownership/${Date.now()}.pdf`,
        physicalLocation: location,
        condition: condition as any,
        identificationNumber: identificationNumber || undefined,
      });

      toast.success("Asset Submitted for Approval!", {
        description: `${name} has been added to your inventory in PENDING review status.`,
      });

      // Reset form
      setName("");
      setDescription("");
      setDeclaredValueNaira("");
      setLocation("");
      setIdentificationNumber("");
      setViewMode("LIST");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: PartnerAsset["status"]) => {
    switch (status) {
      case "ACTIVE_IN_COMPETITION":
        return (
          <Badge className="bg-mint/40 text-ink border-mint text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <CheckCircle2 className="size-3 mr-1 text-mint-700" /> Active in Competition
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-mint/30 text-ink text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <CheckCircle2 className="size-3 mr-1 text-mint-700" /> Approved
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-lemon/40 text-ink text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <Clock className="size-3 mr-1" /> Under Review
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-coral/20 text-coral text-[10px] font-bold rounded-full px-2.5 py-0.5">
            <XCircle className="size-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-medium border-ink/20">
            {status}
          </Badge>
        );
    }
  };

  return (
    <PartnerShell activeNav="submit" title="Partner Asset Management">
      <div className="space-y-6">
        {/* Header and Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              {viewMode === "LIST" ? "My Assets" : "Submit Asset for Approval"}
            </h1>
            <p className="font-body text-ink/65 text-sm mt-1">
              {viewMode === "LIST"
                ? "Manage your registered prize inventory, inspection status, and active campaign linkages."
                : "Submit vehicle title, real estate deed, or luxury consignment documents for compliance review."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "LIST" ? (
              <Button
                onClick={() => setViewMode("FORM")}
                className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs h-10 px-5 shadow-sm"
              >
                <Plus className="size-4 mr-1.5" /> Submit New Asset
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setViewMode("LIST")}
                className="rounded-full border-ink/20 font-bold text-xs h-10 px-4"
              >
                Back to My Assets
              </Button>
            )}
          </div>
        </div>

        {/* VIEW 1: MY ASSETS TABLE */}
        {viewMode === "LIST" ? (
          <Card className="border-ink/10 rounded-[28px] bg-white shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-ink/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-xl font-extrabold text-ink flex items-center gap-2">
                    <Package className="size-5 text-coral" /> Registered Partner Assets
                  </CardTitle>
                  <CardDescription className="text-xs text-ink/60 mt-1">
                    {assets.length} total assets registered under this partner account.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {assets.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="size-16 rounded-full bg-paper mx-auto flex items-center justify-center text-ink/30 mb-3">
                    <Package className="size-8" />
                  </div>
                  <p className="font-display text-lg font-bold text-ink">No Assets Submitted Yet</p>
                  <p className="text-xs text-ink/60 max-w-sm mx-auto mt-1">
                    Submit your first vehicle, property, or luxury watch asset to make it eligible
                    for Raffila competitions.
                  </p>
                  <Button
                    onClick={() => setViewMode("FORM")}
                    className="rounded-full bg-coral text-white mt-4 font-bold text-xs"
                  >
                    Submit First Asset
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-paper border-b border-ink/10 text-ink/50 uppercase font-extrabold tracking-wider">
                      <tr>
                        <th className="py-3.5 px-5">Asset Name</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Declared Retail Value</th>
                        <th className="py-3.5 px-4">Submitted Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {assets.map((asset) => (
                        <tr
                          key={asset.id}
                          className="hover:bg-paper/40 transition cursor-pointer"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          <td className="py-4 px-5">
                            <p className="font-extrabold text-ink text-sm hover:text-coral transition">
                              {asset.name}
                            </p>
                            <p className="text-[10px] text-ink/40 font-mono mt-0.5">
                              {asset.identificationNumber || asset.id} · {asset.physicalLocation}
                            </p>
                          </td>
                          <td className="py-4 px-4 font-medium text-ink/80">{asset.category}</td>
                          <td className="py-4 px-4 font-extrabold text-ink text-sm">
                            {formatNaira(asset.declaredRetailValueKobo)}
                          </td>
                          <td className="py-4 px-4 text-ink/65 font-medium">
                            {asset.submittedDate}
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(asset.status)}</td>
                          <td className="py-4 px-5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAsset(asset);
                              }}
                              className="rounded-full text-[11px] font-bold h-7 px-3 border-ink/20"
                            >
                              <Eye className="size-3 mr-1" /> View Details
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
        ) : (
          /* VIEW 2: ASSET SUBMISSION FORM */
          <Card className="border-ink/10 rounded-[32px] bg-white shadow-lg overflow-hidden max-w-3xl mx-auto">
            <CardHeader className="p-6 sm:p-8 border-b border-ink/5 bg-paper/30">
              <CardTitle className="font-display text-2xl font-extrabold text-ink">
                Submit Asset for Approval
              </CardTitle>
              <CardDescription className="text-xs text-ink/60 mt-1">
                Provide comprehensive specifications and ownership proof. Our team verifies physical
                possession and legal titles within 24-48 hours.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleCreateAsset} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                      Asset Name & Model *
                    </Label>
                    <Input
                      placeholder="e.g. 2026 Toyota Land Cruiser 300 VXR or Rolex Submariner Date"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                      Category *
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12 rounded-xl border-ink/15 font-bold text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="font-bold text-sm">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                      Declared Market / Retail Value (₦ Naira) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 85000000"
                      value={declaredValueNaira}
                      onChange={(e) => setDeclaredValueNaira(e.target.value)}
                      required
                      className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                    />
                    {declaredValueNaira && Number(declaredValueNaira) > 0 && (
                      <p className="mt-1 text-xs font-extrabold text-coral">
                        {formatNaira(Number(declaredValueNaira) * 100)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                      Physical Location *
                    </Label>
                    <Input
                      placeholder="e.g. Victoria Island Showroom, Lagos"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                      Asset Condition *
                    </Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="h-12 rounded-xl border-ink/15 font-bold text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {CONDITIONS.map((cond) => (
                          <SelectItem key={cond} value={cond} className="font-bold text-sm">
                            {cond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                      Identification / VIN / Serial Number (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. VIN-JTMEU39J2026-90412 or Property C of O Number"
                      value={identificationNumber}
                      onChange={(e) => setIdentificationNumber(e.target.value)}
                      className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                      Description & Technical Specifications *
                    </Label>
                    <Textarea
                      placeholder="List engine specs, luxury options, trim level, warranty status, inclusions, and transfer conditions..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="rounded-xl border-ink/15 font-bold text-sm"
                    />
                  </div>

                  {/* Documents & Photos upload placeholders */}
                  <div className="sm:col-span-2 rounded-2xl border border-ink/10 p-4 bg-paper/40 space-y-3">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink/65">
                      Compliance Attachments
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-ink/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="size-4 text-mint-700" />
                          <span className="text-xs font-bold text-ink">
                            Proof of Ownership / Title
                          </span>
                        </div>
                        <Badge className="bg-mint/30 text-ink text-[10px] font-bold">
                          Attached
                        </Badge>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-ink/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="size-4 text-coral" />
                          <span className="text-xs font-bold text-ink">Inspection Photos (5)</span>
                        </div>
                        <Badge className="bg-mint/30 text-ink text-[10px] font-bold">
                          Uploaded
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-ink/10 flex items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewMode("LIST")}
                    className="rounded-full text-xs font-bold px-6 h-11 border-ink/20"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-xs px-8 h-11 shadow-sm"
                  >
                    {isSubmitting ? "Submitting..." : "Submit for Approval"}
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Asset Details Modal */}
        <Dialog open={Boolean(selectedAsset)} onOpenChange={(o) => !o && setSelectedAsset(null)}>
          <DialogContent className="max-w-2xl rounded-[32px] p-6 sm:p-8 bg-white max-h-[90vh] overflow-y-auto">
            {selectedAsset && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50 font-mono">
                      Asset Ref: {selectedAsset.id}
                    </span>
                    {getStatusBadge(selectedAsset.status)}
                  </div>
                  <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                    {selectedAsset.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-ink/60">
                    Category: {selectedAsset.category} · Condition: {selectedAsset.condition}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-paper">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                      Declared Market Value
                    </p>
                    <p className="font-display text-lg font-extrabold text-coral mt-0.5">
                      {formatNaira(selectedAsset.declaredRetailValueKobo)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-paper">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                      Physical Location
                    </p>
                    <p className="font-display text-sm font-bold text-ink mt-1 truncate">
                      {selectedAsset.physicalLocation}
                    </p>
                  </div>
                </div>

                {selectedAsset.rejectionReason && (
                  <div className="p-4 rounded-2xl bg-coral/10 border border-coral/30 text-xs">
                    <p className="font-bold text-coral flex items-center gap-1.5">
                      <XCircle className="size-4" /> Compliance Rejection Notice:
                    </p>
                    <p className="text-ink/80 mt-1">{selectedAsset.rejectionReason}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-ink/65">
                    Description & Specifications
                  </p>
                  <p className="text-xs text-ink/75 leading-relaxed bg-paper/40 p-4 rounded-2xl border border-ink/10">
                    {selectedAsset.description}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAsset(null)}
                    className="rounded-full text-xs font-bold border-ink/20"
                  >
                    Close
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
