import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, User, Loader2, AlertCircle, Camera, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthActions, useAuthSession } from "@/hooks/useAuthSession";
import { checkUsernameAvailability, validateUsernameFormat } from "@/lib/user-validation";

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

/**
 * Downscale an image file to a small JPEG data URL so it fits comfortably
 * inside a Firestore document (1MB limit).
 */
function downscaleImage(file: File, maxDim = 512, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };
    img.src = url;
  });
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
  const { user } = useAuthSession();
  const { completeGoogleProfile } = useAuthActions();
  const navigate = useNavigate();

  const defaultUsername = user?.handle || user?.firstName?.toLowerCase().replace(/\s+/g, "_") || "";
  const [username, setUsername] = useState(defaultUsername);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    phone?: string;
    address?: string;
    dob?: string;
    global?: string;
  }>({});

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Small files can be used directly; larger ones are downscaled so the
    // saved avatar fits inside a Firestore document.
    if (file.size <= 400 * 1024) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    downscaleImage(file)
      .then((url) => setAvatarPreview(url))
      .catch(() => {
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
      });
  }

  async function handleUsernameBlur() {
    if (!username.trim()) return;
    const format = validateUsernameFormat(username);
    if (!format.valid) {
      setErrors((prev) => ({ ...prev, username: format.error }));
      setUsernameAvailable(false);
      return;
    }
    setCheckingUsername(true);
    try {
      const currentUid = user?.id?.replace("firebase_", "");
      const res = await checkUsernameAvailability(username, currentUid);
      if (!res.available) {
        setErrors((prev) => ({ ...prev, username: res.error || "This username is already taken" }));
        setUsernameAvailable(false);
      } else {
        setErrors((prev) => {
          const n = { ...prev };
          delete n.username;
          return n;
        });
        setUsernameAvailable(true);
      }
    } catch {
      // Ignore
    } finally {
      setCheckingUsername(false);
    }
  }

  function validate() {
    const next: typeof errors = {};
    const format = validateUsernameFormat(username);
    if (!format.valid) next.username = format.error;
    if (!phone) next.phone = "Phone number is required";
    else if (!/^(\+?234|0)[789]\d{9}$/.test(phone.replace(/\s/g, "")))
      next.phone = "Enter a valid Nigerian number";
    if (!address) next.address = "Residential address is required";
    if (!dob) next.dob = "Date of birth is required";
    else if (!isAdult(dob)) next.dob = "You must be 18 or older";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const currentUid = user?.id?.replace("firebase_", "");
    const avail = await checkUsernameAvailability(username, currentUid);
    if (!avail.available) {
      setLoading(false);
      setErrors({
        username: avail.error || "This username is already taken. Please choose another.",
      });
      return;
    }

    const result = await completeGoogleProfile({
      phone,
      address,
      dob,
      handle: username,
      ...(avatarPreview ? { avatarUrl: avatarPreview } : {}),
    });

    setLoading(false);
    if (!result.ok) {
      setErrors({ global: result.message });
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
    <div className="space-y-6">
      <Link
        to="/auth"
        search={{ mode: undefined }}
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink/55 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>

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

        {errors.global && (
          <div className="rounded-2xl border-2 border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-coral">
            {errors.global}
          </div>
        )}

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
          label="Username (unique handle)"
          required
          error={errors.username}
          hint={
            checkingUsername ? (
              <span className="flex items-center gap-1 text-ink/40">
                <Loader2 className="size-3 animate-spin" /> Checking availability...
              </span>
            ) : usernameAvailable === true && !errors.username ? (
              <span className="flex items-center gap-1 text-mint font-extrabold">
                <Check className="size-3" /> Username is available
              </span>
            ) : (
              "Letters, numbers, underscores and dots. Unique to you."
            )
          }
        >
          <input
            id="cp-username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameAvailable(null);
              if (errors.username) {
                setErrors((p) => {
                  const n = { ...p };
                  delete n.username;
                  return n;
                });
              }
            }}
            onBlur={handleUsernameBlur}
            className={cn(
              authInputBase(errors.username),
              "w-full",
              usernameAvailable === true && !errors.username && "border-mint/50 bg-mint/5",
            )}
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
    </div>
  );
}
