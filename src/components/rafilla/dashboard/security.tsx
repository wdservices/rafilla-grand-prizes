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
  ChevronRight,
  Ticket,
  Settings,
  UserCircle2,
  Link as LinkIcon,
} from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sessions = [
  {
    browser: "Chrome",
    os: "Windows",
    location: "Lagos, NG",
    ip: "102.89.41.45",
    lastActive: "Just now",
    current: true,
  },
  {
    browser: "Chrome",
    os: "Android 14",
    location: "Lagos, NG",
    ip: "102.67.12.45",
    lastActive: "2h ago",
    current: false,
  },
  {
    browser: "Safari",
    os: "macOS 14",
    location: "Abuja, NG",
    ip: "102.44.88.45",
    lastActive: "3d ago",
    current: false,
  },
];

const activityLog = [
  { icon: <Ticket className="size-4" />, text: "Purchased 25 entries · Mercedes-Benz C-Class", time: "2h ago", tone: "mint" },
  { icon: <Settings className="size-4" />, text: "Profile updated · phone number changed", time: "5h ago", tone: "sky" },
  { icon: <Lock className="size-4" />, text: "Successful login · Chrome on Windows", time: "8h ago", tone: "mint" },
  { icon: <UserCircle2 className="size-4" />, text: "Avatar upload attempted", time: "1d ago", tone: "lilac" },
  { icon: <LinkIcon className="size-4" />, text: "Wallet funded ₦50,000 · Paystack card", time: "2d ago", tone: "lemon" },
];

const toneBg: Record<string, string> = {
  mint: "bg-mint/30 text-coral",
  sky: "bg-sky/20 text-coral",
  lilac: "bg-lilac/30 text-coral",
  lemon: "bg-lemon/30 text-coral",
};

function pwStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
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
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [show, setShow] = useState({ cur: false, n: false, c: false });
  const [saved, setSaved] = useState(false);

  const strength = pwStrength(newPw);
  const pwMatch = newPw && confirmPw && newPw === confirmPw;

  const handleChangePw = () => {
    if (!newPw || !pwMatch) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  return (
    <DashboardShell activeNav="Security">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Lock it down
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Security
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            Your Rafilla account and wallet protection — all in one place.
          </p>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center gap-2">
            <Lock className="size-5 text-coral" />
            <h2 className="font-display text-xl font-extrabold text-ink">Change password</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-ink/45">
            Use a strong, unique password you don't reuse anywhere else.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <PwField
              label="Current password"
              value={currentPw}
              onChange={setCurrentPw}
              show={show.cur}
              onToggle={() => setShow((s) => ({ ...s, cur: !s.cur }))}
            />
            <div />
            <PwField
              label="New password"
              value={newPw}
              onChange={setNewPw}
              show={show.n}
              onToggle={() => setShow((s) => ({ ...s, n: !s.n }))}
            />
            <PwField
              label="Confirm new password"
              value={confirmPw}
              onChange={setConfirmPw}
              show={show.c}
              onToggle={() => setShow((s) => ({ ...s, c: !s.c }))}
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 w-12 rounded-full bg-ink/10 transition-colors",
                      strength.score >= i && strength.color,
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-extrabold capitalize text-ink/60">
                {strength.label}
              </span>
            </div>
            {newPw && !pwMatch && confirmPw && (
              <p className="text-xs font-bold text-rose">Passwords don't match yet.</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            {saved && (
              <span className="rounded-full bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-ink">
                Password updated
              </span>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleChangePw}
              disabled={!newPw || !pwMatch || !currentPw}
            >
              Update password
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lemon/30 text-coral">
                <Smartphone className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-extrabold text-ink">
                    Two-Factor Authentication
                  </h2>
                  <span className="rounded-full bg-ink/10 px-2.5 py-1 text-[10px] font-extrabold text-ink/70">
                    Not enabled
                  </span>
                </div>
                <p className="mt-1 max-w-md text-xs font-bold leading-relaxed text-ink/55">
                  Adds an extra layer of security at sign in with an authenticator app like Google Authenticator or Authy.
                </p>
              </div>
            </div>
            <Button variant="primary" size="md">
              Enable 2FA
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center gap-2">
            <Monitor className="size-5 text-coral" />
            <h2 className="font-display text-xl font-extrabold text-ink">Active sessions</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-ink/45">
            Sign out of any devices you don't recognise.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-ink/5">
            {sessions.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-4 border-b border-ink/10 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
                  s.current && "bg-cream/40",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lilac/30 text-coral ring-1 ring-ink/5">
                    <Monitor className="size-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-extrabold text-ink">
                        {s.browser} on {s.os}
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
                {!s.current && (
                  <Button variant="outline" size="sm">
                    <LogOut className="size-3.5" /> Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-coral" />
              <h2 className="font-display text-xl font-extrabold text-ink">Activity log</h2>
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-extrabold text-ink/60 hover:text-ink">
              View full audit log <ChevronRight className="size-3.5" />
            </button>
          </div>
          <ul className="mt-5 space-y-2">
            {activityLog.map((a, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-2xl bg-cream/50 p-3 ring-1 ring-ink/5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl",
                      toneBg[a.tone],
                    )}
                  >
                    {a.icon}
                  </span>
                  <p className="text-sm font-bold text-ink">{a.text}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-ink/45">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}

function PwField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
        {label}
      </label>
      <div className="flex min-h-11 items-center gap-2 rounded-2xl bg-cream px-4 ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/30"
        />
        <button
          type="button"
          onClick={onToggle}
          className="grid size-8 place-items-center rounded-full text-ink/45 hover:text-coral"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
