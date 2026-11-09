# Deploying to Vercel
1. Push the project to GitHub (`.env*` and service-account files are git-ignored).
2. Vercel > Add New > Project > import the repository. Framework: Next.js (auto-detected).
3. Settings > Environment Variables: add every variable from `.env.example` for Production (and Preview if wanted). Paste the private key exactly, including `\n`.
4. Set `NEXT_PUBLIC_SITE_URL` to the final domain; add the domain under Settings > Domains.
5. Add the domain to Firebase Auth > Settings > Authorized domains, and to `firebase/cors.json` (then re-run the CORS command).
6. Deploy. Visit `/admin/login`, sign in, and confirm `/sitemap.xml` and `/robots.txt` look right.
Notes: the in-memory rate limiter is per instance (add Cloudflare Turnstile or Firebase App Check for stronger spam protection). Redeploys are not needed for content changes; they publish through revalidation.
