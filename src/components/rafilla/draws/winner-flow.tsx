import { useMemo, useState } from "react";
import {
  Trophy,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Package,
  Archive,
  X,
  User,
  MapPin,
  Upload,
  Banknote,
  ArrowLeft,
  ArrowRight,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { winnerCards } from "@/lib/rafilla-data";
import { cn } from "@/lib/utils";

type WinnerStatus =
  | "SELECTED"
  | "CONTACTED"
  | "CONFIRMED"
  | "CLAIMED"
  | "FULFILLED"
  | "ARCHIVED";

const STATUS_ORDER: WinnerStatus[] = [
  "SELECTED",
  "CONTACTED",
  "CONFIRMED",
  "CLAIMED",
  "FULFILLED",
  "ARCHIVED",
];

const stepConfig: Record<
  WinnerStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  SELECTED: { label: "Selected", icon: Trophy, tone: "bg-coral/15 text-coral" },
  CONTACTED: { label: "Contacted", icon: PhoneCall, tone: "bg-sky/20 text-sky" },
  CONFIRMED: { label: "Confirmed", icon: MessageSquare, tone: "bg-lemon/30 text-coral" },
  CLAIMED: { label: "Claimed", icon: CheckCircle2, tone: "bg-lilac/30 text-lilac" },
  FULFILLED: { label: "Fulfilled", icon: Package, tone: "bg-mint/35 text-mint" },
  ARCHIVED: { label: "Archived", icon: Archive, tone: "bg-ink/10 text-ink" },
};

type WinnerDetail = {
  id: string;
  name: string;
  handle: string;
  phone: string;
  email: string;
  prize: string;
  campaignName: string;
  campaignSlug: string;
  ticketNo: string;
  entryId: string;
  drawDate: string;
  status: WinnerStatus;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
  };
  payoutAmountKobo?: number;
  notes: string;
};

const mockWinner = (): WinnerDetail => {
  const w = winnerCards[0];
  return {
    id: w.id,
    name: w.winnerName,
    handle: "@adebayo_o",
    phone: "+234 803 123 4567",
    email: "adebayo.o@example.com",
    prize: w.prize,
    campaignName: w.competition,
    campaignSlug: "mercedes-benz-c-class",
    ticketNo: "049382",
    entryId: "RF-2026-MBZ7-A92K",
    drawDate: w.drawDate,
    status: "SELECTED",
    deliveryAddress: {
      line1: "14, Awolowo Road",
      line2: "Ikoyi",
      city: "Lagos",
      state: "Lagos",
      postal: "101222",
    },
    payoutAmountKobo: undefined,
    notes: "Prize is physical vehicle delivery. Coordinate with logistics partner AutoHaus NG.",
  };
};

