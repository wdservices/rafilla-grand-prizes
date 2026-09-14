import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  UserMinus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Crown,
} from "lucide-react";

import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { logActivity, sendAdminInvite, cancelAdminInvite } from "@/lib/activity-log";
import {
  FEATURE_META,
  DEFAULT_FEATURES,
  PLATFORM_CONFIG_DOC_ID,
} from "@/lib/platform-config";
import { getEmailDocKey, normalizeEmail } from "@/lib/user-validation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { cn } from "@/lib/utils";

interface AdminRow {
  id: string;
  email: string;
  name: string;
  handle: string;
  createdAt: string;
}

function Section({
  icon: Icon,
  tone,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
      <div className="flex items-start gap-4">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", tone)}>
          <Icon className="size-5 text-coral" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55">{description}</p>
        </div>
      </div>
      <Separator className="my-5 bg-ink/8" />
      {children}
    </section>
  );
}

export function AdminSettingsPage() {
  const { user } = useAuthSession();
  const selfUid = user?.id?.startsWith("firebase_") ? user.id.slice("firebase_".length) : user?.id ?? "";

  // ---- Administrators ----
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [inviteCandidate, setInviteCandidate] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [invites, setInvites] = useState<Array<{ email: string; invitedBy: string; createdAt: string }>>([]);
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminsError(null);
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("role", "==", "admin"), limit(50)),
      );
      const rows: AdminRow[] = snap.docs.map((d) => {
        const v = d.data() as Record<string, unknown>;
        const first = (v["firstName"] as string) || "";
        const last = (v["lastName"] as string) || "";
        const display = (v["displayName"] as string) || `${first} ${last}`.trim();
        let created = "";
        try {
          const c: any = v["createdAt"];
          created = typeof c?.toDate === "function" ? (c.toDate() as Date).toISOString() : String(c ?? "");
        } catch {
          created = "";
        }
        return {
          id: d.id,
          email: (v["email"] as string) || "",
          name: display || (v["handle"] as string) || d.id.slice(0, 8),
          handle: (v["handle"] as string) || "",
          createdAt: created,
        };
      });
      rows.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
      setAdmins(rows);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      setAdminsError(
        code === "permission-denied"
          ? "Firestore denied access. Publish the latest firestore.rules in Firebase Console (Firestore → Rules), then refresh."
          : err?.message || "Could not load administrators",
      );
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  const fetchInvites = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, "adminInvites"), limit(50)));
      const rows = snap.docs.map((d) => {
        const v = d.data() as Record<string, unknown>;
        let created = "";
        try {
          const c: any = v["createdAt"];
          created = typeof c?.toDate === "function" ? (c.toDate() as Date).toISOString() : "";
        } catch {
          created = "";
        }
        return {
          email: (v["email"] as string) || d.id,
          invitedBy: (v["invitedBy"] as string) || "",
          createdAt: created,
        };
      });
      setInvites(rows);
    } catch {
      setInvites([]);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
    void fetchInvites();
  }, [fetchAdmins, fetchInvites]);

  const handleSendInvite = async () => {
    if (!inviteCandidate || inviting) return;
    setInviting(true);
    try {
      const { emailed } = await sendAdminInvite(inviteCandidate, {
        id: selfUid,
        email: user?.email ?? "",
        name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      });
      setInviteCandidate(null);
      setNewEmail("");
      await fetchInvites();
      toast.success("Admin invite sent", {
        description: emailed
          ? "Invitation email sent — rights apply on first sign-in."
          : "Invite saved. Add EmailJS keys to .env to email invites out — rights still apply on first sign-in.",
      });
    } catch (err: any) {
      toast.error("Could not send invite", { description: permissionHint(err) });
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (email: string) => {
    setCancellingInvite(email);
    try {
      await cancelAdminInvite(email);
      await fetchInvites();
      toast.success("Invite cancelled", { description: email });
    } catch (err: any) {
      toast.error("Could not cancel invite", { description: permissionHint(err) });
    } finally {
      setCancellingInvite(null);
    }
  };

  useEffect(() => {
    if (!confirmRevokeId) return;
    const t = setTimeout(() => setConfirmRevokeId(null), 4000);
    return () => clearTimeout(t);
  }, [confirmRevokeId]);

  /** Find a user doc by email: registry first (case-insensitive), then direct query. */
  async function findUserByEmail(email: string): Promise<{ id: string; data: Record<string, unknown> } | null> {
    const clean = normalizeEmail(email);
    try {
      const regSnap = await getDoc(doc(db, "registeredEmails", getEmailDocKey(clean)));
      if (regSnap.exists()) {
        const uid = (regSnap.data() as Record<string, unknown>)["uid"] as string | undefined;
        if (uid) {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) {
            return { id: userSnap.id, data: userSnap.data() as Record<string, unknown> };
          }
        }
      }
    } catch {
      // fall through to query
    }
    const snap = await getDocs(
      query(collection(db, "users"), where("email", "==", clean), limit(1)),
    );
    if (!snap.empty) {
      const d = snap.docs[0]!;
      return { id: d.id, data: d.data() as Record<string, unknown> };
    }
    // Last resort: exact raw input (catches docs stored before normalization).
    const raw = email.trim();
    if (raw !== clean) {
      const snap2 = await getDocs(
        query(collection(db, "users"), where("email", "==", raw), limit(1)),
      );
      if (!snap2.empty) {
        const d = snap2.docs[0]!;
        return { id: d.id, data: d.data() as Record<string, unknown> };
      }
    }
    return null;
  }

  function permissionHint(err: any): string {
    const code = err?.code as string | undefined;
    const msg = err?.message || String(err);
    if (code === "permission-denied" || /permission|insufficient/i.test(msg)) {
      return "Firestore denied the write. Publish the latest firestore.rules in Firebase Console (Firestore → Rules), then retry.";
    }
    return msg;
  }

  const handleAddAdmin = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid email", { description: "Enter a valid email address." });
      return;
    }
    setAdding(true);
    try {
      const target = await findUserByEmail(email);
      if (!target) {
        // No account yet — offer an invite instead of a dead end.
        setInviteCandidate(email);
        toast.info("No account found", {
          description: `${email} has no Raffila account yet — send an invite below.`,
        });
        return;
      }
      setInviteCandidate(null);
      const data = target.data;
      if (data["role"] === "admin") {
        toast.info("Already an administrator", { description: email });
        return;
      }
      await updateDoc(doc(db, "users", target.id), {
        role: "admin",
        isAdmin: true,
        verified: true,
        updatedAt: serverTimestamp(),
      });
      await logActivity({
        eventType: "USER_UPDATE",
        targetType: "user",
        targetId: target.id,
        summary: `Granted admin access to ${email}`,
        oldValue: { role: (data["role"] as string) ?? "user" },
        newValue: { role: "admin" },
      });
      setNewEmail("");
      await fetchAdmins();
      toast.success("Administrator added", { description: `${email} can now sign in to /admin.` });
    } catch (err: any) {
      toast.error("Could not add administrator", { description: permissionHint(err) });
    } finally {
      setAdding(false);
    }
  };

  const handleRevokeAdmin = async (row: AdminRow) => {
    if (confirmRevokeId !== row.id) {
      setConfirmRevokeId(row.id);
      return;
    }
    if (row.id === selfUid) {
      toast.error("Not allowed", { description: "You cannot revoke your own admin access." });
      setConfirmRevokeId(null);
      return;
    }
    if (admins.length <= 1) {
      toast.error("Not allowed", { description: "At least one administrator must remain." });
      setConfirmRevokeId(null);
      return;
    }
    setRevoking(true);
    try {
      const snap = await getDoc(doc(db, "users", row.id));
      const prev = snap.exists() ? ((snap.data() as Record<string, unknown>)["role"] ?? "admin") : "admin";
      await updateDoc(doc(db, "users", row.id), {
        role: "user",
        isAdmin: false,
        updatedAt: serverTimestamp(),
      });
      await logActivity({
        eventType: "USER_UPDATE",
        targetType: "user",
        targetId: row.id,
        summary: `Revoked admin access from ${row.email || row.name}`,
        oldValue: { role: prev },
        newValue: { role: "user" },
      });
      setConfirmRevokeId(null);
      await fetchAdmins();
      toast.success("Admin access revoked", { description: row.email || row.name });
    } catch (err: any) {
      toast.error("Could not revoke access", { description: permissionHint(err) });
    } finally {
      setRevoking(false);
    }
  };

  // ---- Feature availability ----
  const [features, setFeatures] = useState<Record<string, boolean>>({ ...DEFAULT_FEATURES });
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [featuresSaving, setFeaturesSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "platformSettings", PLATFORM_CONFIG_DOC_ID));
        if (!cancelled && snap.exists()) {
          const stored = ((snap.data() as Record<string, unknown>)["features"] as Record<string, unknown>) ?? {};
          setFeatures((prev) => {
            const next = { ...prev };
            for (const { key } of FEATURE_META) {
              if (typeof stored[key] === "boolean") next[key] = stored[key] as boolean;
            }
            return next;
          });
        }
      } catch (err) {
        console.warn("Could not load feature flags:", err);
      } finally {
        if (!cancelled) setFeaturesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveFeatures = async () => {
    setFeaturesSaving(true);
    try {
      await setDoc(
        doc(db, "platformSettings", PLATFORM_CONFIG_DOC_ID),
        { features, updatedAt: serverTimestamp() },
        { merge: true },
      );
      await logActivity({
        eventType: "CONFIG_CHANGE",
        targetType: "platformSettings",
        targetId: PLATFORM_CONFIG_DOC_ID,
        summary: "Updated feature availability",
        details: { features },
      });
      toast.success("Feature availability saved", {
        description: "User dashboard navigation updates immediately.",
      });
    } catch (err: any) {
      toast.error("Save failed", { description: err?.message || String(err) });
    } finally {
      setFeaturesSaving(false);
    }
  };

  return (
    <AdminShell activeNav="settings" title="Settings">
      <div className="space-y-6">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Admin · Platform
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Who can administer Raffila and which platform modules are available — all stored live
            in Firestore, every change written to the audit trail.
          </p>
        </header>

        <Section
          icon={Crown}
          tone="bg-lemon/30"
          title="Administrators"
          description="Grant or revoke admin access by email. The account must already exist — new admins sign in normally and land on this dashboard. Roles live on the user's Firestore document; nothing is hardcoded."
        >
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAddAdmin();
                }}
                placeholder="admin@example.com"
                className="h-12 rounded-2xl border-0 bg-white pl-11 pr-4 text-sm font-bold text-ink ring-1 ring-ink/10 placeholder:text-ink/35 focus-visible:ring-coral focus-visible:ring-2"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => void handleAddAdmin()}
              disabled={adding}
              className="h-12 shrink-0 rounded-2xl px-6 font-bold"
            >
              {adding ? (
                <RefreshCw className="mr-1.5 size-4 animate-spin" />
              ) : (
                <UserPlus className="mr-1.5 size-4" />
              )}
              {adding ? "Adding…" : "Add administrator"}
            </Button>
          </div>

          {inviteCandidate && (
            <div className="mt-4 space-y-3 rounded-2xl bg-lemon/20 p-4 ring-1 ring-lemon/50">
              <p className="text-xs font-bold leading-relaxed text-ink/75">
                No Raffila account uses{" "}
                <span className="font-mono font-extrabold text-ink">{inviteCandidate}</span> yet.
                Send an admin invite — they get an email and automatically become administrator
                when they sign in with that address.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={inviting}
                  onClick={() => void handleSendInvite()}
                  className="h-10 rounded-full px-5 text-xs font-bold"
                >
                  {inviting ? (
                    <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Mail className="mr-1.5 size-3.5" />
                  )}
                  {inviting ? "Sending…" : "Send admin invite"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteCandidate(null)}
                  className="h-10 rounded-full px-5 text-xs font-bold"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          <div className="mt-5">
            {adminsLoading ? (
              <div className="flex items-center gap-2 rounded-2xl bg-cream/60 p-4 text-sm font-bold text-ink/55">
                <RefreshCw className="size-4 animate-spin" /> Loading administrators…
              </div>
            ) : adminsError ? (
              <div className="flex items-center gap-2 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral">
                <AlertTriangle className="size-4" /> {adminsError}
              </div>
            ) : admins.length === 0 ? (
              <div className="rounded-2xl bg-cream/60 p-4 text-sm font-bold text-ink/55">
                No administrators found.
              </div>
            ) : (
              <ul className="divide-y divide-ink/8 rounded-2xl bg-cream/40 ring-1 ring-ink/8">
                {admins.map((a) => {
                  const isSelf = a.id === selfUid;
                  const arming = confirmRevokeId === a.id;
                  return (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3.5"
                    >
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-coral/15 font-display text-sm font-extrabold text-coral">
                        {(a.name.slice(0, 1) || "A").toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-ink">
                          <span className="truncate">{a.name}</span>
                          {isSelf && (
                            <Badge className="rounded-full border-0 bg-mint/30 px-2 py-0 text-[10px] font-extrabold uppercase text-ink">
                              You
                            </Badge>
                          )}
                        </p>
                        <p className="truncate font-mono text-[11px] font-bold text-ink/50">
                          {a.email || a.id}
                        </p>
                      </div>
                      <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                      <Button
                        variant={arming ? "primary" : "outline"}
                        size="sm"
                        disabled={revoking}
                        onClick={() => void handleRevokeAdmin(a)}
                        className={cn(
                          "h-9 rounded-full px-4 text-xs font-bold",
                          arming
                            ? "bg-coral hover:bg-coral/90"
                            : "text-coral ring-coral/30 hover:bg-coral/10",
                        )}
                      >
                        <UserMinus className="mr-1.5 size-3.5" />
                        {arming ? "Click again to confirm" : "Revoke"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] font-bold leading-relaxed text-ink/50">
              {admins.length} administrator{admins.length === 1 ? "" : "s"} · revoking yourself or
              the last remaining admin is blocked.
            </p>

            {invites.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Pending invites · {invites.length}
                </p>
                <ul className="divide-y divide-ink/8 rounded-2xl bg-white ring-1 ring-ink/8">
                  {invites.map((inv) => (
                    <li key={inv.email} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-lemon/40">
                        <Mail className="size-4 text-ink/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs font-extrabold text-ink">
                          {inv.email}
                        </p>
                        <p className="text-[11px] font-bold text-ink/50">
                          Invited{inv.invitedBy ? ` by ${inv.invitedBy}` : ""} · applies on first sign-in
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cancellingInvite === inv.email}
                        onClick={() => void handleCancelInvite(inv.email)}
                        className="h-8 rounded-full px-3 text-[11px] font-bold text-ink/60 hover:text-coral"
                      >
                        {cancellingInvite === inv.email ? "Cancelling…" : "Cancel"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>

        <Section
          icon={SlidersHorizontal}
          tone="bg-sky/20"
          title="Feature availability"
          description="Show or hide platform modules on the user dashboard. Changes apply as soon as users navigate."
        >
          {featuresLoading ? (
            <div className="flex items-center gap-2 rounded-2xl bg-cream/60 p-4 text-sm font-bold text-ink/55">
              <RefreshCw className="size-4 animate-spin" /> Loading feature flags…
            </div>
          ) : (
            <div className="space-y-3">
              {FEATURE_META.map((f) => (
                <div
                  key={f.key}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-cream/50 px-4 py-3.5 ring-1 ring-ink/8"
                >
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-ink">{f.label}</p>
                      {!features[f.key] && (
                        <Badge className="rounded-full border-0 bg-ink/10 px-2 py-0 text-[10px] font-extrabold uppercase text-ink/60">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-bold text-ink/55">{f.description}</p>
                  </div>
                  <Switch
                    checked={features[f.key] !== false}
                    onCheckedChange={(v) =>
                      setFeatures((prev) => ({ ...prev, [f.key]: !!v }))
                    }
                  />
                </div>
              ))}
              <Button
                variant="primary"
                onClick={() => void saveFeatures()}
                disabled={featuresSaving}
                className="h-11 rounded-full px-6 font-bold"
              >
                {featuresSaving ? (
                  <RefreshCw className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 size-4" />
                )}
                {featuresSaving ? "Saving…" : "Save feature availability"}
              </Button>
            </div>
          )}
        </Section>

        <Section
          icon={ShieldCheck}
          tone="bg-mint/25"
          title="How access control works"
          description="Single source of truth, no hardcoded credentials."
        >
          <ul className="space-y-2 text-xs font-bold leading-relaxed text-ink/65">
            <li>· Admin access = <code className="font-mono">role: "admin"</code> on the <code className="font-mono">users/{"{uid}"}</code> Firestore document.</li>
            <li>· No account yet? Send an invite — rights apply automatically on first sign-in.</li>
            <li>· New registrations always start as regular users.</li>
            <li>· Every grant, revoke, invite and settings change is written to the audit trail.</li>
            <li>· Platform values (rates, thresholds, partners) live under Config; feature visibility lives here.</li>
          </ul>
        </Section>
      </div>
    </AdminShell>
  );
}
