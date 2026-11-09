# Setup guide

## 1. Requirements
Node 20.6+ (for `--env-file`), npm, a Google account, the Firebase CLI (`npm i -g firebase-tools`), and `gcloud` (for the one-time bucket CORS step).

## 2. Firebase project
1. Create a project at console.firebase.google.com (Blaze plan is required for Storage in most regions; see the cost note below).
2. Build > Authentication > Sign-in method: enable **Email/Password**. Do not enable public sign-up anywhere else.
3. Build > Firestore Database: create in production mode, choose a region close to Ghana users.
4. Build > Storage: create the default bucket.
5. Project settings > General > Your apps: add a **Web app** and copy its config values.
6. Project settings > Service accounts > **Generate new private key**. Keep this JSON secret; never commit it.

## 3. Environment variables
`cp .env.example .env.local` and fill in:
| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production domain, no trailing slash. Used for canonical URLs, sitemap, sharing. |
| `NEXT_PUBLIC_FIREBASE_*` (6 values) | From the web app config. Safe to expose. |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | From the service-account JSON. **Server only.** Keep `\n` escapes inside the quotes. |

## 4. Deploy rules, indexes and CORS
```
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes,storage
gcloud storage buckets update gs://YOUR_BUCKET --cors-file=firebase/cors.json   # edit domains in the file first
```
Indexes take a few minutes to build; list pages show empty states until they finish. Re-deploy indexes after every update.

## 5. First Super Admin (no public registration)
```
node --env-file=.env.local scripts/provision-admin.mjs --email you@example.org --role super_admin
```
Open the printed one-time link, set a password, then sign in at `/admin/login`. Add other staff from **Users and roles**.

## 6. Run
`npm install`, `npm run dev`, then `npm run typecheck && npm run lint && npm run test && npm run build`.

## First-content checklist
Website settings (name, verified address/hours/contact, logo, hero) > Pages (About, Visit) > upload media > create categories by adding artifacts > publish articles/exhibitions.
Nothing is pre-filled: unverified facts show as "To be confirmed". Do not publish founding dates, partners, awards or history the museum has not confirmed.

## Costs
Firebase and Vercel both have free tiers; Storage requires the pay-as-you-go plan but small museums typically stay within free quotas. Sending newsletters needs a separate email service (not included). Website traffic analytics are not configured (Vercel Analytics or Google Analytics could be added).
