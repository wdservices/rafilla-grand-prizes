import { useState } from "react";
import {
  Camera,
  Mail,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Check,
  Lock,
  Ticket,
  Users,
  Trophy,
} from "lucide-react";

import { DashboardAppShell } from "@/components/rafilla/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Badge = {
  name: string;
  icon: React.ReactNode;
  desc: string;
  earned: boolean;
  tone: string;
};

const badges: Badge[] = [
  {
    name: "Verified account",
    icon: <ShieldCheck className="size-4" />,
    desc: "Account created and email confirmed",
    earned: true,
    tone: "bg-mint/30 text-ink ring-mint/40",
  },
  {
    name: "Phone verified",
    icon: <Phone className="size-4" />,
    desc: "Phone number confirmed with OTP",
    earned: true,
    tone: "bg-mint/30 text-ink ring-mint/40",
  },
  {
    name: "Email verified",
    icon: <Mail className="size-4" />,
    desc: "Email address confirmed at signup",
    earned: true,
    tone: "bg-mint/30 text-ink ring-mint/40",
  },
  {
    name: "First entry",
    icon: <Ticket className="size-4" />,
    desc: "Entered your very first competition",
    earned: true,
    tone: "bg-mint/30 text-ink ring-mint/40",
  },
  {
    name: "50+ entries",
    icon: <Ticket className="size-4" />,
    desc: "Reach 50 entries across all competitions",
    earned: false,
    tone: "bg-ink/10 text-ink/50 ring-ink/10",
  },
  {
    name: "10+ referrals",
    icon: <Users className="size-4" />,
    desc: "Invite 10 friends who complete signup",
    earned: false,
    tone: "bg-ink/10 text-ink/50 ring-ink/10",
  },
  {
    name: "Winner",
    icon: <Trophy className="size-4" />,
    desc: "Win at least one Rafilla competition prize",
    earned: false,
    tone: "bg-ink/10 text-ink/50 ring-ink/10",
  },
];

