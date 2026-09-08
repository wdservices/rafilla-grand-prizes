import { useState } from "react";
import { AdminShell } from "./admin-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Download,
  FileText,
  Plus,
  Tag,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Wallet,
  Ticket,
  Trophy,
  Clock,
  MessageSquare,
  Tag as TagIcon,
  ChevronRight,
  Star,
  Crown,
  Gift,
  Handshake,
  Target,
  Filter,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

type ContactTag = "Prospect" | "Player" | "Winner" | "VIP" | "Partner" | "At-risk" | "Pending KYC" | "Referred";
type Classification = "Cold" | "Warm" | "Hot" | "Champion";

interface CRMNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  tag: "note" | "call" | "email" | "meeting";
}

interface CRMActivity {
  id: string;
  timestamp: string;
  type: "ticket_buy" | "win" | "wallet_fund" | "referral" | "login" | "kyc_submit" | "suspend" | "note";
  detail: string;
  valueKobo?: number;
}

interface Contact {
  id: string;
  name: string;
  initials: string;
  tint: string;
  email: string;
  phone: string;
  username: string;
  address: string;
  state: string;
  registeredAt: string;
  lastActive: string;
  tags: ContactTag[];
  classification: Classification;
  entriesTotal: number;
  spentTotalKobo: number;
  walletKobo: number;
  wins: number;
  referrals: number;
  level: number;
  notes: CRMNote[];
  activity: CRMActivity[];
  assignedTo: string;
  rating: number;
}

const FIRST = ["Amaka", "Tunde", "Funmi", "Chidi", "Sade", "Kemi", "Bola", "Ifeoma", "Dele", "Zainab", "Emeka", "Ngozi", "Seun", "Tobi", "Wale", "Aisha", "Musa", "Ebi", "Dapo", "Rita", "Jide", "Tola", "Uche", "Temitope", "Kunle"];
const LAST = ["Okafor", "Bakare", "Adeyemi", "Eze", "Lawal", "Hassan", "Tinubu", "Dike", "Ogun", "Aliyu", "Nwosu", "Obi", "Adeyinka", "Balogun", "Olayiwola", "Musa", "Sani", "Abubakar", "Okoro", "Ezeigbo", "Ogunleye", "Adewale", "Ibrahim", "Abdullahi", "Chukwu"];
const STATES = ["Lagos", "Abuja", "Rivers", "Ogun", "Kano", "Kaduna", "Oyo", "Delta", "Edo", "Enugu", "Anambra", "Plateau"];
const TINTS = ["coral", "mint", "lemon", "sky", "lilac"];
const TAG_POOL: ContactTag[] = ["Prospect", "Player", "Winner", "VIP", "Partner", "At-risk", "Pending KYC", "Referred"];
const CLS: Classification[] = ["Cold", "Warm", "Hot", "Champion"];
const AGENTS = ["Gloria (CRM)", "David (Sales)", "Chioma (Support)", "Kingsley (Success)", "Unassigned"];

const now = Date.now();

