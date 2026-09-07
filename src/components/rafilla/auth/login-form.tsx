import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    "h-12 rounded-[14px] border-2 bg-cream/40 px-4 text-sm font-bold text-ink placeholder:text-ink/40",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:border-coral focus-visible:ring-0",
    error ? "border-coral bg-coral/5" : "border-ink/10 hover:border-ink/20",
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1400);
  }

  if (success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint/30">
          <CheckCircle2 className="size-8 text-mint" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">Welcome back!</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          You are now signed in to your Rafilla account.
        </p>
        <Button asChild variant="dark" size="md" className="mt-6">
          <Link to="/competitions">Browse competitions</Link>
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <header className="mb-1">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-ink/60">Sign in to continue your Rafilla journey.</p>
      </header>

      <div className="space-y-1">
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(authInputBase(errors.email), "w-full")}
        />
        {errors.email ? <p className="px-1 text-xs font-bold text-coral">{errors.email}</p> : null}
      </div>

      <div className="space-y-1">
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Password"
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
        <div className="flex items-center justify-between px-1">
          {errors.password ? (
            <p className="text-xs font-bold text-coral">{errors.password}</p>
          ) : <span />}
          <Link
            to="/auth"
            search={{ mode: "forgot" }}
            className="text-xs font-extrabold text-coral hover:underline hover:underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(v) => setRemember(Boolean(v))}
          className="size-5 rounded-md"
        />
        <label
          htmlFor="remember"
          className="text-xs font-bold text-ink/65 cursor-pointer select-none"
        >
          Remember me for 30 days
        </label>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {loading ? "Signing in..." : "Log in"}
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

      <p className="pt-1 text-center text-sm font-bold text-ink/60">
        No account?{" "}
        <Link
          to="/auth"
          search={{ mode: undefined }}
          className="text-coral hover:underline hover:underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
