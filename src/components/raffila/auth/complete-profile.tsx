import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, User, Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";

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

function authTextareaBase(error?: string) {
  return cn(
    "min-h-[96px] rounded-[14px] border-2 bg-cream/40 px-4 py-3 text-sm font-bold text-ink placeholder:text-ink/30 resize-none",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:border-coral focus-visible:ring-0",
    error ? "border-coral bg-coral/5" : "border-ink/10 hover:border-ink/20",
  );
}

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string | undefined;
  required?: boolean | undefined;
  children: React.ReactNode;
  hint?: string | undefined;
}

function FieldWrapper({ id, label, error, required, children, hint }: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-extrabold text-ink/70">
          {label}
          {required ? <span className="ml-0.5 text-coral">*</span> : null}
        </Label>
      </div>
      <div className="relative">{children}</div>
      {error ? (
        <p className="flex items-center gap-1 text-xs font-bold text-coral">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs font-bold text-ink/40">{hint}</p>
      ) : null}
    </div>
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

export function CompleteProfileForm() {
  const [username, setUsername] = useState("tunmise_ade");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    phone?: string;
    address?: string;
    dob?: string;
  }>({});

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function validate() {
    const next: typeof errors = {};
    if (!username) next.username = "Username is required";
    else if (username.length < 3) next.username = "Username must be at least 3 characters";
    if (!phone) next.phone = "Phone number is required";
    else if (!/^(\+?234|0)[789]\d{9}$/.test(phone.replace(/\s/g, "")))
      next.phone = "Enter a valid Nigerian number";
    if (!address) next.address = "Residential address is required";
    if (!dob) next.dob = "Date of birth is required";
    else if (!isAdult(dob)) next.dob = "You must be 18 or older";
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
    }, 1600);
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
            Profile complete!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            Your Raffila account is ready to go.
          </p>
          <Button asChild variant="dark" size="md" className="mt-6">
            <Link to="/competitions">Browse competitions</Link>
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="space-y-4.5">
          <header>
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-coral/20 sm:mx-0">
              <User className="size-6 text-coral" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Complete your Raffila profile
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              We just need a few more details to set up your account.
            </p>
          </header>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5 rounded-[20px] border-2 border-ink/10 bg-cream/30 p-4 sm:p-5">
            <label htmlFor="cp-avatar" className="relative cursor-pointer group">
              <div
                className={cn(
                  "grid size-20 place-items-center overflow-hidden rounded-[22px] border-2 ring-4 ring-white shadow-sm",
                  avatarPreview ? "border-lilac" : "border-ink/10 bg-lilac/20",
                )}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt=""
                    aria-hidden="true"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-10 place-items-center rounded-full bg-white text-ink/40">
                    <User className="size-6" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-coral text-paper shadow-md ring-2 ring-white">
                <Camera className="size-4" />
              </span>
              <input
                id="cp-avatar"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
              />
            </label>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display text-lg font-extrabold text-ink">Profile picture</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/55">
                Upload a photo (optional). PNG or JPG, max 5&nbsp;MB). This will be shown on your
                entry slips and winner announcements.
              </p>
            </div>
          </div>

          <FieldWrapper
            id="cp-username"
            label="Username"
            required
            error={errors.username}
            hint="Prefilled from your Google account"
          >
            <input
              id="cp-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={authInputBase(errors.username)}
            />
          </FieldWrapper>

          <FieldWrapper
            id="cp-phone"
            label="Phone number"
            required
            error={errors.phone}
            hint="NG format: +234 803 ..."
          >
            <input
              id="cp-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 803 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={authInputBase(errors.phone)}
            />
          </FieldWrapper>

          <FieldWrapper id="cp-address" label="Residential address" required error={errors.address}>
            <textarea
              id="cp-address"
              autoComplete="street-address"
              placeholder="Street, city, state"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={authTextareaBase(errors.address)}
            />
          </FieldWrapper>

          <FieldWrapper
            id="cp-dob"
            label="Date of birth"
            required
            error={errors.dob}
            hint="Must be 18+ years"
          >
            <input
              id="cp-dob"
              type="date"
              max={
                new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
              }
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={cn(authInputBase(errors.dob), "text-ink/70 [color-scheme:light]")}
            />
          </FieldWrapper>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Saving profile..." : "Save and continue"}
          </Button>
        </form>
      )}
    </div>
  );
}
