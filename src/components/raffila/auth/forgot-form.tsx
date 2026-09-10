import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function authInputBase(error?: string) {
  return cn(
    "h-12 rounded-[14px] border-2 bg-cream/40 px-4 text-sm font-bold text-ink placeholder:text-ink/30",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:border-coral focus-visible:ring-0",
    error ? "border-coral bg-coral/5" : "border-ink/10 hover:border-ink/20",
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function validate() {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError(undefined);
    return true;
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

  return (
    <div className="space-y-6">
      <Link
        to="/auth"
        search={{ mode: undefined }}
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink/55 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back to Log in
      </Link>

      {success ? (
        <div className="py-4 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint/30">
            <CheckCircle2 className="size-8 text-mint" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">
            Reset link sent
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            If that email is registered you will receive a reset link shortly.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="dark" size="md">
              <Link to="/auth" search={{ mode: undefined }}>
                Back to Log in
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="space-y-5">
          <header>
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-sky/20 sm:mx-0">
              <Mail className="size-6 text-sky" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </header>

          <div className="space-y-2">
            <Label htmlFor="f-email" className="text-xs font-extrabold text-ink/70">
              Email address
            </Label>
            <input
              id="f-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputBase(error)}
            />
            {error ? (
              <p className="flex items-center gap-1 text-xs font-bold text-coral">
                <AlertCircle className="size-3.5" />
                {error}
              </p>
            ) : null}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Sending link..." : "Send reset link"}
          </Button>

          <p className="pt-1 text-center text-sm font-bold text-ink/60">
            Remembered it?{" "}
            <Link
              to="/auth"
              search={{ mode: undefined }}
              className="text-coral hover:underline hover:underline-offset-2"
            >
              Log in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
