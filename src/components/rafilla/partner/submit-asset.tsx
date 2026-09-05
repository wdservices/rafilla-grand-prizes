import { useState } from "react";
import { PartnerShell } from "./partner-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Upload,
  ImagePlus,
  FileVideo,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Plus,
  Camera,
  Info,
  Car,
  Watch,
  Smartphone,
  Gem,
  Sofa,
  Laptop,
  ShieldCheck,
  Clock,
  FileCheck,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;
type Category = "Auto" | "Watches" | "Jewelry" | "Electronics" | "Real Estate" | "Home" | "Art" | "Experiences";

const CATEGORIES: Category[] = ["Auto", "Watches", "Jewelry", "Electronics", "Real Estate", "Home", "Art", "Experiences"];
const CAT_ICON: Record<Category, React.ReactNode> = {
  Auto: <Car className="w-5 h-5" />,
  Watches: <Watch className="w-5 h-5" />,
  Jewelry: <Gem className="w-5 h-5" />,
  Electronics: <Smartphone className="w-5 h-5" />,
  "Real Estate": <Gem className="w-5 h-5" />,
  Home: <Sofa className="w-5 h-5" />,
  Art: <Gem className="w-5 h-5" />,
  Experiences: <Sparkles className="w-5 h-5" />,
};
const CONDITIONS = ["Brand New", "Brand New (Sealed)", "Like New (0-6 months)", "Excellent (6-18 months)", "Good (1-3 years)", "Used (3+ years)", "Certified Pre-Owned"];

interface MediaSlot {
  id: number;
  url: string | null;
  primary: boolean;
}

