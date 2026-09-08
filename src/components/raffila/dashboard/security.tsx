import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Monitor,
  MapPin,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

import { DashboardAppShell } from "@/components/raffila/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sessions = [
  {
    browser: "Chrome",
    os: "Windows",
    location: "Lagos, Nigeria",
    ip: "102.89.23.45",
    lastActive: "2 min ago",
    current: true,
  },
  {
    browser: "Chrome",
    os: "Android 14",
    location: "Lagos, Nigeria",
    ip: "102.67.12.45",
    lastActive: "2h ago",
    current: false,
  },
  {
    browser: "Safari",
    os: "iOS 17",
    location: "Abuja, Nigeria",
    ip: "102.44.88.45",
    lastActive: "3d ago",
    current: false,
  },
];

const loginActivity = [
  { date: "05 Mar · 14:30", device: "Chrome · Windows 11", ip: "102.89.23.45", location: "Lagos, NG", status: "Success" as const },
  { date: "05 Mar · 08:12", device: "Chrome · Android 14", ip: "102.67.12.45", location: "Lagos, NG", status: "Success" as const },
  { date: "04 Mar · 22:05", device: "Safari · iOS 17", ip: "102.44.88.45", location: "Abuja, NG", status: "Success" as const },
  { date: "04 Mar · 11:40", device: "Chrome · Windows 11", ip: "192.168.1.10", location: "Unknown", status: "Failed" as const },
  { date: "03 Mar · 19:22", device: "Firefox · macOS", ip: "41.203.65.12", location: "Port Harcourt, NG", status: "Success" as const },
  { date: "03 Mar · 07:50", device: "Chrome · Android 14", ip: "102.67.12.45", location: "Lagos, NG", status: "Success" as const },
  { date: "02 Mar · 21:10", device: "Safari · iOS 17", ip: "102.44.88.45", location: "Abuja, NG", status: "Failed" as const },
  { date: "02 Mar · 10:04", device: "Chrome · Windows 11", ip: "102.89.23.45", location: "Lagos, NG", status: "Success" as const },
];

function strength(pw: string) {
  if (!pw) return { score: 0, label: "Enter a password", color: "bg-ink/10" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: "Weak", color: "bg-rose" };
  if (s === 2) return { score: 2, label: "Okay", color: "bg-lemon" };
  if (s === 3) return { score: 3, label: "Strong", color: "bg-sky" };
  return { score: 4, label: "Excellent", color: "bg-mint" };
}

