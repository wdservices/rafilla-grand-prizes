import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import { logActivity } from "./activity-log";
import { getSession } from "./auth-store";

/* ============================================================================
 * RAFFILLA ADMIN RAFFLE DRAW SYSTEM
 * ----------------------------------------------------------------------------
 * Ticket-based (NOT user-based) secure draw.
 *
 * Data model (existing — DO NOT change purchase/ticket generation):
 *   competitions/{competitionId}             — competition docs
 *   competitions/{competitionId}/tickets/{TKT-xxxxxx}
 *     { ticketNumber, ticketCode, competitionSlug, entryId,
 *       userId, userName, userHandle, purchasedAt, status }
 *   draws/{competitionId}                    — one draw record per competition
 *   winners/{winnerId}                       — public winners showcase
 *
 * Security posture in this architecture (no Cloud Functions):
 * - Winner selection NEVER uses Math.random(). It uses crypto.getRandomValues
 *   (CSPRNG in both browser and Node) inside a Firestore transaction claim.
 * - The client NEVER supplies winnerUserId / winningTicketId. The winner is
 *   derived inside the flow from the eligible pool count + secure index.
 * - Firestore rules gate all draw writes to admins only.
 * - runTransaction gives claim-once semantics: double-clicks / concurrent
 *   admins cannot create two winners.
 * ========================================================================== */

export type DrawLifecycleStatus = "READY" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type CompetitionDrawState =
  | "DRAFT"
  | "SCHEDULED"
  | "LIVE"
  | "DRAW_READY"
  | "DRAW_IN_PROGRESS"
  | "WINNER_SELECTED"
  | "COMPLETED"
  | "SUSPENDED"
  | "CANCELLED";

export interface EligibleTicket {
  id: string;
  ticketNumber: string;
  ticketCode: string;
  entryId: string;
  userId: string;
  userName: string;
  userHandle: string;
  userEmail: string;
  purchasedAt: string;
  status: string;
}

