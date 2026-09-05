import { useState } from "react";
import { Camera, Mail, Phone, ShieldCheck, BadgeCheck, AlertCircle } from "lucide-react";

import { DashboardShell } from "@/components/rafilla/dashboard/shell";
import { Button } from "@/components/ui/button";

export function DashboardProfilePage() {
  const [form, setForm] = useState({
    username: "tunmiseadeyemi",
    email: "t***@********",
    phone: "+234 803 123 4567",
    firstName: "Tunmise",
    lastName: "Adeyemi",
    address: "14, Allen Avenue, Ikeja",
    dob: "1998-06-14",
    state: "Lagos",
    lga: "Ikeja",
    country: "NG",
  });
  const [savedToast, setSavedToast] = useState(false);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <DashboardShell activeNav="Profile">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Your identity on Rafilla
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            My Profile
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/60">
            Keep your details up to date so prize claims and support are fast and smooth.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="rounded-[28px] bg-paper p-6 text-center ring-1 ring-ink/5">
              <label className="relative mx-auto block size-[112px] cursor-pointer group">
                <div className="absolute inset-0 overflow-hidden rounded-full bg-lilac/40 ring-1 ring-ink/5">
                  <div className="grid h-full w-full place-items-center font-display text-4xl font-extrabold text-ink">
                    TA
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full bg-coral text-paper shadow-[0_6px_14px_-6px_var(--coral)] ring-2 ring-paper group-hover:scale-105 transition-transform">
                  <Camera className="size-4" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => {}}
                />
              </label>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
                Tunmise Adeyemi
              </h2>
              <p className="mt-1 text-sm font-bold text-ink/45">@{form.username}</p>
              <p className="mt-4 text-[11px] font-bold text-ink/40">
                Tap avatar to upload a photo (JPG, PNG · max 3MB)
              </p>
            </div>

            <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
              <h3 className="font-display text-lg font-extrabold text-ink">
                Verification
              </h3>
              <p className="mt-1 text-xs font-bold text-ink/45">
                Verified details speed up prize claims.
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-mint/20 p-3">
                  <div className="flex items-center gap-3">
                    <Mail className="size-5 text-coral" />
                    <div>
                      <p className="text-sm font-extrabold text-ink">Email</p>
                      <p className="text-[11px] font-bold text-ink/45 truncate max-w-[160px]">
                        {form.email}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint/40 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                    <BadgeCheck className="size-3" /> VERIFIED
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-lemon/25 p-3">
                  <div className="flex items-center gap-3">
                    <Phone className="size-5 text-coral" />
                    <div>
                      <p className="text-sm font-extrabold text-ink">Phone</p>
                      <p className="text-[11px] font-bold text-ink/45">{form.phone}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-lemon/40 px-2.5 py-1 text-[10px] font-extrabold text-ink">
                    ⏳ PENDING
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-cream p-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 text-ink/50" />
                    <div>
                      <p className="text-sm font-extrabold text-ink">Identity</p>
                      <p className="text-[11px] font-bold text-ink/45">
                        Not required for entry
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink/10 px-2.5 py-1 text-[10px] font-extrabold text-ink/70">
                    <AlertCircle className="size-3" /> OPTIONAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Username"
                value={form.username}
                onChange={(v) => update("username", v)}
                placeholder="Choose a username"
              />
              <Field
                label="Email address"
                value={form.email}
                readOnly
                trailing={
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint/40 px-2 py-1 text-[10px] font-extrabold text-ink">
                    <BadgeCheck className="size-3" /> Verified
                  </span>
                }
              />
              <Field
                label="Phone number"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                placeholder="+234 800 000 0000"
              />
              <div />
              <Field
                label="First name"
                value={form.firstName}
                onChange={(v) => update("firstName", v)}
                placeholder="First name"
              />
              <Field
                label="Last name"
                value={form.lastName}
                onChange={(v) => update("lastName", v)}
                placeholder="Last name"
              />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Residential address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral"
                  placeholder="House number, street, city"
                />
              </div>
              <Field
                label="Date of birth"
                type="date"
                value={form.dob}
                onChange={(v) => update("dob", v)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="State"
                  value={form.state}
                  onChange={(v) => update("state", v)}
                  placeholder="State"
                />
                <Field
                  label="LGA"
                  value={form.lga}
                  onChange={(v) => update("lga", v)}
                  placeholder="Local Govt"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="min-h-11 w-full rounded-2xl bg-cream px-4 text-sm font-extrabold text-ink outline-none ring-1 ring-ink/5 focus:ring-2 focus:ring-coral"
                >
                  <option value="NG">Nigeria (🇳🇬)</option>
                  <option value="GH">Ghana (🇬🇭)</option>
                  <option value="KE">Kenya (🇰🇪)</option>
                  <option value="ZA">South Africa (🇿🇦)</option>
                  <option value="GB">United Kingdom (🇬🇧)</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse items-start justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
              <p className="text-xs font-bold text-ink/45">Last updated 3 days ago.</p>
              <div className="flex items-center gap-3">
                {savedToast && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-ink">
                    <BadgeCheck className="size-3.5" /> Changes saved
                  </span>
                )}
                <Button variant="primary" size="lg" onClick={handleSave}>
                  Update profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  trailing,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">
          {label}
        </label>
        {trailing}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="min-h-11 w-full rounded-2xl bg-cream px-4 text-sm font-bold text-ink ring-1 ring-ink/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-coral disabled:opacity-60"
      />
    </div>
  );
}