export function DashboardProfilePage() {
  const [form, setForm] = useState({
    displayName: "Tunmise Adebayo",
    username: "tunmise_ade",
    email: "tunmise.adebayo@example.com",
    phone: "+234 803 123 4567",
    address: "14, Allen Avenue, Ikeja, Lagos, Nigeria",
    dob: "1998-06-14",
  });
  const [saved, setSaved] = useState(false);
  const [phoneModal, setPhoneModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const sendOtp = () => {
    setOtpSent(true);
  };

  const verifyOtp = () => {
    if (otp.length >= 4) {
      setOtpVerified(true);
      setTimeout(() => {
        setPhoneModal(false);
        setOtpSent(false);
        setOtpVerified(false);
        setOtp("");
      }, 1200);
    }
  };

  return (
    <DashboardAppShell
      title="Profile"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Profile" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Profile
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            Keep your identity fresh so prize claims and support are fast and smooth.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="rounded-[28px] bg-white p-6 text-center ring-1 ring-ink/5">
              <label className="relative mx-auto block size-[120px] cursor-pointer group">
                <div className="absolute inset-0 overflow-hidden rounded-full bg-lilac/30 ring-2 ring-ink/5">
                  <div className="grid h-full w-full place-items-center font-display text-5xl font-extrabold text-ink">
                    TA
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full bg-coral text-paper shadow-[0_6px_14px_-6px_var(--coral)] ring-2 ring-white group-hover:scale-105 transition-transform">
                  <Camera className="size-4.5" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => {}}
                />
              </label>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
                Tunmise Adebayo
              </h2>
              <p className="mt-1 text-sm font-bold text-ink/45">@tunmise_ade</p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-mint/30 px-3 py-1 text-[11px] font-extrabold text-ink">
                  <BadgeCheck className="size-3.5" /> Email verified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-mint/30 px-3 py-1 text-[11px] font-extrabold text-ink">
                  <BadgeCheck className="size-3.5" /> Phone verified
                </span>
              </div>

              <p className="mt-5 text-xs font-bold text-ink/45">
                Account created · 14 Jan 2026
              </p>

              <Button variant="outline" size="sm" className="mt-4 w-full">
                <Camera className="size-3.5" /> Edit profile picture
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Display name"
                value={form.displayName}
                onChange={(v) => update("displayName", v)}
              />
              <Field
                label="Username"
                value={form.username}
                onChange={(v) => update("username", v)}
                leading="@"
              />
              <Field
                label="Email"
                value={form.email}
                readOnly
                trailing={
                  <button className="inline-flex items-center gap-1 rounded-full bg-lilac/25 px-3 py-1 text-[11px] font-extrabold text-ink hover:bg-lilac/40">
                    Change
                  </button>
                }
              />
              <Field
                label="Phone"
                value={form.phone}
                readOnly
                trailing={
                  <button
                    onClick={() => setPhoneModal(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-lemon/30 px-3 py-1 text-[11px] font-extrabold text-ink hover:bg-lemon/45"
                  >
                    Verify
                  </button>
                }
              />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral"
                />
              </div>
              <Field label="Date of birth" type="date" value={form.dob} readOnly />
            </div>

            <div className="mt-8 flex flex-col-reverse items-start justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
              <p className="text-xs font-bold text-ink/45">Last updated 3 days ago</p>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-ink">
                    <Check className="size-3.5" /> Changes saved
                  </span>
                )}
                <Button variant="primary" size="lg" onClick={save}>
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
              Your Rafilla badges
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
              User tiers & achievements
            </h2>
            <p className="mt-1 max-w-2xl text-xs font-bold leading-relaxed text-ink/55">
              Badges celebrate your activity with Rafilla. Earn more to unlock future perks and features.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.name}
                className={cn(
                  "rounded-2xl p-5 ring-1",
                  b.tone
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={cn(
                    "grid size-10 place-items-center rounded-xl",
                    b.earned ? "bg-white ring-1 ring-ink/10" : "bg-white/50"
                  )}>
                    {b.icon}
                    {!b.earned && (
                      <div className="absolute mt-0 ml-7 grid size-4 place-items-center rounded-full bg-white ring-1 ring-ink/10">
                        <Lock className="size-2.5 text-ink/50" />
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                    b.earned ? "bg-white text-ink ring-1 ring-ink/10" : "bg-white/60 text-ink/60"
                  )}>
                    {b.earned ? "EARNED" : "LOCKED"}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-extrabold text-ink">
                  {b.name}
                </h3>
                <p className="mt-1 text-xs font-bold leading-relaxed text-ink/60">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {phoneModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center" onClick={() => setPhoneModal(false)}>
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Verify phone
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                Confirm your number
              </h2>
              <p className="mt-2 text-xs font-bold leading-relaxed text-ink/55">
                We'll send a 6-digit OTP to {form.phone}.
              </p>
            </div>

            {!otpSent ? (
              <Button variant="primary" size="lg" className="mt-6 w-full" onClick={sendOtp}>
                Send verification code
              </Button>
            ) : otpVerified ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-mint/30 p-4">
                <div className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-ink/10">
                  <Check className="size-5 text-coral" />
                </div>
                <p className="font-display font-extrabold text-ink">Phone verified!</p>
              </div>
            ) : (
              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Enter OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="min-h-12 w-full rounded-2xl bg-cream px-4 text-center font-display text-2xl font-extrabold tracking-[0.2em] text-ink ring-1 ring-ink/5 outline-none focus:ring-2 focus:ring-coral"
                />
                <Button variant="primary" size="lg" className="mt-5 w-full" onClick={verifyOtp} disabled={otp.length < 4}>
                  Verify number
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardAppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  trailing,
  leading,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  trailing?: React.ReactNode;
  leading?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
          {label}
        </label>
        {trailing}
      </div>
      <div className="flex min-h-11 items-center gap-2 rounded-2xl bg-cream px-4 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral">
        {leading && <span className="font-extrabold text-ink/45">{leading}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={cn(
            "w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/35",
            readOnly && "opacity-80"
          )}
        />
      </div>
    </div>
  );
}
