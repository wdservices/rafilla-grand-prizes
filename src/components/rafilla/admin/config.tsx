import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/components/rafilla/admin/admin-shell";
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
  coral: "bg-coral/18",
  sky: "bg-sky/25",
  mint: "bg-mint/30",
  lemon: "bg-lemon/35",
  lilac: "bg-lilac/30",
  ink: "bg-ink/5",
};
const toneText: Record<string, string> = {
  coral: "text-coral",
  sky: "text-ink",
  mint: "text-ink",
  lemon: "text-ink",
  lilac: "text-ink",
  ink: "text-ink",
};

function ConfigGroup({ title, description, icon: Icon, tone, children, onSave, showSave = true }: GroupProps) {
  return (
    <Card className="rounded-[26px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", toneBg[tone])}>
              <Icon className={cn("size-5", toneText[tone])} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-extrabold text-ink">{title}</h3>
              <p className="mt-1 text-xs font-bold text-ink/55">{description}</p>
            </div>
          </div>
          {showSave && (
            <Button variant="outline" size="sm" onClick={onSave}>
              <Save className="size-3.5" /> Save changes
            </Button>
          )}
        </div>
        <Separator className="my-5" />
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
  const [poolRules, setPoolRules] = useState("5% of every ticket value accrues to the platform reward pool, distributed monthly to eligible winners and community rewards on a proportional basis subject to the published reward pool charter.");
  const [minPayout, setMinPayout] = useState("5000");
  const [minTopup, setMinTopup] = useState("1000");
  const [liveDelay, setLiveDelay] = useState("60");
  const [confirmWindow, setConfirmWindow] = useState("48");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [inappNotif, setInappNotif] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("Rafilla is performing scheduled maintenance. The platform will be back online shortly.");
  const [testMode, setTestMode] = useState(false);

  const saveAll = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Changes published", {
        description: "All platform configuration groups have been saved · version bumped to #248.",
      });
    }, 700);
  };

  const groupSave = (name: string) => toast.success(`${name} saved`, { description: "Configuration group updated." });

  return (
    <AdminShell activeNav="config" title="Config">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Platform</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Configuration</h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Global Rafilla platform settings — referral rates, reward pool, thresholds, draws, notifications, and operational status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-full bg-cream px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink/60 ring-1 ring-ink/10">
            <Wrench className="mr-1 size-3" /> Config v247
          </Badge>
          <Button variant="primary" onClick={saveAll} disabled={saving}>
            {saving ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            {saving ? "Publishing…" : "Save all"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ConfigGroup
          title="Referral rates"
          description="5-tier referral commission structure applied per qualified ticket purchase."
          icon={UsersRound}
          tone="lemon"
          onSave={() => groupSave("Referral rates")}
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Level 1", val: l1, set: setL1, tint: "bg-coral/20 text-coral" },
              { label: "Level 2", val: l2, set: setL2, tint: "bg-sky/25 text-ink" },
              { label: "Level 3", val: l3, set: setL3, tint: "bg-mint/30 text-ink" },
              { label: "Level 4", val: l4, set: setL4, tint: "bg-lemon/35 text-ink" },
              { label: "Level 5", val: l5, set: setL5, tint: "bg-lilac/30 text-ink" },
            ].map((t) => (
              <div key={t.label} className="space-y-2">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">{t.label}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={t.val}
                    onChange={(e) => t.set(e.target.value)}
                    className="h-12 rounded-2xl border-0 bg-cream pr-7 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">%</span>
                </div>
                <div className={cn("rounded-xl px-2 py-1 text-center text-[10px] font-extrabold uppercase tracking-wider", t.tint)}>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Contribution rate · % of ticket value</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={poolPct}
                  onChange={(e) => setPoolPct(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-cream pr-7 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Distribution rules</Label>
              <Textarea
                rows={4}
                value={poolRules}
                onChange={(e) => setPoolRules(e.target.value)}
                className="rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink focus-visible:ring-coral"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Min payout</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">₦</span>
                <Input
                  type="number"
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-cream pl-8 pr-4 text-base font-extrabold text-ink focus-visible:ring-coral"
                />
              </div>
              <p className="text-[11px] font-bold text-ink/50">{formatNaira(parseInt(minPayout || "0", 10) * 100)} floor</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Min wallet top-up</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">₦</span>
                <Input
                  type="number"
                  value={minTopup}
                  onChange={(e) => setMinTopup(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-cream pl-8 pr-4 text-base font-extrabold text-ink focus-visible:ring-coral"
                />
              </div>
              <p className="text-[11px] font-bold text-ink/50">{formatNaira(parseInt(minTopup || "0", 10) * 100)} minimum</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Live delay · seconds</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={liveDelay}
                  onChange={(e) => setLiveDelay(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-cream pr-14 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">s</span>
              </div>
              <p className="text-[11px] font-bold text-ink/50">Broadcast buffer</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Confirmation window · hours</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={confirmWindow}
                  onChange={(e) => setConfirmWindow(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-cream pr-12 pl-4 text-base font-extrabold text-ink focus-visible:ring-coral"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">hrs</span>
              </div>
              <p className="text-[11px] font-bold text-ink/50">Claim deadline</p>
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
          <div className="space-y-2.5">
            {[
              { label: "Email notifications", desc: "Receipts, draws, results, marketing opt-in.", val: emailNotif, set: setEmailNotif },
              { label: "SMS notifications", desc: "High-priority OTP, winner, payout alerts only.", val: smsNotif, set: setSmsNotif },
              { label: "In-app notifications", desc: "Activity feed, badges, live draw reminders.", val: inappNotif, set: setInappNotif },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3.5">
                <div>
                  <p className="text-sm font-extrabold text-ink">{n.label}</p>
                  <p className="text-xs font-bold text-ink/55">{n.desc}</p>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-ink">Maintenance mode</p>
                  {maintenance && <Badge className="rounded-full bg-coral/15 px-2 py-0 text-[10px] font-extrabold uppercase text-coral ring-0">Active</Badge>}
                </div>
                <p className="text-xs font-bold text-ink/55">Public pages show maintenance landing · admin only available.</p>
              </div>
              <Switch checked={maintenance} onCheckedChange={(v) => setMaintenance(!!v)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Maintenance message</Label>
              <Textarea
                rows={3}
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                className="rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink focus-visible:ring-coral"
              />
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-ink">Test mode</p>
                  {testMode && <Badge className="rounded-full bg-lemon/40 px-2 py-0 text-[10px] font-extrabold uppercase text-ink ring-0"><TestTube className="mr-1 size-2.5" /> Sandbox</Badge>}
                </div>
                <p className="text-xs font-bold text-ink/55">Mocks all banks and payouts · no real money moves.</p>
              </div>
              <Switch checked={testMode} onCheckedChange={(v) => setTestMode(!!v)} />
            </div>
          </div>
        </ConfigGroup>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="lg" onClick={saveAll} disabled={saving}>
          {saving ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4.5" />}
          {saving ? "Publishing all changes…" : "Publish all changes"}
        </Button>
      </div>
    </AdminShell>
  );
}
