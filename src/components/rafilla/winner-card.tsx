import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";

import type { WinnerCard as WinnerCardType } from "@/lib/rafilla-data";

export function WinnerCard({ winner }: { winner: WinnerCardType }) {
  return (
    <article className="group rounded-[22px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 transition-transform duration-200 hover:-translate-y-1">
      <div className="overflow-hidden rounded-[18px] bg-lilac/20">
        <img
          src={winner.image}
          alt={winner.imageAlt}
          width={600}
          height={400}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      <div className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-coral">Winner</p>
            <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
              {winner.winnerName}
            </h3>
          </div>
          {winner.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mint/30 px-2.5 py-1 text-[11px] font-extrabold text-ink">
              <BadgeCheck className="size-3.5 text-mint" /> Verified
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-2 border-t border-ink/10 pt-3">
          <div>
            <p className="text-xs font-bold text-ink/45">Prize</p>
            <p className="font-display text-base font-extrabold text-ink">{winner.prize}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink/45">Competition</p>
            <p className="text-sm font-bold text-ink/70">{winner.competition}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink/55">
              <CalendarDays className="size-3.5 text-coral" /> {winner.drawDate}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink/55">
              <MapPin className="size-3.5 text-coral" /> {winner.location}
            </div>
          </div>
          <div className="mt-2 rounded-2xl bg-lilac/25 px-3 py-2">
            <p className="text-xs font-bold text-ink/45">Prize value</p>
            <p className="font-display text-lg font-extrabold text-ink">{winner.amount}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
