import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updatePassword,
  updateProfile,
  deleteUser,
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

/** Change the signed-in user's password after re-authenticating. */
export async function changeAccountPassword(currentPassword: string, newPassword: string) {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("No signed-in user with an email address");
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}

/**
 * Permanently delete the signed-in Firebase Auth user.
 * Pass the account password for email/password accounts; Google users are
 * re-authenticated with a popup when no password is given.
 */
export async function deleteOwnAccount(password?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user");
  try {
    if (password && user.email) {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
    } else {
      await reauthenticateWithPopup(user, googleProvider);
    }
  } catch (err: any) {
    if (err?.code === "auth/popup-closed-by-user") throw new Error("Confirmation cancelled");
    throw err;
  }
  await deleteUser(user);
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

/**
 * Admin access is determined SOLELY by the Firestore `users/{uid}` document.
 * Set `role: "admin"` (or `isAdmin: true`) in the Firebase Console to grant
 * admin access. No email addresses are hardcoded anywhere.
 */
export function checkIsAdmin(profile?: Record<string, unknown> | null): boolean {
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
  const isAdmin = checkIsAdmin(profile);
  const role: "user" | "admin" | "partner" =
    isAdmin ? "admin" : (profile?.["role"] as string)?.toLowerCase() === "partner" ? "partner" : "user";

  const initials =
    (firstName.slice(0, 1) + lastName.slice(0, 1)).toUpperCase() || (isAdmin ? "AD" : "U");

  return {
    id: fbUser.uid,
    role,
    firstName: firstName || (isAdmin ? "Admin" : "Partner"),
    lastName,
    handle,
    email,
    phone: (profile?.["phone"] as string) || "",
    avatarMonogram: (profile?.["avatarMonogram"] as string) || initials,
    avatarUrl: (profile?.["avatarUrl"] as string) || fbUser.photoURL || "",
    verified: Boolean(profile?.["verified"] ?? isAdmin),
    isGoogleUser: !fbUser.email || fbUser.providerData.some((p) => p.providerId === "google.com"),
    profileComplete: Boolean(
      isAdmin || (role === "partner") || (profile?.["phone"] && profile?.["address"] && profile?.["dob"]),
    ),
    partnerId: (profile?.["partnerId"] as string) || undefined,
    businessName: (profile?.["businessName"] as string) || undefined,
  } as const;
}
