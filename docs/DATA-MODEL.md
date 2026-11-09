# Data model (Firestore)
All writes happen on the server with the Admin SDK; the rules deny client writes. Timestamps are server-generated. "Slug" collections hold one doc per slug to guarantee uniqueness.

| Collection | Key fields | Notes |
|---|---|---|
| `articles` | title, slug, excerpt, content (sanitized HTML), category/categorySlug, tags[], author, evidenceType, coverImage{url,alt,caption,credit}, references[], seoTitle, seoDescription, featured, status, publishedAt, createdAt, updatedAt, authorId, mediaUrls[] | status: draft, pending_review, published, archived |
| `exhibitions` | title, slug, excerpt, description, kind (permanent/temporary/digital/past), category, period, startDate, endDate, location, coverImage, gallery[], artifactIds[], featured, status, ... | |
| `artifacts` | title, slug, collectionId (generated), description, significance, period, materials, origin, attribution, displayLocation, provenance, researchNotes, imageCredits, images[], references[], relatedIds[], category/categorySlug, ... | Only populated fields are shown publicly |
| `educationalResources` | title, slug, description, type, category, coverImage, fileUrl, publicDownload, videoUrl, ... | Downloads only if publicDownload is true |
| `artifactCategories` | slug, name | Maintained automatically from artifact categories |
| `articleSlugs`, `exhibitionSlugs`, `artifactSlugs`, `resourceSlugs` | docId | Server only |
| `counters/artifacts` | n | Collection ID counter |
| `pages` | about, visit, announcement | Structured fields, see `src/lib/page-config.ts` |
| `settings/site` | museum details, hero, logo, social[], newsletter settings | Public read; Super Admin write |
| `media` | filename, title, alt, caption, credit, contentType, kind, size, path, url, status (pending/ready), uploadedBy, createdAt | Files live in Storage under `public/media/` |
| `inquiries` | name, email, organization, subject, message, kind, status, assignedTo, internalNotes[], consent, ipHash, createdAt | Staff only |
| `newsletterSubscribers` | email, status, consent, consentText, unsubscribeToken, subscribedAt, unsubscribedAt | Doc ID is a hash of the email. Staff only |
| `users` | email, role, areas[], disabled | Mirror only; roles are enforced from Auth custom claims |
| `activityLogs` | actorId, action, target, metadata, createdAt | Server-written; Super Admin read |

Indexes: `firebase/firestore.indexes.json`. Roles and permissions: `src/lib/auth/roles.ts`.
