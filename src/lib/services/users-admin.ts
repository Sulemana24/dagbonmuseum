import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AREAS, isRole, ROLES } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/session";
import { logActivity } from "./activity";
import { ServiceError } from "./errors";

export interface StaffUser { uid: string; email: string; role: string; areas: string[]; disabled: boolean; lastSignIn?: string }

export async function listStaff(): Promise<StaffUser[]> {
  const res = await adminAuth().listUsers(500);
  return res.users.filter((u) => isRole(u.customClaims?.role)).map((u) => ({
    uid: u.uid, email: u.email ?? "", role: u.customClaims!.role as string, areas: (u.customClaims!.areas as string[] | undefined) ?? [],
    disabled: u.disabled, lastSignIn: u.metadata.lastSignInTime || undefined,
  })).sort((a, b) => a.email.localeCompare(b.email));
}

const createSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address."), role: z.enum(ROLES), areas: z.array(z.enum(AREAS)).max(5).default([]) });

/** Creates the account with NO password and returns a one-time setup link for the Super Admin to pass on privately. */
export async function createStaff(s: Session, raw: unknown) {
  const { email, role, areas } = createSchema.parse(raw);
  const existing = await adminAuth().getUserByEmail(email).catch(() => null);
  if (existing) throw new ServiceError(409, "An account with this email already exists. Use the role control for existing staff.");
  const user = await adminAuth().createUser({ email, disabled: false });
  await adminAuth().setCustomUserClaims(user.uid, { role, areas });
  await adminDb().collection("users").doc(user.uid).set({ email, role, areas, disabled: false, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  const link = await adminAuth().generatePasswordResetLink(email);
  await logActivity({ actorId: s.uid, action: "user.create", target: user.uid, metadata: { role, areas } });
  return { uid: user.uid, setupLink: link };
}

export async function setDisabled(s: Session, uid: string, raw: unknown) {
  const { disabled } = z.object({ disabled: z.boolean() }).parse(raw);
  if (uid === s.uid) throw new ServiceError(400, "You cannot disable your own account.");
  const user = await adminAuth().getUser(uid).catch(() => null);
  if (!user || !isRole(user.customClaims?.role)) throw new ServiceError(404, "Staff account not found.");
  await adminAuth().updateUser(uid, { disabled });
  await adminAuth().revokeRefreshTokens(uid); // ends any live session immediately
  await adminDb().collection("users").doc(uid).set({ disabled, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await logActivity({ actorId: s.uid, action: disabled ? "user.disable" : "user.enable", target: uid });
}
