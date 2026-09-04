import { ArrowUpRight, Instagram, Mail, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8 lg:pb-10">
      <div className="rounded-[28px] bg-ink p-6 text-cream sm:p-8 lg:flex lg:items-end lg:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-lilac font-display text-lg font-extrabold text-ink">R</span>
            <span className="font-display text-xl font-extrabold">Rafilla</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cream/70">Premium prize competitions, presented with clarity, care, and a commitment to fair chances.</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-cream/60">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5"><ShieldCheck className="size-3.5 text-mint" /> Verifiable draws</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5"><Mail className="size-3.5 text-lemon" /> Secure accounts</span>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-3 text-sm font-bold text-cream/65 sm:grid-cols-3 lg:mt-0">
          <Link to="/competitions" className="hover:text-cream">Competitions</Link>
          <Link to="/how-it-works" className="hover:text-cream">How it works</Link>
          <Link to="/winners" className="hover:text-cream">Winners</Link>
          <Link to="/become-a-partner" className="hover:text-cream">Partners</Link>
          <Link to="/faq" className="hover:text-cream">FAQ</Link>
          <a href="mailto:hello@raffila.com" className="inline-flex items-center gap-1 hover:text-cream">Contact <ArrowUpRight className="size-3.5" /></a>
          <a href="https://instagram.com" className="inline-flex items-center gap-1 hover:text-cream" aria-label="Rafilla on Instagram">Instagram <Instagram className="size-3.5" /></a>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 px-1 text-xs font-bold text-ink/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Rafilla. Development preview.</p>
        <p>Public inventory shown here is demo data pending platform configuration.</p>
      </div>
    </footer>
  );
}