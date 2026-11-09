// Provision (or re-role) a staff account WITHOUT ever handling a password.
// Usage: node --env-file=.env.local scripts/provision-admin.mjs --email you@example.org --role super_admin [--areas articles,artifacts]
// Run it only on a trusted machine. It prints a one-time password-setup link for the new user.
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const ROLES = ["super_admin", "content_manager", "content_editor", "viewer"];
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const email = arg("email")?.trim().toLowerCase();
const role = arg("role");
const areas = (arg("areas") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

if (!email || !ROLES.includes(role)) { console.error(`Usage: --email <email> --role <${ROLES.join("|")}> [--areas a,b]`); process.exit(1); }
const { FIREBASE_ADMIN_PROJECT_ID: projectId, FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail } = process.env;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) { console.error("Missing FIREBASE_ADMIN_* variables. Run with --env-file=.env.local"); process.exit(1); }

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth();
const db = getFirestore();

let user;
try { user = await auth.getUserByEmail(email); } catch { user = await auth.createUser({ email, emailVerified: false, disabled: false }); }
await auth.setCustomUserClaims(user.uid, { role, areas });
await auth.revokeRefreshTokens(user.uid);
await db.collection("users").doc(user.uid).set({ email, role, areas, updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() }, { merge: true });
await db.collection("activityLogs").add({ actorId: "system:provision-script", action: "user.provision", target: user.uid, metadata: { role, areas }, createdAt: FieldValue.serverTimestamp() });

const link = await auth.generatePasswordResetLink(email);
console.log(`\nProvisioned ${email} as ${role}.\nOne-time password setup link (share privately, do not commit):\n${link}\n`);