export function PartnerSubmitAssetPage() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState<Category | "">("");
  const [assetName, setAssetName] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<string>("");
  const [serialNo, setSerialNo] = useState("");
  const [marketValue, setMarketValue] = useState<string>("");
  const [media, setMedia] = useState<MediaSlot[]>([
    { id: 0, url: null, primary: true },
    { id: 1, url: null, primary: false },
    { id: 2, url: null, primary: false },
    { id: 3, url: null, primary: false },
    { id: 4, url: null, primary: false },
  ]);
  const [moreSlots, setMoreSlots] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [agreeAssign, setAgreeAssign] = useState(false);
  const [agreeIndemnity, setAgreeIndemnity] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);

  const steps = [
    { n: 1, title: "Asset details", desc: "Category, name, value" },
    { n: 2, title: "Upload media", desc: "Photos & 360° video" },
    { n: 3, title: "Terms", desc: "Assignment & indemnity" },
    { n: 4, title: "Review", desc: "Submit for approval" },
  ];

  const setSlot = (id: number, patch: Partial<MediaSlot>) => {
    setMedia(media.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };
  const addSlot = () => {
    setMedia([...media, { id: media.length + moreSlots, url: null, primary: false }]);
    setMoreSlots(moreSlots + 1);
  };

  const allMedia = media;
  const filledSlots = media.filter((m) => m.url).length;
  const marketValueKobo = parseInt(marketValue || "0") * 100;

  const goNext = () => {
    if (step === 1 && (!category || !assetName || !marketValue || !condition)) {
      toast.error("Fill category, name, market value and condition");
      return;
    }
    if (step === 2 && filledSlots < 1) {
      toast.error("Upload at least 1 primary image");
      return;
    }
    if (step === 3 && (!agreeAssign || !agreeIndemnity || !agreeTos)) {
      toast.error("You must agree to all terms");
      return;
    }
    setStep((s) => Math.min(4, (s + 1)) as Step);
  };
  const goBack = () => setStep((s) => Math.max(1, (s - 1)) as Step);

  const doSubmit = () => {
    toast.loading("Submitting asset for review...", { id: "sub" });
    setTimeout(() => {
      toast.success("Asset submitted — awaiting approval within 24h", { id: "sub" });
      setSubmitted(true);
    }, 900);
  };

  if (submitted) {
    return (
      <PartnerShell activeNav="submit" title="Submit asset">
        <div className="max-w-2xl mx-auto my-8">
          <Card className="border-mint bg-mint/5">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-mint/30 flex items-center justify-center text-coral border-4 border-mint/40">
                <CheckCircle2 className="w-10 h-10 text-coral" />
              </div>
              <div>
                <h2 className="font-display text-3xl text-ink mb-1">Pending review ✅</h2>
                <p className="font-body text-ink/60">
                  Your asset has been submitted successfully. Rafilla team will review within 24 hours.
                </p>
              </div>
              <Card className="bg-paper border-ink/10 text-left">
                <CardContent className="p-5 space-y-2 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-ink/50">Asset</span>
                    <span className="font-semibold text-ink">{assetName || "Your new asset"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">Category</span>
                    <Badge variant="outline" className="rounded-full">{category || "—"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">Market value</span>
                    <span className="font-display font-bold text-coral">{formatNaira(marketValueKobo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">Media uploaded</span>
                    <span className="font-semibold">{filledSlots} images{videoUrl ? " + 360 video" : ""}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-ink/50">Submission ID</span>
                    <span className="font-mono text-ink/70">LST-PENDING-{String(Math.floor(Math.random() * 900000) + 100000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">Est. review</span>
                    <span className="flex items-center gap-1 text-ink font-semibold">
                      <Clock className="w-3.5 h-3.5 text-coral" /> 24 hours
                    </span>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="rounded-full">
                  <FileCheck className="w-4 h-4 mr-2" /> Go to My listings
                </Button>
                <Button
                  className="rounded-full bg-coral hover:bg-coral/90 text-white"
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                    setAssetName("");
                    setCategory("");
                    setMarketValue("");
                    setCondition("");
                    setDescription("");
                    setSerialNo("");
                    setVideoUrl("");
                    setMedia(Array.from({ length: 5 }).map((_, i) => ({ id: i, url: null, primary: i === 0 })));
                    setAgreeAssign(false);
                    setAgreeIndemnity(false);
                    setAgreeTos(false);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Submit another asset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PartnerShell>
    );
  }

  return (
    <PartnerShell activeNav="submit" title="Submit asset">
      <div className="space-y-5 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              <Upload className="w-7 h-7 text-coral" /> Submit new asset
            </h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Average approval time · 6.2 hours · 94% success rate for approved partners.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full bg-mint/20 border-mint text-ink">
            <ShieldCheck className="w-3 h-3 mr-1" /> Approved partner
          </Badge>
        </div>

        <Card className="border-ink/10 overflow-hidden">
          <CardHeader className="bg-cream/50 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {steps.map((s, i) => {
                const done = step > s.n;
                const active = step === s.n;
                return (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 text-sm font-display font-bold transition ${
                      done ? "bg-mint/40 border-mint text-ink"
                      : active ? "bg-coral border-coral text-white shadow-md shadow-coral/30"
                      : "bg-paper border-ink/15 text-ink/40"
                    }`}>
                      {done ? <CheckCheck className="w-4 h-4" /> : s.n}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <p className={`font-display text-sm leading-tight ${active || done ? "text-ink" : "text-ink/40"}`}>
                        {s.title}
                      </p>
                      <p className="text-[11px] text-ink/40 font-body">{s.desc}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`hidden sm:block h-0.5 flex-1 mt-4 ${done ? "bg-mint" : "bg-ink/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-8">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-4 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">
                      Category <span className="text-coral">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                            category === c
                              ? "bg-coral/10 border-coral text-ink ring-2 ring-coral/30"
                              : "bg-paper border-ink/15 hover:border-ink/30 text-ink/70"
                          }`}
                          onClick={() => setCategory(c)}
                        >
                          <span className={`p-1.5 rounded-lg ${category === c ? "bg-coral text-white" : "bg-cream"}`}>
                            {CAT_ICON[c]}
                          </span>
                          <span className="font-body font-semibold text-sm">{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">
                        Asset name / title <span className="text-coral">*</span>
                      </Label>
                      <Input
                        className="rounded-xl"
                        placeholder="e.g. 2024 Lexus RX 350 F-Sport (Foreign Used)"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">
                        Market value (₦) <span className="text-coral">*</span>
                      </Label>
                      <Input
                        className="rounded-xl font-display text-lg"
                        placeholder="48,500,000"
                        value={marketValue}
                        onChange={(e) => setMarketValue(e.target.value.replace(/[^\d]/g, ""))}
                      />
                      {marketValue && (
                        <p className="text-xs text-ink/50 font-body">= {formatNaira(marketValueKobo)} · 85% payout share</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">
                        Condition <span className="text-coral">*</span>
                      </Label>
                      <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">
                        Serial / VIN / Chassis no
                      </Label>
                      <Input
                        className="rounded-xl font-mono"
                        placeholder="JTJBM7FX9F5******"
                        value={serialNo}
                        onChange={(e) => setSerialNo(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">
                        Description
                      </Label>
                      <Textarea
                        rows={4}
                        className="rounded-2xl resize-none"
                        placeholder="Highlight key specifications, any defects, service history, proof of ownership docs available..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <p className="text-[11px] text-ink/40 font-body text-right">{description.length} / 2000</p>
                    </div>
                  </div>
                </div>

                <aside className="md:col-span-2 space-y-4">
                  <Card className="bg-coral/5 border-coral/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-coral" />
                        <p className="font-display text-ink font-bold text-sm">Valuation tips</p>
                      </div>
                      <ul className="text-xs font-body text-ink/70 space-y-1.5 list-disc list-inside">
                        <li>Set fair market value — underpricing increases entries but reduces yield</li>
                        <li>Use verified sources (Jiji, Cheki, manufacturers)</li>
                        <li>Our team audits every listing before going LIVE</li>
                        <li>Average approval: <span className="font-bold text-ink">6.2h</span> for complete submissions</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-ink/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-ink text-base">Estimated listing preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-sky/25 via-coral/15 to-lemon/25 flex items-center justify-center">
                        {category ? CAT_ICON[category] : <Camera className="w-10 h-10 text-ink/20" />}
                      </div>
                      <p className="font-display text-ink text-lg leading-tight">{assetName || "Your asset title"}</p>
                      <div className="flex items-center justify-between text-xs font-body">
                        <span className="text-ink/50">{category || "Category"}</span>
                        <Badge variant="outline" className="rounded-full bg-cream">
                          {condition || "Condition"}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-ink/50 uppercase tracking-wider font-body">Market value</p>
                        <p className="font-display text-coral font-bold text-xl">
                          {marketValue ? formatNaira(marketValueKobo) : "—"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-display text-ink text-xl">Upload media</h3>
                    <p className="font-body text-ink/60 text-sm">
                      {filledSlots}/5+ images uploaded. First image = primary thumbnail.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-cream">
                    <ImagePlus className="w-3 h-3 mr-1" /> Min: 1 image · Max: 15
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {allMedia.map((m, idx) => (
                    <div key={m.id} className="group relative">
                      {m.url ? (
                        <div
                          className={`aspect-square rounded-2xl bg-gradient-to-br ${
                            idx === 0 ? "from-coral/30 via-lemon/20 to-sky/20"
                            : idx === 1 ? "from-mint/30 via-sky/15 to-lilac/20"
                            : idx === 2 ? "from-lemon/30 via-coral/15 to-mint/15"
                            : idx === 3 ? "from-sky/30 via-lilac/15 to-coral/15"
                            : "from-lilac/30 via-cream to-coral/10"
                          } border-2 flex items-center justify-center p-4 relative overflow-hidden ${
                            m.primary ? "border-coral ring-2 ring-coral/30" : "border-ink/10"
                          }`}
                        >
                          <div className={`p-3 rounded-xl bg-paper/70 backdrop-blur ${idx === 0 ? "text-coral" : idx === 1 ? "text-sky" : "text-ink/70"}`}>
                            <Camera className="w-8 h-8" />
                          </div>
                          {m.primary && (
                            <Badge className="absolute top-2 left-2 rounded-full bg-coral text-white border-coral text-[10px] font-bold">
                              PRIMARY
                            </Badge>
                          )}
                          <button
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/80 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                            onClick={() => setSlot(m.id, { url: null })}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {!m.primary && (
                            <button
                              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-paper/90 border border-ink/10 rounded-full px-2 py-0.5 font-body font-semibold text-ink/70 opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                              onClick={() => {
                                setMedia(allMedia.map((mm) => ({ ...mm, primary: mm.id === m.id })));
                              }}
                            >
                              Set as primary
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          className="aspect-square rounded-2xl border-2 border-dashed border-ink/20 hover:border-coral hover:bg-coral/5 transition flex flex-col items-center justify-center gap-2 text-ink/40 hover:text-coral"
                          onClick={() => setSlot(m.id, { url: `https://placeholder/${idx}` })}
                        >
                          <ImagePlus className="w-7 h-7" />
                          <span className="text-[11px] font-body font-semibold uppercase tracking-wider">
                            {idx === 0 ? "Primary image" : "Add image"}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                  {allMedia.length < 15 && (
                    <button
                      className="aspect-square rounded-2xl border-2 border-dashed border-ink/10 hover:border-coral/50 hover:bg-coral/5 transition flex flex-col items-center justify-center gap-1.5 text-ink/30 hover:text-coral/70"
                      onClick={addSlot}
                    >
                      <Plus className="w-7 h-7" />
                      <span className="text-[10px] font-body font-semibold uppercase tracking-wider">Add more</span>
                    </button>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card className="border-ink/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-ink text-base flex items-center gap-2">
                        <FileVideo className="w-4 h-4 text-coral" /> 360° video walkaround
                      </CardTitle>
                      <CardDescription className="font-body text-xs">
                        Optional but <span className="font-bold text-ink">boosts entries by 42%</span>. YouTube, Vimeo, or Cloudinary URL.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        className="rounded-xl"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                      {videoUrl && (
                        <div className="mt-3 aspect-video rounded-xl bg-ink/90 flex items-center justify-center text-cream/70">
                          <div className="text-center">
                            <FileVideo className="w-12 h-12 mx-auto mb-2 text-coral" />
                            <p className="font-body text-sm">360° video preview (mock embed)</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="bg-mint/5 border-mint/30">
                    <CardContent className="p-5 space-y-3 text-sm font-body">
                      <h4 className="font-display text-ink font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-mint" /> Media checklist
                      </h4>
                      <ul className="space-y-1.5 text-ink/70 text-xs">
                        <li className={filledSlots >= 1 ? "text-mint" : ""}>
                          {filledSlots >= 1 ? "✓" : "○"} At least 1 primary image
                        </li>
                        <li className={filledSlots >= 5 ? "text-mint" : ""}>
                          {filledSlots >= 5 ? "✓" : "○"} 5+ angles (front/side/back/engine/odometer)
                        </li>
                        <li className={serialNo ? "text-mint" : ""}>
                          {serialNo ? "✓" : "○"} Serial / VIN photo included
                        </li>
                        <li className={videoUrl ? "text-mint" : ""}>
                          {videoUrl ? "✓" : "○"} 360° walkaround video
                        </li>
                        <li className="text-mint">✓ Min 1200×1200 resolution (auto-checked)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-3xl mx-auto space-y-5">
                <h3 className="font-display text-ink text-2xl">Agree to terms</h3>
                <p className="font-body text-ink/60 text-sm">
                  Legal contracts between Lekki Luxury Autos and Rafilla Grand Prizes Ltd.
                </p>
                <Card className="bg-cream/40 border-ink/10">
                  <CardContent className="p-6 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <Checkbox id="t1" checked={agreeAssign} onCheckedChange={(v) => setAgreeAssign(!!v)} className="mt-1 h-5 w-5 rounded-full" />
                      <div>
                        <p className="font-body font-semibold text-ink text-sm group-has-[:checked]:text-coral transition">
                          Asset Assignment & Transfer of Ownership
                        </p>
                        <p className="text-xs text-ink/60 font-body mt-0.5 leading-relaxed">
                          I irrevocably assign full legal and equitable ownership of the asset (
                          <span className="font-bold text-ink">{assetName || "listed asset"}</span>)
                          to Rafilla Grand Prizes Ltd. upon draw completion. I warrant I hold unencumbered title
                          and will execute all transfer documentation within 48 hours of winner notification.
                        </p>
                      </div>
                    </label>
                    <Separator className="bg-ink/10" />
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <Checkbox id="t2" checked={agreeIndemnity} onCheckedChange={(v) => setAgreeIndemnity(!!v)} className="mt-1 h-5 w-5 rounded-full" />
                      <div>
                        <p className="font-body font-semibold text-ink text-sm group-has-[:checked]:text-coral transition">
                          Indemnity & Accuracy Undertaking
                        </p>
                        <p className="text-xs text-ink/60 font-body mt-0.5 leading-relaxed">
                          I indemnify and hold harmless Rafilla Grand Prizes Ltd., its employees, winners, and
                          partners from any claim relating to misrepresentation of asset condition, undisclosed
                          liens, odometer tampering, or counterfeit goods. I agree all submitted information is
                          true to the best of my knowledge.
                        </p>
                      </div>
                    </label>
                    <Separator className="bg-ink/10" />
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <Checkbox id="t3" checked={agreeTos} onCheckedChange={(v) => setAgreeTos(!!v)} className="mt-1 h-5 w-5 rounded-full" />
                      <div>
                        <p className="font-body font-semibold text-ink text-sm group-has-[:checked]:text-coral transition">
                          Partner Agreement & Settlement Terms
                        </p>
                        <p className="text-xs text-ink/60 font-body mt-0.5 leading-relaxed">
                          I acknowledge the <span className="font-bold text-ink">5% platform fee</span> and
                          <span className="font-bold text-ink"> 85% partner share</span> structure (10% prize pool).
                          Weekly disbursements every Friday via bank transfer to account on file. I have read and
                          agree to the Rafilla Partner Terms v3.2.
                        </p>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="max-w-3xl mx-auto space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-coral/15 flex items-center justify-center text-coral border-4 border-coral/30 mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-ink text-2xl">Review & submit</h3>
                  <p className="font-body text-ink/60 text-sm mt-1">
                    Double-check everything. Once submitted, editing is locked until reviewed.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="md:col-span-2 border-ink/10 bg-gradient-to-br from-cream/70 to-paper">
                    <CardContent className="p-5">
                      <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-coral/25 via-lemon/20 to-sky/25 flex items-center justify-center mb-4 overflow-hidden relative">
                        {category && <div className="p-4 rounded-2xl bg-paper/60 backdrop-blur text-coral">{CAT_ICON[category as Category]}</div>}
                        {Array.from({ length: Math.min(filledSlots, 4) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl absolute border-4 border-paper shadow-lg"
                            style={{
                              transform: `rotate(${(i - 1.5) * 4}deg) translate(${i * 22 - 33}%, ${i * 12 - 18}%)`,
                              background: [
                                "linear-gradient(135deg, #f7b6a0, #ffd8a8)",
                                "linear-gradient(135deg, #a8e6cf, #88d8b0)",
                                "linear-gradient(135deg, #85c1e9, #aed6f1)",
                                "linear-gradient(135deg, #d2b4de, #e8daef)",
                              ][i],
                              opacity: 0.95,
                            }}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">Asset name</p>
                          <p className="font-body font-semibold text-ink text-sm">{assetName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">Category</p>
                          <p className="font-body font-semibold text-ink text-sm">{category || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">Condition</p>
                          <p className="font-body font-semibold text-ink text-sm">{condition || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body">Market value</p>
                          <p className="font-display font-bold text-coral">{marketValue ? formatNaira(marketValueKobo) : "—"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-ink/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-ink text-base">Settlement breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm font-body">
                      <div className="flex justify-between"><span className="text-ink/60">Ticket value</span><span className="font-semibold">{marketValue ? formatNaira(marketValueKobo) : "—"}</span></div>
                      <div className="flex justify-between"><span className="text-ink/60">Platform fee (5%)</span><span className="text-ink/70">- {marketValue ? formatNaira(Math.floor(marketValueKobo * 0.05)) : "—"}</span></div>
                      <div className="flex justify-between"><span className="text-ink/60">Prize pool (10%)</span><span className="text-ink/70">- {marketValue ? formatNaira(Math.floor(marketValueKobo * 0.1)) : "—"}</span></div>
                      <Separator />
                      <div className="flex justify-between bg-mint/20 -mx-2 -mb-2 px-2 py-2 rounded-xl">
                        <span className="font-bold text-ink">Partner share (85%)</span>
                        <span className="font-display font-bold text-coral text-lg">
                          {marketValue ? formatNaira(Math.floor(marketValueKobo * 0.85)) : "—"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-mint/5 border-mint/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-ink text-base flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-mint" /> Submission summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm font-body space-y-1.5 text-ink/70">
                      <div className="flex justify-between"><span>Media:</span><span className="font-semibold text-ink">{filledSlots} images{videoUrl ? " + 360 video" : ""}</span></div>
                      <div className="flex justify-between"><span>Serial/VIN:</span><span className="font-mono text-ink">{serialNo || "—"}</span></div>
                      <div className="flex justify-between"><span>Terms:</span><span className="text-mint font-semibold">✓ Accepted</span></div>
                      <div className="flex justify-between"><span>Partner tier:</span><Badge variant="outline" className="rounded-full bg-mint/30 border-mint">Approved</Badge></div>
                      <div className="flex justify-between"><span>Est. approval:</span><span className="font-semibold text-coral">6.2 hours</span></div>
                      <div className="flex justify-between"><span>Quality score:</span><span className="font-display font-bold text-mint">A+</span></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-cream/40 border-t border-ink/10 flex-col sm:flex-row sm:justify-between gap-3 p-5">
            <div className="text-xs font-body text-ink/50 flex items-center gap-2">
              <Circle className="w-3 h-3 fill-coral text-coral" />
              Step {step} of 4
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="rounded-full flex-1 sm:flex-none"
                onClick={goBack}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {step < 4 ? (
                <Button className="rounded-full flex-1 sm:flex-none bg-coral hover:bg-coral/90 text-white" onClick={goNext}>
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button className="rounded-full flex-1 sm:flex-none bg-coral hover:bg-coral/90 text-white" onClick={doSubmit}>
                  <Send className="w-4 h-4 mr-2" /> Submit for approval
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </PartnerShell>
  );
}
