# MadLease

Map-based UW–Madison student subleases. React 19, Vite, React Router, React Leaflet, CSS theme tokens, shadcn/ui components, and Supabase. Browse is public; posting, saves, and contact information require a UW email sign-in.

## Local setup

Use a current Node LTS compatible with Vite (Node 22.12+ is suitable).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

In PowerShell, use `Copy-Item .env.example .env.local`. Open the `/madlease/` URL printed by Vite. Without Supabase values, public browsing works with an empty real-listing list. On Browse, **Add test subleases** adds 26 clearly labeled fictional listings; **Remove test subleases** removes only those local examples. The choice lasts for the current browser tab (including reloads). No database records are created or deleted. Saving and contacting these examples are disabled. Sign-in and posting remain unavailable until Supabase is configured.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public publishable key; never a service-role or secret key |
| `VITE_CARTO_KEY` | CARTO basemap key; optional locally, with OpenStreetMap fallback |

These values are included in the browser build. RLS and database grants protect records. `.env.local` is ignored by Git. Restart Vite after changing it.

## Supabase setup checklist

1. Create the Supabase project and put its Project URL and publishable key in `.env.local`.
2. Run all six SQL files under `supabase/` in numbered order, from `01_schema.sql` through `06_footprints.sql`. This creates the tables, policies, buckets, hook, demo listings, and OSM footprints.
3. In Authentication → Hooks, enable **Before User Created** and select `public.hook_wisc_only`.
4. In Authentication → Email Templates, replace the link with `{{ .Token }}` in both **Magic link** and **Confirm signup** templates.
5. Check the email OTP length. The UI accepts 6–10 digits.
6. Add teammates to the Supabase organization team. The built-in email service is restricted to team addresses and has a low limit (about two emails per hour; verify the project's current limit). Configure custom SMTP before students outside the team can receive codes. SMTP setup is outside this project.
7. Set Authentication → URL Configuration → Site URL to `https://adityapall1.github.io/madlease/`.
8. Optionally add a CARTO basemap key to `.env.local` for the listing form's location picker. Browse and the homepage use a quiet local OSM campus backdrop and need no map key.
9. Add the three `VITE_*` values as **GitHub Actions repository variables**, with exactly the names above.

Free Supabase projects may pause after inactivity. Open the site before grading and resume the project in the dashboard if needed. Demo listings have fixed 2027 dates and will eventually expire; their sample prices and availability are not real.

## Checks and deployment

```sh
npm run lint
npm run build
npm run preview
```

GitHub Actions builds with repository variables, copies `index.html` to `404.html`, and publishes `dist/` to Pages. The fallback lets React Router load nested URLs on refresh. Test a deployed `/madlease/browse/listings/<id>` URL directly; a local dev-server refresh does not prove Pages is configured correctly.

Pushes to `main` deploy the live site. Keep development on `supabase-v1` until the changes are ready for review.

## Features and failure handling

Browse loads active listings and buildings, then filters and sorts locally. Search filters, sort, and building selection are shareable URL parameters; the walk landmark is remembered on the device. Walk times are estimates, not routing directions.

The map's **Walk to** selector offers six campus destinations and updates walk estimates and closest-first sorting. The simplified backdrop covers campus and nearby neighborhoods; beyond that snapshot, listing markers still work but street detail is absent. Refresh the OSM geometry with `node scripts/fetch-basemap.mjs` (network required). Map data © OpenStreetMap contributors, under ODbL.

New listings are initially stored as taken while photos upload, then made active after the final update succeeds. Retry reuses the same row during that form session. Leaving an interrupted form may leave a taken row; it is visible in My listings for editing or deletion. Photo names are unique within each owner's listing folder. Profile offers unused-photo cleanup, and deletion reports cleanup failures separately so they can be retried. The first selected photo is the cover. Avatar changes overwrite a centered 512px WebP image.

Disposable local test tooling and data have been removed. The SQL demo seeds remain intentional sample content, clearly marked as demos. See `docs/TESTING.md` for verification and remaining real-backend checks, `docs/ARCHITECTURE.md` for design decisions, and `docs/COMMIT-PLAN.md` for the proposed commit sequence.
