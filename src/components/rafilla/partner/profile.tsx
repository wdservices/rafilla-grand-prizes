import { useState } from "react";
import { PartnerShell } from "./partner-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  UserCircle2,
  Building2,
  Landmark,
  FileCheck2,
  ShieldCheck,
  Upload,
  Save,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Eye,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Star,
  Crown,
  Award,
  Sparkles,
  Check,
  Camera,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

const BANKS = ["Zenith Bank", "GTBank", "Access Bank", "UBA", "First Bank", "Stanbic IBTC", "Wema Bank", "FCMB", "Fidelity", "Union Bank"];
const STATES = ["Lagos", "Abuja FCT", "Rivers", "Ogun", "Kano", "Kaduna", "Oyo", "Delta", "Edo", "Enugu", "Anambra", "Plateau", "Ondo"];

interface DocItem {
  id: string;
  label: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
  verified: boolean;
  updatedAt?: string;
}

export function PartnerProfilePage() {
  const [orgName, setOrgName] = useState("Lekki Luxury Autos Limited");
  const [rcNumber, setRcNumber] = useState("RC-1872456");
  const [taxId, setTaxId] = useState("24187642-0001");
  const [bizType, setBizType] = useState("Limited Liability Company");
  const [industry, setIndustry] = useState("Automotive / Luxury Assets");
  const [website, setWebsite] = useState("https://lekkiluxuryautos.ng");
  const [instagram, setInstagram] = useState("@lekkiluxuryautos");
  const [founded, setFounded] = useState("2018");
  const [employees, setEmployees] = useState("10-49");
  const [about, setAbout] = useState(
    "Premium luxury automobile dealer based in Victoria Island, Lagos. Specialising in Tokunbo and brand new vehicles, high-end watches, jewelry, and curated experiences for discerning Nigerian clients. In business since 2018 with 500+ successful deliveries nationwide."
  );
  const [address1, setAddress1] = useState("14A Adeyemi Lawson Street");
  const [address2, setAddress2] = useState("Victoria Island");
  const [city, setCity] = useState("Lagos");
  const [state, setState] = useState("Lagos");
  const [postal, setPostal] = useState("101241");
  const [cpTitle, setCpTitle] = useState("Mrs.");
  const [cpFirst, setCpFirst] = useState("Adaeze");
  const [cpLast, setCpLast] = useState("Okafor-Chukwu");
  const [cpRole, setCpRole] = useState("Managing Director / CEO");
  const [cpEmail, setCpEmail] = useState("adaeze@lekkiluxuryautos.ng");
  const [cpPhone, setCpPhone] = useState("+234 803 444 0077");
  const [cpDob, setCpDob] = useState("1988-03-14");
  const [bank, setBank] = useState("Zenith Bank");
  const [acctName, setAcctName] = useState("Lekki Luxury Autos Limited");
  const [acctNo, setAcctNo] = useState("101****7821");
  const [acctType, setAcctType] = useState("Current");
  const [bankCode, setBankCode] = useState("057");
  const [settlementDay, setSettlementDay] = useState("friday");
  const [minSettle, setMinSettle] = useState("500000");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [saving, setSaving] = useState<null | "org" | "cp" | "bank" | "docs" | "all">(null);

  const docs: DocItem[] = [
    { id: "cac", label: "CAC Certificate of Incorporation", required: true, uploaded: true, fileName: "CAC-RC1872456-cert.pdf", verified: true, updatedAt: "2026-03-14" },
    { id: "cac2", label: "CAC Forms (CAC2/CAC7)", required: true, uploaded: true, fileName: "CAC-forms-bundle.pdf", verified: true, updatedAt: "2026-03-14" },
    { id: "tax", label: "Tax Identification (TIN/JTB)", required: true, uploaded: true, fileName: "FIRS-TIN-24187642.pdf", verified: true, updatedAt: "2026-03-14" },
    { id: "id", label: "Director Valid ID (PVC/NIN/Passport)", required: true, uploaded: true, fileName: "Adaeze-Okafor-NIN-front-back.pdf", verified: true, updatedAt: "2026-03-14" },
    { id: "address", label: "Proof of Address (Utility / Lease)", required: true, uploaded: true, fileName: "Ikeja-Electric-bill-Mar-2026.pdf", verified: true, updatedAt: "2026-03-18" },
    { id: "bankletter", label: "Bank Confirmation Letter", required: true, uploaded: true, fileName: "Zenith-acct-conf-2026.pdf", verified: true, updatedAt: "2026-03-20" },
    { id: "refs1", label: "Trade Reference 1", required: false, uploaded: true, fileName: "Trade-Ref-Innoson-Motors.pdf", verified: true, updatedAt: "2026-03-20" },
    { id: "refs2", label: "Trade Reference 2", required: false, uploaded: false, verified: false },
    { id: "portfolio", label: "Portfolio / Catalogue", required: false, uploaded: true, fileName: "LLA-catalogue-2026-Q3.pdf", verified: false, updatedAt: "2026-07-02" },
  ];

  const verifiedCount = docs.filter((d) => d.verified).length;
  const uploadedCount = docs.filter((d) => d.uploaded).length;
  const requiredTotal = docs.filter((d) => d.required).length;
  const requiredDone = docs.filter((d) => d.required && d.verified).length;

  const save = (k: typeof saving) => {
    setSaving(k);
    setTimeout(() => {
      setSaving(null);
      toast.success(k === "all" ? "All changes published" : "Saved", { id: "sv" });
    }, 650);
  };

  return (
    <PartnerShell activeNav="profile" title="Profile">
      <div className="space-y-5 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              <UserCircle2 className="w-7 h-7 text-coral" /> Partner Profile
            </h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Manage Lekki Luxury Autos business information, settlement details, and documentation.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full">
              <Eye className="w-4 h-4 mr-2" /> Preview public page
            </Button>
            <Button className="rounded-full bg-coral hover:bg-coral/90 text-white" onClick={() => save("all")}>
              <Save className="w-4 h-4 mr-2" />
              {saving === "all" ? "Saving…" : "Save all changes"}
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden bg-gradient-to-br from-ink via-ink to-ink/90 text-cream border-ink">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-coral/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-mint/15 blur-3xl pointer-events-none" />
          <CardContent className="p-6 sm:p-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-coral/40 shadow-lg shadow-coral/10">
                  <AvatarFallback className="bg-coral text-white font-display text-3xl font-bold">
                    LL
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center shadow-md border-2 border-ink hover:bg-coral/90">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-2xl sm:text-3xl text-cream truncate">{orgName}</h2>
                  <Badge className="rounded-full bg-mint/40 text-ink border-mint font-bold">
                    <ShieldCheck className="w-3 h-3 mr-1" /> APPROVED PARTNER
                  </Badge>
                  <Badge className="rounded-full bg-coral text-white border-coral font-bold">
                    <Crown className="w-3 h-3 mr-1" /> GOLD TIER · #24
                  </Badge>
                </div>
                <div className="flex items-center gap-4 flex-wrap text-sm text-cream/70 font-body">
                  <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {rcNumber} · {bizType}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {city}, {state}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Partner since Mar 2026</span>
                </div>
                <div className="flex items-center gap-5 pt-2 flex-wrap">
                  {[
                    { k: "Lifetime earned", v: formatNaira(4824000000), t: "text-mint" },
                    { k: "Assets listed", v: "18", t: "text-coral" },
                    { k: "Listings delivered", v: "13", t: "text-lemon" },
                    { k: "Rating", v: "4.9 ★", t: "text-lemon" },
                  ].map((m) => (
                    <div key={m.k}>
                      <p className="text-[10px] uppercase tracking-wider text-cream/50 font-body">{m.k}</p>
                      <p className={`font-display text-lg font-bold ${m.t}`}>{m.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:max-w-xs w-full md:w-auto bg-cream/5 border border-cream/15 rounded-2xl p-4 space-y-3 backdrop-blur">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] uppercase tracking-wider text-cream/60 font-body flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3" /> KYC progress
                    </p>
                    <Badge className="rounded-full bg-mint/30 border-mint text-ink font-bold text-[10px]">
                      {requiredDone}/{requiredTotal} verified
                    </Badge>
                  </div>
                  <div className="h-2.5 bg-cream/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-mint via-coral to-lemon rounded-full transition-all" style={{ width: `${(requiredDone / requiredTotal) * 100}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-body">
                  <div className="p-2 rounded-xl bg-cream/5">
                    <p className="text-cream/50">Docs uploaded</p>
                    <p className="font-display font-bold text-cream text-base">{uploadedCount}/{docs.length}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-cream/5">
                    <p className="text-cream/50">Verified</p>
                    <p className="font-display font-bold text-mint text-base">{verifiedCount}</p>
                  </div>
                </div>
                {requiredDone === requiredTotal ? (
                  <p className="text-[11px] text-mint font-semibold flex items-center gap-1 font-body">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All required docs verified
                  </p>
                ) : (
                  <p className="text-[11px] text-lemon font-semibold flex items-center gap-1 font-body">
                    <Clock className="w-3.5 h-3.5" /> {requiredTotal - requiredDone} required pending
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-5">
            <Card className="border-ink/10">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-sky/20 text-sky border border-sky/30"><Building2 className="w-5 h-5" /></div>
                  <div>
                    <CardTitle className="font-display text-ink text-lg">Organisation details</CardTitle>
                    <CardDescription className="font-body text-sm">Public business information</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => save("org")}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> {saving === "org" ? "Saving…" : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Legal business name *</Label>
                  <Input className="rounded-xl" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">CAC / RC Number *</Label>
                  <Input className="rounded-xl font-mono" value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Tax ID (JTB/TIN) *</Label>
                  <Input className="rounded-xl font-mono" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Business type</Label>
                  <Select value={bizType} onValueChange={setBizType}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Limited Liability Company", "Business Name", "Public Company", "Sole Proprietorship", "Partnership", "Trust / NGO"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Industry / Category</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Automotive / Luxury Assets", "Real Estate / Property", "Electronics / Mobile", "Jewelry / Watches", "Home / Furniture", "Art / Collectibles", "Experiences / Travel", "Fashion / Luxury Goods"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Website</Label>
                  <Input className="rounded-xl font-mono" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Instagram handle</Label>
                  <Input className="rounded-xl font-mono" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Founded</Label>
                  <Input className="rounded-xl" value={founded} onChange={(e) => setFounded(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Team size</Label>
                  <Select value={employees} onValueChange={setEmployees}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1-9", "10-49", "50-99", "100-249", "250+"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">About the business</Label>
                  <Textarea rows={4} className="rounded-2xl resize-none" value={about} onChange={(e) => setAbout(e.target.value)} />
                  <p className="text-[11px] text-ink/40 font-body text-right">{about.length} / 2000</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-mint/30 text-ink border border-mint/40"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <CardTitle className="font-display text-ink text-lg">Registered address</CardTitle>
                    <CardDescription className="font-body text-sm">Used for verification & correspondence</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Street / Unit (line 1)</Label>
                  <Input className="rounded-xl" value={address1} onChange={(e) => setAddress1(e.target.value)} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Line 2 (optional)</Label>
                  <Input className="rounded-xl" value={address2} onChange={(e) => setAddress2(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">City</Label>
                  <Input className="rounded-xl" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Postal code</Label>
                  <Input className="rounded-xl font-mono w-full sm:w-56" value={postal} onChange={(e) => setPostal(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-coral/20 text-coral border border-coral/30"><UserCircle2 className="w-5 h-5" /></div>
                  <div>
                    <CardTitle className="font-display text-ink text-lg">Primary contact person</CardTitle>
                    <CardDescription className="font-body text-sm">Rafilla account owner & primary settlement authoriser</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => save("cp")}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> {saving === "cp" ? "Saving…" : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Title</Label>
                  <Select value={cpTitle} onValueChange={setCpTitle}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Mr.", "Mrs.", "Miss", "Ms.", "Dr.", "Chief", "Alh.", "Engr."].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">First name *</Label>
                  <Input className="rounded-xl" value={cpFirst} onChange={(e) => setCpFirst(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Last name *</Label>
                  <Input className="rounded-xl" value={cpLast} onChange={(e) => setCpLast(e.target.value)} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Role / Title</Label>
                  <Input className="rounded-xl" value={cpRole} onChange={(e) => setCpRole(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">DOB</Label>
                  <Input type="date" className="rounded-xl" value={cpDob} onChange={(e) => setCpDob(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body flex items-center gap-1"><Mail className="w-3 h-3" /> Email *</Label>
                  <Input className="rounded-xl font-mono" value={cpEmail} onChange={(e) => setCpEmail(e.target.value)} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body flex items-center gap-1"><Phone className="w-3 h-3" /> Phone number *</Label>
                  <Input className="rounded-xl font-mono" value={cpPhone} onChange={(e) => setCpPhone(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <Card className="border-ink/10">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-mint/30 text-ink border border-mint/40"><Landmark className="w-5 h-5" /></div>
                  <div>
                    <CardTitle className="font-display text-ink text-lg">Bank & settlement</CardTitle>
                    <CardDescription className="font-body text-sm">All payouts go here · verified by bank letter</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => save("bank")}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> {saving === "bank" ? "Saving…" : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="p-3 rounded-xl bg-mint/10 border border-mint/30 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-mint shrink-0" />
                  <p className="text-xs text-ink/80 font-body">
                    <span className="font-bold">Verified.</span> Bank letter on file confirms account name matches RC {rcNumber}.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Depository bank *</Label>
                  <Select value={bank} onValueChange={setBank}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Sort / CBN code</Label>
                  <Input className="rounded-xl font-mono" value={bankCode} onChange={(e) => setBankCode(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Account name (as per bank) *</Label>
                  <Input className="rounded-xl" value={acctName} onChange={(e) => setAcctName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Account no *</Label>
                    <Input className="rounded-xl font-mono" value={acctNo} onChange={(e) => setAcctNo(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-ink/60 font-body">Type</Label>
                    <Select value={acctType} onValueChange={setAcctType}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Current", "Savings", "Corporate", "Domiciliary (USD)", "Domiciliary (GBP)"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator className="bg-ink/10" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink/60 font-body mb-2">Settlement preferences</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-cream/50">
                      <div>
                        <p className="font-body text-sm text-ink font-semibold">Settlement day</p>
                        <p className="text-[11px] text-ink/50 font-body">Weekly disbursement date</p>
                      </div>
                      <Select value={settlementDay} onValueChange={setSettlementDay}>
                        <SelectTrigger className="rounded-full w-36 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["monday", "tuesday", "wednesday", "thursday", "friday"].map((d) => <SelectItem key={d} value={d}>{d[0]!.toUpperCase() + d.slice(1)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-cream/50">
                      <div>
                        <p className="font-body text-sm text-ink font-semibold">Minimum settlement</p>
                        <p className="text-[11px] text-ink/50 font-body">Accumulate until this amount</p>
                      </div>
                      <div className="relative w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">₦</span>
                        <Input className="rounded-full pl-7 pr-3 text-right font-display font-semibold h-9" value={minSettle} onChange={(e) => setMinSettle(e.target.value.replace(/[^\d]/g, ""))} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-lilac/20 text-lilac border border-lilac/30"><Sparkles className="w-5 h-5" /></div>
                  <div>
                    <CardTitle className="font-display text-ink text-lg">Notifications</CardTitle>
                    <CardDescription className="font-body text-sm">Where should we reach you?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {[
                  { id: "ne", k: notifyEmail, s: setNotifyEmail, l: "Email alerts", d: "Settlement, listing, approvals", i: <Mail className="w-4 h-4" /> },
                  { id: "ns", k: notifySms, s: setNotifySms, l: "SMS text alerts", d: "Time-sensitive draw & payout events", i: <Phone className="w-4 h-4" /> },
                  { id: "nw", k: notifyWhatsapp, s: setNotifyWhatsapp, l: "WhatsApp alerts", d: "Weekly summary + instant draws", i: <Award className="w-4 h-4" /> },
                  { id: "nm", k: marketing, s: setMarketing, l: "Marketing & opportunities", d: "Exclusive partner promos & campaigns", i: <Star className="w-4 h-4" /> },
                ].map((n) => (
                  <div key={n.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream/40 border border-ink/5 hover:border-coral/30 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${n.k ? "bg-coral/20 text-coral" : "bg-ink/5 text-ink/40"}`}>{n.i}</div>
                      <div className="min-w-0">
                        <p className="font-body text-sm text-ink font-semibold">{n.l}</p>
                        <p className="text-[11px] text-ink/50 font-body truncate">{n.d}</p>
                      </div>
                    </div>
                    <Switch checked={n.k} onCheckedChange={n.s} className="data-[state=checked]:bg-coral" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-lemon/30 text-ink border border-lemon/40"><FileCheck2 className="w-5 h-5" /></div>
                  <div>
                    <CardTitle className="font-display text-ink text-lg">Legal documentation</CardTitle>
                    <CardDescription className="font-body text-sm">
                      {verifiedCount} of {docs.length} verified · {uploadedCount} uploaded
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="p-3 rounded-xl border border-ink/10 hover:border-ink/20 transition flex items-start gap-3 group">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      d.verified ? "bg-mint/30 text-ink" : d.uploaded ? "bg-lemon/30 text-ink" : "bg-ink/5 text-ink/40"
                    }`}>
                      {d.verified ? <CheckCircle2 className="w-4 h-4 text-mint" /> : d.uploaded ? <Clock className="w-4 h-4 text-lemon" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-body text-sm text-ink font-semibold">{d.label}</p>
                        {d.required ? (
                          <Badge className="rounded-full bg-coral/15 text-coral border-coral/30 text-[9px] font-bold">REQUIRED</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full text-[9px] bg-ink/5 text-ink/60 border-ink/15">OPTIONAL</Badge>
                        )}
                        {d.verified && (
                          <Badge className="rounded-full bg-mint/40 text-ink border-mint text-[9px] font-bold">
                            <Check className="w-2.5 h-2.5 mr-0.5" /> VERIFIED
                          </Badge>
                        )}
                      </div>
                      {d.uploaded && d.fileName && (
                        <p className="text-[11px] text-ink/60 font-mono mt-0.5 truncate">
                          📎 {d.fileName}
                          {d.updatedAt && <span className="text-ink/40 ml-2">· {d.updatedAt}</span>}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {d.uploaded ? (
                        <>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-ink/50 hover:text-coral">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-ink/50 hover:text-coral">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast.success(`Upload dialog: ${d.label}`)}>
                          <Upload className="w-3 h-3 mr-1" /> Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Separator className="my-2 bg-ink/10" />
                <button className="w-full p-3 rounded-xl border-2 border-dashed border-ink/20 hover:border-coral hover:bg-coral/5 transition flex items-center justify-center gap-2 text-ink/50 hover:text-coral text-sm font-body">
                  <Upload className="w-4 h-4" /> Upload additional document
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PartnerShell>
  );
}
