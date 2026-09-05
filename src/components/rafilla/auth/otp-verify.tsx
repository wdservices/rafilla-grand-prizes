import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COUNTDOWN_SECONDS = 5 * 60;
const RESEND_COOLDOWN = 60;

function formatTime(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function otpSlotBase(active: boolean, hasError?: boolean, filled?: boolean) {
  return cn(
    "grid size-[46px] place-items-center rounded-[14px] border-2 text-lg font-extrabold font-display text-ink transition-all duration-150 sm:size-14 sm:text-xl",
    filled ? "bg-cream/60" : "bg-cream/30",
    hasError
      ? "border-coral bg-coral/5"
      : active
        ? "border-coral ring-4 ring-coral/15"
        : "border-ink/10 hover:border-ink/20",
  );
}

export function OTPVerifyForm() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const allFilled = useMemo(() => digits.every((d) => d !== ""), [digits]);

  function handleChange(index: number, value: string) {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (error) setError(undefined);
    if (v && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted.charAt(i);
    setDigits(next);
    if (error) setError(undefined);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  function handleResend() {
    if (resendCooldown > 0) return;
    setDigits(["", "", "", "", "", ""]);
    setError(undefined);
    setTimeLeft(COUNTDOWN_SECONDS);
    setResendCooldown(RESEND_COOLDOWN);
    inputRefs.current[0]?.focus();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allFilled) {
      setError("Please enter all 6 digits");
      return;
    }
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
        <ArrowLeft className="size-4" /> Back
      </Link>

      {success ? (
        <div className="py-4 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint/30">
            <CheckCircle2 className="size-8 text-mint" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">
            Phone verified
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            Your phone number has been confirmed. Welcome to Rafilla.
          </p>
          <Button asChild variant="dark" size="md" className="mt-6">
            <Link to="/competitions">Browse competitions</Link>
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="space-y-6">
          <header>
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-lilac/40 sm:mx-0">
              <ShieldCheck className="size-6 text-ink" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Verify your phone
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              We sent a 6-digit code to{" "}
              <span className="font-extrabold text-ink">+234 803 *** 1234</span>. It expires in{" "}
              <span className="inline-flex items-center font-extrabold text-coral">
                {formatTime(timeLeft)}
              </span>
              .
            </p>
          </header>

          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className={cn(
                  otpSlotBase(d !== "", error !== undefined, d !== ""),
                  "text-center caret-transparent",
                )}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {error ? (
            <p className="flex items-center justify-center gap-1 text-xs font-bold text-coral">
              <AlertCircle className="size-3.5" />
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-center gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={resendCooldown > 0}
              onClick={handleResend}
              className="font-extrabold"
            >
              {resendCooldown > 0 ? `Resend code (${formatTime(resendCooldown)})` : "Resend code"}
            </Button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading || !allFilled}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Verifying..." : "Verify and continue"}
          </Button>
        </form>
      )}
    </div>
  );
}
