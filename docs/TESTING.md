# Verification

## Checked locally

- Production build with stand-in Supabase environment values and `npm run lint` passed. Campus map geometry produces a size warning (about 388 KB gzipped).
- Targeted assertions covered listing validation, date matching, filter URL round-trips, safe return paths, Madison pin bounds, walk calculations, and main text contrast.
- Browser checks covered search/filtering, mobile sheets, listing details, saved listings, profile editing, posting, image handling, upload-failure retry, listing status changes, and deletion against a disposable in-memory server.
- The simplified map was checked on desktop and at 390px. Changing Bascom to Union South updated walk estimates, the landmark marker, and the closest-sort label; the selection persisted after reload.
- Hero scroll progress and map transforms were checked. The FAQ and final call to action were added afterward without changing the hero animation hook or existing animation styles. FAQ expansion and mobile layout were checked; no horizontal overflow was observed at 390px or 1280px.

## Cleanup — November 15, 2026

The temporary server was stopped, clearing its in-memory listings, profiles, saved items, uploads, and injected failures. Its source, temporary checks, screenshots, and uploaded test image were removed with `.test.local/`. The generated build using test environment values was removed too. No test credentials or accounts are part of the application source. The intentional SQL demo seed listings remain.

## Deferred backend and deployment checks

No real Supabase project is configured. The historical local fixture was not Postgres, GoTrue, or Supabase Storage, and did not prove database security or actual email delivery. Backend configuration is deferred. After following README setup, verify:

- Actual email-code delivery and verification, both email templates, and server-side rejection of non-wisc addresses.
- RLS, grants, and storage policies with separate accounts, including anonymous profile access and cross-user modification attempts.
- Real image uploads and cleanup, including cleanup failures and retries.
- Optional CARTO tile loading in the posting form.
- GitHub Pages deployment and refresh of nested routes.
- Full keyboard/screen-reader acceptance and OS reduced-motion behavior.

Nothing was staged, committed, pushed, or deployed during preparation.
