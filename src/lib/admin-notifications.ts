import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

import { db } from "./firebase";
import { getSession } from "./auth-store";

export type AdminNotifChannel = "inapp" | "email" | "sms";

export interface AdminNotification {
  id: string;
  channel: AdminNotifChannel;
  title: string;
  preview: string;
  time: string;
  recipient: string;
  kind: string;
  refId: string;
}

function toMs(value: unknown): number {
  try {
    const v = value as any;
    if (v && typeof v.toDate === "function") return (v.toDate() as Date).getTime();
  } catch {
    // ignore
  }
  if (typeof value === "string" && value) {
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

function displayNameOf(v: Record<string, unknown>, fallback: string): string {
  const first = (v["firstName"] as string) || "";
  const last = (v["lastName"] as string) || "";
  return (
    (v["displayName"] as string) ||
    `${first} ${last}`.trim() ||
    (v["handle"] as string) ||
    (v["email"] as string) ||
    fallback
  );
}

const HIGH_RISK = new Set(["high", "critical"]);

/** In-app alerts: high/critical activity + new users + new competitions. */
async function fetchInapp(): Promise<AdminNotification[]> {
  const out: AdminNotification[] = [];
  const [logsSnap, usersSnap, compsSnap] = await Promise.all([
    getDocs(query(collection(db, "activityLogs"), orderBy("createdAt", "desc"), limit(120))).catch(
      () => null,
    ),
    getDocs(query(collection(db, "users"), limit(60))).catch(() => null),
    getDocs(query(collection(db, "competitions"), limit(40))).catch(() => null),
  ]);

  logsSnap?.docs.forEach((d) => {
    const v = d.data() as Record<string, unknown>;
    if (!HIGH_RISK.has(String(v["riskLevel"] ?? ""))) return;
    const ms = toMs(v["createdAt"]) || toMs(v["clientAt"]);
    out.push({
      id: `log-${d.id}`,
      channel: "inapp",
      title: String(v["summary"] || v["eventType"] || "Platform event"),
      preview: `${String(v["actorName"] || "Unknown")} · ${String(v["eventType"] || "")}`.trim(),
      time: ms ? new Date(ms).toISOString() : new Date(0).toISOString(),
      recipient: String(v["actorName"] || v["actorEmail"] || "System"),
      kind: String(v["eventType"] || "event"),
      refId: d.id,
    });
  });

  const twoWeeksAgo = Date.now() - 14 * 86400000;
  usersSnap?.docs.forEach((d) => {
    const v = d.data() as Record<string, unknown>;
    const ms = toMs(v["createdAt"]);
    if (!ms || ms < twoWeeksAgo) return;
    const name = displayNameOf(v, d.id.slice(0, 8));
    out.push({
      id: `user-${d.id}`,
      channel: "inapp",
      title: `New registration — ${name}`,
      preview: `${String(v["email"] || "")} joined Raffila.`,
      time: new Date(ms).toISOString(),
      recipient: name,
      kind: "USER_CREATE",
      refId: d.id,
    });
  });

  compsSnap?.docs.forEach((d) => {
    const v = d.data() as Record<string, unknown>;
    const ms = toMs(v["createdAt"]) || toMs(v["updatedAt"]);
    if (!ms || ms < twoWeeksAgo) return;
    const title = String(v["title"] ?? v["name"] ?? d.id);
    out.push({
      id: `comp-${d.id}`,
      channel: "inapp",
      title: `New competition — ${title}`,
      preview: `Status: ${String(v["status"] ?? "unknown")}.`,
      time: new Date(ms).toISOString(),
      recipient: String(v["partner"] ?? "Raffila"),
      kind: "COMPETITION_CREATE",
      refId: d.id,
    });
  });

  out.sort((a, b) => (a.time < b.time ? 1 : -1));
  return out.slice(0, 40);
}

/** Email tab: real outbound mail queue. */
async function fetchEmail(): Promise<AdminNotification[]> {
  try {
    const snap = await getDocs(query(collection(db, "mail"), limit(30)));
    const rows = snap.docs.map((d) => {
      const v = d.data() as Record<string, unknown>;
      const msg = (v["message"] as Record<string, unknown>) ?? {};
      const delivery = (v["delivery"] as Record<string, unknown>) ?? {};
      const state = String(delivery["state"] ?? "queued");
      const ms = toMs(v["createdAt"]) || 0;
      const to = String(v["to"] ?? "");
      return {
        id: `mail-${d.id}`,
        channel: "email" as const,
        title: String(msg["subject"] ?? "Email"),
        preview: `To ${to} · ${state}.`,
        time: ms ? new Date(ms).toISOString() : new Date(0).toISOString(),
        recipient: to,
        kind: "EMAIL",
        refId: d.id,
      };
    });
    rows.sort((a, b) => (a.time < b.time ? 1 : -1));
    return rows;
  } catch {
    return [];
  }
}

export async function fetchAdminNotifications(): Promise<{
  inapp: AdminNotification[];
  email: AdminNotification[];
  sms: AdminNotification[];
}> {
  const [inapp, email] = await Promise.all([fetchInapp(), fetchEmail()]);
  // No SMS pipeline exists yet — honest empty state on the SMS tab.
  return { inapp, email, sms: [] };
}

// ---- Per-admin read / dismissed state (localStorage, no extra rules needed) ----

function scopeKey(suffix: string): string {
  const uid = getSession()?.user?.id ?? "anon";
  return `raffila:admin:notif-${suffix}:${uid}`;
}

function readIds(key: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeIds(key: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(ids).slice(-500)));
  } catch {
    // ignore
  }
}

export function getReadIds(): Set<string> {
  return readIds(scopeKey("read"));
}

export function markNotifRead(id: string) {
  const key = scopeKey("read");
  const s = readIds(key);
  s.add(id);
  writeIds(key, s);
}

export function markAllNotifsRead(ids: string[]) {
  const key = scopeKey("read");
  const s = readIds(key);
  ids.forEach((id) => s.add(id));
  writeIds(key, s);
}

export function getDismissedIds(): Set<string> {
  return readIds(scopeKey("dismissed"));
}

export function dismissNotif(id: string) {
  const key = scopeKey("dismissed");
  const s = readIds(key);
  s.add(id);
  writeIds(key, s);
}
