# Testing
## Automated (run with `npm run test`)
Role and permission matrix, article validation (slugs, cover-image host, https-only links), media validation (allowed types and size limits, file-signature detection, SVG/script rejection). Run `npm run typecheck`, `npm run lint` and `npm run build` before each deploy.
Not automated yet: anything needing Firebase (login, sessions, Firestore rules, uploads). Use the manual list below, and ideally the Firebase Emulator Suite for rules.

## Manual checklist
**Sign-in and sessions**
- [ ] Wrong password shows a friendly error; correct credentials reach /admin/overview.
- [ ] An account with no role is refused ("does not have admin access").
- [ ] Visiting /admin/overview signed out redirects to /admin/login.
- [ ] Sign out, then press Back: the dashboard does not load. Copy the old cookie into another browser: it is rejected (tokens revoked).
- [ ] Disabling a user ends their session on the next request.
**Roles** (create one user per role)
- [ ] Editor can save drafts and "Submit for review" but cannot publish, delete, or edit a published item.
- [ ] Manager with only "articles" cannot create artifacts. Viewer sees lists but no edit controls (and /new redirects).
- [ ] Only Super Admin sees Users, Settings, Activity logs; a direct URL as another role shows "permission" notice.
**Content**
- [ ] Draft article is NOT visible at /history or /history/slug; after Publish it is; after Unpublish it is gone.
- [ ] Duplicate slug is refused. Pasting `<script>` into the editor does not execute on the public page.
- [ ] Artifact shows only populated fields; collection ID is generated; enlarge-image dialog opens with keyboard and closes with Escape.
**Uploads**
- [ ] JPEG/PNG/WebP/GIF/PDF upload with progress. A renamed .txt or .svg is rejected. A file over the limit is rejected.
- [ ] A file used by content cannot be deleted; an unused one can.
**Forms**
- [ ] Contact form validates, shows success, and the message appears in Visitor inquiries; internal notes never appear publicly.
- [ ] Filling the hidden honeypot field (browser dev tools) is rejected. Six rapid submissions trigger the rate limit.
- [ ] Newsletter: duplicate email gives the same success message; unsubscribe link works; CSV export opens in a spreadsheet.
**Public site / accessibility**
- [ ] Mobile menu opens, closes on outside click, Escape and link select. Skip link works. Tab order and focus rings visible.
- [ ] No horizontal scrolling at 360 px, 768 px, 1280 px. Check contrast with a browser tool (axe or Lighthouse).
- [ ] /admin and /api are not in the sitemap; /robots.txt disallows them.
**Rules** (emulator or console Rules Playground): anonymous user cannot read draft articles, inquiries, subscribers, logs, or write anything.