export function DashboardSecurityPage() {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");
  const [show, setShow] = useState({ cur: false, n: false, c: false });
  const [saved, setSaved] = useState(false);
  const [endedAll, setEndedAll] = useState(false);
  const [endedIds, setEndedIds] = useState<Set<number>>(new Set());
  const [setup2fa, setSetup2fa] = useState(false);

  const st = strength(nw);
  const match = nw && cf && nw === cf;

  const endOne = (i: number) => setEndedIds((s) => new Set(s).add(i));
  const endAll = () => {
    setEndedAll(true);
    setTimeout(() => setEndedAll(false), 2500);
  };

  return (
    <DashboardAppShell
      title="Security"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Security" },
      ]}
    >
      <div className="space-y-6 max-w-5xl">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/60 -mt-3">
          Password, two-factor, sessions, and sign-in activity — all in one place.
        </p>

        <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center gap-2">
            <Lock className="size-5 text-coral" />
            <h2 className="font-display text-xl font-extrabold text-ink">Change password</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-ink/45">
            Use a strong, unique password you don't reuse anywhere else.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <PwField label="Current password" value={cur} onChange={setCur} show={show.cur} onToggle={() => setShow((s) => ({ ...s, cur: !s.cur }))} />
            <div />
            <PwField label="New password" value={nw} onChange={setNw} show={show.n} onToggle={() => setShow((s) => ({ ...s, n: !s.n }))} />
            <PwField label="Confirm new password" value={cf} onChange={setCf} show={show.c} onToggle={() => setShow((s) => ({ ...s, c: !s.c }))} />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={cn("h-2 w-12 rounded-full bg-ink/10 transition-colors", st.score >= i && st.color)} />
                ))}
              </div>
              <span className="text-xs font-extrabold capitalize text-ink/60">{st.label}</span>
            </div>
            {nw && !match && cf && <p className="text-xs font-bold text-rose">Passwords don't match yet.</p>}
          </div>

          <div className="mt-6 flex items-center gap-3">
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-ink">
                <Check className="size-3.5" /> Password updated
              </span>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (!nw || !match || !cur) return;
                setSaved(true);
                setTimeout(() => setSaved(false), 2200);
                setCur(""); setNw(""); setCf("");
              }}
              disabled={!nw || !match || !cur}
            >
              Update password
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center gap-2">
            <Smartphone className="size-5 text-coral" />
            <h2 className="font-display text-xl font-extrabold text-ink">Two-factor authentication</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-ink/45">
            2FA adds an extra layer of security when you sign in.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-mint/20 p-4 ring-1 ring-mint/30">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-ink/10">
                  <Smartphone className="size-5 text-coral" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-extrabold text-ink">SMS OTP</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint/40 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                      <Check className="size-3" /> ENABLED
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-ink/55 max-w-md">
                    A one-time code is sent by SMS to +234 803 123 4567 on every new sign-in.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Managed
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-ink/10">
                  <KeyRound className="size-5 text-coral" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-extrabold text-ink">Authenticator app</h3>
                    <span className="inline-flex items-center rounded-full bg-ink/10 px-2.5 py-1 text-[10px] font-extrabold text-ink/70">
                      NOT SET UP
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-ink/55 max-w-md">
                    Use an authenticator app like Google Authenticator or Authy for offline codes.
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => setSetup2fa(true)}>
                Set up
              </Button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-sky/15 p-4 ring-1 ring-sky/25">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 text-coral shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-extrabold text-ink text-sm">Why enable 2FA?</h4>
                <p className="mt-1 text-xs font-bold leading-relaxed text-ink/65">
                  If someone gets your password, they still can't sign in without a code from your phone or authenticator app. We recommend turning on both SMS and app-based 2FA.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center gap-2">
            <Monitor className="size-5 text-coral" />
            <h2 className="font-display text-xl font-extrabold text-ink">Active sessions</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-ink/45">
            Sign out of any devices you don't recognise.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-ink/5">
            {sessions.map((s, i) => {
              const ended = endedIds.has(i);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col gap-4 border-b border-ink/10 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
                    s.current && "bg-cream/40",
                    ended && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-lilac/30 text-coral ring-1 ring-ink/5">
                      <Monitor className="size-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-base font-extrabold text-ink">
                          {s.browser} · {s.os}
                        </p>
                        {s.current && (
                          <span className="rounded-full bg-coral/15 px-2.5 py-1 text-[10px] font-extrabold text-coral">
                            Current session
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-ink/50">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {s.location}
                        </span>
                        <span>IP {s.ip}</span>
                        <span>{s.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  {!s.current && !ended && (
                    <Button variant="outline" size="sm" onClick={() => endOne(i)}>
                      <LogOut className="size-3.5" /> End session
                    </Button>
                  )}
                  {ended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/10 px-2.5 py-1 text-[10px] font-extrabold text-ink/70">
                      <X className="size-3" /> Ended
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-coral/20 bg-coral/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-ink/10">
                  <AlertTriangle className="size-5 text-coral" />
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold text-ink">Sign out all other sessions</h3>
                  <p className="mt-1 text-xs font-bold text-ink/55 max-w-md">
                    Ends every session except the one you're using now. Recommended if you see a device you don't own.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="border-coral/30 text-coral hover:bg-coral/10 shrink-0"
                onClick={endAll}
              >
                {endedAll ? (
                  <><Check className="size-4" /> Done</>
                ) : (
                  <><LogOut className="size-4" /> End all other sessions</>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-coral" />
            <h2 className="font-display text-xl font-extrabold text-ink">Login activity</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-ink/45">
            Recent sign-in attempts on your account.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {loginActivity.map((a, i) => (
                  <tr key={i} className="hover:bg-cream/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50">{a.date}</td>
                    <td className="px-4 py-3 text-sm font-bold text-ink">{a.device}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-ink/70">{a.ip}</td>
                    <td className="px-4 py-3 text-xs font-bold text-ink/60">{a.location}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                        a.status === "Success" ? "bg-mint/30 text-ink" : "bg-rose/20 text-ink"
                      )}>
                        {a.status === "Success" ? <Check className="size-3" /> : <X className="size-3" />}
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {setup2fa && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center" onClick={() => setSetup2fa(false)}>
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 ring-1 ring-ink/5 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Authenticator app</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">Set up 2FA</h2>
              </div>
              <button onClick={() => setSetup2fa(false)} className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-cream p-5 ring-1 ring-ink/5 flex flex-col items-center">
                <div className="size-36 grid place-items-center rounded-2xl bg-white ring-1 ring-ink/10">
                  <KeyRound className="size-16 text-ink/60" />
                </div>
                <p className="mt-4 text-xs font-bold text-ink/55">Scan QR with your authenticator</p>
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Manual key</span>
                <span className="font-mono text-xs font-bold text-ink">JBSWY3DPEHPK3PXP</span>
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={() => setSetup2fa(false)}>
                I've scanned — verify code
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardAppShell>
  );
}

function PwField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">{label}</label>
      <div className="flex min-h-11 items-center gap-2 rounded-2xl bg-cream px-4 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/30"
        />
        <button type="button" onClick={onToggle} className="grid size-8 place-items-center rounded-full text-ink/45 hover:text-coral" aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