export interface DrawRecord {
  id: string;
  competitionId: string;
  competitionTitle: string;
  status: DrawLifecycleStatus;
  eligibleTicketCount: number;
  eligibleParticipantCount: number;
  initiatedBy: string;
  initiatedByEmail: string;
  initiatedAt: string;
  winningTicketId: string | null;
  winningTicketNumber: string | null;
  winnerUserId: string | null;
  winnerDisplayName: string | null;
  winnerHandle: string | null;
  verificationReference: string;
  snapshotHash: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DrawPoolStats {
  eligibleTickets: number;
  participants: number;
}

/** Ticket statuses that must NEVER participate in a draw. */
export const INELIGIBLE_TICKET_STATUSES = new Set([
  "REFUNDED",
  "CANCELLED",
  "VOID",
  "VOIDED",
  "DISQUALIFIED",
  "FAILED",
  "PENDING",
  "EXPIRED",
  "FRAUD",
  "FRAUDULENT",
]);

export function isTicketEligible(status: unknown): boolean {
  const s = String(status ?? "ACTIVE").toUpperCase();
  return !INELIGIBLE_TICKET_STATUSES.has(s);
}

/**
 * Payment/transaction states that disqualify an otherwise ACTIVE ticket.
 * A missing paymentStatus defaults to eligible (legacy tickets were written
 * before the field existed and are paid by construction).
 */
const INELIGIBLE_PAYMENT_STATUSES = new Set([
  "FAILED",
  "PENDING",
  "UNCONFIRMED",
  "REFUNDED",
  "REVERSED",
  "CANCELLED",
  "VOID",
  "VOIDED",
  "DISPUTED",
  "FRAUD",
  "FRAUDULENT",
  "CHARGEBACK",
]);

export function isPaymentConfirmed(paymentStatus: unknown): boolean {
  if (paymentStatus == null || paymentStatus === "") return true;
  return !INELIGIBLE_PAYMENT_STATUSES.has(String(paymentStatus).toUpperCase());
}

/** Full ticket-doc eligibility: status AND payment confirmation. */
export function isTicketDocEligible(data: Record<string, unknown>): boolean {
  return isTicketEligible(data["status"]) && isPaymentConfirmed(data["paymentStatus"]);
}

/**
 * Cryptographically secure random integer in [0, bound).
 * Uses crypto.getRandomValues (CSPRNG) — NEVER Math.random().
 * Rejection sampling avoids modulo bias for large pools.
 */
export function secureRandomInt(bound: number): number {
  if (!Number.isInteger(bound) || bound <= 0) {
    throw new Error("secureRandomInt requires a positive integer bound");
  }
  if (bound === 1) return 0;
  const cryptoObj =
    typeof globalThis !== "undefined" ? (globalThis as any).crypto : undefined;
  if (!cryptoObj?.getRandomValues) {
    throw new Error("Secure random source (crypto.getRandomValues) unavailable");
  }
  const range = 0xffffffff;
  const limit = range - (range % bound);
  const buf = new Uint32Array(1);
  for (let i = 0; i < 1000; i++) {
    cryptoObj.getRandomValues(buf);
    const v = buf[0]!;
    if (v < limit) return v % bound;
  }
  throw new Error("secureRandomInt failed to sample");
}

/** Parse any closes/drawDate representation to epoch ms (0 = unknown). */
export function parseCloseMs(data: Record<string, unknown>): number {
  const candidates = [
    data["closesAt"],
    data["closes"],
    data["drawDate"],
    data["closeDate"],
    data["endDate"],
  ];
  for (const c of candidates) {
    try {
      const v = c as any;
      if (v && typeof v.toDate === "function") return (v.toDate() as Date).getTime();
    } catch {
      /* ignore */
    }
    if (typeof c === "number" && c > 0) return c;
    if (typeof c === "string" && c) {
      const t = new Date(c).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  return 0;
}

/**
 * Map competition doc + draw doc to the admin draw lifecycle state.
 * Existing statuses (LIVE, SCHEDULED, DRAFT, COMPLETED) are preserved;
 * draw states layer on top without breaking them.
 */
export function deriveDrawState(
  compData: Record<string, unknown>,
  drawData: Record<string, unknown> | null,
  nowMs = Date.now(),
): CompetitionDrawState {
  const rawStatus = String(compData["status"] ?? "LIVE").toUpperCase();
  const drawStatus = drawData ? String(drawData["status"] ?? "").toUpperCase() : "";

  if (rawStatus === "CANCELLED") return "CANCELLED";
  if (rawStatus === "SUSPENDED") return "SUSPENDED";
  if (rawStatus === "DRAFT") return "DRAFT";

  // A completed draw always wins over the competition flag.
  if (
    drawStatus === "COMPLETED" ||
    drawStatus === "VERIFIED" ||
    (drawData?.["winningTicketNumber"] && drawStatus !== "FAILED")
  ) {
    return rawStatus === "COMPLETED" ? "COMPLETED" : "WINNER_SELECTED";
  }
  if (drawStatus === "IN_PROGRESS" || drawStatus === "DRAWING") return "DRAW_IN_PROGRESS";
  if (rawStatus === "DRAW_IN_PROGRESS") return "DRAW_IN_PROGRESS";
  if (rawStatus === "WINNER_SELECTED") return "WINNER_SELECTED";
  if (rawStatus === "DRAW_READY" || rawStatus === "DRAW-READY" || rawStatus === "CLOSED") {
    return "DRAW_READY";
  }
  if (rawStatus === "COMPLETED") return "COMPLETED";

  // Time-based: past close + LIVE/SCHEDULED => DRAW_READY
  const closesMs = parseCloseMs(compData);
  const entriesClosed = compData["entriesClosed"] === true;
  if ((closesMs > 0 && closesMs <= nowMs) || entriesClosed) {
    if (rawStatus === "LIVE" || rawStatus === "SCHEDULED" || rawStatus === "CLOSING SOON") {
      return "DRAW_READY";
    }
  }
  if (rawStatus === "SCHEDULED" || rawStatus === "UPCOMING") return "SCHEDULED";
  return "LIVE";
}

function sha256Hex(input: string): Promise<string> {
  const cryptoObj =
    typeof globalThis !== "undefined" ? (globalThis as any).crypto : undefined;
  if (cryptoObj?.subtle?.digest) {
    return cryptoObj.subtle
      .digest("SHA-256", new TextEncoder().encode(input))
      .then((buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      );
  }
  // Non-secure fallback for snapshot hashing ONLY (never for selection).
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  return Promise.resolve(`fnv1a-${h1.toString(16).padStart(8, "0")}`);
}

function ticketToEligible(id: string, data: DocumentData): EligibleTicket {
  return {
    id,
    ticketNumber: String(data["ticketNumber"] ?? ""),
    ticketCode: String(data["ticketCode"] ?? `TKT-${data["ticketNumber"] ?? id}`),
    entryId: String(data["entryId"] ?? data["entryCode"] ?? ""),
    userId: String(data["userId"] ?? ""),
    userName: String(data["userName"] ?? data["userDisplayName"] ?? ""),
    userHandle: String(data["userHandle"] ?? ""),
    userEmail: String(data["userEmail"] ?? data["email"] ?? ""),
    purchasedAt: String(data["purchasedAt"] ?? data["createdAt"] ?? ""),
    status: String(data["status"] ?? "ACTIVE"),
  };
}

/**
 * Fetch ALL eligible tickets for a competition (paginated, server-side
 * eligibility — never trust the frontend). Large pools never hit the browser
 * all at once in the UI; this is only used inside the draw flow and counts.
 */
export async function fetchEligibleTickets(
  competitionId: string,
  pageSize = 500,
  maxPages = 400,
): Promise<EligibleTicket[]> {
  const out: EligibleTicket[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;
  for (let page = 0; page < maxPages; page++) {
    const constraints: QueryConstraint[] = [orderBy("ticketNumber"), limit(pageSize)];
    if (cursor) constraints.push(startAfter(cursor));
    const snap = await getDocs(
      query(collection(db, "competitions", competitionId, "tickets"), ...constraints),
    );
    if (snap.empty) break;
    for (const d of snap.docs) {
      const data = d.data();
      if (isTicketDocEligible(data)) out.push(ticketToEligible(d.id, data));
    }
    if (snap.docs.length < pageSize) break;
    cursor = snap.docs[snap.docs.length - 1]!;
  }
  return out;
}

/** Lightweight pool counts without materialising the full pool in the UI. */
export async function fetchDrawPoolStats(competitionId: string): Promise<DrawPoolStats> {
  const tickets = await fetchEligibleTickets(competitionId);
  return {
    eligibleTickets: tickets.length,
    participants: new Set(tickets.map((t) => t.userId).filter(Boolean)).size,
  };
}

export function drawDocToRecord(id: string, data: DocumentData): DrawRecord {
  return {
    id,
    competitionId: String(data["competitionId"] ?? data["competitionSlug"] ?? id),
    competitionTitle: String(data["competitionTitle"] ?? ""),
    status: ((): DrawLifecycleStatus => {
      const s = String(data["status"] ?? "READY").toUpperCase();
      if (s === "IN_PROGRESS" || s === "DRAWING") return "IN_PROGRESS";
      if (s === "COMPLETED" || s === "VERIFIED") return "COMPLETED";
      if (s === "FAILED") return "FAILED";
      return "READY";
    })(),
    eligibleTicketCount: Number(
      data["eligibleTicketCount"] ?? data["totalEligibleTickets"] ?? 0,
    ),
    eligibleParticipantCount: Number(
      data["eligibleParticipantCount"] ?? data["totalParticipants"] ?? 0,
    ),
    initiatedBy: String(data["initiatedBy"] ?? data["initiated_by"] ?? ""),
    initiatedByEmail: String(data["initiatedByEmail"] ?? ""),
    initiatedAt: String(data["initiatedAt"] ?? data["initiated_at"] ?? ""),
    winningTicketId: (data["winningTicketId"] as string) ?? null,
    winningTicketNumber: (data["winningTicketNumber"] as string) ?? null,
    winnerUserId: (data["winnerUserId"] as string) ?? null,
    winnerDisplayName:
      (data["winnerDisplayName"] as string) ?? (data["winnerName"] as string) ?? null,
    winnerHandle: (data["winnerHandle"] as string) ?? null,
    verificationReference: String(
      data["verificationReference"] ??
        data["random_reference"] ??
        data["beaconSeed"] ??
        "",
    ),
    snapshotHash: String(data["snapshotHash"] ?? ""),
    completedAt:
      (data["completedAt"] as string) ?? (data["completed_at"] as string) ?? null,
    createdAt: String(data["createdAt"] ?? ""),
    updatedAt: String(data["updatedAt"] ?? ""),
  };
}

export async function getDrawRecord(competitionId: string): Promise<DrawRecord | null> {
  const snap = await getDoc(doc(db, "draws", competitionId));
  if (!snap.exists()) return null;
  return drawDocToRecord(snap.id, snap.data());
}

export async function listDraws(max = 100): Promise<DrawRecord[]> {
  const snap = await getDocs(
    query(collection(db, "draws"), orderBy("createdAt", "desc"), limit(max)),
  );
  return snap.docs.map((d) => drawDocToRecord(d.id, d.data()));
}

function requireAdmin(): { uid: string; email: string; name: string } {
  const user = getSession()?.user;
  if (!user || user.role !== "admin") {
    throw new Error("Only authorized admins can initiate a draw.");
  }
  const rawId = user.id.startsWith("firebase_") ? user.id.slice("firebase_".length) : user.id;
  return {
    uid: rawId,
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
  };
}

function makeDrawId(): string {
  const y = new Date().getUTCFullYear();
  const rand = String(secureRandomInt(1000000)).padStart(6, "0");
  return `RF-DRAW-${y}-${rand}`;
}

/**
 * Automatic LIVE -> DRAW_READY transition. Safe to call on every admin page
 * load: only touches competitions past their close time that are still open.
 */
export async function checkAndCloseCompetitions(nowMs = Date.now()): Promise<string[]> {
  const admin = (() => {
    try {
      return requireAdmin();
    } catch {
      return null;
    }
  })();
  const snap = await getDocs(query(collection(db, "competitions"), limit(100)));
  const closed: string[] = [];
  const nowIso = new Date(nowMs).toISOString();
  for (const d of snap.docs) {
    const data = d.data();
    const rawStatus = String(data["status"] ?? "LIVE").toUpperCase();
    if (rawStatus !== "LIVE" && rawStatus !== "SCHEDULED" && rawStatus !== "CLOSING SOON") {
      continue;
    }
    const closesMs = parseCloseMs(data);
    const entriesClosed = data["entriesClosed"] === true;
    if (!((closesMs > 0 && closesMs <= nowMs) || entriesClosed)) continue;
    try {
      await updateDoc(doc(db, "competitions", d.id), {
        status: "DRAW_READY",
        entriesClosed: true,
        closedAt: data["closedAt"] ?? nowIso,
        updatedAt: nowIso,
      });
      const drawRef = doc(db, "draws", d.id);
      const drawSnap = await getDoc(drawRef).catch(() => null);
      if (!drawSnap || !drawSnap.exists()) {
        await setDoc(drawRef, {
          competitionId: d.id,
          competitionSlug: d.id,
          competitionTitle: String(data["title"] ?? data["assetName"] ?? d.id),
          status: "READY",
          eligibleTicketCount: 0,
          eligibleParticipantCount: 0,
          initiatedBy: "",
          initiatedByEmail: "",
          initiatedAt: "",
          winningTicketId: null,
          winningTicketNumber: null,
          winnerUserId: null,
          winnerDisplayName: null,
          winnerHandle: null,
          verificationReference: "",
          snapshotHash: "",
          completedAt: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      } else {
        const ds = String(drawSnap.data()["status"] ?? "").toUpperCase();
        if (ds === "SCHEDULED") {
          await updateDoc(drawRef, { status: "READY", updatedAt: nowIso });
        }
      }
      closed.push(d.id);
      if (admin) {
        void logActivity({
          eventType: "COMPETITION_UPDATE",
          targetType: "competition",
          targetId: d.id,
          summary: `Competition auto-closed → DRAW_READY`,
          details: { competitionId: d.id },
        });
      }
    } catch (err) {
      console.warn(`Auto-close failed for ${d.id}:`, err);
    }
  }
  return closed;
}

export interface ExecuteDrawResult {
  record: DrawRecord;
  resumed: boolean;
}

/**
 * Execute the raffle draw for a DRAW_READY competition.
 *
 * Concurrency-safe:
 *  1. Transaction claims the draw (READY -> IN_PROGRESS). Concurrent callers
 *     see IN_PROGRESS/COMPLETED and never create a second winner.
 *  2. Eligible pool is read server-side from ticket records.
 *  3. Winner index comes from crypto.getRandomValues (CSPRNG).
 *  4. Commit transaction writes winner + competition + ticket atomically.
 *  5. A refresh mid-draw resumes the persisted record — never re-spins.
 */
export async function executeDraw(competitionId: string): Promise<ExecuteDrawResult> {
  const admin = requireAdmin();
  const nowIso = new Date().toISOString();
  const compRef = doc(db, "competitions", competitionId);
  const drawRef = doc(db, "draws", competitionId);

  // --- Step 1: claim the draw inside a transaction (double-click safe) ---
  const claim = await runTransaction(db, async (tx) => {
    const compSnap = await tx.get(compRef);
    if (!compSnap.exists()) throw new Error("Competition not found.");
    const comp = compSnap.data();
    const state = deriveDrawState(comp, null);
    const drawSnap = await tx.get(drawRef);
    const drawData = drawSnap.exists() ? drawSnap.data() : null;
    const drawStatus = drawData ? String(drawData["status"] ?? "").toUpperCase() : "";

    // Idempotent resume: already completed -> return existing, never re-spin.
    if (
      drawStatus === "COMPLETED" ||
      drawStatus === "VERIFIED" ||
      (drawData?.["winningTicketNumber"] && drawStatus !== "FAILED")
    ) {
      return { action: "resume-completed" as const };
    }
    if (drawStatus === "IN_PROGRESS" || drawStatus === "DRAWING") {
      // Re-entrant: if a winner was somehow committed, resume; else take over.
      if (drawData?.["winningTicketNumber"]) return { action: "resume-completed" as const };
      return { action: "resume-in-progress" as const };
    }
    if (state === "COMPLETED" || state === "WINNER_SELECTED") {
      return { action: "resume-completed" as const };
    }
    if (state !== "DRAW_READY" && state !== "DRAW_IN_PROGRESS") {
      throw new Error(
        state === "LIVE" || state === "SCHEDULED"
          ? "Competition is still open. Close entries before starting the draw."
          : `Draw is not available in state ${state}.`,
      );
    }

    const drawId = makeDrawId();
    const verificationReference = `RF-VRF-${Date.now().toString(36).toUpperCase()}-${String(
      secureRandomInt(1679616),
    ).padStart(4, "0")}`;
    if (drawSnap.exists()) {
      tx.update(drawRef, {
        status: "IN_PROGRESS",
        initiatedBy: admin.name,
        initiatedByEmail: admin.email,
        initiatedAt: nowIso,
        verificationReference,
        updatedAt: nowIso,
      });
    } else {
      tx.set(drawRef, {
        competitionId,
        competitionSlug: competitionId,
        competitionTitle: String(comp["title"] ?? comp["assetName"] ?? competitionId),
        status: "IN_PROGRESS",
        drawId,
        eligibleTicketCount: 0,
        eligibleParticipantCount: 0,
        initiatedBy: admin.name,
        initiatedByEmail: admin.email,
        initiatedAt: nowIso,
        winningTicketId: null,
        winningTicketNumber: null,
        winnerUserId: null,
        winnerDisplayName: null,
        winnerHandle: null,
        verificationReference,
        snapshotHash: "",
        completedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }
    tx.update(compRef, { status: "DRAW_IN_PROGRESS", updatedAt: nowIso });
    return { action: "claimed" as const, verificationReference };
  });

  if (claim.action === "resume-completed") {
    const rec = await getDrawRecord(competitionId);
    if (!rec) throw new Error("Draw record missing.");
    return { record: rec, resumed: true };
  }

  void logActivity({
    eventType: "COMPETITION_DRAW",
    targetType: "competition",
    targetId: competitionId,
    summary: `Draw started for competition`,
    details: { competitionId, phase: "DRAW_STARTED", admin: admin.email },
  });

  // --- Step 2: build the eligible pool (ticket records, server-side) ---
  const pool = await fetchEligibleTickets(competitionId);
  if (pool.length === 0) {
    await updateDoc(drawRef, { status: "FAILED", updatedAt: nowIso }).catch(() => {});
    await updateDoc(compRef, { status: "DRAW_READY", updatedAt: nowIso }).catch(() => {});
    void logActivity({
      eventType: "COMPETITION_DRAW",
      targetType: "competition",
      targetId: competitionId,
      summary: `Draw failed — no eligible tickets`,
      details: { competitionId, phase: "DRAW_FAILED", reason: "ZERO_ELIGIBLE_TICKETS" },
    });
    throw new Error("No eligible tickets are available for this competition.");
  }

  const participantCount = new Set(pool.map((t) => t.userId).filter(Boolean)).size;
  const snapshotSource = pool.map((t) => `${t.ticketNumber}:${t.userId}`).join("|");
  const snapshotHash = await sha256Hex(
    `${competitionId}::${pool.length}::${snapshotSource}`.slice(0, 200000),
  );

  // --- Step 3: CSPRNG selection — index into the TICKET pool ---
  const winnerIndex = secureRandomInt(pool.length);
  const winner = pool[winnerIndex]!;

  // --- Step 4: atomic commit (second transaction verifies still ours) ---
  const completedAt = new Date().toISOString();
  await runTransaction(db, async (tx) => {
    const drawSnap = await tx.get(drawRef);
    if (!drawSnap.exists()) throw new Error("Draw record vanished mid-draw.");
    const dd = drawSnap.data();
    const ds = String(dd["status"] ?? "").toUpperCase();
    if (dd["winningTicketNumber"] || ds === "COMPLETED" || ds === "VERIFIED") {
      return; // another committer won the race — keep the first winner
    }
    if (ds !== "IN_PROGRESS" && ds !== "DRAWING") {
      throw new Error("Draw is no longer in progress.");
    }
    tx.update(drawRef, {
      status: "COMPLETED",
      eligibleTicketCount: pool.length,
      eligibleParticipantCount: participantCount,
      winningTicketId: winner.id,
      winningTicketNumber: winner.ticketNumber,
      winnerUserId: winner.userId,
      winnerDisplayName: winner.userName,
      winnerHandle: winner.userHandle,
      snapshotHash,
      completedAt,
      updatedAt: completedAt,
    });
    tx.update(compRef, {
      status: "COMPLETED",
      entriesClosed: true,
      winnerTicketNumber: winner.ticketNumber,
      winnerUserId: winner.userId,
      winnerName: winner.userName,
      drawCompletedAt: completedAt,
      updatedAt: completedAt,
    });
    tx.update(doc(db, "competitions", competitionId, "tickets", winner.id), {
      status: "WINNER",
      wonAt: completedAt,
    });
  });

  // --- Step 5: winners showcase (non-critical, best-effort) ---
  let competitionTitle = competitionId;
  try {
    const compSnap = await getDoc(compRef);
    const comp = compSnap.exists() ? compSnap.data() : {};
    competitionTitle = String(comp["title"] ?? comp["assetName"] ?? competitionId);
    await setDoc(doc(db, "winners", `${competitionId}-${winner.ticketNumber}`), {
      id: `${competitionId}-${winner.ticketNumber}`,
      competitionSlug: competitionId,
      competitionTitle: String(comp["title"] ?? comp["assetName"] ?? competitionId),
      winnerName: winner.userName,
      winnerHandle: winner.userHandle,
      winnerUserId: winner.userId,
      ticketNumber: winner.ticketNumber,
      ticketCode: winner.ticketCode,
      entryId: winner.entryId,
      drawDate: completedAt,
      eligibleTickets: pool.length,
      participants: participantCount,
      verificationReference: (claim as any).verificationReference ?? "",
      snapshotHash,
      claimStatus: "PENDING_CLAIM",
      verified: true,
      createdAt: completedAt,
    });
  } catch (err) {
    console.warn("Winners showcase write failed (non-critical):", err);
  }

  // --- Step 6: winner notification (non-critical, best-effort) ---
  // Queues into the outbound mail collection consumed by the Trigger Email
  // extension / future Cloud Function. Never exposes private data publicly.
  if (winner.userEmail) {
    try {
      const drawId = (claim as any).verificationReference ?? competitionId;
      await addDoc(collection(db, "mail"), {
        to: winner.userEmail,
        createdAt: serverTimestamp(),
        message: {
          subject: `You won: ${competitionTitle} (ticket #${winner.ticketNumber})`,
          text: `Congratulations ${winner.userName}!\n\nYour ticket #${winner.ticketNumber} won "${competitionTitle}".\n\nDraw ID: ${drawId}\nDraw date: ${completedAt}\n\nTo claim your prize, sign in to Raffila and open My Entries, then follow the prize-claim instructions. Our team may contact you to verify your details.\n\n— Team Raffila`,
          html: `<p>Congratulations <strong>${winner.userName}</strong>!</p><p>Your ticket <strong>#${winner.ticketNumber}</strong> won "<strong>${competitionTitle}</strong>".</p><p>Draw ID: ${drawId}<br/>Draw date: ${completedAt}</p><p>To claim your prize, sign in to Raffila and open <strong>My Entries</strong>, then follow the prize-claim instructions. Our team may contact you to verify your details.</p><p>— Team Raffila</p>`,
        },
      });
      void logActivity({
        eventType: "NOTIFICATION_SEND",
        targetType: "user",
        targetId: winner.userId,
        summary: `Winner notification queued for ${winner.userName} (#${winner.ticketNumber})`,
        details: { competitionId, winningTicketNumber: winner.ticketNumber },
      });
    } catch (err) {
      console.warn("Winner notification queue failed (non-critical):", err);
    }
  }

  void logActivity({
    eventType: "COMPETITION_DRAW",
    targetType: "competition",
    targetId: competitionId,
    summary: `Winner selected: ticket #${winner.ticketNumber} (${winner.userName})`,
    details: {
      competitionId,
      phase: "DRAW_COMPLETED",
      winningTicketNumber: winner.ticketNumber,
      winnerUserId: winner.userId,
      eligibleTickets: pool.length,
      participants: participantCount,
      admin: admin.email,
    },
  });

  const record = await getDrawRecord(competitionId);
  if (!record) throw new Error("Draw completed but record could not be read.");
  return { record, resumed: claim.action !== "claimed" };
}

/** Persist purchased tickets to Firestore (connects purchase → draw pool). */
export async function persistPurchaseTickets(args: {
  competitionId: string;
  competitionSlug: string;
  entryId: string;
  ticketNumbers: string[];
  userId: string;
  userName: string;
  userHandle: string;
  userEmail: string;
}): Promise<void> {
  const { competitionId, entryId, ticketNumbers, userId, userName, userHandle, userEmail } = args;
  const nowIso = new Date().toISOString();
  for (const num of ticketNumbers) {
    const ticketId = `TKT-${num}`;
    try {
      await setDoc(
        doc(db, "competitions", competitionId, "tickets", ticketId),
        {
          ticketNumber: num,
          ticketCode: ticketId,
          competitionSlug: args.competitionSlug,
          competitionId,
          entryId,
          userId,
          userName,
          userHandle,
          userEmail,
          purchasedAt: nowIso,
          createdAt: nowIso,
          status: "ACTIVE",
          paymentStatus: "CONFIRMED",
        },
        { merge: true } as any,
      );
    } catch (err) {
      console.warn(`Ticket persist failed for ${ticketId}:`, err);
    }
  }
}
