import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../src/lib/firebase";

// Draw-test seeder — NO admin credentials needed.
// Creates 5 real Firebase Auth test users (so their `users/{uid}` docs
// satisfy the owner-create rule and show up on the Admin > Users dashboard),
// then seeds their tickets into the competition pool with the exact shape
// real purchases use (status ACTIVE + paymentStatus CONFIRMED = draw-eligible).
//
// Usage (PowerShell):  npx vite-node scripts/seed-draw-test.ts
// Optional overrides:
//   $env:DRAW_TEST_COMPETITION="mercedes-benz-c-class-2025"
//   $env:DRAW_TEST_SPLIT="10,1,5,6,3"   (must have 5 numbers)
//   $env:DRAW_TEST_PASSWORD="DrawTest2026!"
//
// NOTE: wipe/reset is intentionally NOT done here — firestore.rules denies
// ticket deletes for everyone and restricts competition/draw writes to
// admins, so this script appends. Reopening the competition or resetting a
// previous draw must be done from the Admin UI / Firebase console.

const COMPETITION_ID =
  process.env.DRAW_TEST_COMPETITION?.trim() || "mercedes-benz-c-class-2025";

const SPLIT = (process.env.DRAW_TEST_SPLIT?.trim() || "10,1,5,6,3")
  .split(",")
  .map((n) => Number(n.trim()))
  .filter((n) => Number.isInteger(n) && n > 0);

const TEST_PASSWORD = process.env.DRAW_TEST_PASSWORD ?? "DrawTest2026!";

const TEST_USERS = [
  { email: "drawtest1@raffila.com", displayName: "Draw Test Ada", firstName: "Ada", lastName: "Test", handle: "drawtest_ada" },
  { email: "drawtest2@raffila.com", displayName: "Draw Test Bola", firstName: "Bola", lastName: "Test", handle: "drawtest_bola" },
  { email: "drawtest3@raffila.com", displayName: "Draw Test Chidi", firstName: "Chidi", lastName: "Test", handle: "drawtest_chidi" },
  { email: "drawtest4@raffila.com", displayName: "Draw Test Ngozi", firstName: "Ngozi", lastName: "Test", handle: "drawtest_ngozi" },
  { email: "drawtest5@raffila.com", displayName: "Draw Test Tunde", firstName: "Tunde", lastName: "Test", handle: "drawtest_tunde" },
];

const CLOSED_STATUSES = new Set([
  "DRAW_READY",
  "DRAW-READY",
  "DRAW_IN_PROGRESS",
  "WINNER_SELECTED",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
  "SUSPENDED",
  "REFUND_REQUIRED",
]);

