import { collection, getDocs } from "firebase/firestore";
import { db } from "../src/lib/firebase";

async function main() {
  const s = await getDocs(collection(db, "competitions"));
  console.log(`count: ${s.size}`);
  s.docs.forEach((d) => {
    const v = d.data() as Record<string, unknown>;
    console.log(
      `- id=${d.id} | title=${String(v["title"] ?? "")} | status=${String(v["status"] ?? "")} | entriesSold=${String(v["entriesSold"] ?? "")} | entriesClosed=${String(v["entriesClosed"] ?? "")}`,
    );
  });
  process.exit(0);
}

main().catch((err) => {
  console.error("List failed:", err?.message || err);
  process.exit(1);
});