function mkContact(i: number): Contact {
  const first = FIRST[i % FIRST.length]!;
  const last = LAST[(i * 3) % LAST.length]!;
  const tagCount = 1 + (i % 3);
  const tags: ContactTag[] = [];
  for (let t = 0; t < tagCount; t++) {
    const picked = TAG_POOL[(i * 2 + t * 5) % TAG_POOL.length]!;
    if (!tags.includes(picked)) tags.push(picked);
  }
  const notes: CRMNote[] = Array.from({ length: 2 + (i % 3) }, (_, n) => ({
    id: `note-${i}-${n}`,
    author: AGENTS[(i + n) % AGENTS.length]!,
    timestamp: new Date(now - (n * 3 + i) * 86400000).toISOString(),
    content:
      n === 0 ? "User followed up via SMS — confirmed interest in auto draws next month."
      : n === 1 ? "Called to verify bank details for upcoming ₦250k payout. Confirmed."
      : n === 2 ? "Reached out re: VIP tier upgrade — in consideration."
      : "Sent personalised offer for competition ending this weekend.",
    tag: (["note", "call", "email", "meeting"] as const)[n % 4]!,
  }));
  const activity: CRMActivity[] = Array.from({ length: 10 }, (_, a) => {
    const roll = (i * 3 + a) % 8;
    const types: CRMActivity["type"][] = ["ticket_buy", "win", "wallet_fund", "referral", "login", "kyc_submit", "suspend", "note"];
    const type = types[roll]!;
    const base: CRMActivity = {
      id: `act-${i}-${a}`,
      timestamp: new Date(now - (a * 17 + i) * 3600000).toISOString(),
      type,
      detail:
        type === "ticket_buy" ? `Purchased ${3 + a * 2} entries — "2024 Lexus RX 350"`
        : type === "win" ? `Won "Samsung Galaxy S24 Ultra" draw`
        : type === "wallet_fund" ? `Wallet funded via Paystack`
        : type === "referral" ? `Referred 3 new L1 signups`
        : type === "login" ? `Login from Lagos (192.168.x.x)`
        : type === "kyc_submit" ? `Submitted KYC — NIN + passport`
        : type === "suspend" ? `Temporary restriction lifted (reviewed)`
        : `Outbound call — outcome: positive`,
      valueKobo: 0,
    };
    if (type === "wallet_fund") base.valueKobo = (50000 + i * 5000 + a * 10000) * 100;
    else if (type === "ticket_buy") base.valueKobo = (2500 + a * 500) * 100;
    else if (type === "win") base.valueKobo = (450000 + i * 12000) * 100;
    else base.valueKobo = 0;
    return base;
  });
  return {
    id: `RF-USR-${String(30000 + i).slice(0, 5)}`,
    name: `${first} ${last}`,
    initials: `${first[0]!}${last[0]!}`,
    tint: TINTS[i % TINTS.length]!,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@raffila.ng`,
    phone: `+234 ${8000000000 + i * 137}`,
    username: `@${first.toLowerCase()}${i}`,
    address: `${100 + i} Allen Avenue, Ikeja`,
    state: STATES[i % STATES.length]!,
    registeredAt: new Date(now - (i * 13 + 30) * 86400000).toISOString(),
    lastActive: new Date(now - (i * 5 + 1) * 3600000).toISOString(),
    tags,
    classification: CLS[i % 4]!,
    entriesTotal: 120 + i * 73,
    spentTotalKobo: (850000 + i * 275000) * 100,
    walletKobo: (15000 + (i * 4300) % 900000) * 100,
    wins: i % 7 === 0 ? 2 + (i % 3) : i % 3,
    referrals: i % 5,
    level: 1 + (i % 5),
    notes,
    activity,
    assignedTo: AGENTS[i % AGENTS.length]!,
    rating: 3 + (i % 3),
  };
}

const CONTACTS: Contact[] = Array.from({ length: 36 }, (_, i) => mkContact(i));
const ALL_TAGS: ContactTag[] = ["Prospect", "Player", "Winner", "VIP", "Partner", "At-risk", "Pending KYC", "Referred"];

function tagBadge(t: ContactTag) {
  const tint =
    t === "Prospect" ? "bg-sky/20 border-sky text-ink"
    : t === "Player" ? "bg-lemon/30 border-lemon text-ink"
    : t === "Winner" ? "bg-mint/30 border-mint text-ink"
    : t === "VIP" ? "bg-coral border-coral text-white"
    : t === "Partner" ? "bg-lilac/20 border-lilac text-ink"
    : t === "At-risk" ? "bg-coral/20 border-coral text-ink"
    : t === "Pending KYC" ? "bg-lemon/30 border-lemon text-ink"
    : "bg-mint/20 border-mint text-ink";
  return (
    <Badge variant="outline" className={`rounded-full text-[10px] ${tint}`}>
      {t === "Prospect" && <Target className="w-3 h-3 mr-1" />}
      {t === "Player" && <Ticket className="w-3 h-3 mr-1" />}
      {t === "Winner" && <Trophy className="w-3 h-3 mr-1" />}
      {t === "VIP" && <Crown className="w-3 h-3 mr-1" />}
      {t === "Partner" && <Handshake className="w-3 h-3 mr-1" />}
      {t === "At-risk" && <Clock className="w-3 h-3 mr-1" />}
      {t === "Referred" && <Gift className="w-3 h-3 mr-1" />}
      {t}
    </Badge>
  );
}

const actIcon = (t: CRMActivity["type"]) => {
  switch (t) {
    case "ticket_buy": return <Ticket className="w-3.5 h-3.5" />;
    case "win": return <Trophy className="w-3.5 h-3.5 text-coral" />;
    case "wallet_fund": return <Wallet className="w-3.5 h-3.5 text-mint" />;
    case "referral": return <Gift className="w-3.5 h-3.5 text-lilac" />;
    case "login": return <User className="w-3.5 h-3.5 text-sky" />;
    case "kyc_submit": return <FileText className="w-3.5 h-3.5 text-lemon" />;
    case "suspend": return <Clock className="w-3.5 h-3.5 text-coral" />;
    case "note": return <MessageSquare className="w-3.5 h-3.5 text-ink/50" />;
  }
};

const actTint = (t: CRMActivity["type"]) =>
  t === "win" ? "bg-coral/20 border-coral"
  : t === "wallet_fund" ? "bg-mint/30 border-mint"
  : t === "ticket_buy" ? "bg-lemon/30 border-lemon"
  : t === "referral" ? "bg-lilac/20 border-lilac"
  : t === "login" ? "bg-sky/20 border-sky"
  : "bg-ink/5 border-ink/20";

export function AdminCRMPage() {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<ContactTag>>(new Set());
  const [activeClassification, setActiveClassification] = useState<Classification | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(CONTACTS[2]!.id);
  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState<CRMNote["tag"]>("note");
  const [classification, setClassification] = useState<Classification>(CONTACTS[2]!.classification);

  const filtered = CONTACTS.filter((c) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.email.toLowerCase().includes(q) &&
        !c.phone.includes(q) &&
        !c.id.toLowerCase().includes(q) &&
        !c.username.toLowerCase().includes(q)
      ) return false;
    }
    if (activeTags.size > 0 && !c.tags.some((t) => activeTags.has(t))) return false;
    if (activeClassification !== "all" && c.classification !== activeClassification) return false;
    return true;
  });

  const selected: Contact = CONTACTS.find((c) => c.id === selectedId) ?? CONTACTS[0]!;

  const stats = {
    total: CONTACTS.length,
    winners: CONTACTS.filter((c) => c.tags.includes("Winner")).length,
    vip: CONTACTS.filter((c) => c.tags.includes("VIP")).length,
    atRisk: CONTACTS.filter((c) => c.tags.includes("At-risk")).length,
    pending: CONTACTS.filter((c) => c.tags.includes("Pending KYC")).length,
  };

  return (
    <AdminShell activeNav="crm" title="CRM">
      <div className="space-y-4 h-[calc(100vh-96px)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              <User className="w-7 h-7 text-coral" /> CRM
            </h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Player lifecycle, classifications, and outreach notes.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full" onClick={() => toast.success("CSV export queued")}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button className="rounded-full">
              <Plus className="w-4 h-4 mr-2" /> New segment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Contacts", value: stats.total, tint: "bg-cream/60", icon: <User className="w-4 h-4" /> },
            { label: "Winners", value: stats.winners, tint: "bg-mint/20", icon: <Trophy className="w-4 h-4 text-coral" /> },
            { label: "VIP", value: stats.vip, tint: "bg-coral/15", icon: <Crown className="w-4 h-4 text-coral" /> },
            { label: "At-risk", value: stats.atRisk, tint: "bg-lemon/30", icon: <Clock className="w-4 h-4" /> },
            { label: "Pending KYC", value: stats.pending, tint: "bg-sky/15", icon: <FileText className="w-4 h-4" /> },
          ].map((s) => (
            <Card key={s.label} className={`${s.tint} border-ink/10`}>
              <CardContent className="p-3">
                <p className="text-[10px] font-body uppercase tracking-wider text-ink/50 flex items-center gap-1">
                  {s.icon}{s.label}
                </p>
                <p className="font-display text-2xl text-ink mt-0.5">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[calc(100%-200px)]">
          <Card className="flex flex-col overflow-hidden">
            <CardContent className="p-3 space-y-3 border-b border-ink/10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <Input
                  className="pl-9 rounded-full"
                  placeholder="Search contacts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-ink/50" />
                  {ALL_TAGS.map((t) => (
                    <button
                      key={t}
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-body transition ${
                        activeTags.has(t)
                          ? "bg-ink text-cream border-ink"
                          : "bg-paper text-ink/70 border-ink/15 hover:border-ink/30"
                      }`}
                      onClick={() => {
                        const ns = new Set(activeTags);
                        ns.has(t) ? ns.delete(t) : ns.add(t);
                        setActiveTags(ns);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="font-body text-[10px] text-ink/50 uppercase tracking-wider whitespace-nowrap">
                    Classification
                  </Label>
                  <Select value={activeClassification} onValueChange={(v) => setActiveClassification(v as Classification | "all")}>
                    <SelectTrigger className="rounded-full h-8 text-xs">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All classifications</SelectItem>
                      {CLS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline" className="rounded-full font-body">{filtered.length} contacts</Badge>
              </div>
            </CardContent>
            <div className="overflow-y-auto flex-1 divide-y divide-ink/5">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  className={`w-full text-left p-3 flex gap-3 hover:bg-cream/40 transition ${
                    selectedId === c.id ? "bg-coral/10 border-s-4 border-s-coral" : "border-s-4 border-s-transparent"
                  }`}
                  onClick={() => {
                    setSelectedId(c.id);
                    setClassification(c.classification);
                    setNoteText("");
                  }}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className={`bg-${c.tint} text-ink font-display font-semibold`}>
                      {c.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-body font-semibold text-ink truncate">{c.name}</p>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className={`w-3 h-3 ${s < c.rating ? "text-coral fill-coral" : "text-ink/20"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-ink/50 truncate font-mono">{c.id} · {c.username}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.tags.slice(0, 2).map((t) => tagBadge(t))}
                      {c.tags.length > 2 && (
                        <Badge variant="outline" className="rounded-full text-[10px] bg-ink/5 border-ink/15 text-ink/60">
                          +{c.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 h-full overflow-hidden">
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 flex-wrap gap-3">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 border-4 border-coral/30 shrink-0">
                    <AvatarFallback className={`bg-${selected.tint} text-ink font-display text-xl font-bold`}>
                      {selected.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="font-display text-2xl text-ink">{selected.name}</CardTitle>
                      {selected.tags.map((t) => tagBadge(t))}
                    </div>
                    <CardDescription className="mt-1 font-body text-sm">
                      <span className="font-mono text-ink/50 mr-3">{selected.id}</span>
                      <span className="text-ink/60">Assigned to: </span>
                      <span className="text-ink font-semibold">{selected.assignedTo}</span>
                    </CardDescription>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className={`rounded-full text-xs ${
                        selected.classification === "Champion" ? "bg-coral text-white border-coral"
                        : selected.classification === "Hot" ? "bg-coral/20 border-coral text-ink"
                        : selected.classification === "Warm" ? "bg-lemon/30 border-lemon text-ink"
                        : "bg-ink/10 border-ink/20 text-ink/70"
                      }`}>
                        <TagIcon className="w-3 h-3 mr-1" /> {selected.classification}
                      </Badge>
                      <div className="flex items-center">
                        <Label className="font-body text-xs text-ink/50 mr-2">Set:</Label>
                        <Select value={classification} onValueChange={(v) => setClassification(v as Classification)}>
                          <SelectTrigger className="h-7 w-36 rounded-full text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CLS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Mail className="w-3.5 h-3.5 mr-1" /> Email
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Phone className="w-3.5 h-3.5 mr-1" /> Call
                  </Button>
                  <Button size="sm" className="rounded-full bg-coral hover:bg-coral/90">
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> Note
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-ink/10 flex-1 min-h-0">
                <div className="lg:col-span-3 p-4 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { k: "Total entries", v: selected.entriesTotal.toLocaleString(), icon: <Ticket className="w-3.5 h-3.5 text-coral" /> },
                      { k: "Lifetime spend", v: formatNaira(selected.spentTotalKobo), icon: <Wallet className="w-3.5 h-3.5 text-mint" /> },
                      { k: "Wins", v: `${selected.wins} prizes`, icon: <Trophy className="w-3.5 h-3.5 text-coral" /> },
                      { k: "Wallet", v: formatNaira(selected.walletKobo), icon: <Wallet className="w-3.5 h-3.5 text-sky" /> },
                      { k: "Referrals", v: `${selected.referrals} L1`, icon: <Gift className="w-3.5 h-3.5 text-lilac" /> },
                      { k: "Loyalty tier", v: `Level ${selected.level}`, icon: <Crown className="w-3.5 h-3.5 text-lemon" /> },
                    ].map((s) => (
                      <div key={s.k} className="p-3 rounded-xl bg-cream/50 border border-ink/5">
                        <p className="text-[10px] uppercase tracking-wider text-ink/50 font-body flex items-center gap-1">
                          {s.icon}{s.k}
                        </p>
                        <p className="font-display text-lg text-ink mt-0.5">{s.v}</p>
                      </div>
                    ))}
                  </div>

                  <Card className="border-ink/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-ink text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-coral" /> Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Textarea
                            rows={3}
                            placeholder="Write a note about this contact..."
                            className="rounded-2xl text-sm"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex gap-1">
                            {(["note", "call", "email", "meeting"] as const).map((n) => (
                              <Button
                                key={n}
                                size="sm"
                                variant={noteTag === n ? "primary" : "outline"}
                                className="rounded-full text-xs capitalize"
                                onClick={() => setNoteTag(n)}
                              >
                                {n === "note" ? <Tag className="w-3 h-3 mr-1" /> : n === "call" ? <Phone className="w-3 h-3 mr-1" /> : n === "email" ? <Mail className="w-3 h-3 mr-1" /> : <Calendar className="w-3 h-3 mr-1" />}
                                {n}
                              </Button>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            className="rounded-full"
                            disabled={!noteText.trim()}
                            onClick={() => {
                              toast.success(`${noteTag} added to ${selected.name}`);
                              setNoteText("");
                            }}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add note
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        {selected.notes.map((n) => (
                          <div key={n.id} className="p-3 rounded-xl bg-cream/40 border border-ink/5">
                            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="rounded-full text-[10px] bg-ink/5 border-ink/20 capitalize">
                                  {n.tag}
                                </Badge>
                                <span className="font-body text-xs font-semibold text-ink">{n.author}</span>
                              </div>
                              <span className="text-[10px] text-ink/40 font-mono">
                                {new Date(n.timestamp).toLocaleString("en-NG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm font-body text-ink/80">{n.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 p-4 overflow-y-auto space-y-4">
                  <Card className="border-ink/10">
                    <CardContent className="p-4 space-y-3 text-sm font-body">
                      <h4 className="font-display text-ink text-base">Contact details</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-ink/40 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-ink/40">Email</p>
                            <p className="text-ink break-all">{selected.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-ink/40 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-ink/40">Phone</p>
                            <p className="text-ink">{selected.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-ink/40 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-ink/40">Username</p>
                            <p className="text-ink">{selected.username}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-ink/40 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-ink/40">Address</p>
                            <p className="text-ink">{selected.address}, {selected.state}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-ink/40 mt-0.5 shrink-0" />
                          <div className="grid grid-cols-2 gap-3 flex-1">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-ink/40">Registered</p>
                              <p className="text-ink text-xs">{new Date(selected.registeredAt).toLocaleDateString("en-NG")}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-ink/40">Last active</p>
                              <p className="text-ink text-xs">{new Date(selected.lastActive).toLocaleDateString("en-NG")}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-ink/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-ink text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-coral" /> Activity timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="relative border-s-2 border-ink/10 ms-2 space-y-3">
                        {selected.activity.map((a, idx) => (
                          <li key={a.id} className="ms-4">
                            <span className={`absolute -start-[9px] flex items-center justify-center w-4 h-4 rounded-full border ${actTint(a.type)}`}>
                              {actIcon(a.type)}
                            </span>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-xs font-body text-ink font-semibold">{a.detail}</p>
                              {a.valueKobo && (
                                <Badge variant="outline" className="rounded-full text-[10px] bg-mint/20 border-mint text-ink font-display">
                                  {formatNaira(a.valueKobo)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-ink/40 font-mono mt-0.5">
                              {new Date(a.timestamp).toLocaleString("en-NG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {idx < selected.activity.length - 1 && <ChevronRight className="sr-only" />}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
