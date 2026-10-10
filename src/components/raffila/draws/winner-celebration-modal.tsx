import React, { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, CheckCircle2, FileCheck2, Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionName: string;
  competitionSlug: string;
  prizeImage?: string;
  winningTicketNumber: string;
  winnerDisplayName: string;
  drawId: string;
  completedAt?: string | null;
}

export function WinnerCelebrationModal({
  isOpen,
  onClose,
  competitionName,
  competitionSlug,
  prizeImage,
  winningTicketNumber,
  winnerDisplayName,
  drawId,
  completedAt,
}: WinnerCelebrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Confetti Particle burst matching Rafilla brand colors (gold, emerald, cream, mint)
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#D4AF37", "#10B981", "#F7F4EB", "#22C55E", "#F59E0B", "#F3E5AB"];
    const particleCount = 120;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      gravity: 0.28,
    }));

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.0035;

        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (particles.some((p) => p.opacity > 0)) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Verified on-chain";

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `Winner announced for ${competitionName}!`,
          text: `Congratulations to ${winnerDisplayName} winning with Ticket #${winningTicketNumber}!`,
          url,
        })
        .catch(() => {});
    } else {
      void navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* Main Card Modal */}
      <div className="relative z-20 w-full max-w-lg rounded-[32px] bg-gradient-to-b from-[#0F3528] via-[#092218] to-[#04120C] border-2 border-[#D4AF37]/80 p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(212,175,55,0.3)] text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 size-9 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {/* Celebration Trophy Icon */}
        <div className="mx-auto size-20 sm:size-24 rounded-full bg-gradient-to-br from-[#FFF0B2] via-[#D4AF37] to-[#8C6D1F] p-[3px] shadow-[0_0_30px_rgba(212,175,55,0.5)]">
          <div className="size-full rounded-full bg-[#082218] flex items-center justify-center">
            <Trophy className="size-10 sm:size-12 text-[#D4AF37] animate-bounce duration-1000" />
          </div>
        </div>

        {/* Kicker */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <Sparkles className="size-4 text-[#D4AF37]" />
          <span className="font-display text-sm font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
            WE HAVE A WINNER!
          </span>
          <Sparkles className="size-4 text-[#D4AF37]" />
        </div>

        {/* Competition Name */}
        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#F7F4EB] leading-tight">
          {competitionName}
        </h2>

        {/* Prize Image if available */}
        {prizeImage && (
          <div className="mt-4 mx-auto max-w-[200px] aspect-[16/10] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-lg">
            <img src={prizeImage} alt={competitionName} className="size-full object-cover" />
          </div>
        )}

        {/* Winner Highlight Plaque */}
        <div className="mt-6 rounded-2xl bg-black/40 border border-[#D4AF37]/40 p-5 space-y-3 shadow-inner">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Winning Ticket Number
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#F3E5AB] tracking-wider drop-shadow-md">
              #{winningTicketNumber}
            </span>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Official Winner
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-white">
              {winnerDisplayName}
            </span>
          </div>
        </div>

        {/* Draw Audit Metadata */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs bg-white/[0.03] p-3 rounded-xl border border-white/5">
          <div>
            <span className="text-white/40 block text-[10px] uppercase font-bold">Draw ID</span>
            <span className="font-mono font-semibold text-white/90 truncate block">{drawId}</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px] uppercase font-bold">
              Completed At
            </span>
            <span className="font-semibold text-white/90 truncate block">{formattedDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Button
            asChild
            className="w-full sm:flex-1 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0A261B] font-extrabold shadow-lg border-0"
          >
            <Link to="/draw-verification/$slug" params={{ slug: competitionSlug }}>
              <FileCheck2 className="mr-2 size-4" />
              Verify Draw Record
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full sm:w-auto h-12 rounded-full border-white/20 bg-white/5 hover:bg-white/15 text-white font-bold"
          >
            <Share2 className="mr-2 size-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
