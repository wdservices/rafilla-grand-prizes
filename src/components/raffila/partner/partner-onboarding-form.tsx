import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  UserCheck,
  FileCheck2,
  PackagePlus,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Building,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { partnerStore } from "@/lib/partner-store";
import { signInWithCredentials, setFirebaseSession } from "@/lib/auth-store";
import { useAuthSession } from "@/hooks/useAuthSession";
import { formatNaira, cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  "Automotive & Dealership",
  "Real Estate & Property Development",
  "Consumer Electronics & Computing",
  "Luxury Watches & Horology",
  "Fine Jewelry & Precious Metals",
  "Marine, Yachts & Aviation",
  "Hospitality & Luxury Travel",
  "Art, Antiques & Collectibles",
  "Other Premium Goods",
];

const ASSET_CATEGORIES = [
  "Automotive",
  "Real Estate",
  "Electronics",
  "Watches",
  "Jewelry",
  "Lifestyle & Travel",
];

const STEPS = [
  { id: 1, title: "Business Info", desc: "Company credentials", icon: Building2 },
  { id: 2, title: "Representative", desc: "Authorized signatory", icon: UserCheck },
  { id: 3, title: "Verification", desc: "CAC & compliance docs", icon: FileCheck2 },
  { id: 4, title: "First Asset", desc: "Proposed prize asset", icon: PackagePlus },
  { id: 5, title: "Security & Login", desc: "Portal credentials", icon: Lock },
  { id: 6, title: "Review & Submit", desc: "Application summary", icon: CheckCircle2 },
];

