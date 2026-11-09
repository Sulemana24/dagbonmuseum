# Dagbon and Ghana Civilization Museum website

Next.js (App Router) + TypeScript + Tailwind + Firebase (Auth, Firestore, Storage). Public museum site and a secure staff dashboard at `/admin`.

**Start here:** `docs/SETUP.md` (Firebase, env vars, rules, first Super Admin), `docs/DEPLOY-VERCEL.md`, `docs/TESTING.md`, `docs/MAINTENANCE.md`, `docs/DATA-MODEL.md`.
Checks: `npm run typecheck && npm run lint && npm run test && npm run build`. The sections below record what each build phase added.

---
# Dagbon and Ghana Civilization Museum - Phase 1 (Foundation)

## Run
1. `npm install`
2. `cp .env.example .env.local` and fill in Firebase values (the site renders without them).
3. `npm run dev`, then `npm run typecheck && npm run lint && npm run build`.

## Included
Next.js App Router + TypeScript + Tailwind v4 theme (palette/fonts from the brief), accessible sticky
header with mobile menu (closes on outside click, Escape, and link select), footer, skip link,
not-found page, Firebase client/admin helpers (admin is `server-only`), `.env.example`.

## Placeholders
Museum address, hours, email, phone, and socials are unverified. Edit `src/lib/site-config.ts` until the
admin Settings page exists (Phase 4). The hero has no photograph yet.

## Not yet built
shadcn/ui install, Sonner, React Hook Form + Zod (added with the first forms), all pages beyond Home and a
Search stub, newsletter, auth, rules, admin. Footer Privacy/Terms are placeholders.

## Phase 2 (public site)
Pages: Home, About, History (+article), Exhibitions (+detail), Collections (+artifact), Learn (+resource), Visit, Contact,
Search, Privacy/Terms placeholders, Unsubscribe. APIs: `/api/contact`, `/api/newsletter`, `/api/newsletter/unsubscribe`
(Zod-validated, honeypot, in-memory rate limit, written with the Admin SDK). Also `sitemap.xml`, `robots.txt`.

- Content is read from Firestore on the server (published only). Without Admin credentials every list shows an empty state.
- Deploy `firebase/firestore.indexes.json` before using filters/sorting (`firebase deploy --only firestore:indexes`).
- Singleton docs: `settings/site` (name, address, email, phone, openingHours, admissionInfo, mapEmbedUrl, intro, mission,
  vision, hero{heading,text,image}, social[]) and `pages/about`, `pages/visit` (text fields shown only when present).
- Required doc fields: `status: "published"`, `slug`, `title`, `publishedAt` (timestamp); see `src/types/content.ts`.
- Limits: search scans up to 150 published records per collection in memory; collections have no period filter yet;
  rate limiting is per server instance; the homepage newsletter lives in the footer; Privacy/Terms are drafts.
- Deliberately not done: no sample content was seeded. Firestore rules are Phase 3 (the Admin SDK bypasses rules, so
  public reads here are safe; client-side reads must stay denied until rules are written).

## Phase 3 (auth and security)
Routes: `/admin/login`, `/admin/overview` (protected). APIs: `POST/DELETE /api/admin/session`, `POST /api/admin/users/role`.

**How it works.** Staff sign in with Firebase Auth in the browser (in-memory only), the ID token is exchanged for an
HTTP-only, SameSite=Lax session cookie (`museum_session`, 5 days, Secure in production), and the browser Firebase session is
signed out immediately. Every dashboard request calls `requireStaff()`, which verifies the cookie with Firebase including
revocation. Roles live in Firebase custom claims set only by the Admin SDK. `middleware.ts` is just an optimistic redirect.
Sign-out revokes the user's refresh tokens. Sessions do not slide: after 5 days staff sign in again.

**Roles** (`src/lib/auth/roles.ts`, tested): `super_admin`, `content_manager` (assigned areas), `content_editor` (cannot
publish or delete), `viewer`. Add roles or permissions in the matrix only.

**First Super Admin (no public registration, no password handled by code):**
1. Firebase Console: enable Email/Password sign-in; create a service account key; fill `.env.local`.
2. `node --env-file=.env.local scripts/provision-admin.mjs --email you@example.org --role super_admin`
3. Open the printed one-time link, set your password, then sign in at `/admin/login`. Never commit the key or the link.

**Rules.** `firebase/firestore.rules` and `firebase/storage.rules` deny all client writes; reads are published-only for visitors.
Deploy: `firebase deploy --only firestore:rules,firestore:indexes,storage`. NOT yet tested with the Firebase emulator.

**Logs.** `activityLogs` is written server-side only (sign-in, sign-out, role changes, provisioning). Failures to log are
printed but do not block the action. No retention policy is enforced yet; set a Firestore TTL policy if wanted.

