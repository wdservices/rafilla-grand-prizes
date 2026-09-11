import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { db, auth } from "./firebase";
import { SEED_USERS } from "./firestore-seed";
import { DEFAULT_CREDENTIALS } from "./auth-store";

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "raffila",
  "official",
  "support",
  "help",
  "system",
  "moderator",
  "root",
  "superuser",
  "guest",
  "security",
  "billing",
  "team",
  "info",
]);

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function getEmailDocKey(email: string): string {
  return normalizeEmail(email).replace(/[^a-zA-Z0-9_]/g, "_");
}

export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  const clean = normalizeUsername(username);
  if (!clean) {
    return { valid: false, error: "Username is required" };
  }
  if (clean.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (clean.length > 25) {
    return { valid: false, error: "Username cannot exceed 25 characters" };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(clean)) {
    return { valid: false, error: "Only letters, numbers, dots, and underscores allowed" };
  }
  if (/^[._-]/.test(clean) || /[._-]$/.test(clean)) {
    return { valid: false, error: "Username cannot start or end with a symbol" };
  }
  if (RESERVED_USERNAMES.has(clean)) {
    return { valid: false, error: "This username is reserved by Raffila" };
  }
  return { valid: true };
}

export function validateEmailFormat(email: string): { valid: boolean; error?: string } {
  const clean = normalizeEmail(email);
  if (!clean) {
    return { valid: false, error: "Email address is required" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { valid: false, error: "Please enter a valid email address" };
  }
  return { valid: true };
}

/**
 * Check if a username is globally available
 */
export async function checkUsernameAvailability(
  rawUsername: string,
  excludeUid?: string,
): Promise<{ available: boolean; error?: string }> {
  const formatCheck = validateUsernameFormat(rawUsername);
  if (!formatCheck.valid) {
    return { available: false, error: formatCheck.error };
  }

  const clean = normalizeUsername(rawUsername);

  // 1. Check against pre-seeded users and default credentials
  const isSeedTaken = SEED_USERS.some(
    (u) => u.handle.toLowerCase() === clean && (!excludeUid || u.id !== excludeUid),
  );
  if (isSeedTaken) {
    return { available: false, error: "This username is already taken. Please choose another." };
  }

  const isDefaultTaken = Object.values(DEFAULT_CREDENTIALS).some(
    (c) => c.user.handle?.toLowerCase() === clean && (!excludeUid || c.user.id !== excludeUid),
  );
  if (isDefaultTaken) {
    return { available: false, error: "This username is already taken. Please choose another." };
  }

  // 2. Check Firestore usernames collection
  try {
    const userRef = doc(db, "usernames", clean);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (!excludeUid || data?.uid !== excludeUid) {
        return {
          available: false,
          error: "This username is already taken. Please choose another.",
        };
      }
    }
  } catch (err) {
    console.warn("Firestore username lookup warning:", err);
  }

  // 3. Optional secondary check on users collection by handle
  try {
    const q = query(collection(db, "users"), where("handle", "==", clean), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const matched = snap.docs[0];
      if (!excludeUid || matched.id !== excludeUid) {
        return {
          available: false,
          error: "This username is already taken. Please choose another.",
        };
      }
    }
  } catch {
    // If client rules restrict query on users collection, ignore
  }

  return { available: true };
}

/**
 * Check if an email is globally available (not registered)
 */
export async function checkEmailAvailability(
  rawEmail: string,
  excludeUid?: string,
): Promise<{ available: boolean; error?: string }> {
  const formatCheck = validateEmailFormat(rawEmail);
  if (!formatCheck.valid) {
    return { available: false, error: formatCheck.error };
  }

  const clean = normalizeEmail(rawEmail);

  // 1. Check against pre-seeded users and default credentials
  const isSeedTaken = SEED_USERS.some(
    (u) => u.email.toLowerCase() === clean && (!excludeUid || u.id !== excludeUid),
  );
  if (isSeedTaken) {
    return { available: false, error: "This email is already registered. Please sign in instead." };
  }

  const isDefaultTaken = Object.values(DEFAULT_CREDENTIALS).some(
    (c) => c.email.toLowerCase() === clean && (!excludeUid || c.user.id !== excludeUid),
  );
  if (isDefaultTaken) {
    return { available: false, error: "This email is already registered. Please sign in instead." };
  }

  // 2. Check Firestore registeredEmails collection
  try {
    const emailKey = getEmailDocKey(clean);
    const snap = await getDoc(doc(db, "registeredEmails", emailKey));
    if (snap.exists()) {
      const data = snap.data();
      if (!excludeUid || data?.uid !== excludeUid) {
        return {
          available: false,
          error: "This email is already registered. Please sign in instead.",
        };
      }
    }
  } catch (err) {
    console.warn("Firestore email doc lookup warning:", err);
  }

  // 3. Check Firebase Auth methods
  try {
    const methods = await fetchSignInMethodsForEmail(auth, clean);
    if (methods && methods.length > 0) {
      return {
        available: false,
        error: "This email is already registered. Please sign in instead.",
      };
    }
  } catch (err: any) {
    if (err?.code === "auth/email-already-in-use") {
      return {
        available: false,
        error: "This email is already registered. Please sign in instead.",
      };
    }
    // Ignore other Firebase auth errors such as disabled enumeration
  }

  return { available: true };
}

/**
 * Reserve username and email mappings in Firestore
 */
export async function claimUsernameAndEmail(params: {
  username: string;
  email: string;
  uid: string;
}): Promise<void> {
  const cleanUsername = normalizeUsername(params.username);
  const cleanEmail = normalizeEmail(params.email);
  const emailKey = getEmailDocKey(cleanEmail);

  try {
    await Promise.all([
      setDoc(
        doc(db, "usernames", cleanUsername),
        {
          uid: params.uid,
          email: cleanEmail,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
      setDoc(
        doc(db, "registeredEmails", emailKey),
        {
          uid: params.uid,
          username: cleanUsername,
          email: cleanEmail,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
    ]);
  } catch (err) {
    console.error("Failed to claim username or email registry in Firestore:", err);
  }
}
