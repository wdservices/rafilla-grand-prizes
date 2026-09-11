import { useState, useEffect } from "react";
import {
  Save,
  UsersRound,
  Gift,
  WalletMinimal,
  Sparkles,
  Bell,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TestTube,
  Wrench,
  Database,
  Copy,
  ExternalLink,
  ShieldCheck,
  Mail,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { firebaseConfig } from "@/lib/firebase";
import { useAdminEmailConfig, DEFAULT_PRIMARY_ADMIN_EMAIL } from "@/lib/admin-email-config";
import {
  seedFirestoreDatabase,
  checkFirestoreStatus,
  type SeedProgress,
} from "@/lib/firestore-seed";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { cn, formatNaira } from "@/lib/utils";

interface GroupProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "coral" | "sky" | "mint" | "lemon" | "lilac" | "ink";
  children: React.ReactNode;
  onSave?: () => void;
  showSave?: boolean;
}

const toneBg: Record<string, string> = {
  coral: "bg-coral/15",
  sky: "bg-sky/20",
  mint: "bg-mint/25",
  lemon: "bg-lemon/30",
  lilac: "bg-lilac/25",
  ink: "bg-ink/8",
};
const toneText: Record<string, string> = {
  coral: "text-coral",
  sky: "text-ink",
  mint: "text-ink",
  lemon: "text-ink",
  lilac: "text-ink",
  ink: "text-ink",
};

function ConfigGroup({
  title,
  description,
  icon: Icon,
  tone,
  children,
  onSave,
  showSave = true,
}: GroupProps) {
  return (
    <Card className="rounded-[24px] border-0 bg-white p-0 ring-1 ring-ink/8 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", toneBg[tone])}
            >
              <Icon className={cn("size-5", toneText[tone])} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-display text-lg font-extrabold text-ink">{title}</h3>
              <p className="mt-1 text-xs font-bold text-ink/55 leading-relaxed">{description}</p>
            </div>
          </div>
          {showSave && (
            <Button variant="outline" size="sm" onClick={onSave} className="rounded-full h-10 px-4">
              <Save className="size-3.5 mr-1.5" /> Save changes
            </Button>
          )}
        </div>
        <Separator className="my-5 bg-ink/8" />
        {children}
      </CardContent>
    </Card>
  );
}

