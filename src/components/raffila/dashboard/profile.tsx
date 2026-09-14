import { useState, useEffect } from "react";
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

import { DashboardAppShell } from "@/components/raffila/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthSession";

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
    desc: "Win at least one Raffila competition prize",
    earned: false,
    tone: "bg-ink/10 text-ink/50 ring-ink/10",
  },
];

export function DashboardProfilePage() {
  const { user } = useAuthSession();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const [form, setForm] = useState({
    displayName: fullName,
    username: user?.handle || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    dob: "",
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [phoneModal, setPhoneModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    const uid = user?.id?.replace("firebase_", "");
    if (!uid) return;
    import("@/lib/firebase-auth").then(({ getUserProfile }) =>
      getUserProfile(uid).then((profile) => {
        if (!profile) return;
        setForm((f) => ({
          ...f,
          phone: (profile["phone"] as string) || f.phone,
          address: (profile["address"] as string) || f.address,
          dob: (profile["dob"] as string) || f.dob,
          username: (profile["handle"] as string) || f.username,
        }));
      }),
    );
  }, [user?.id]);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    try {
      setSaveError("");
      const { createUserProfile } = await import("@/lib/firebase-auth");
      const uid = user?.id?.replace("firebase_", "");
      if (uid) {
        await createUserProfile(uid, {
          phone: form.phone,
          address: form.address,
          dob: form.dob,
          handle: form.username,
        });

        const [{ setFirebaseSession }, { logActivity }] = await Promise.all([
          import("@/lib/auth-store"),
          import("@/lib/activity-log"),
        ]);
        setFirebaseSession({
          ...user!,
          handle: form.username,
          phone: form.phone,
        });
        void logActivity({
          eventType: "USER_UPDATE",
          targetType: "user",
          targetId: uid,
          summary: "Updated profile details",
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save changes");
    }
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
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
    >
      <div className="space-y-6">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/60 -mt-3">
          Keep your identity fresh so prize claims and support are fast and smooth.
        </p>

        <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-ink/5">
          <div className="relative h-28 bg-gradient-to-r from-coral/25 via-lemon/25 to-mint/25 sm:h-36">
            <div className="absolute -top-16 -right-10 size-52 rounded-full bg-coral/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 size-60 rounded-full bg-lemon/20 blur-3xl" />
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:gap-5">
                <label className="relative mx-auto block size-[108px] shrink-0 cursor-pointer group sm:mx-0 sm:size-28">
                  <div className="absolute inset-0 overflow-hidden rounded-3xl bg-lilac/30 ring-4 ring-white shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)]">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-display text-5xl font-extrabold text-ink sm:text-4xl">
                        {user?.avatarMonogram || "U"}
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-1 right-1 grid size-8 place-items-center rounded-2xl bg-coral text-paper shadow-[0_6px_14px_-6px_var(--coral)] ring-2 ring-white group-hover:scale-105 transition-transform">
                    <Camera className="size-3.5" />
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={() => {}} />
                </label>

                <div className="text-center sm:text-left sm:pb-2">
                  <h2 className="font-display text-2xl font-extrabold text-ink sm:text-[1.7rem]">
                    {fullName}
                  </h2>
                  <p className="mt-0.5 text-sm font-bold text-ink/45">@{form.username}</p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-mint/20">
                      <BadgeCheck className="size-3.5" /> Email verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-mint/20">
                      <BadgeCheck className="size-3.5" /> Phone verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 sm:items-end sm:pb-2">
                <p className="text-xs font-bold text-ink/45">Member since · 14 Jan 2026</p>
                <Button variant="outline" size="sm">
                  <Camera className="size-3.5" /> Edit profile picture
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Personal information
              </p>
              <h2 className="mt-1.5 font-display text-xl font-extrabold text-ink">
                Account details
              </h2>
            </div>
            <p className="text-xs font-bold text-ink/45">Last updated · 3 days ago</p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
              label="Email address"
              value={form.email}
              readOnly
              trailing={
                <button className="inline-flex items-center gap-1 rounded-full bg-lilac/25 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-lilac/20 hover:bg-lilac/40">
                  Change
                </button>
              }
            />
            <Field
              label="Phone number"
              value={form.phone}
              readOnly
              trailing={
                <button
                  onClick={() => setPhoneModal(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-lemon/30 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-lemon/25 hover:bg-lemon/45"
                >
                  Verify
                </button>
              }
            />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                Residential address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral"
              />
            </div>
            <Field
              label="Date of birth"
              type="date"
              value={form.dob}
              onChange={(v) => update("dob", v)}
            />
            <div className="hidden sm:block" />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-ink/10 pt-6">
            {saveError && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-extrabold text-coral ring-1 ring-coral/20">
                {saveError}
              </span>
            )}
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-ink ring-1 ring-mint/20">
                <Check className="size-3.5" /> Changes saved
              </span>
            )}
            <Button variant="primary" size="lg" onClick={save}>
              Save changes
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Your Raffila badges
              </p>
              <h2 className="mt-1.5 font-display text-xl font-extrabold text-ink">
                User tiers & achievements
              </h2>
            </div>
            <p className="max-w-sm text-xs font-bold leading-relaxed text-ink/50">
              Badges celebrate your activity. Earn more to unlock future perks and features.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.name}
                className={cn(
                  "relative rounded-[24px] p-5 ring-1 transition-all duration-200 hover:shadow-md",
                  b.tone,
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "relative grid size-11 place-items-center rounded-2xl ring-1",
                      b.earned ? "bg-white ring-ink/10" : "bg-white/60 ring-ink/10",
                    )}
                  >
                    {b.icon}
                    {!b.earned && (
                      <div className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-white ring-1 ring-ink/10">
                        <Lock className="size-2.5 text-ink/50" />
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1",
                      b.earned
                        ? "bg-white text-ink ring-ink/10"
                        : "bg-white/70 text-ink/60 ring-ink/10",
                    )}
                  >
                    {b.earned ? "EARNED" : "LOCKED"}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[15px] font-extrabold text-ink">{b.name}</h3>
                <p className="mt-1 text-xs font-bold leading-relaxed text-ink/60">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {phoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => setPhoneModal(false)}
        >
          <div
            className="w-full max-w-md rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
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
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-mint/30 p-4 ring-1 ring-mint/20">
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
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-5 w-full"
                  onClick={verifyOtp}
                  disabled={otp.length < 4}
                >
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
      <div className="flex min-h-11 items-center gap-2 rounded-2xl bg-cream px-4 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral/20 transition-all">
        {leading && <span className="font-extrabold text-ink/45">{leading}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={cn(
            "w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/35",
            readOnly && "opacity-80",
          )}
        />
      </div>
    </div>
  );
}
