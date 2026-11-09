# Maintenance
- **Updates:** monthly `npm outdated`; update Next.js, Firebase and sanitize-html promptly for security fixes; run the checks and test the admin flows before deploying.
- **Backups:** enable Firestore scheduled backups or export with `gcloud firestore export`; Storage has object versioning you can turn on. Test a restore once.
- **Staff changes:** disable (not delete) leavers in Users and roles; this ends their sessions at once. Review roles quarterly.
- **Service-account key:** rotate yearly or after any suspected leak (generate a new key, update Vercel, delete the old key).
- **Logs:** activity logs have no automatic retention; add a Firestore TTL policy on `activityLogs.createdAt` if you want to expire old entries.
- **Housekeeping:** abandoned uploads leave `media` documents with status `pending` (and a file in Storage); delete them manually until a scheduled cleanup is added.
- **Scale limits:** search and admin lookups scan the latest 150-300 records in memory. If content grows past that, add Algolia or Typesense.
- **Known gaps:** no scheduled publishing, no inline images in article bodies, no related-article picker, no traffic analytics, no newsletter sending, no JSON-LD structured data, no automated browser tests.
