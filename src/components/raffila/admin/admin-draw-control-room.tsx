import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dices,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  ExternalLink,
  Copy,
  AlertTriangle,
  Play,
  RotateCcw,
  X,
  Zap,
} from "lucide-react";
import {
  executeDrawWorkflow,
  listenDrawRecord,
  fetchEligibleTickets,
  seedDemoTicketsForCompetition,
  type DrawRecord,
  type DrawStage,
  type EligibleTicket,
} from "@/lib/draw-system";
import { WheelOfFortune } from "@/components/raffila/draws/wheel-of-fortune";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminDrawControlRoomProps {
  isOpen: boolean;
  onClose: () => void;
  competition: {
    id: string;
    docId: string;
    slug: string;
    name: string;
    image: string;
    drawDate: string;
    entriesSold: number;
    totalEntries: number;
  };
  onSuccess?: () => void;
}

export function AdminDrawControlRoom({
  isOpen,
  onClose,
  competition,
  onSuccess,
}: AdminDrawControlRoomProps) {
  const [tickets, setTickets] = useState<EligibleTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [seedingTickets, setSeedingTickets] = useState(false);
  const [drawRecord, setDrawRecord] = useState<DrawRecord | null>(null);
  const [currentStage, setCurrentStage] = useState<DrawStage>("READY");
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load tickets for competition
  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const tkts = await fetchEligibleTickets(competition.slug);
      setTickets(tkts);
    } catch (err) {
      console.warn("Control room fetch tickets error:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    void loadTickets();

    const unsub = listenDrawRecord(competition.slug, (rec) => {
      setDrawRecord(rec);
      if (rec?.stage) {
        setCurrentStage(rec.stage);
      }
    });

    return () => {
      unsub();
    };
  }, [isOpen, competition.slug]);

  if (!isOpen) return null;

  const eligibleCount = drawRecord?.eligibleTicketCount || tickets.length;
  const participantCount =
    drawRecord?.eligibleParticipantCount ||
    new Set(tickets.map((t) => t.userId).filter(Boolean)).size;

  const isCompleted =
    currentStage === "COMPLETED" ||
    drawRecord?.status === "COMPLETED" ||
    !!drawRecord?.winningTicketNumber;

  const handleStartDraw = async () => {
    if (tickets.length === 0) {
      toast.error("No eligible tickets found", {
        description: "Please seed or add tickets to this competition before drawing.",
      });
      return;
    }

    setIsExecuting(true);
    setErrorMessage(null);

    try {
      toast.info("Draw sequence initiated", {
        description: "Freezing ticket pool and selecting winner...",
      });

      const { record } = await executeDrawWorkflow(competition.slug, (stage) => {
        setCurrentStage(stage);
      });

      setDrawRecord(record);
      setIsExecuting(false);
      onSuccess?.();
      toast.success("Draw completed successfully!", {
        description: `Winning ticket #${record.winningTicketNumber} selected.`,
      });
    } catch (err) {
      setIsExecuting(false);
      const msg = err instanceof Error ? err.message : "Draw failed.";
      setErrorMessage(msg);
      toast.error("Draw failed", { description: msg });
    }
  };

  const handleSeedTickets = async () => {
    setSeedingTickets(true);
    try {
      const created = await seedDemoTicketsForCompetition(competition.slug, 24);
      setTickets(created);
      toast.success("24 Verified Test Tickets Created", {
        description: "Pool is now ready for draw testing.",
      });
    } catch (err) {
      toast.error("Failed to seed tickets", {
        description: err instanceof Error ? err.message : "Error",
      });
    } finally {
      setSeedingTickets(false);
    }
  };

  const copyRef = (val?: string) => {
    if (!val) return;
    void navigator.clipboard.writeText(val);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={isExecuting ? undefined : onClose}
      />

      {/* Control Room Window */}
      <div className="relative z-10 w-full max-w-6xl rounded-[32px] bg-[#071F16] border-2 border-[#C5A059]/40 p-5 sm:p-8 text-white shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Dices className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#F7F4EB]">
                  Admin Draw Control Room
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-[10px] font-extrabold uppercase">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-white/60">
                {competition.name} · {competition.slug}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all disabled:opacity-30"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* =========================================================================
            TWO-AREA CONTROL ROOM:
            AREA A: Draw Engine (Verification stages, snapshot, audit, diagnostics)
            AREA B: Public Wheel Preview (Exact public wheel component with Rafilla logo)
            ========================================================================= */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* AREA A: DRAW ENGINE (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl bg-black/40 border border-[#C5A059]/30 p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#10B981]" />
                Area A: Draw Engine Diagnostics
              </h3>

              {/* Pool & Participant Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-white/50 block">
                    Eligible Tickets
                  </span>
                  <span className="font-display text-2xl font-extrabold text-white tabular-nums">
                    {eligibleCount.toLocaleString("en-NG")}
                  </span>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-white/50 block">
                    Participants
                  </span>
                  <span className="font-display text-2xl font-extrabold text-white tabular-nums">
                    {participantCount.toLocaleString("en-NG")}
                  </span>
                </div>
              </div>

              {/* Diagnostic Fields */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-white/50">Draw ID</span>
                  <span className="font-mono text-white/90 font-bold">
                    {drawRecord?.verificationReference || `RF-DRAW-${competition.slug.slice(0, 8)}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-white/50">Current Stage</span>
                  <span className="font-bold text-[#F3E5AB] uppercase">{currentStage}</span>
                </div>

                {drawRecord?.snapshotHash && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-white/50">Snapshot Hash</span>
                    <span className="font-mono text-[10px] text-white/80">
                      {drawRecord.snapshotHash.slice(0, 16)}...
                    </span>
                  </div>
                )}
              </div>

              {/* Zero ticket alert & Quick Seed */}
              {eligibleCount === 0 && !loadingTickets && (
                <div className="rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 p-3 text-xs">
                  <p className="font-bold text-[#F59E0B] flex items-center gap-1.5">
                    <AlertTriangle className="size-4" />
                    Zero tickets in pool
                  </p>
                  <p className="text-white/70 mt-1">
                    To test the draw experience immediately, you can seed 24 verified sample tickets
                    into Firestore.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleSeedTickets}
                    disabled={seedingTickets}
                    className="mt-3 w-full rounded-full bg-[#F59E0B] text-black font-extrabold hover:bg-white"
                  >
                    <Zap className="size-3.5 mr-1" />
                    {seedingTickets ? "Generating tickets..." : "⚡ Generate 24 Verified Tickets"}
                  </Button>
                </div>
              )}

              {/* Error box */}
              {errorMessage && (
                <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Winner Revealed Summary */}
              {isCompleted && drawRecord?.winningTicketNumber && (
                <div className="rounded-xl bg-gradient-to-br from-[#D4AF37]/25 to-[#10B981]/20 border border-[#D4AF37]/60 p-3 text-center">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4AF37] block">
                    Winner Selected &amp; Committed
                  </span>
                  <p className="font-display text-lg font-extrabold text-white mt-1">
                    {drawRecord.winnerDisplayName}
                  </p>
                  <p className="font-mono text-sm text-[#F3E5AB]">
                    Ticket #{drawRecord.winningTicketNumber}
                  </p>
                </div>
              )}

              {/* Execution Actions */}
              <div className="pt-2 space-y-2">
                {!isCompleted ? (
                  <Button
                    onClick={handleStartDraw}
                    disabled={isExecuting || eligibleCount === 0}
                    className="w-full h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#071F16] font-extrabold shadow-lg text-sm border-0"
                  >
                    {isExecuting ? (
                      <>
                        <Dices className="size-4 mr-2 animate-spin" />
                        Executing Draw Sequence...
                      </>
                    ) : (
                      <>
                        <Play className="size-4 mr-2" />
                        Start Secure Draw &amp; Broadcast Spin
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      asChild
                      className="flex-1 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs"
                    >
                      <Link to="/draw-verification/$slug" params={{ slug: competition.slug }}>
                        <ShieldCheck className="size-3.5 mr-1" />
                        Audit Record
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                    >
                      <Link
                        to="/competitions/$slug/draw"
                        params={{ slug: competition.slug }}
                        target="_blank"
                      >
                        <ExternalLink className="size-3.5 mr-1" />
                        Public Page
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AREA B: PUBLIC WHEEL PREVIEW (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl bg-black/40 border border-[#C5A059]/30 p-6 sm:p-8 relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Area B: Public Wheel Preview
              </span>
              <span className="text-[11px] text-white/50">
                Identical component broadcast to all viewers
              </span>
            </div>

            {/* Same Wheel Component with Rafilla Logo */}
            <WheelOfFortune
              tickets={tickets}
              winningTicketNumber={drawRecord?.winningTicketNumber}
              isSpinning={currentStage === "SPINNING"}
              spinStartTime={drawRecord?.spinStartTime}
              spinDurationMs={drawRecord?.spinDurationMs || 7500}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