function StatusTimeline({ status }: { status: WinnerStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-2 pb-2">
        {STATUS_ORDER.map((s, i) => {
          const cfg = stepConfig[s];
          const Icon = cfg.icon;
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 ring-1 transition-colors",
                  isCurrent
                    ? "bg-coral/10 ring-coral/30"
                    : isDone
                      ? "bg-mint/15 ring-mint/25"
                      : "bg-paper ring-ink/5",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    isDone || isCurrent ? cfg.tone : "bg-ink/5 text-ink/40",
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink">
                  {cfg.label}
                </p>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] w-8 rounded-full",
                    i < currentIndex ? "bg-mint" : "bg-ink/10",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
        {label}
      </Label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-cream px-3 py-2 ring-1 ring-ink/5">
        <p className="flex-1 truncate font-mono text-sm font-bold text-ink">{value}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value).then(() =>
              toast.success("Copied", {
                className: "!bg-mint/30 !text-ink !border-0 !ring-1 !ring-mint/40",
              }),
            );
          }}
          className="grid size-7 place-items-center rounded-full bg-paper text-ink/60 ring-1 ring-ink/10 hover:text-ink"
          aria-label={`Copy ${label}`}
        >
          <FileText className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function WinnerFlow() {
  const [winner, setWinner] = useState<WinnerDetail>(mockWinner());
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [address, setAddress] = useState({ ...winner.deliveryAddress });

  const currentIndex = STATUS_ORDER.indexOf(winner.status);
  const nextStatus = STATUS_ORDER[currentIndex + 1];
  const prevStatus = STATUS_ORDER[currentIndex - 1];

  const actionLabel = useMemo(() => {
    switch (nextStatus) {
      case "CONTACTED":
        return "Mark contacted";
      case "CONFIRMED":
        return "Confirm winner response";
      case "CLAIMED":
        return "Approve claim";
      case "FULFILLED":
        return "Mark fulfilled (delivery proof)";
      case "ARCHIVED":
        return "Archive record";
      default:
        return "Advance";
    }
  }, [nextStatus]);

  const advance = () => {
    if (!nextStatus) return;
    setWinner((w) => ({ ...w, status: nextStatus }));
    toast.success(`Status updated: ${nextStatus}`, {
      className: "!bg-mint/30 !text-ink !border-0 !ring-1 !ring-mint/40",
    });
  };

  const revert = () => {
    if (!prevStatus) return;
    setWinner((w) => ({ ...w, status: prevStatus }));
    toast.info(`Reverted to ${prevStatus}`);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return;
    toast.error("Winner rejected. Promoting next runner-up.", {
      className: "!bg-coral/20 !text-ink !border-0 !ring-1 !ring-coral/30",
    });
    setRejectOpen(false);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-lemon/30 text-coral">
            <Trophy className="size-5" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
              Winner management
            </p>
            <h1 className="font-display text-2xl font-extrabold text-ink">
              {winner.campaignName}
            </h1>
          </div>
        </div>
        <Badge
          className={cn(
            "border-0 px-3 py-1.5 text-xs font-extrabold",
            stepConfig[winner.status].tone,
          )}
        >
          {stepConfig[winner.status].label}
        </Badge>
      </div>

      <Card className="rounded-[22px] border-0 ring-1 ring-ink/5">
        <CardContent className="p-4 sm:p-6">
          <StatusTimeline status={winner.status} />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[22px] border-0 ring-1 ring-ink/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl font-extrabold text-ink">
                Winner details
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectOpen(true)}
                className="text-coral hover:bg-coral/10"
              >
                <AlertTriangle className="size-4" />
                Reject (runner-up)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <div className="flex items-center gap-3 rounded-2xl bg-lilac/20 p-4 ring-1 ring-lilac/20">
              <div className="grid size-14 place-items-center rounded-2xl bg-paper ring-1 ring-ink/10">
                <User className="size-7 text-coral" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl font-extrabold text-ink">
                  {winner.name}
                </p>
                <p className="text-xs font-bold text-ink/55">
                  {winner.handle} · {winner.email}
                </p>
                <p className="mt-0.5 text-xs font-bold text-ink/55">{winner.phone}</p>
              </div>
              <Badge className="border-0 bg-mint/40 text-ink">
                <CheckCircle2 className="mr-1 size-3 text-mint" /> ID verified
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <CopyField label="Winning ticket no." value={`#${winner.ticketNo}`} />
              <CopyField label="Winning entry ID" value={winner.entryId} />
            </div>

            <Separator className="bg-ink/10" />

            <div>
              <h3 className="font-display text-lg font-extrabold text-ink">
                Prize delivery address
              </h3>
              <p className="mt-1 text-xs font-bold text-ink/50">
                Read from user profile · Admin may edit to coordinate delivery
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                    Address line 1
                  </Label>
                  <Input
                    value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                    Address line 2
                  </Label>
                  <Input
                    value={address.line2 ?? ""}
                    onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                    City
                  </Label>
                  <Input
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                    State
                  </Label>
                  <Input
                    value={address.state}
                    onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                    Postal code
                  </Label>
                  <Input
                    value={address.postal}
                    onChange={(e) => setAddress((a) => ({ ...a, postal: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="md" className="w-full">
                    <MapPin className="size-4" /> Use profile address
                  </Button>
                </div>
              </div>
            </div>

            {winner.status === "FULFILLED" || winner.status === "ARCHIVED" ? (
              <>
                <Separator className="bg-ink/10" />
                <div className="rounded-2xl bg-mint/15 p-4 ring-1 ring-mint/25">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-5 text-mint" />
                    <h3 className="font-display text-lg font-extrabold text-ink">
                      Payout record (cash equivalent)
                    </h3>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                        Amount (₦)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        defaultValue="12000000"
                        className="mt-1.5 rounded-xl font-mono font-extrabold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                        Reference
                      </Label>
                      <Input
                        defaultValue="PAY-2026-0228-MBZ"
                        className="mt-1.5 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            <Separator className="bg-ink/10" />

            <div>
              <h3 className="font-display text-lg font-extrabold text-ink">Admin notes</h3>
              <Textarea
                value={winner.notes}
                onChange={(e) => setWinner((w) => ({ ...w, notes: e.target.value }))}
                className="mt-2 min-h-[96px] rounded-2xl text-sm font-bold text-ink/70"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[22px] border-0 ring-1 ring-ink/5">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-xl font-extrabold text-ink">
                Delivery proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={cn(
                      "grid aspect-square place-items-center rounded-2xl ring-1 transition-colors",
                      n === 1
                        ? "bg-mint/15 ring-mint/25 text-mint"
                        : "cursor-pointer bg-cream ring-ink/5 text-ink/40 hover:bg-lilac/15 hover:text-coral",
                    )}
                  >
                    {n === 1 ? (
                      <CheckCircle2 className="size-7" />
                    ) : (
                      <Upload className="size-6" />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="md" className="w-full">
                <Upload className="size-4" /> Upload proof photos
              </Button>
              <div>
                <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                  Delivery timestamp
                </Label>
                <Input
                  defaultValue="2026-03-10 14:22 WAT"
                  className="mt-1.5 rounded-xl"
                  readOnly
                />
              </div>
              <div>
                <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                  Logistics provider
                </Label>
                <Input defaultValue="AutoHaus NG" className="mt-1.5 rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[22px] border-0 bg-paper ring-1 ring-ink/5">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Current step action
                </p>
                <h3 className="mt-1 font-display text-lg font-extrabold text-ink">
                  {nextStatus ? `Advance to ${stepConfig[nextStatus].label}` : "Record is archived"}
                </h3>
              </div>
              <p className="text-xs font-bold leading-relaxed text-ink/60">
                {nextStatus === "CONTACTED" &&
                  "Mark when the winner has been reached via phone, email, or in-app message."}
                {nextStatus === "CONFIRMED" &&
                  "Record when the winner formally responds and acknowledges the prize."}
                {nextStatus === "CLAIMED" &&
                  "Approve the claim once documentation, ID verification, and eligibility are confirmed."}
                {nextStatus === "FULFILLED" &&
                  "Use when prize delivery is complete and proof of delivery has been uploaded."}
                {nextStatus === "ARCHIVED" &&
                  "Close and archive the record once all taxes, releases, and settlements are complete."}
                {!nextStatus &&
                  "This record is read-only. Revert to a prior status for changes."}
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  disabled={!prevStatus}
                  onClick={revert}
                >
                  <ArrowLeft className="size-4" /> Revert
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={!nextStatus}
                  onClick={advance}
                >
                  {actionLabel} <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md rounded-[28px] p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-coral/15 text-coral">
                <X className="size-5" />
              </span>
              <DialogTitle className="font-display text-xl font-extrabold text-ink">
                Reject winner &amp; promote runner-up
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm font-bold text-ink/60">
              This will mark {winner.name} as disqualified and promote the next runner-up from the
              verified draw list. This action is auditable.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-[11px] font-extrabold uppercase tracking-wider text-ink/45">
                Rejection reason (required)
              </Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Winner could not be contacted within 7 days, duplicate entry detected..."
                className="mt-1.5 min-h-[110px] rounded-2xl text-sm font-bold text-ink/70"
              />
            </div>
            <div className="rounded-2xl bg-coral/10 p-3 ring-1 ring-coral/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-coral" />
                <p className="text-xs font-bold leading-relaxed text-ink/70">
                  Next runner-up will inherit the prize. The full draw order is preserved for audit.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-5 flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" size="md" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-coral"
              disabled={!rejectReason.trim()}
              onClick={confirmReject}
            >
              Confirm reject &amp; promote runner-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
