import React from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  FileCheck2,
  ExternalLink,
  Loader2,
  Copy,
} from "lucide-react";
import type { DrawRecord, DrawStage } from "@/lib/draw-system";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DrawVerificationPanelProps {
  record: DrawRecord | null;
  stage: DrawStage;
  eligibleTicketCount: number;
  participantCount: number;
  competitionSlug: string;
  className?: string;
}

interface VerificationStep {
  key: string;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
}

export function DrawVerificationPanel({
  record,
  stage,
  eligibleTicketCount,
  participantCount,
  competitionSlug,
  className,
}: DrawVerificationPanelProps) {
  // Map stage to step progress
  const stageWeights: Record<DrawStage, number> = {
    READY: 0,
    VERIFYING_TICKETS: 1,
    CONFIRMING_PAYMENTS: 2,
    LOCKING_POOL: 3,
    VERIFYING_COUNT: 4,
    PREPARING_RECORD: 5,
    WINNER_SELECTED: 6,
    SPINNING: 7,
    REVEALED: 7,
    COMPLETED: 8,
    FAILED: 0,
  };

  const currentWeight = stageWeights[stage] ?? 0;
  const isFinished = stage === "COMPLETED" || record?.status === "COMPLETED";

  const steps: VerificationStep[] = [
    {
      key: "VERIFYING_TICKETS",
      label: "Verifying eligible tickets",
      isCompleted: isFinished || currentWeight > 1,
      isActive: stage === "VERIFYING_TICKETS",
    },
    {
      key: "CONFIRMING_PAYMENTS",
      label: "Confirming successful payments",
      isCompleted: isFinished || currentWeight > 2,
      isActive: stage === "CONFIRMING_PAYMENTS",
    },
    {
      key: "LOCKING_POOL",
      label: "Locking the eligible ticket pool",
      isCompleted: isFinished || currentWeight > 3,
      isActive: stage === "LOCKING_POOL",
    },
    {
      key: "VERIFYING_COUNT",
      label: "Verifying the ticket count",
      isCompleted: isFinished || currentWeight > 4,
      isActive: stage === "VERIFYING_COUNT",
    },
    {
      key: "PREPARING_RECORD",
      label: "Preparing the draw record",
      isCompleted: isFinished || currentWeight > 5,
      isActive: stage === "PREPARING_RECORD",
    },
    {
      key: "WINNER_SELECTED",
      label: "Winner selected securely (CSPRNG)",
      isCompleted: isFinished || currentWeight > 6,
      isActive: stage === "WINNER_SELECTED",
    },
    {
      key: "SPINNING",
      label: "Wheel reveal in progress",
      isCompleted: isFinished || currentWeight >= 7,
      isActive: stage === "SPINNING" || stage === "REVEALED",
    },
    {
      key: "COMPLETED",
      label: "Draw completed & finalized",
      isCompleted: isFinished,
      isActive: stage === "COMPLETED",
    },
  ];

  const copySnapshotHash = () => {
    if (!record?.snapshotHash) return;
    void navigator.clipboard.writeText(record.snapshotHash);
    toast.success("Snapshot hash copied", {
      description: "SHA-256 integrity hash saved to clipboard.",
    });
  };

  return (
    <div
      className={cn(
        "rounded-3xl bg-[#09251B] border border-[#C5A059]/30 p-5 sm:p-6 text-white shadow-xl flex flex-col justify-between backdrop-blur-md",
        className,
      )}
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-extrabold text-[#F7F4EB]">
                Draw Verification
              </h3>
              <p className="text-[11px] font-semibold text-[#D4AF37]/80">
                Audited &amp; cryptographically verified
              </p>
            </div>
          </div>
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider",
              isFinished
                ? "bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40"
                : stage === "READY"
                  ? "bg-white/10 text-white/70"
                  : "bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 animate-pulse",
            )}
          >
            {isFinished ? "Verified" : stage === "READY" ? "Standby" : "Live audit"}
          </span>
        </div>

        {/* Real Backend Statistics Bar */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-black/30 border border-white/5 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
              Eligible Tickets
            </span>
            <span className="font-display text-xl font-extrabold text-[#F7F4EB] tabular-nums">
              {(record?.eligibleTicketCount || eligibleTicketCount).toLocaleString("en-NG")}
            </span>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/5 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
              Participants
            </span>
            <span className="font-display text-xl font-extrabold text-[#F7F4EB] tabular-nums">
              {(record?.eligibleParticipantCount || participantCount).toLocaleString("en-NG")}
            </span>
          </div>
        </div>

        {/* Backend Verified Operational Stages */}
        <div className="mt-5 space-y-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4AF37]/70">
            Backend Verification Sequence
          </p>
          <div className="space-y-1.5">
            {steps.map((s, idx) => (
              <div
                key={s.key}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                  s.isCompleted
                    ? "bg-[#10B981]/15 text-white/90 border border-[#10B981]/30"
                    : s.isActive
                      ? "bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/50 shadow-sm"
                      : "text-white/40 bg-white/[0.02]",
                )}
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <span className="font-mono text-[10px] text-white/30 shrink-0">0{idx + 1}</span>
                  <span className="truncate">{s.label}</span>
                </div>

                <div className="shrink-0">
                  {s.isCompleted ? (
                    <CheckCircle2 className="size-4 text-[#10B981]" />
                  ) : s.isActive ? (
                    <Loader2 className="size-4 text-[#D4AF37] animate-spin" />
                  ) : (
                    <Clock className="size-3.5 text-white/20" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Snapshot Hash & Verification Link */}
      <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
        {record?.snapshotHash && (
          <div className="flex items-center justify-between text-[11px] bg-black/40 px-3 py-2 rounded-xl border border-white/5">
            <div className="truncate mr-2">
              <span className="text-white/40 block text-[9px] uppercase font-bold">
                Snapshot SHA-256 Hash
              </span>
              <span className="font-mono text-white/80 truncate block text-[10px]">
                {record.snapshotHash.slice(0, 22)}...
              </span>
            </div>
            <button
              type="button"
              onClick={copySnapshotHash}
              className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              title="Copy hash"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/50 flex items-center gap-1.5">
            <Lock className="size-3.5 text-[#10B981]" />
            Locked draw record
          </span>

          <Link
            to="/draw-verification/$slug"
            params={{ slug: competitionSlug }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:text-[#FFF] transition-colors"
          >
            <FileCheck2 className="size-3.5" />
            Full Audit Record
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