export function PartnerOnboardingForm() {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuthSession();
  const [bypassActiveCheck, setBypassActiveCheck] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPartner, setSubmittedPartner] = useState<{
    id: string;
    businessName: string;
    email: string;
  } | null>(null);

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Automotive & Dealership");
  const [cacNumber, setCacNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lagos");
  const [state, setState] = useState("Lagos State");
  const [country, setCountry] = useState("Nigeria");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 2: Authorized Representative
  const [repName, setRepName] = useState("");
  const [repPosition, setRepPosition] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [idType, setIdType] = useState("National Identity Number (NIN)");
  const [idNumber, setIdNumber] = useState("");

  // Step 3: Verification Documents
  const [cacDocUploaded, setCacDocUploaded] = useState(true);
  const [addressDocUploaded, setAddressDocUploaded] = useState(true);
  const [dealershipDocUploaded, setDealershipDocUploaded] = useState(false);
  const [taxIdNumber, setTaxIdNumber] = useState("");

  // Step 4: Asset Information
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("Automotive");
  const [assetDescription, setAssetDescription] = useState("");
  const [declaredValueNaira, setDeclaredValueNaira] = useState("");
  const [assetLocation, setAssetLocation] = useState("");
  const [assetCondition, setAssetCondition] = useState<"Brand new" | "Like new" | "Refurbished">(
    "Brand new",
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [assetImages, setAssetImages] = useState<string[]>(["/mercedes-benz-c-class.png"]);

  // Step 5: Account Setup
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!businessName.trim()) newErrors.businessName = "Company / Business Name is required";
      if (!cacNumber.trim()) newErrors.cacNumber = "RC / CAC Registration number is required";
      if (!address.trim()) newErrors.address = "Registered address is required";
      if (!companyEmail.trim()) newErrors.companyEmail = "Company email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail))
        newErrors.companyEmail = "Enter a valid email address";
      if (!companyPhone.trim()) newErrors.companyPhone = "Company telephone is required";
      if (!description.trim()) newErrors.description = "Brief business description is required";
    } else if (stepNumber === 2) {
      if (!repName.trim()) newErrors.repName = "Representative full name is required";
      if (!repPosition.trim()) newErrors.repPosition = "Role or position is required";
      if (!repEmail.trim()) newErrors.repEmail = "Direct email is required";
      if (!repPhone.trim()) newErrors.repPhone = "Direct phone number is required";
    } else if (stepNumber === 3) {
      if (!cacDocUploaded) newErrors.cacDoc = "Certificate of Incorporation is required";
      if (!addressDocUploaded) newErrors.addressDoc = "Proof of address is required";
    } else if (stepNumber === 4) {
      if (!assetName.trim()) newErrors.assetName = "Proposed asset name is required";
      if (!assetDescription.trim()) newErrors.assetDescription = "Asset description is required";
      if (!declaredValueNaira || Number(declaredValueNaira) <= 0)
        newErrors.declaredValue = "Valid declared market value is required";
      if (!assetLocation.trim()) newErrors.assetLocation = "Current asset location is required";
    } else if (stepNumber === 5) {
      if (!accountPassword) newErrors.password = "Password is required";
      else if (accountPassword.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (accountPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
      if (!agreeTerms) newErrors.agreeTerms = "You must agree to the Partner Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && !repEmail) {
        setRepEmail(companyEmail);
        setRepPhone(companyPhone);
      }
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in required fields to continue");
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickFill = () => {
    setBusinessName("Prestige Motors Nigeria Ltd");
    setBusinessType("Automotive & Dealership");
    setCacNumber("RC-2948192");
    setAddress("14 Adeola Odeku Street, Victoria Island");
    setCity("Lagos");
    setState("Lagos State");
    setCountry("Nigeria");
    setCompanyEmail("partnerships@prestigemotors.ng");
    setCompanyPhone("+234 802 334 5566");
    setWebsite("https://prestigemotors.ng");
    setDescription(
      "Authorized luxury automotive distributor and dealership specializing in European luxury brands in Nigeria.",
    );
    setRepName("Olumide Adeleke");
    setRepPosition("Managing Director");
    setRepEmail("olumide@prestigemotors.ng");
    setRepPhone("+234 803 777 8899");
    setIdNumber("NIN-39482910492");
    setTaxIdNumber("TIN-83920194");
    setCacDocUploaded(true);
    setAddressDocUploaded(true);
    setDealershipDocUploaded(true);
    setAssetName("2024 Mercedes-Benz C300 AMG Line");
    setAssetCategory("Automotive");
    setAssetDescription(
      "Brand new Mercedes-Benz C300 with panoramic sunroof, Burmester 3D surround sound, AMG aerodynamics package, and full Nigerian customs clearance.",
    );
    setDeclaredValueNaira("85000000");
    setAssetLocation("Lagos Showroom, Victoria Island");
    setAssetCondition("Brand new");
    setReferenceNumber("VIN-WDD2060461F123456");
    setAccountPassword("PartnerPass2026!");
    setConfirmPassword("PartnerPass2026!");
    setAgreeTerms(true);
    setErrors({});
    toast.success("Sample business data loaded!", {
      description: "You can step through and submit to view your partner dashboard immediately.",
    });
  };

  const handleSubmitApplication = async () => {
    if (!agreeTerms && !validateStep(5)) {
      setCurrentStep(5);
      return;
    }

    setIsSubmitting(true);
    try {
      const valKobo = Math.round(Number(declaredValueNaira || 0) * 100);

      const result = await partnerStore.registerPartnerApplication({
        businessName,
        businessType,
        cacNumber,
        address,
        city,
        state,
        country,
        companyEmail,
        companyPhone,
        website,
        description,
        logo: logoPreview || undefined,
        authorizedRepresentative: {
          fullName: repName,
          position: repPosition,
          email: repEmail,
          phone: repPhone,
        },
        documents: {
          cacCertificate: `https://secure-docs.raffila.internal/cac/${cacNumber.replace(/[^a-zA-Z0-9]/g, "")}.pdf`,
          proofOfAddress: `https://secure-docs.raffila.internal/utility/${city.toLowerCase()}-address.pdf`,
          additionalDocument: dealershipDocUploaded
            ? `https://secure-docs.raffila.internal/auth/partner-license.pdf`
            : undefined,
        },
        initialAsset: {
          name: assetName,
          category: assetCategory,
          description: assetDescription,
          declaredValueKobo: valKobo,
          location: assetLocation,
          condition: assetCondition,
          referenceNumber: referenceNumber || undefined,
          images: assetImages,
        },
      });

      // Auto sign-in or prepare session for this new partner
      const partnerUser = {
        id: result.partner.userId || `ptr_${result.partner.id}`,
        role: "partner" as const,
        firstName: repName.split(" ")[0] || "Partner",
        lastName: repName.split(" ").slice(1).join(" ") || "Admin",
        handle: businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .slice(0, 20),
        email: repEmail || companyEmail,
        phone: repPhone || companyPhone,
        avatarMonogram: businessName.slice(0, 2).toUpperCase(),
        verified: true,
        tagline: `${businessName} · Pending Review`,
        partnerId: result.partner.id,
        businessName: result.partner.businessName,
      };

      setFirebaseSession(partnerUser, true);

      setSubmittedPartner({
        id: result.partner.id,
        businessName: result.partner.businessName,
        email: repEmail || companyEmail,
      });

      toast.success("Application Submitted Successfully!", {
        description: `Welcome ${businessName}! Opening your Partner Dashboard...`,
      });

      // Display their partner dashboard directly
      navigate({ to: "/partner" });
    } catch (err: any) {
      toast.error("Application submission failed", {
        description: err.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated as a partner and has not chosen to register another
  if (
    isAuthenticated &&
    session?.user?.role === "partner" &&
    !bypassActiveCheck &&
    !submittedPartner
  ) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <Card className="rounded-[32px] border-0 bg-white p-8 ring-1 ring-ink/10 shadow-lg">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-coral/10 text-coral mb-4">
            <Building className="size-8" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink">Partner Account Active</h2>
          <p className="text-sm text-ink/70 mt-2 max-w-md mx-auto">
            You are currently signed in as{" "}
            <strong className="text-ink">{session.user.businessName || session.user.email}</strong>.
            Your partner dashboard is live and accessible.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-coral hover:bg-coral/90 text-white font-bold px-6"
            >
              <Link to="/partner">
                Go to Partner Dashboard <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full font-bold border-ink/20"
              onClick={() => setBypassActiveCheck(true)}
            >
              Register Another Partner Company
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render Confirmation Screen upon completion
  if (submittedPartner) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card className="rounded-[32px] border-0 bg-white p-8 ring-1 ring-ink/10 shadow-xl text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-mint/25 text-ink ring-8 ring-mint/10">
            <Check className="size-10 stroke-[2.5]" />
          </div>

          <Badge className="mt-6 rounded-full bg-lemon/30 border-0 text-ink px-4 py-1 text-xs font-bold">
            APPLICATION STATUS: PENDING COMPLIANCE REVIEW
          </Badge>

          <h1 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Welcome, {submittedPartner.businessName}
          </h1>

          <p className="mt-3 text-base text-ink/70 leading-relaxed max-w-lg mx-auto">
            Your partner onboarding application has been successfully submitted and logged into our
            secure compliance register. Reference:{" "}
            <span className="font-mono font-bold text-ink">{submittedPartner.id}</span>
          </p>

          <div className="mt-8 rounded-2xl bg-paper p-5 text-left ring-1 ring-ink/5 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 text-mint-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-ink">What happens next?</p>
                <p className="text-xs text-ink/65 mt-0.5 leading-relaxed">
                  Our compliance team reviews Corporate Affairs Commission (CAC) filings and asset
                  specifications within 24-48 hours. You will receive an official confirmation at{" "}
                  <span className="font-bold text-ink">{submittedPartner.email}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-coral shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-ink">Partner Portal Access</p>
                <p className="text-xs text-ink/65 mt-0.5 leading-relaxed">
                  Your account is active in preview mode. You can view your submitted asset, track
                  upcoming campaigns, and configure your settlement bank account.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="rounded-full px-8 h-12 text-sm font-bold shadow-md"
            >
              <Link to="/partner">
                Go to Partner Dashboard <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-6 h-12 text-sm font-bold border-ink/15"
            >
              <Link to="/">Back to Homepage</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-lilac/30 px-4 py-1.5 text-xs font-extrabold text-ink">
          <Building className="size-3.5 text-coral" />
          <span>Rafilla Asset Partner Program</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Register as an Asset Partner
        </h1>
        <p className="mt-2 text-sm text-ink/65 sm:text-base">
          Bring your luxury vehicles, real estate, electronics, or fine goods to Africa’s premier
          verified prize marketplace.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="mt-10 overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            const Icon = s.icon;

            return (
              <div key={s.id} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => s.id < currentStep && setCurrentStep(s.id)}
                  disabled={s.id > currentStep}
                  className={cn(
                    "flex items-center gap-2.5 text-left transition-all p-2 rounded-xl",
                    isCurrent
                      ? "bg-white ring-1 ring-coral/30 shadow-sm"
                      : isCompleted
                        ? "text-ink hover:bg-white/60 cursor-pointer"
                        : "text-ink/35 cursor-not-allowed",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-9 place-items-center rounded-xl font-bold text-xs shrink-0 transition-colors",
                      isCompleted
                        ? "bg-mint text-ink font-extrabold"
                        : isCurrent
                          ? "bg-coral text-white font-extrabold shadow-sm"
                          : "bg-ink/10 text-ink/50",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4 stroke-[3]" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">
                      Step 0{s.id}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-extrabold truncate",
                        isCurrent ? "text-ink" : "text-ink/75",
                      )}
                    >
                      {s.title}
                    </p>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      currentStep > s.id ? "bg-mint" : "bg-ink/10",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <Card className="mt-8 rounded-[32px] border-0 bg-white ring-1 ring-ink/10 shadow-lg overflow-hidden">
        <CardContent className="p-6 sm:p-10">
          {/* STEP 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink">
                    Business Information
                  </h2>
                  <p className="text-sm text-ink/60 mt-1">
                    Enter your registered legal entity details for Corporate Affairs Commission
                    (CAC) verification.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickFill}
                  className="rounded-full border-ink/20 font-bold text-xs self-start sm:self-auto bg-paper/60 hover:bg-white text-ink/75"
                >
                  <Sparkles className="size-3.5 mr-1.5 text-coral" /> Quick Demo Fill
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Company / Business Name *
                  </label>
                  <Input
                    placeholder="e.g. ABC Motors Limited"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.businessName && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Business Type / Industry *
                  </label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="h-12 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {BUSINESS_TYPES.map((bt) => (
                        <SelectItem key={bt} value={bt} className="font-bold text-sm py-2">
                          {bt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    RC / CAC Registration Number *
                  </label>
                  <Input
                    placeholder="e.g. RC-1849204"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.cacNumber && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.cacNumber && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.cacNumber}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Registered Business Address *
                  </label>
                  <Input
                    placeholder="Plot / Street number, Building, Area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.address && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    City / Town *
                  </label>
                  <Input
                    placeholder="e.g. Lagos, Abuja, Port Harcourt"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    State & Country *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                    />
                    <Input
                      placeholder="Country"
                      value={country}
                      disabled
                      className="h-12 rounded-xl border-ink/15 font-bold text-sm bg-cream/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Official Company Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="partners@company.example"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.companyEmail && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.companyEmail && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.companyEmail}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Official Phone Number *
                  </label>
                  <Input
                    placeholder="+234 803 000 0000"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.companyPhone && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.companyPhone && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.companyPhone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Company Website (Optional)
                  </label>
                  <Input
                    placeholder="https://company.example"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Business Profile & Track Record *
                  </label>
                  <Textarea
                    placeholder="Tell us about your brand, physical showroom / offices, and inventory background..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={cn(
                      "rounded-xl border-ink/15 font-bold text-sm",
                      errors.description && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Authorized Representative */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  Authorized Representative
                </h2>
                <p className="text-sm text-ink/60 mt-1">
                  The primary contact person legally authorized to represent the business on
                  Rafilla.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Full Legal Name *
                  </label>
                  <Input
                    placeholder="e.g. Michael Ade"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repName && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repName && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.repName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Designation / Title *
                  </label>
                  <Input
                    placeholder="e.g. Managing Director, Head of Commercial"
                    value={repPosition}
                    onChange={(e) => setRepPosition(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repPosition && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repPosition && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.repPosition}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Direct Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="rep@company.example"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repEmail && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repEmail && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.repEmail}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Direct Mobile Phone *
                  </label>
                  <Input
                    placeholder="+234 803 111 2233"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.repPhone && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.repPhone && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.repPhone}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Identification Document Type
                  </label>
                  <Select value={idType} onValueChange={setIdType}>
                    <SelectTrigger className="h-12 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="National Identity Number (NIN)">
                        NIN Slip / Card
                      </SelectItem>
                      <SelectItem value="International Passport">International Passport</SelectItem>
                      <SelectItem value="Driver's License">FRSC Driver's License</SelectItem>
                      <SelectItem value="Voter's Card">INEC Voter's Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    ID Reference Number (Optional)
                  </label>
                  <Input
                    placeholder="e.g. 11-digit NIN or Passport Number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Business Verification Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  Business Verification Documents
                </h2>
                <p className="text-sm text-ink/60 mt-1">
                  Upload corporate documents to satisfy Nigerian regulatory & KYC compliance.
                </p>
              </div>

              <div className="space-y-4">
                {/* CAC Certificate */}
                <div className="rounded-2xl border border-ink/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper/50">
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-coral/10 text-coral flex items-center justify-center shrink-0">
                      <FileCheck2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-ink">
                        Certificate of Incorporation (CAC) *
                      </p>
                      <p className="text-xs text-ink/50 mt-0.5">
                        PDF or scanned official certificate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cacDocUploaded ? (
                      <Badge className="bg-mint/30 border-0 text-ink text-xs font-bold px-3 py-1">
                        <Check className="size-3 mr-1 text-mint-700" /> Attached
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs font-bold border-coral text-coral"
                        onClick={() => setCacDocUploaded(true)}
                      >
                        <Upload className="size-3.5 mr-1" /> Upload CAC
                      </Button>
                    )}
                  </div>
                </div>

                {/* Proof of Address */}
                <div className="rounded-2xl border border-ink/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper/50">
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-sky/20 text-sky-700 flex items-center justify-center shrink-0">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-ink">Proof of Business Address *</p>
                      <p className="text-xs text-ink/50 mt-0.5">
                        Utility bill, tenancy agreement or bank statement (within 3 months)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {addressDocUploaded ? (
                      <Badge className="bg-mint/30 border-0 text-ink text-xs font-bold px-3 py-1">
                        <Check className="size-3 mr-1 text-mint-700" /> Attached
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs font-bold border-coral text-coral"
                        onClick={() => setAddressDocUploaded(true)}
                      >
                        <Upload className="size-3.5 mr-1" /> Upload Address Proof
                      </Button>
                    )}
                  </div>
                </div>

                {/* Supporting dealership/license */}
                <div className="rounded-2xl border border-ink/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper/50">
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-lemon/35 text-ink flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-ink">
                        Authorized Dealership / OEM License (Optional)
                      </p>
                      <p className="text-xs text-ink/50 mt-0.5">
                        Importer letter, distributor authorization, or franchise proof
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dealershipDocUploaded ? (
                      <Badge className="bg-mint/30 border-0 text-ink text-xs font-bold px-3 py-1">
                        <Check className="size-3 mr-1 text-mint-700" /> Attached
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs font-bold border-ink/20"
                        onClick={() => setDealershipDocUploaded(true)}
                      >
                        <Upload className="size-3.5 mr-1" /> Attach License
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-lilac/20 p-4 flex items-start gap-3 text-xs text-ink/75">
                  <Info className="size-4 text-coral shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-ink">Data Security Guarantee:</span> All
                    documents uploaded during partner registration are encrypted in transit and at
                    rest. They are only accessible by accredited compliance officers for
                    verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Asset Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  Initial Prize Asset Proposal
                </h2>
                <p className="text-sm text-ink/60 mt-1">
                  Propose your first asset to be listed on Rafilla once your partner account is
                  approved.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Asset Title / Model Name *
                  </label>
                  <Input
                    placeholder="e.g. 2026 Toyota Land Cruiser 300 VXR or 2-Bed Serviced Apartment"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.assetName && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.assetName && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.assetName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Category *
                  </label>
                  <Select value={assetCategory} onValueChange={setAssetCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {ASSET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="font-bold text-sm py-2">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Declared Retail / Market Value (₦ Naira) *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 15000000"
                    value={declaredValueNaira}
                    onChange={(e) => setDeclaredValueNaira(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.declaredValue && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {declaredValueNaira && Number(declaredValueNaira) > 0 && (
                    <p className="mt-1 text-xs font-extrabold text-coral">
                      {formatNaira(Number(declaredValueNaira) * 100)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Current Physical Location *
                  </label>
                  <Input
                    placeholder="e.g. Victoria Island Showroom, Lagos"
                    value={assetLocation}
                    onChange={(e) => setAssetLocation(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.assetLocation && "border-coral ring-1 ring-coral",
                    )}
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Condition *
                  </label>
                  <Select value={assetCondition} onValueChange={(v: any) => setAssetCondition(v)}>
                    <SelectTrigger className="h-12 rounded-xl border-ink/15 font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Brand new">
                        Brand new (Factory zero km / New Build)
                      </SelectItem>
                      <SelectItem value="Like new">Like new / Pristine condition</SelectItem>
                      <SelectItem value="Refurbished">Certified Pre-owned / Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Identification Reference / VIN / Serial Number (Optional)
                  </label>
                  <Input
                    placeholder="e.g. VIN-JTMEU39J2026-90412 or Property Deed Ref"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="h-12 rounded-xl border-ink/15 font-bold text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Asset Specifications & Detailed Description *
                  </label>
                  <Textarea
                    placeholder="Include trim level, technical specifications, warranty status, inclusions, and transfer conditions..."
                    value={assetDescription}
                    onChange={(e) => setAssetDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl border-ink/15 font-bold text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Security & Portal Login */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  Security & Portal Login
                </h2>
                <p className="text-sm text-ink/60 mt-1">
                  Create secure credentials to access your dedicated Partner Dashboard.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Login Email Address
                  </label>
                  <Input
                    value={repEmail || companyEmail || "partners@company.example"}
                    disabled
                    className="h-12 rounded-xl border-ink/15 font-bold text-sm bg-cream/30"
                  />
                  <p className="mt-1 text-xs text-ink/50">
                    This will be the administrator email for your partner account.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      className={cn(
                        "h-12 rounded-xl border-ink/15 font-bold text-sm pr-11",
                        errors.password && "border-coral ring-1 ring-coral",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink/65 block mb-1.5">
                    Confirm Password *
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl border-ink/15 font-bold text-sm",
                      errors.confirmPassword && "border-coral ring-1 ring-coral",
                    )}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-coral font-bold">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="sm:col-span-2 pt-2">
                  <div className="flex items-start gap-3 rounded-2xl bg-paper p-4 ring-1 ring-ink/5">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={(c) => setAgreeTerms(Boolean(c))}
                      className="mt-1 size-4 rounded-md"
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-ink/75 leading-relaxed cursor-pointer"
                    >
                      I confirm that I am legally authorized to submit this application on behalf of{" "}
                      <span className="font-bold text-ink">{businessName || "the business"}</span>,
                      and agree to the{" "}
                      <Link to="/terms-and-conditions" className="font-bold text-coral underline">
                        Raffila Partner Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy-policy" className="font-bold text-coral underline">
                        Privacy Policy
                      </Link>
                      . I understand that all assets require administrative approval before going
                      live.
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="mt-1.5 text-xs text-coral font-bold">{errors.agreeTerms}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Final Submission */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  Review Your Application
                </h2>
                <p className="text-sm text-ink/60 mt-1">
                  Please verify that all corporate details and asset specifications are accurate.
                </p>
              </div>

              <div className="space-y-4">
                {/* Business Box */}
                <div className="rounded-2xl border border-ink/10 p-5 bg-paper/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink/45">
                      Company Profile
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-coral hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-base font-extrabold text-ink">{businessName}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-ink/50 block">CAC Reg:</span>
                      <span className="font-bold text-ink">{cacNumber}</span>
                    </div>
                    <div>
                      <span className="text-ink/50 block">Industry:</span>
                      <span className="font-bold text-ink">{businessType}</span>
                    </div>
                    <div>
                      <span className="text-ink/50 block">Location:</span>
                      <span className="font-bold text-ink">
                        {city}, {state}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink/50 block">Company Email:</span>
                      <span className="font-bold text-ink truncate block">{companyEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Representative Box */}
                <div className="rounded-2xl border border-ink/10 p-5 bg-paper/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink/45">
                      Authorized Signatory
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-coral hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-base font-extrabold text-ink">
                    {repName} <span className="text-xs font-bold text-ink/50">({repPosition})</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-ink/50 block">Direct Contact Email:</span>
                      <span className="font-bold text-ink">{repEmail}</span>
                    </div>
                    <div>
                      <span className="text-ink/50 block">Direct Phone:</span>
                      <span className="font-bold text-ink">{repPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Initial Asset Box */}
                <div className="rounded-2xl border border-ink/10 p-5 bg-paper/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink/45">
                      Initial Prize Asset
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs font-bold text-coral hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-extrabold text-ink">{assetName}</p>
                      <p className="text-xs text-ink/60 mt-0.5">
                        {assetCategory} · {assetCondition} · Located in {assetLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink/50">Declared Value</p>
                      <p className="text-sm font-extrabold text-coral">
                        {formatNaira(Number(declaredValueNaira || 0) * 100)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-ink/10 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="rounded-full px-6 h-12 text-sm font-bold border-ink/20"
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleNext}
                className="rounded-full px-8 h-12 text-sm font-bold shadow-md ml-auto"
              >
                Continue to Step 0{currentStep + 1} <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="rounded-full px-10 h-12 text-sm font-bold shadow-md bg-coral text-white ml-auto"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Partner Application"}
                <Check className="size-4 ml-2 stroke-[2.5]" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