async function main() {
  if (SPLIT.length !== 5) {
    console.error(`DRAW_TEST_SPLIT must have exactly 5 numbers, got: ${SPLIT.join(",")}`);
    process.exit(1);
  }
  const totalTickets = SPLIT.reduce((a, b) => a + b, 0);
  console.log("--------------------------------------------------");
  console.log("Raffila Draw-Test Seeder (no admin)");
  console.log("--------------------------------------------------");
  console.log(`Competition : ${COMPETITION_ID}`);
  console.log(`Split       : ${SPLIT.join(" / ")} (total ${totalTickets})`);

  // 0. Competition must exist and be accepting entries (public read).
  //    Ticket creates are rejected by rules once entries close.
  const compRef = doc(db, "competitions", COMPETITION_ID);
  const compSnap = await getDoc(compRef).catch((err) => {
    console.error(`[COMP] read failed: ${err?.message || err?.code}`);
    process.exit(1);
  });
  if (!compSnap.exists()) {
    console.error(`[FAIL] Competition "${COMPETITION_ID}" not found in Firestore.`);
    process.exit(1);
  }
  const compData = compSnap.data() as Record<string, unknown>;
  const status = String(compData["status"] ?? "LIVE").toUpperCase();
  const entriesClosed = compData["entriesClosed"] === true;
  const entriesPaused = compData["entriesPaused"] === true;
  console.log(`[COMP] title="${String(compData["title"] ?? "")}" status=${status} entriesSold=${String(compData["entriesSold"] ?? 0)} entriesClosed=${entriesClosed} entriesPaused=${entriesPaused}`);
  if (entriesClosed || entriesPaused || CLOSED_STATUSES.has(status)) {
    console.error(
      `[FAIL] Competition is not accepting entries (status=${status}). ` +
        `Reopen it from Admin > Competitions (status LIVE, entries open) and re-run.`,
    );
    process.exit(1);
  }

  // Unique 6-digit ticket base from timestamp — avoids colliding with
  // existing pool tickets since we cannot list them (rules) or wipe them.
  const base = 100000 + (Number(String(Date.now()).slice(-6)) % 700000);
  let ticketSeq = base;
  console.log(`[TICKET] number range starts at ${ticketSeq} (timestamp-derived, collision-safe)`);

  let created = 0;
  for (let ui = 0; ui < TEST_USERS.length; ui++) {
    const u = TEST_USERS[ui]!;
    const count = SPLIT[ui]!;

    // 1. Create (or reuse) the real Auth account — owner of users/{uid}.
    let uid: string;
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, TEST_PASSWORD);
      uid = cred.user.uid;
      console.log(`[AUTH] created ${u.email} (uid=${uid})`);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        const cred = await signInWithEmailAndPassword(auth, u.email, TEST_PASSWORD).catch(
          (signInErr) => {
            console.error(
              `[FAIL] ${u.email} exists but sign-in failed — set $env:DRAW_TEST_PASSWORD to its password and re-run. (${signInErr?.message || signInErr?.code})`,
            );
            process.exit(1);
          },
        );
        uid = cred.user.uid;
        console.log(`[AUTH] signed in existing ${u.email} (uid=${uid})`);
      } else {
        console.error(`[FAIL] could not create ${u.email}: ${err?.message || err?.code}`);
        process.exit(1);
      }
    }

    // 2. users/{uid} profile (owner-create allowed) — shows on admin dashboard.
    await setDoc(
      doc(db, "users", uid),
      {
        id: uid,
        email: u.email,
        displayName: u.displayName,
        firstName: u.firstName,
        lastName: u.lastName,
        handle: u.handle,
        role: "user",
        phone: "",
        avatarMonogram: u.firstName[0]! + u.lastName[0]!,
        referralCode: `RAF-${u.handle.toUpperCase()}`,
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    // 3. Tickets — any authenticated user may create while competition is open.
    const entryId = `RF-2026-DRAWTEST-${String(ui + 1).padStart(2, "0")}`;
    for (let k = 0; k < count; k++) {
      const ticketNumber = String(ticketSeq++);
      const ticketId = `TKT-${ticketNumber}`;
      const purchasedAt = new Date(Date.now() - (created + 1) * 60_000).toISOString();
      await setDoc(doc(db, "competitions", COMPETITION_ID, "tickets", ticketId), {
        ticketNumber,
        ticketCode: ticketId,
        competitionSlug: COMPETITION_ID,
        competitionId: COMPETITION_ID,
        entryId,
        userId: uid,
        userName: u.displayName,
        userHandle: u.handle,
        userEmail: u.email,
        purchasedAt,
        createdAt: purchasedAt,
        status: "ACTIVE",
        paymentStatus: "CONFIRMED",
      });
      created++;
    }

    // 4. Mirror entry for the My Entries UI (owner-write allowed).
    await setDoc(
      doc(db, "users", uid, "entries", entryId),
      {
        id: entryId,
        competitionSlug: COMPETITION_ID,
        competitionId: COMPETITION_ID,
        ticketCount: count,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );
    console.log(`[SEED] ${u.displayName} (${u.email}): ${count} ticket(s), entry ${entryId}`);
  }

  // 5. Bump the live counter (any signed-in user may increment entriesSold).
  await updateDoc(compRef, { entriesSold: increment(created) }).catch((err) => {
    console.warn(`[WARN] entriesSold bump failed (non-fatal): ${err?.message || err?.code}`);
  });

  console.log("--------------------------------------------------");
  console.log(`Done. Added ${created} ticket(s) across ${TEST_USERS.length} users.`);
  console.log(`Test logins: drawtest1..5@raffila.com / ${TEST_PASSWORD}`);
  console.log("Check Admin > Users for the 5 accounts and the competition draw");
  console.log("panel for the pool size (admins can read all tickets).");
  console.log("NEXT: set closes/drawDate to +10 mins in Admin > Competitions,");
  console.log("then run the draw once it flips to DRAW_READY.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal draw-test seed error:", err?.message || err);
  process.exit(1);
});
