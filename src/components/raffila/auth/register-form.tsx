import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getPasswordStrength, passwordStrengthLabels } from "@/lib/password-strength";
import { useAuthActions } from "@/hooks/useAuthSession";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
      />
      <path
        fill="#34A853"
        d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
      />
      <path
        fill="#4A90E2"
        d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
      />
      <path
        fill="#FBBC05"
        d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
      />
    </svg>
  );
}

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

const strengthLabels: Record<PasswordStrength, { label: string; color: string; dots: number }> = {
  0: { label: "", color: "bg-ink/10", dots: 0 },
  1: passwordStrengthLabels[0],
  2: passwordStrengthLabels[1],
  3: passwordStrengthLabels[2],
  4: passwordStrengthLabels[3],
};

function authInputBase(error?: string) {
  return cn(
    "h-12 rounded-[14px] border-2 bg-cream/40 px-4 text-sm font-bold text-ink placeholder:text-ink/40",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:border-coral focus-visible:ring-0",
    error ? "border-coral bg-coral/5" : "border-ink/10 hover:border-ink/20",
  );
}

function authTextareaBase(error?: string) {
  return cn(
    "min-h-[90px] rounded-[14px] border-2 bg-cream/40 px-4 py-3 text-sm font-bold text-ink placeholder:text-ink/40 resize-none",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:border-coral focus-visible:ring-0",
    error ? "border-coral bg-coral/5" : "border-ink/10 hover:border-ink/20",
  );
}

function ErrorRow({ error, hint }: { error?: string; hint?: string }) {
  if (error)
    return (
      <p className="flex items-center gap-1 px-1 text-xs font-bold text-coral">
        <AlertCircle className="size-3.5" />
        {error}
      </p>
    );
  if (hint) return <p className="px-1 text-xs font-bold text-ink/40">{hint}</p>;
  return null;
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
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    address?: string;
    dob?: string;
    terms?: string;
  }>({});

  const { signInQuick } = useAuthActions();

  const strength = useMemo(
    () => (password ? ((Math.min(3, getPasswordStrength(password)) + 1) as PasswordStrength) : 0),
    [password],
  );
  const strengthInfo = strengthLabels[strength];

  function validate() {
    const next: typeof errors = {};
    if (!username) next.username = "Username is required";
    else if (username.length < 3) next.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_.-]+$/.test(username))
      next.username = "Letters, numbers, dots, underscores only";

    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";

    if (!phone) next.phone = "Phone number is required";
    else if (!/^(\+?234|0)[789]\d{9}$/.test(phone.replace(/\s/g, "")))
      next.phone = "Enter a valid Nigerian number";

    if (!password) next.password = "Password is required";
    else if (password.length < 8)
      next.password = "Use 8+ characters with a mix of letters & numbers";
    else if (strength < 2) next.password = "Choose a stronger password (add uppercase or symbols)";

    if (!confirmPassword) next.confirmPassword = "Confirm your password";
    else if (confirmPassword !== password) next.confirmPassword = "Passwords do not match";

    if (!address) next.address = "Residential address is required";
    else if (address.length < 10) next.address = "Please enter a complete address";

    if (!dob) next.dob = "Date of birth is required";
    else if (!isAdult(dob)) next.dob = "You must be 18 or older to create an account";

    if (!terms)
      next.terms =
        "You must accept the terms, privacy policy, and rules before creating an account.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      setSuccess(true);
      await signInQuick("user");
    }, 1800);
  }

  if (success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint/30">
          <CheckCircle2 className="size-8 text-mint" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">Account created!</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Welcome to Raffila — taking you to your dashboard now.
        </p>
        <Button asChild variant="dark" size="md" className="mt-6">
          <Link to="/dashboard">Go to my dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-3.5">
      <header className="mb-0.5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Join Raffila and start playing for life-changing prizes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <input
            id="r-username"
            type="text"
            autoComplete="username"
            placeholder="Username *"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={cn(authInputBase(errors.username), "w-full")}
          />
          <ErrorRow error={errors.username} hint="e.g. tunmise_24" />
        </div>

        <div className="space-y-1">
          <input
            id="r-email"
            type="email"
            autoComplete="email"
            placeholder="Email address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(authInputBase(errors.email), "w-full")}
          />
          <ErrorRow error={errors.email} />
        </div>
      </div>

      <div className="space-y-1">
        <input
          id="r-phone"
          type="tel"
          autoComplete="tel"
          placeholder="Phone number * (NG)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={cn(authInputBase(errors.phone), "w-full")}
        />
        <ErrorRow error={errors.phone} hint="+234 803 000 0000" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="relative">
            <input
              id="r-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(authInputBase(errors.password), "w-full pr-12")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 grid place-items-center pr-1 text-ink/40 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {password ? (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((dot) => (
                  <span
                    key={dot}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-200",
                      strengthInfo.dots >= dot ? strengthInfo.color : "bg-ink/10",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-ink/60">{strengthInfo.label}</p>
            </div>
          ) : null}
          <ErrorRow error={errors.password} />
        </div>

        <div className="space-y-1">
          <div className="relative">
            <input
              id="r-confirm"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm password *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(authInputBase(errors.confirmPassword), "w-full pr-12")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute inset-y-0 right-3 grid place-items-center pr-1 text-ink/40 hover:text-ink"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          <ErrorRow error={errors.confirmPassword} />
        </div>
      </div>

      <div className="space-y-1">
        <textarea
          id="r-address"
          autoComplete="street-address"
          placeholder="Residential address *"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={cn(authTextareaBase(errors.address), "w-full")}
        />
        <ErrorRow error={errors.address} hint="Street, city, state" />
      </div>

      <div className="space-y-1">
        <input
          id="r-dob"
          type="date"
          placeholder="Date of birth"
          max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className={cn(authInputBase(errors.dob), "w-full text-ink/70 [color-scheme:light]")}
        />
        <ErrorRow error={errors.dob} hint="Must be 18+ years" />
      </div>

      <div className="space-y-1.5 pt-0.5">
        <div
          className={cn(
            "flex items-start gap-3 rounded-[14px] border-2 p-3.5",
            errors.terms ? "border-coral bg-coral/5" : "border-ink/10 bg-cream/30",
          )}
        >
          <Checkbox
            id="r-terms"
            checked={terms}
            onCheckedChange={(v) => {
              setTerms(Boolean(v));
              if (errors.terms) {
                setErrors((p) => {
                  const next = { ...p };
                  delete next.terms;
                  return next;
                });
              }
            }}
            className="mt-0.5 size-5 rounded-md"
          />
          <label
            htmlFor="r-terms"
            className="text-xs leading-relaxed font-bold text-ink/70 cursor-pointer select-none"
          >
            I have read and agree to the{" "}
            <Link
              to="/terms-and-conditions"
              className="text-coral hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Terms and Conditions
            </Link>
            ,{" "}
            <Link
              to="/privacy-policy"
              className="text-coral hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </Link>
            , and{" "}
            <Link
              to="/competition-rules"
              className="text-coral hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Competition Rules
            </Link>
            .
          </label>
        </div>
        <ErrorRow error={errors.terms} />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <div className="relative py-0.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-ink/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 font-extrabold uppercase tracking-[0.14em] text-ink/35">
            or continue with
          </span>
        </div>
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full">
        <GoogleIcon className="size-4.5" />
        Continue with Google
      </Button>

      <p className="pt-0.5 text-center text-sm font-bold text-ink/60">
        Have an account?{" "}
        <Link
          to="/auth"
          search={{ mode: undefined }}
          className="text-coral hover:underline hover:underline-offset-2"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
