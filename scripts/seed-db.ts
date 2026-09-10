import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/lib/firebase";
import { seedFirestoreDatabase, checkFirestoreStatus } from "../src/lib/firestore-seed";

async function main() {
  console.log("--------------------------------------------------");
  console.log("Raffila Firestore Database Seeder");
  console.log("--------------------------------------------------");

  // Try signing in as admin if available
  try {
    const cred = await signInWithEmailAndPassword(auth, "admin@raffila.com", "Admin2026!");
    console.log(`[AUTH] Authenticated as admin: ${cred.user.email} (UID: ${cred.user.uid})`);
  } catch (authErr: any) {
    console.log(`[AUTH] Anonymous/Unauthenticated mode (${authErr?.message || authErr?.code})`);
  }

  console.log("Checking current Firestore status...");
  const status = await checkFirestoreStatus();
  console.log("Status:", status);

  console.log("\nStarting database seed...");
  const result = await seedFirestoreDatabase((p) => {
    if (p.error) {
      console.error(`[ERROR] ${p.stage}: ${p.error}`);
    } else {
      console.log(`[PROGRESS] ${p.stage} (${p.count}/${p.total})`);
    }
  });

  if (result.success) {
    console.log("\nSeeding completed successfully!");
    console.log("Summary of documents created:", result.stats);
    process.exit(0);
  } else {
    console.error("\nSeeding failed with error:", result.error);
    console.log(
      "\nTIP: If you received a 'permission-denied' error, ensure your Firestore Security Rules in Firebase Console allow read/write during seeding:",
    );
    console.log("match /{document=**} { allow read, write: if true; }");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
