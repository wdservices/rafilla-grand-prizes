import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../src/lib/firebase";

// Usage:
//   $env:SEED_ADMIN_EMAIL="admin@example.com"; $env:SEED_ADMIN_PASSWORD="secret"; npm run seed:admin
async function main() {
  console.log("--------------------------------------------------");
  console.log("Raffila Admin Seeder");
  console.log("--------------------------------------------------");

  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    console.error("Missing credentials. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD first.");
    console.error(
      'Example: $env:SEED_ADMIN_EMAIL="admin@example.com"; $env:SEED_ADMIN_PASSWORD="secret"; npm run seed:admin',
    );
    process.exit(1);
  }

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  console.log(`[AUTH] Authenticated as ${cred.user.email} (UID: ${uid})`);

  await setDoc(
    doc(db, "users", uid),
    {
      email,
      firstName: "Raffila",
      lastName: "Admin",
      displayName: "Raffila Admin",
      handle: "raffila_admin",
      avatarMonogram: "RA",
      phone: "",
      address: "",
      dob: "",
      role: "admin",
      isAdmin: true,
      verified: true,
      referralCode: "RAF-ADMIN",
      walletBalanceKobo: 0,
      referralEarningsKobo: 0,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`[SEED] users/${uid} upserted with role "admin".`);
  console.log("Done. Log in with the admin email to reach /admin.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal seed error:", err?.message || err);
  process.exit(1);
});
