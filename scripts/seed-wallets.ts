import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db, auth } from "../src/lib/firebase";

interface WalletSeed {
  userId: string;
  displayName: string;
  balanceKobo: number;
  referralBalanceKobo: number;
  virtualAccountNumber: string;
  accountName: string;
  totalFundedKobo: number;
  totalSpentKobo: number;
}

const wallets: WalletSeed[] = [
  {
    userId: "usr_tunmise_adebayo_001",
    displayName: "Tunmise Adebayo",
    balanceKobo: 5000000,
    referralBalanceKobo: 1250000,
    virtualAccountNumber: "7820194821",
    accountName: "Raffila / Tunmise Adebayo",
    totalFundedKobo: 18000000,
    totalSpentKobo: 13000000,
  },
  {
    userId: "usr_chioma_okeke_002",
    displayName: "Chioma Okeke",
    balanceKobo: 8200000,
    referralBalanceKobo: 450000,
    virtualAccountNumber: "7820194822",
    accountName: "Raffila / Chioma Okeke",
    totalFundedKobo: 25000000,
    totalSpentKobo: 16800000,
  },
  {
    userId: "usr_emeka_nwosu_003",
    displayName: "Emeka Nwosu",
    balanceKobo: 15000000,
    referralBalanceKobo: 2100000,
    virtualAccountNumber: "7820194823",
    accountName: "Raffila / Emeka Nwosu",
    totalFundedKobo: 40000000,
    totalSpentKobo: 25000000,
  },
  {
    userId: "usr_amina_bello_004",
    displayName: "Amina Bello",
    balanceKobo: 3400000,
    referralBalanceKobo: 800000,
    virtualAccountNumber: "7820194824",
    accountName: "Raffila / Amina Bello",
    totalFundedKobo: 10000000,
    totalSpentKobo: 6600000,
  },
  {
    userId: "adm_aisha_ola_001",
    displayName: "Aisha Olamide",
    balanceKobo: 0,
    referralBalanceKobo: 0,
    virtualAccountNumber: "7820194825",
    accountName: "Raffila / Aisha Olamide",
    totalFundedKobo: 0,
    totalSpentKobo: 0,
  },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

async function main() {
  console.log("--------------------------------------------------");
  console.log("Raffila Wallet & Transaction Seeder");
  console.log("--------------------------------------------------");

  try {
    const cred = await signInWithEmailAndPassword(auth, "admin@raffila.com", "Admin2026!");
    console.log(`[AUTH] Authenticated as: ${cred.user.email}`);
  } catch (err: any) {
    console.error(`[AUTH] Failed: ${err?.message}`);
    process.exit(1);
  }

  let walletCount = 0;
  let txCount = 0;
  let rootTxCount = 0;

  // Seed wallets + subcollection transactions
  for (const w of wallets) {
    const batch = writeBatch(db);

    // Wallet document
    batch.set(doc(db, "wallets", w.userId), {
      userId: w.userId,
      displayName: w.displayName,
      balanceKobo: w.balanceKobo,
      referralBalanceKobo: w.referralBalanceKobo,
      currency: "NGN",
      virtualAccountNumber: w.virtualAccountNumber,
      bankName: "Wema Bank / Raffila Pay",
      accountName: w.accountName,
      status: "ACTIVE",
      totalFundedKobo: w.totalFundedKobo,
      totalSpentKobo: w.totalSpentKobo,
      updatedAt: new Date().toISOString(),
    });
    walletCount++;

    const tsBase = Date.now();
    const short = w.userId.replace("usr_", "").replace("adm_", "").slice(0, 10);

    // Transaction 1: Top-up via Paystack
    const tx1Id = `TX-${short}-TOP-${tsBase}`;
    const tx1 = {
      userId: w.userId,
      type: "Wallet credit",
      direction: "CREDIT",
      amountKobo: 5000000,
      currency: "NGN",
      status: "SUCCESS",
      reference: `PSTK-TOP-${tsBase}`,
      description: "Wallet top-up via Paystack",
      channel: "paystack",
      createdAt: daysAgo(5),
    };
    batch.set(doc(db, "wallets", w.userId, "transactions", tx1Id), tx1);
    batch.set(doc(db, "transactions", tx1Id), tx1);
    txCount++;
    rootTxCount++;

    // Transaction 2: Ticket purchase
    const tx2Id = `TX-${short}-TKT-${tsBase}`;
    const tx2 = {
      userId: w.userId,
      type: "Ticket purchase",
      direction: "DEBIT",
      amountKobo: 500000,
      currency: "NGN",
      status: "SUCCESS",
      reference: "TKT-DED-001",
      description: "2x Executive Sedan Draw entries",
      competitionSlug: "mercedes-benz-c-class",
      createdAt: daysAgo(3),
    };
    batch.set(doc(db, "wallets", w.userId, "transactions", tx2Id), tx2);
    batch.set(doc(db, "transactions", tx2Id), tx2);
    txCount++;
    rootTxCount++;

    // Transaction 3: Referral commission
    const tx3Id = `TX-${short}-REF-${tsBase}`;
    const tx3 = {
      userId: w.userId,
      type: "Referral bonus",
      direction: "CREDIT",
      amountKobo: 250000,
      currency: "NGN",
      status: "SUCCESS",
      reference: "REF-COMM-001",
      description: "Referral commission from invited user",
      createdAt: daysAgo(1),
    };
    batch.set(doc(db, "wallets", w.userId, "transactions", tx3Id), tx3);
    batch.set(doc(db, "transactions", tx3Id), tx3);
    txCount++;
    rootTxCount++;

    await batch.commit();
    console.log(`[OK] ${w.displayName} — wallet + 3 transactions`);
  }

  // Verify
  const [walletSnap, txSnap] = await Promise.all([
    getDocs(collection(db, "wallets")),
    getDocs(collection(db, "transactions")),
  ]);

  console.log("\n--------------------------------------------------");
  console.log("Seed completed successfully!");
  console.log("--------------------------------------------------");
  console.log(`  Wallets:              ${walletCount} documents`);
  console.log(`  Subcollection TXs:    ${txCount} documents`);
  console.log(`  Root transactions:    ${rootTxCount} documents`);
  console.log(`  Firestore wallets:    ${walletSnap.size}`);
  console.log(`  Firestore TXs:        ${txSnap.size}`);
  console.log("--------------------------------------------------");

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