**Tests.** `npm run test` (permission matrix). Manual checks still needed: wrong password, no-role account, expired cookie,
signing out then reusing an old cookie, `/admin/overview` while signed out.

## Phase 4a (dashboard shell + articles)
Admin: sidebar/mobile drawer (only built modules are listed), Overview with real counts (Firestore aggregation), a published-per-month
chart, recent activity (Super Admin only), and a clear "traffic analytics not configured" notice. Articles: list with status filter,
search and pagination; create/edit with a Tiptap editor, references, SEO, evidence type; draft, submit for review, publish, unpublish,
archive/restore, delete with confirmation, and preview. All writes go through `/api/admin/articles` (permission, area, role and
Zod checks on the server), HTML is sanitized on save and on render, slugs are unique via `articleSlugs` reservations, and public
pages are revalidated on publish. Every action is written to `activityLogs`.

Rules recap: editors can draft and submit for review but cannot publish, delete, or edit a published article.
Known gaps: cover image is a Firebase Storage link until the media library (4b) exists; no inline images in the editor yet;
no scheduled publishing; no related-article picker; editing is last-write-wins; the article list search scans the 200 most recently
edited articles. Deploy the updated `firebase/firestore.indexes.json` (new: articles by status + updatedAt).
Tests: `npm run test` (roles + article validation). The article API, editor and dashboard have NOT been exercised against a live Firebase project.

## Phase 4b (exhibitions, artifacts, resources, media library)
Admin: `/admin/exhibitions`, `/admin/collections` (artifacts), `/admin/resources`, `/admin/media`. Articles, exhibitions, artifacts and
resources now share one engine (`content-engine.ts` + `modules.ts`) behind `/api/admin/content/[type]`: server-side permission and
area checks, Zod validation, unique slugs, draft / submit / publish / unpublish / archive / delete, audit log, and revalidation of the
public pages. Artifacts get sequential collection IDs (`DGM-2026-0001`; change the prefix in `site-config.ts`), a category list that
feeds the public filter, related artifacts, references and provenance. Exhibitions connect to artifacts through a search picker.
Resources only offer a download when "visitors may download" is ticked.

**Media library.** Uploads go straight to Firebase Storage through a 10-minute signed URL; the server then re-reads the stored file,
checks its size and its real type from the first bytes (JPEG, PNG, WebP, GIF, PDF; SVG is refused), and only then marks it ready.
Rejected files are deleted. Staff can edit title, alt text, caption and credit; deleting is blocked while any content still uses the file.
**One-time setup:** allow browser uploads with `gcloud storage buckets update gs://YOUR_BUCKET --cors-file=firebase/cors.json`
(edit the domains in `firebase/cors.json` first), and deploy `firebase/firestore.indexes.json`.

Known gaps: no image insertion inside article bodies; no scheduled publishing; no inline preview for exhibitions/artifacts/resources
(publish to a test project instead); unfinished uploads leave a `pending` media record (clean up by hand until a scheduled job exists);
cover images are not resized; lookups and media search scan the latest 200 records; not yet exercised against live Firebase.
Tests: `npm run test` (13 passing: roles, article validation, media type detection and limits).

## Phase 4c (inquiries, subscribers, users, settings, pages, logs)
- **Visitor inquiries** (`inquiries:read/write`): list with status filter and search, full message, status (New, In progress, Resolved, Archived),
  assignment to staff, internal notes (staff only), archive. Message text is never copied into the audit log.
- **Newsletter subscribers**: list/search/filter; Super Admin can suppress or delete and export CSV (spreadsheet-formula safe, export is logged).
  Unsubscribe tokens are never sent to the dashboard. No emails can be sent until an email service is connected.
- **Users and roles** (Super Admin): list staff, change role and assigned areas (signs them out), disable/enable, and create accounts. New accounts
  get no password; a one-time setup link is shown once for you to pass on privately (no email is sent automatically).
- **Website settings** (Super Admin): museum details, map embed (Google/OpenStreetMap only), hero, intro, mission, vision, logo, favicon, sharing image,
  SEO description, footer note, social links, newsletter on/off and consent wording. Empty values fall back to "To be confirmed". Cached for up to 60 s.
- **Pages** (`content:publish`): structured editors for About, Visit and a site-wide announcement banner. Publishes immediately.
- **Activity logs** (Super Admin): newest first with actor emails; read-only.
Deploy updated indexes (inquiries and subscribers by status + date). Not yet exercised against live Firebase. Tests: 13 passing (`npm run test`).
Gaps: activity-log filtering is not built; settings and page edits are last-write-wins; inquiry and subscriber search scan the latest 200-300 records.
