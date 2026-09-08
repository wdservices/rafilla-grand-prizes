import type { ReactNode } from "react";
import { Check, ShieldCheck, BadgeCheck, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthVariant = "login" | "register" | "forgot" | "otp" | "complete";

interface AuthShellProps {
  children: ReactNode;
  variant?: AuthVariant;
}

const trustItems = [
  {
    icon: <ShieldCheck className="size-5" />,
    title: "Fair, verified draws",
    text: "Every result is transparent and independently checkable.",
    iconColor: "text-raf-green",
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: "Real prizes delivered",
    text: "Winners receive their prizes with proof of delivery.",
    iconColor: "text-raf-gold",
  },
  {
    icon: <WalletCards className="size-5" />,
    title: "Secure entries, always",
    text: "Your account and payments are protected end-to-end.",
    iconColor: "text-coral",
  },
];

export function AuthShell({ children, variant = "login" }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mx-auto w-full max-w-[480px] lg:max-w-none lg:grid lg:grid-cols-20 lg:gap-8 lg:items-stretch lg:min-h-[720px]">
          <div className="hidden lg:flex lg:col-span-9 lg:flex-col lg:rounded-[28px] lg:bg-cream lg:p-8 lg:ring-1 lg:ring-ink/5 xl:p-12">
            <div className="flex items-center gap-2">
              <img
                src="/Raffila-logo.png"
                alt=""
                className="size-10 shrink-0 rounded-2xl shadow-sm"
                width={40}
                height={40}
              />
              <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
                Raffila
              </span>
            </div>

            <div className="mt-12 xl:mt-16">
              <h2 className="max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight text-ink xl:text-5xl">
                Fair draws.
                <br />
                <span className="text-coral">Real prizes.</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60 xl:text-base">
                Join thousands across Africa playing for premium homes, cars, cash, and lifestyle
                prizes — with complete peace of mind.
              </p>
            </div>

            <ul className="mt-10 space-y-5 xl:mt-14">
              {trustItems.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-2xl bg-white/70 ring-1 ring-ink/5", item.iconColor)}>
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-ink">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink/55 xl:text-sm">
                      {item.text}
                    </p>
                  </div>
                  <Check className="mt-1 ml-auto size-4 text-raf-green" aria-hidden />
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-10">
              <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-4 ring-1 ring-ink/5">
                <span className="grid size-10 place-items-center rounded-xl bg-raf-gold text-ink">
                  <BadgeCheck className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                    Prizes paid out
                  </p>
                  <p className="mt-0.5 font-display text-2xl font-extrabold text-ink">
                    ₦148,200,000+
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-11 lg:flex lg:items-center lg:justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8 lg:p-10 xl:p-12 raf-rise">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
