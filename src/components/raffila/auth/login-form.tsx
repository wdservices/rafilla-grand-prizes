import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type UserRole } from "@/lib/auth-store";
import { useAuthActions } from "@/hooks/useAuthSession";
import { cn } from "@/lib/utils";

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

function authInputBase(error?: string) {
  return cn(
    "h-12 rounded-xl border bg-cream/30 px-4 text-sm font-bold text-ink placeholder:text-ink/35",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:border-coral focus-visible:ring-2 focus-visible:ring-coral/10",
    error ? "border-coral bg-coral/5" : "border-ink/10 hover:border-ink/20",
  );
}

type AuthErrors = { email?: string; password?: string; global?: string };

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successRole, setSuccessRole] = useState<UserRole | null>(null);
  const [errors, setErrors] = useState<AuthErrors>({});

  const { signIn, signInWithGoogle } = useAuthActions();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem("raffila:saved_email");
      const savedRemember = window.localStorage.getItem("raffila:remember_me");
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      } else if (savedRemember === "false") {
        setRemember(false);
      }
    } catch {
      // Ignore
    }
  }, []);

  function validate() {
    const next: AuthErrors = {};
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    const res = await signIn({ email, password, remember });
    setLoading(false);
    if (!res.ok) {
      setErrors({ global: res.message });
    } else {
      setSuccessRole(res.user.role);
      setSuccess(true);
    }
  }

  async function onGoogleSignIn() {
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
    setSuccessRole(res.user.role);
    setSuccess(true);
  }

  useEffect(() => {
    if (!success) return;
    const redirect = (successRole ?? "user") === "admin" ? "/admin" : "/dashboard";
    navigate({ to: redirect });
  }, [success, successRole, navigate]);

  if (success) return <Loader2 className="size-6 animate-spin mx-auto mt-12" />;

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          Phone/OTP is fastest on mobile. Email or Google also works.
        </p>
      </header>

      <div className="rounded-2xl bg-lemon/30 p-4 ring-1 ring-ink/10">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/50">
          Prefer phone?
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="primary" size="md" className="min-h-11 flex-1">
            <Link to="/auth" search={{ mode: "otp" }}>
              Continue with phone / OTP
            </Link>
          </Button>
          <Link
            to="/faq"
            className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-extrabold text-coral underline underline-offset-2 ring-1 ring-ink/10"
          >
            Get support
          </Link>
        </div>
      </div>

      {errors.global && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm font-bold text-coral">
          {errors.global}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-extrabold text-ink/60">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(authInputBase(errors.email), "w-full")}
          autoFocus
        />
        {errors.email ? <p className="px-1 text-xs font-bold text-coral">{errors.email}</p> : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-extrabold text-ink/60">
            Password
          </label>
          <Link
            to="/auth"
            search={{ mode: "forgot" }}
            className="text-xs font-extrabold text-coral hover:underline hover:underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(authInputBase(errors.password), "w-full pr-12")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-3 grid place-items-center pr-1 text-ink/30 hover:text-ink/60"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
          </button>
        </div>
        {errors.password ? (
          <p className="px-1 text-xs font-bold text-coral">{errors.password}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(v) => setRemember(Boolean(v))}
          className="size-4 rounded-md"
        />
        <label
          htmlFor="remember"
          className="text-xs font-bold text-ink/55 cursor-pointer select-none"
        >
          Remember me for 30 days
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full h-12 rounded-xl"
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-ink/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 font-extrabold uppercase tracking-[0.12em] text-ink/30">
            or
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full h-12 rounded-xl border-ink/15 hover:border-ink/25 hover:bg-cream/30"
        disabled={loading}
        onClick={onGoogleSignIn}
      >
        <GoogleIcon className="size-4.5" />
        Continue with Google
      </Button>

      <p className="pt-1 text-center text-sm text-ink/55">
        Don&apos;t have an account?{" "}
        <Link
          to="/auth"
          search={{ mode: undefined }}
          className="font-extrabold text-coral hover:underline hover:underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