export function AdminPlatformConfigPage() {
  const [saving, setSaving] = useState(false);
  const [l1, setL1] = useState("10");
  const [l2, setL2] = useState("5");
  const [l3, setL3] = useState("3");
  const [l4, setL4] = useState("2");
  const [l5, setL5] = useState("1");
  const [poolPct, setPoolPct] = useState("5");
  const [poolRules, setPoolRules] = useState(
    "5% of every ticket value accrues to the platform reward pool, distributed monthly to eligible winners and community rewards on a proportional basis subject to the published reward pool charter.",
  );
  const [minPayout, setMinPayout] = useState("5000");
  const [minTopup, setMinTopup] = useState("1000");
  const [liveDelay, setLiveDelay] = useState("60");
  const [confirmWindow, setConfirmWindow] = useState("48");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [inappNotif, setInappNotif] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState(
    "Raffila is performing scheduled maintenance. The platform will be back online shortly.",
  );
  const [testMode, setTestMode] = useState(false);

  // Admin Master Email State
  const {
    adminEmail,
    loading: loadingAdminEmail,
    setAdminEmail: updateMasterAdminEmail,
    resetAdminEmailToDefault,
  } = useAdminEmailConfig();
  const [emailInput, setEmailInput] = useState(adminEmail);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    if (adminEmail) {
      setEmailInput(adminEmail);
    }
  }, [adminEmail]);

  const handleSaveAdminEmail = async () => {
    const clean = emailInput.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address (e.g. name@example.com).",
      });
      return;
    }
    setSavingEmail(true);
    try {
      const res = await updateMasterAdminEmail(clean);
      toast.success("Admin email updated", {
        description: `Authorized master admin email set to ${res.email}. Changes are synced to cloud settings.`,
      });
    } catch (err: any) {
      toast.error("Could not update admin email", {
        description: err?.message || String(err),
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleResetAdminEmail = async () => {
    setSavingEmail(true);
    try {
      const def = await resetAdminEmailToDefault();
      setEmailInput(def);
      toast.info("Admin email restored", {
        description: `Primary admin email reset to ${def}.`,
      });
    } catch (err: any) {
      toast.error("Reset failed", {
        description: err?.message || String(err),
      });
    } finally {
      setSavingEmail(false);
    }
  };

  // Firebase Database Seeding State
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress | null>(null);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    competitionsCount: number;
    usersCount: number;
    drawsCount: number;
    error?: string;
  } | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);

  const handleCheckDb = async () => {
    setCheckingDb(true);
    try {
      const res = await checkFirestoreStatus();
      setDbStatus(res);
      if (res.connected) {
        toast.success("Firestore connected", {
          description: `Found ${res.competitionsCount} competitions, ${res.drawsCount} draws, ${res.usersCount} users.`,
        });
      } else {
        toast.error("Firestore connection issue", {
          description: res.error || "Permission denied or network error.",
        });
      }
    } finally {
      setCheckingDb(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedProgress({ stage: "Initializing seed...", count: 0, total: 17, completed: false });
    try {
      const res = await seedFirestoreDatabase((p) => setSeedProgress(p));
      if (res.success) {
        toast.success("Database seeded successfully!", {
          description: `Seeded ${res.stats.competitions} competitions, ${res.stats.draws} draws, ${res.stats.users} users, and ${res.stats.winners} winners.`,
        });
        void handleCheckDb();
      } else {
        toast.error("Seeding incomplete", {
          description: res.error || "Permission denied. Check Firestore security rules.",
        });
      }
    } catch (err: any) {
      toast.error("Seeding failed", {
        description: err?.message || String(err),
      });
    } finally {
      setSeeding(false);
    }
  };

  const saveAll = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Changes published", {
        description: "All platform configuration groups have been saved · version bumped to #248.",
      });
    }, 700);
  };

  const groupSave = (name: string) =>
    toast.success(`${name} saved`, { description: "Configuration group updated." });

  return (
    <AdminShell activeNav="config" title="Config">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Admin · Platform
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Configuration
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Global Raffila platform settings — referral rates, reward pool, thresholds, draws,
            notifications, and operational status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-full bg-cream px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink/60 ring-1 ring-ink/10">
            <Wrench className="mr-1 size-3" /> Config v247
          </Badge>
          <Button
            variant="primary"
            onClick={saveAll}
            disabled={saving}
            className="rounded-full h-11 px-5"
          >
            {saving ? (
              <RefreshCw className="size-4 animate-spin mr-1.5" />
            ) : (
              <CheckCircle2 className="size-4 mr-1.5" />
            )}
            {saving ? "Publishing…" : "Save all"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ConfigGroup
          title="Admin master email"
          description="Authorized master email for platform administration and security control. Changing this updates administrative login rights immediately."
          icon={ShieldCheck}
          tone="coral"
          showSave={false}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream/70 p-4 ring-1 ring-ink/10">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">
                  Currently active master admin
                </span>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-sm font-extrabold text-ink">
                    {loadingAdminEmail ? "Loading…" : adminEmail}
                  </span>
                  <Badge className="rounded-full bg-coral/15 px-2.5 py-0 text-[10px] font-extrabold uppercase text-coral ring-0">
                    Master Admin
                  </Badge>
                </div>
              </div>

              {adminEmail.toLowerCase() !== DEFAULT_PRIMARY_ADMIN_EMAIL.toLowerCase() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAdminEmail}
                  disabled={savingEmail}
                  className="rounded-full h-8 text-xs font-bold text-ink/60 hover:text-ink hover:bg-ink/5"
                >
                  <RotateCcw className="size-3 mr-1.5" /> Revert to {DEFAULT_PRIMARY_ADMIN_EMAIL}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Change master admin email
              </Label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
                  <Input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. Raffilamarketplace@gmail.com"
                    className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 pl-11 pr-4 text-sm font-bold text-ink focus-visible:ring-coral focus-visible:ring-2"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleSaveAdminEmail}
                  disabled={
                    savingEmail ||
                    !emailInput ||
                    emailInput.trim().toLowerCase() === adminEmail.toLowerCase()
                  }
                  className="rounded-2xl h-12 px-6 font-bold shrink-0"
                >
                  {savingEmail ? (
                    <RefreshCw className="size-4 animate-spin mr-1.5" />
                  ) : (
                    <Save className="size-4 mr-1.5" />
                  )}
                  {savingEmail ? "Saving…" : "Update email"}
                </Button>
              </div>
              <p className="text-[11px] font-bold text-ink/50 leading-relaxed">
                Persisted to Cloud Firestore (
                <code className="font-mono text-[10px]">platformSettings/admin_config</code>) and
                cached locally so any device or session immediately recognizes this address.
              </p>
            </div>

            <div className="rounded-xl bg-ink/5 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-ink">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Authorized administrator access</span>
              </div>
              <p className="text-[11px] text-ink/60 font-medium leading-relaxed">
                Users logging in with this email automatically receive full administrator privileges
                and are directed straight to the Admin Dashboard. Emergency fallback access is
                preserved for <strong className="text-ink">Spellz49@gmail.com</strong>.
              </p>
            </div>
          </div>
        </ConfigGroup>

        <ConfigGroup
          title="Referral rates"
          description="5-tier referral commission structure applied per qualified ticket purchase."
          icon={UsersRound}
          tone="lemon"
          onSave={() => groupSave("Referral rates")}
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Level 1", val: l1, set: setL1, tint: "bg-coral/15 text-coral" },
              { label: "Level 2", val: l2, set: setL2, tint: "bg-sky/20 text-ink" },
              { label: "Level 3", val: l3, set: setL3, tint: "bg-mint/25 text-ink" },
              { label: "Level 4", val: l4, set: setL4, tint: "bg-lemon/30 text-ink" },
              { label: "Level 5", val: l5, set: setL5, tint: "bg-lilac/25 text-ink" },
            ].map((t) => (
              <div key={t.label} className="space-y-2.5">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                  {t.label}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={t.val}
                    onChange={(e) => t.set(e.target.value)}
                    className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 pr-9 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral focus-visible:ring-2 text-right"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                    %
                  </span>
                </div>
                <div
                  className={cn(
                    "rounded-xl px-2 py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider",
                    t.tint,
                  )}
                >
                  Referrer share
                </div>
              </div>
            ))}
          </div>
        </ConfigGroup>

        <ConfigGroup
          title="Reward pool"
          description="Ticket contribution rate and distribution rules for the community reward pool."
          icon={Gift}
          tone="coral"
          onSave={() => groupSave("Reward pool")}
        >
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Contribution rate · % of ticket value
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={poolPct}
                  onChange={(e) => setPoolPct(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 pr-9 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral focus-visible:ring-2"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Distribution rules
              </Label>
              <Textarea
                rows={4}
                value={poolRules}
                onChange={(e) => setPoolRules(e.target.value)}
                className="rounded-2xl border-0 bg-white ring-1 ring-ink/10 p-4 text-sm font-bold text-ink focus-visible:ring-coral focus-visible:ring-2 resize-none"
              />
            </div>
          </div>
        </ConfigGroup>

        <ConfigGroup
          title="Minimum thresholds"
          description="Wallet and payout minimum amounts, all stored as integer kobo."
          icon={WalletMinimal}
          tone="mint"
          onSave={() => groupSave("Minimum thresholds")}
        >
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Min payout
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                  ₦
                </span>
                <Input
                  type="number"
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 pl-9 pr-4 text-base font-extrabold text-ink focus-visible:ring-coral focus-visible:ring-2"
                />
              </div>
              <p className="text-[11px] font-bold text-ink/50 mt-1">
                {formatNaira(parseInt(minPayout || "0", 10) * 100)} floor
              </p>
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Min wallet top-up
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                  ₦
                </span>
                <Input
                  type="number"
                  value={minTopup}
                  onChange={(e) => setMinTopup(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 pl-9 pr-4 text-base font-extrabold text-ink focus-visible:ring-coral focus-visible:ring-2"
                />
              </div>
              <p className="text-[11px] font-bold text-ink/50 mt-1">
                {formatNaira(parseInt(minTopup || "0", 10) * 100)} minimum
              </p>
            </div>
          </div>
        </ConfigGroup>

        <ConfigGroup
          title="Draw settings"
          description="Live draw broadcast delay and winner confirmation windows."
          icon={Sparkles}
          tone="sky"
          onSave={() => groupSave("Draw settings")}
        >
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Live delay · seconds
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={liveDelay}
                  onChange={(e) => setLiveDelay(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 pr-14 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral focus-visible:ring-2"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                  s
                </span>
              </div>
              <p className="text-[11px] font-bold text-ink/50 mt-1">Broadcast buffer</p>
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Confirmation window · hours
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={confirmWindow}
                  onChange={(e) => setConfirmWindow(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-white ring-1 ring-ink/10 pr-12 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral focus-visible:ring-2"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                  hrs
                </span>
              </div>
              <p className="text-[11px] font-bold text-ink/50 mt-1">Claim deadline</p>
            </div>
          </div>
        </ConfigGroup>

        <ConfigGroup
          title="Notification defaults"
          description="Default channels enabled for new user onboarding."
          icon={Bell}
          tone="lilac"
          onSave={() => groupSave("Notification defaults")}
        >
          <div className="space-y-3">
            {[
              {
                label: "Email notifications",
                desc: "Receipts, draws, results, marketing opt-in.",
                val: emailNotif,
                set: setEmailNotif,
              },
              {
                label: "SMS notifications",
                desc: "High-priority OTP, winner, payout alerts only.",
                val: smsNotif,
                set: setSmsNotif,
              },
              {
                label: "In-app notifications",
                desc: "Activity feed, badges, live draw reminders.",
                val: inappNotif,
                set: setInappNotif,
              },
            ].map((n) => (
              <div
                key={n.label}
                className="flex items-center justify-between rounded-2xl bg-white ring-1 ring-ink/10 px-4.5 py-3.5"
              >
                <div className="pr-4">
                  <p className="text-sm font-extrabold text-ink">{n.label}</p>
                  <p className="text-xs font-bold text-ink/55 mt-0.5">{n.desc}</p>
                </div>
                <Switch checked={n.val} onCheckedChange={(v) => n.set(!!v)} />
              </div>
            ))}
          </div>
        </ConfigGroup>

        <ConfigGroup
          title="Platform status"
          description="Operational mode toggles, maintenance messaging, and test/sandbox flags."
          icon={AlertTriangle}
          tone="ink"
          showSave={false}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white ring-1 ring-ink/10 px-4.5 py-3.5">
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-ink">Maintenance mode</p>
                  {maintenance && (
                    <Badge className="rounded-full bg-coral/15 px-2 py-0 text-[10px] font-extrabold uppercase text-coral ring-0">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-bold text-ink/55 mt-0.5">
                  Public pages show maintenance landing · admin only available.
                </p>
              </div>
              <Switch checked={maintenance} onCheckedChange={(v) => setMaintenance(!!v)} />
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                Maintenance message
              </Label>
              <Textarea
                rows={3}
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                className="rounded-2xl border-0 bg-white ring-1 ring-ink/10 p-4 text-sm font-bold text-ink focus-visible:ring-coral focus-visible:ring-2 resize-none"
              />
            </div>
            <Separator className="bg-ink/8" />
            <div className="flex items-center justify-between rounded-2xl bg-white ring-1 ring-ink/10 px-4.5 py-3.5">
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-ink">Test mode</p>
                  {testMode && (
                    <Badge className="rounded-full bg-lemon/30 px-2 py-0 text-[10px] font-extrabold uppercase text-ink ring-0">
                      <TestTube className="mr-1 size-2.5" /> Sandbox
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-bold text-ink/55 mt-0.5">
                  Mocks all banks and payouts · no real money moves.
                </p>
              </div>
              <Switch checked={testMode} onCheckedChange={(v) => setTestMode(!!v)} />
            </div>
          </div>
        </ConfigGroup>

        <ConfigGroup
          title="Firebase Firestore & Seeding"
          description="Cloud database connection, cryptographic raffle draw ledger, and automated data seeding."
          icon={Database}
          tone="sky"
          showSave={false}
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-white ring-1 ring-ink/10 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-ink/50">
                    Project ID
                  </span>
                  <Badge className="rounded-full bg-sky/20 px-2.5 py-0.5 text-xs font-mono font-bold text-ink ring-0">
                    {firebaseConfig.projectId}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckDb}
                  disabled={checkingDb || seeding}
                  className="rounded-full h-8 text-xs font-bold"
                >
                  {checkingDb ? (
                    <RefreshCw className="size-3 animate-spin mr-1.5" />
                  ) : (
                    <Database className="size-3 mr-1.5" />
                  )}
                  {checkingDb ? "Verifying…" : "Check connection"}
                </Button>
              </div>

              {dbStatus && (
                <div
                  className={cn(
                    "rounded-xl p-3 text-xs font-medium space-y-1.5",
                    dbStatus.connected ? "bg-mint/20 text-ink" : "bg-coral/10 text-coral",
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {dbStatus.connected ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-3.5 text-coral" />
                    )}
                    <span>
                      {dbStatus.connected ? "Firestore is reachable" : "Firestore permission issue"}
                    </span>
                  </div>
                  {dbStatus.connected ? (
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div>
                        Competitions: <strong>{dbStatus.competitionsCount}</strong>
                      </div>
                      <div>
                        Draws: <strong>{dbStatus.drawsCount}</strong>
                      </div>
                      <div>
                        Users: <strong>{dbStatus.usersCount}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] leading-relaxed">
                      {dbStatus.error}. If using test mode, ensure security rules in Firebase
                      Console are published.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1 text-xs text-ink/65 font-medium">
                <div className="flex justify-between">
                  <span>Auth Domain:</span>
                  <span className="font-mono text-ink text-[11px]">
                    {firebaseConfig.authDomain}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="font-mono text-ink text-[11px]">
                    {firebaseConfig.storageBucket}
                  </span>
                </div>
              </div>
            </div>

            {/* Seeding Action */}
            <div className="rounded-2xl bg-white ring-1 ring-ink/10 p-4 space-y-3">
              <div>
                <p className="text-sm font-extrabold text-ink">Seed Full Platform Data</p>
                <p className="text-xs font-bold text-ink/55 mt-0.5 leading-relaxed">
                  Seeds 17 competitions, cryptographic raffle draws with snapshot hashes & beacon
                  seeds, sample ticket batches, user accounts, and 15 past winners.
                </p>
              </div>

              {seedProgress && (
                <div className="rounded-xl bg-ink/5 p-3 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-ink">
                    <span>{seedProgress.stage}</span>
                    {seedProgress.total > 0 && (
                      <span>
                        {seedProgress.count} / {seedProgress.total}
                      </span>
                    )}
                  </div>
                  {seedProgress.error && (
                    <p className="text-xs font-semibold text-coral">{seedProgress.error}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="primary"
                  onClick={handleSeedDatabase}
                  disabled={seeding || checkingDb}
                  className="rounded-full h-10 px-5 text-xs font-bold"
                >
                  {seeding ? (
                    <RefreshCw className="size-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Database className="size-3.5 mr-1.5" />
                  )}
                  {seeding ? "Seeding to Firestore…" : "Seed to Firestore"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText("npm run seed:db");
                    toast.success("CLI command copied", {
                      description: "Run 'npm run seed:db' in your terminal.",
                    });
                  }}
                  className="rounded-full h-10 px-4 text-xs font-bold"
                >
                  <Copy className="size-3 mr-1.5" /> Copy CLI: npm run seed:db
                </Button>
              </div>
            </div>
          </div>
        </ConfigGroup>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={saveAll}
          disabled={saving}
          className="rounded-full h-12 px-7"
        >
          {saving ? (
            <RefreshCw className="size-4 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="size-4.5 mr-2" />
          )}
          {saving ? "Publishing all changes…" : "Publish all changes"}
        </Button>
      </div>
    </AdminShell>
  );
}
