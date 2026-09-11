import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export type { FirebaseUser };

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function loginWithEmail(email: string, password: string, remember = true) {
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  } catch (err) {
    console.warn("Could not set auth persistence:", err);
  }
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn("Could not set auth persistence:", err);
  }
  return createUserWithEmailAndPassword(auth, email, password);
}

export { updateProfile };

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logoutFirebase() {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export async function createUserProfile(uid: string, data: Record<string, unknown>) {
  return setDoc(doc(db, "users", uid), { ...data, createdAt: serverTimestamp() }, { merge: true });
}

import {
  DEFAULT_PRIMARY_ADMIN_EMAIL,
  BACKUP_ADMIN_EMAILS,
  getPrimaryAdminEmail,
  getAllAdminEmails,
  checkIsAdminEmail,
  setAdminEmail,
  resetAdminEmailToDefault,
  useAdminEmailConfig,
} from "./admin-email-config";

export {
  DEFAULT_PRIMARY_ADMIN_EMAIL,
  BACKUP_ADMIN_EMAILS,
  getPrimaryAdminEmail,
  getAllAdminEmails,
  checkIsAdminEmail,
  setAdminEmail,
  resetAdminEmailToDefault,
  useAdminEmailConfig,
};

export const KNOWN_ADMIN_EMAILS = [DEFAULT_PRIMARY_ADMIN_EMAIL, ...BACKUP_ADMIN_EMAILS];

export function isAdminEmail(email?: string | null): boolean {
  return checkIsAdminEmail(email);
}

export function checkIsAdmin(
  email?: string | null,
  profile?: Record<string, unknown> | null,
): boolean {
  if (isAdminEmail(email)) return true;
  if (!profile) return false;
  const role = typeof profile["role"] === "string" ? profile["role"].trim().toLowerCase() : "";
  if (
    role === "admin" ||
    role === "superadmin" ||
    role === "administrator" ||
    role === "staff" ||
    role === "ops"
  ) {
    return true;
  }
  if (profile["isAdmin"] === true || profile["is_admin"] === true) {
    return true;
  }
  return false;
}

export function firebaseUserToRaffilaUser(fbUser: FirebaseUser, profile?: Record<string, unknown>) {
  const displayName =
    fbUser.displayName ||
    (profile?.["displayName"] as string) ||
    (profile?.["firstName"] ? `${profile["firstName"]} ${profile["lastName"] || ""}`.trim() : "");
  const parts = displayName.trim().split(/\s+/);
  const firstName = (parts[0] ||
    (profile?.["firstName"] as string) ||
    (profile?.["handle"] as string) ||
    "") as string;
  const lastName = (parts.slice(1).join(" ") || (profile?.["lastName"] as string) || "") as string;
  const handle =
    (profile?.["handle"] as string) || firstName.toLowerCase().replace(/\s+/g, "_") || "user";

  const email = fbUser.email || (profile?.["email"] as string) || "";
  const isAdmin = checkIsAdmin(email, profile);

  const initials =
    (firstName.slice(0, 1) + lastName.slice(0, 1)).toUpperCase() || (isAdmin ? "AD" : "U");

  return {
    id: fbUser.uid,
    role: (isAdmin ? "admin" : "user") as "user" | "admin",
    firstName: firstName || (isAdmin ? "Admin" : "User"),
    lastName,
    handle,
    email,
    phone: (profile?.["phone"] as string) || "",
    avatarMonogram: (profile?.["avatarMonogram"] as string) || initials,
    avatarUrl: (profile?.["avatarUrl"] as string) || fbUser.photoURL || "",
    verified: Boolean(profile?.["verified"] ?? isAdmin),
    isGoogleUser: !fbUser.email || fbUser.providerData.some((p) => p.providerId === "google.com"),
    profileComplete: Boolean(
      isAdmin || (profile?.["phone"] && profile?.["address"] && profile?.["dob"]),
    ),
  } as const;
}
