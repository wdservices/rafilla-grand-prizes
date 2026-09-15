import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { auth, db } from "../src/lib/firebase";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD first.");
    process.exit(1);
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log(`[AUTH] ${cred.user.email} (${cred.user.uid})`);

  const snap = await getDocs(query(collection(db, "competitions"), limit(100)));
  console.log(`[DB] competitions count: ${snap.size}`);
  snap.docs.forEach((d) => {
    const v = d.data() as Record<string, unknown>;
    console.log(
      ` - id=${d.id} title=${String(v["title"] ?? "")} status=${String(v["status"] ?? "")} entryPrice=${String(v["entryPrice"] ?? "")} image=${String(v["image"] ?? "").slice(0, 60)}`,
    );
  });
  process.exit(0);
}

main().catch((err) => {
  console.error("Diag failed:", err?.message || err);
  process.exit(1);
});
