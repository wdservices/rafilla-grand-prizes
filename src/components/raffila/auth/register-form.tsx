import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getPasswordStrength, passwordStrengthLabels } from "@/lib/password-strength";
import { useAuthActions } from "@/hooks/useAuthSession";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
      <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
      <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
    </svg>
  );
}

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

const strengthConfig: Record<PasswordStrength, { label: string; color: string; dots: number }> = {
  0: { label: "", color: "bg-ink/10", dots: 0 },
  1: passwordStrengthLabels[0],
  2: passwordStrengthLabels[1],
  3: passwordStrengthLabels[2],
  4: passwordStrengthLabels[3],
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="flex items-center gap-1 px-1 text-[11px] font-extrabold text-coral">
      <AlertCircle className="size-3" />
      {error}
    </p>
  );
}

function authInputBase(error?: string) {
  return cn(
    "h-11 rounded-xl border bg-cream/30 px-4 text-sm font-bold text-ink placeholder:text-ink/35",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:border-coral focus-visible:ring-2 focus-visible:ring-coral/10",
    error ? "border-coral bg-coral/5" : "border-ink/10 hover:border-ink/20",
  );
}

function isAdult(dob: string): boolean {
  if (!dob) return false;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age--;
  return age >= 18;
}

export function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { registerWithFirebase, signInWithGoogle } = useAuthActions();
  const navigate = useNavigate();

  const strength = useMemo(
    () => (password ? ((Math.min(3, getPasswordStrength(password)) + 1) as PasswordStrength) : 0),
    [password],
  );
  const strengthInfo = strengthConfig[strength];

  function validateStep1() {
    const next: Record<string, string> = {};
    if (!username || username.length < 3) next.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) next.username = "Letters, numbers, dots, underscores only";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (!phone || !/^(\+?234|0)[789]\d{9}$/.test(phone.replace(/\s/g, ""))) next.phone = "Enter a valid Nigerian number";
    if (!password || password.length < 8) next.password = "Use 8+ characters";
    else if (strength < 2) next.password = "Add uppercase or symbols for a stronger password";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2() {
    const next: Record<string, string> = {};
    if (!address || address.length < 10) next.address = "Please enter a complete address";
    if (!dob || !isAdult(dob)) next.dob = "You must be 18 or older";
    if (!terms) next.terms = "You must accept the terms to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onNext() {
    if (validateStep1()) setStep(2);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    setErrors({});

    const result = await registerWithFirebase({
      email,
      password,
      displayName: username,
    });

    if (!result.ok) {
      setLoading(false);
      setErrors({ global: result.message });
      return;
    }

    const { createUserProfile } = await import("@/lib/firebase-auth");
    const uid = result.user.id.replace("firebase_", "");
    await createUserProfile(uid, {
      phone,
      address,
      dob,
      handle: username,
    });

    setLoading(false);
    setSuccess(true);
  }

  async function onGoogleSignUp() {
    setLoading(true);
    setErrors({});
    const res = await signInWithGoogle();
    setLoading(false);
    if (!res.ok) {
      setErrors({ global: res.message });
      return;
    }
    if (res.needsProfile) {
      window.location.href = "/auth?mode=complete";
      return;
    }
    setSuccess(true);
  }

  useEffect(() => {
    if (!success) return;
    navigate({ to: "/dashboard" });
  }, [success, navigate]);

  if (success) return <Loader2 className="size-6 animate-spin mx-auto mt-12" />;

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-ink/55">Join Raffila and start playing for life-changing prizes.</p>
      </header>

      {errors.global && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm font-bold text-coral">
          {errors.global}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl bg-cream/50 p-1">
        {[1, 2].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { if (s === 1) setStep(1); if (s === 2 && validateStep1()) setStep(2); }}
            className={cn(
              "flex-1 h-9 rounded-lg text-xs font-extrabold transition-all duration-200",
              step === s ? "bg-ink text-white shadow-sm" : "text-ink/40 hover:text-ink/60",
            )}
          >
            {s === 1 ? "Account" : "Profile"}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="r-username" className="text-xs font-extrabold text-ink/60">Username</label>
            <input
              id="r-username"
              type="text"
              autoComplete="username"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(authInputBase(errors.username), "w-full")}
              autoFocus
            />
            <FieldError error={errors.username} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="r-email" className="text-xs font-extrabold text-ink/60">Email address</label>
            <input
              id="r-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(authInputBase(errors.email), "w-full")}
            />
            <FieldError error={errors.email} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="r-phone" className="text-xs font-extrabold text-ink/60">Phone number</label>
            <input
              id="r-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 803 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={cn(authInputBase(errors.phone), "w-full")}
            />
            <FieldError error={errors.phone} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="r-password" className="text-xs font-extrabold text-ink/60">Password</label>
              <div className="relative">
                <input
                  id="r-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(authInputBase(errors.password), "w-full pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2.5 grid place-items-center text-ink/30 hover:text-ink/60"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {password ? (
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[1, 2, 3, 4].map((dot) => (
                    <span key={dot} className={cn("h-1 flex-1 rounded-full transition-colors", strengthInfo.dots >= dot ? strengthInfo.color : "bg-ink/10")} />
                  ))}
                  <span className="text-[10px] font-extrabold text-ink/40">{strengthInfo.label}</span>
                </div>
              ) : null}
              <FieldError error={errors.password} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="r-confirm" className="text-xs font-extrabold text-ink/60">Confirm</label>
              <div className="relative">
                <input
                  id="r-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(authInputBase(errors.confirmPassword), "w-full pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute inset-y-0 right-2.5 grid place-items-center text-ink/30 hover:text-ink/60"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {password && confirmPassword && password === confirmPassword ? (
                <p className="flex items-center gap-1 px-1 text-[11px] font-extrabold text-mint">
                  <Check className="size-3" /> Passwords match
                </p>
              ) : (
                <FieldError error={errors.confirmPassword} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="r-address" className="text-xs font-extrabold text-ink/60">Residential address</label>
            <input
              id="r-address"
              type="text"
              autoComplete="street-address"
              placeholder="Street, city, state"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={cn(authInputBase(errors.address), "w-full")}
              autoFocus
            />
            <FieldError error={errors.address} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="r-dob" className="text-xs font-extrabold text-ink/60">Date of birth</label>
            <input
              id="r-dob"
              type="date"
              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={cn(authInputBase(errors.dob), "w-full text-ink/70 [color-scheme:light]")}
            />
            <p className="px-1 text-[11px] font-extrabold text-ink/40">Must be 18 or older</p>
            <FieldError error={errors.dob} />
          </div>

          <div className="space-y-1.5">
            <div className={cn("flex items-start gap-3 rounded-xl border p-3.5 transition-colors", errors.terms ? "border-coral bg-coral/5" : "border-ink/10 bg-cream/30")}>
              <Checkbox
                id="r-terms"
                checked={terms}
                onCheckedChange={(v) => { setTerms(Boolean(v)); if (errors.terms) setErrors((p) => { const n = { ...p }; delete n.terms; return n; }); }}
                className="mt-0.5 size-4 rounded-md"
              />
              <label htmlFor="r-terms" className="text-[12px] leading-relaxed font-bold text-ink/60 cursor-pointer select-none">
                I agree to the{" "}
                <Link to="/terms-and-conditions" className="text-coral hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>Terms</Link>,{" "}
                <Link to="/privacy-policy" className="text-coral hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>, and{" "}
                <Link to="/competition-rules" className="text-coral hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>Competition Rules</Link>.
              </label>
            </div>
            <FieldError error={errors.terms} />
          </div>
        </div>
      )}

      {step === 1 ? (
        <Button type="button" variant="primary" size="lg" className="w-full h-12 rounded-xl" onClick={onNext}>
          Continue
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1 h-12 rounded-xl border-ink/15" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button type="submit" variant="primary" size="lg" className="flex-[2] h-12 rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Creating..." : "Create account"}
          </Button>
        </div>
      )}

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-ink/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 font-extrabold uppercase tracking-[0.12em] text-ink/30">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full h-12 rounded-xl border-ink/15 hover:border-ink/25 hover:bg-cream/30"
        disabled={loading}
        onClick={onGoogleSignUp}
      >
        <GoogleIcon className="size-4.5" />
        Sign up with Google
      </Button>

      <p className="pt-1 text-center text-sm text-ink/55">
        Already have an account?{" "}
        <Link to="/auth" search={{ mode: undefined }} className="font-extrabold text-coral hover:underline hover:underline-offset-2">
          Sign in
        </Link>
      </p>
    </form>
  );
}
